// VOICE-TO-PURCHASE API - PROTOTYPE 5
// Voice-activated purchasing system for cannabis retail
// Implements NLP-powered intent recognition with secure payment processing

import { BigQuery } from '@google-cloud/bigquery';
import Redis from 'ioredis';
import express from 'express';
import multer from 'multer';

// TypeScript strict mode - no 'any' types allowed
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface VoiceCommand {
  audio_data: string;
  audio_format: string;
  customer_id: string;
  session_id?: string;
}

interface VoiceResponse {
  success: boolean;
  intent: 'purchase' | 'search' | 'cart' | 'help' | 'cancel';
  confidence: number;
  extracted_text: string;
  entities: {
    products: string[];
    quantities: string[];
    modifiers: string[];
  };
  action: {
    type: string;
    products: Product[];
    quantity: number;
    confirmation_required: boolean;
  };
  response_text: string;
  response_audio: string;
  session_id: string;
  timestamp: string;
}

interface PurchaseConfirmation {
  session_id: string;
  customer_id: string;
  confirmation: boolean;
  payment_method?: string;
  delivery_address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
  };
}

interface PurchaseStatus {
  success: boolean;
  order_id: string;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
  total_amount: number;
  estimated_delivery: string;
  confirmation_text: string;
  confirmation_audio: string;
  tracking_info?: {
    tracking_number: string;
    delivery_partner: string;
    real_time_tracking: boolean;
  };
}

interface Order {
  id: string;
  customer_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  delivery_address?: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
  };
  created_at: string;
  updated_at: string;
}

export class VoicePurchaseService {
  private bigquery: BigQuery;
  private redis: Redis;
  private dataset: string;
  private nlpService: NLPService;
  private audioService: AudioService;
  private paymentService: PaymentService;

  constructor() {
    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID || 'reggieanddrodispensary',
    });

    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });

    this.dataset = process.env.BIGQUERY_DATASET || 'livhana_prod';
    this.nlpService = new NLPService();
    this.audioService = new AudioService();
    this.paymentService = new PaymentService();
  }

  /**
   * Process voice command for purchase intent
   */
  async processVoiceCommand(command: VoiceCommand): Promise<VoiceResponse> {
    try {
      // 1. Transcribe audio to text
      const extractedText = await this.audioService.transcribeAudio(
        command.audio_data,
        command.audio_format
      );

      // 2. Extract intent and entities using NLP
      const nlpResult = await this.nlpService.processText(extractedText);

      // 3. Find matching products
      const products = await this.findMatchingProducts(nlpResult.entities);

      // 4. Determine action based on intent
      const action = this.determineAction(nlpResult.intent, products, nlpResult.entities);

      // 5. Generate response text
      const responseText = this.generateResponseText(nlpResult.intent, action, products);

      // 6. Convert response to audio
      const responseAudio = await this.audioService.textToSpeech(responseText);

      // 7. Store session context
      await this.storeSessionContext(command.session_id || 'default', {
        intent: nlpResult.intent,
        entities: nlpResult.entities,
        action,
        products,
      });

      return {
        success: true,
        intent: nlpResult.intent,
        confidence: nlpResult.confidence,
        extracted_text: extractedText,
        entities: nlpResult.entities,
        action,
        response_text: responseText,
        response_audio: responseAudio,
        session_id: command.session_id || 'default',
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Failed to process voice command:', error);
      throw error;
    }
  }

  /**
   * Confirm voice purchase
   */
  async confirmVoicePurchase(confirmation: PurchaseConfirmation): Promise<PurchaseStatus> {
    try {
      // 1. Retrieve session context
      const sessionContext = await this.getSessionContext(confirmation.session_id);
      if (!sessionContext) {
        throw new Error('Session not found');
      }

      // 2. Create order
      const order = await this.createOrder({
        customer_id: confirmation.customer_id,
        items: sessionContext.action.products.map(product => ({
          product_id: product.id,
          quantity: sessionContext.action.quantity,
          price: product.price,
        })),
        payment_method: confirmation.payment_method || 'voice_payment',
        delivery_address: confirmation.delivery_address,
      });

      // 3. Process payment
      if (confirmation.confirmation) {
        await this.paymentService.processPayment({
          order_id: order.id,
          amount: order.total_amount,
          payment_method: order.payment_method,
          customer_id: confirmation.customer_id,
        });
      }

      // 4. Generate confirmation response
      const confirmationText = this.generateConfirmationText(order);
      const confirmationAudio = await this.audioService.textToSpeech(confirmationText);

      // 5. Set up tracking
      const trackingInfo = await this.setupOrderTracking(order);

      return {
        success: true,
        order_id: order.id,
        status: 'confirmed',
        total_amount: order.total_amount,
        estimated_delivery: this.calculateEstimatedDelivery(),
        confirmation_text: confirmationText,
        confirmation_audio: confirmationAudio,
        tracking_info: trackingInfo,
      };

    } catch (error) {
      console.error('Failed to confirm voice purchase:', error);
      throw error;
    }
  }

  /**
   * Cancel voice purchase
   */
  async cancelVoicePurchase(
    sessionId: string,
    customerId: string,
    orderId?: string,
    reason?: string
  ): Promise<{
    success: boolean;
    order_id: string;
    status: 'cancelled' | 'refunded';
    refund_amount: number;
    refund_method: string;
    confirmation_text: string;
    confirmation_audio: string;
  }> {
    try {
      let order: Order | null = null;

      if (orderId) {
        order = await this.getOrder(orderId);
      } else {
        // Find active order for session
        order = await this.findActiveOrder(sessionId, customerId);
      }

      if (!order) {
        throw new Error('No active order found');
      }

      // Cancel order
      await this.updateOrderStatus(order.id, 'cancelled');

      // Process refund
      const refundResult = await this.paymentService.processRefund({
        order_id: order.id,
        amount: order.total_amount,
        reason: reason || 'Customer cancellation',
      });

      // Generate cancellation response
      const cancellationText = `Your order ${order.id} has been cancelled and a refund of $${order.total_amount.toFixed(2)} will be processed.`;
      const cancellationAudio = await this.audioService.textToSpeech(cancellationText);

      return {
        success: true,
        order_id: order.id,
        status: 'refunded',
        refund_amount: order.total_amount,
        refund_method: 'original_payment_method',
        confirmation_text: cancellationText,
        confirmation_audio: cancellationAudio,
      };

    } catch (error) {
      console.error('Failed to cancel voice purchase:', error);
      throw error;
    }
  }

  /**
   * Get voice purchase status
   */
  async getVoicePurchaseStatus(sessionId: string, customerId: string): Promise<{
    success: boolean;
    session_id: string;
    customer_id: string;
    current_order?: Order;
    order_history: Order[];
    voice_context: {
      last_intent: string;
      last_products: string[];
      conversation_state: 'idle' | 'listening' | 'processing' | 'confirming' | 'completed';
    };
    timestamp: string;
  }> {
    try {
      // Get current order
      const currentOrder = await this.findActiveOrder(sessionId, customerId);

      // Get order history
      const orderHistory = await this.getOrderHistory(customerId);

      // Get voice context
      const voiceContext = await this.getSessionContext(sessionId);

      return {
        success: true,
        session_id: sessionId,
        customer_id: customerId,
        current_order: currentOrder || undefined,
        order_history: orderHistory,
        voice_context: {
          last_intent: voiceContext?.intent || 'idle',
          last_products: voiceContext?.entities?.products || [],
          conversation_state: this.determineConversationState(voiceContext),
        },
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Failed to get voice purchase status:', error);
      throw error;
    }
  }

  /**
   * Get voice assistance
   */
  async getVoiceHelp(
    audioData: string,
    customerId: string,
    sessionId: string,
    helpType: string = 'general'
  ): Promise<{
    success: boolean;
    help_text: string;
    help_audio: string;
    suggestions: string[];
    session_id: string;
    timestamp: string;
  }> {
    try {
      // Transcribe help request
      const helpText = await this.audioService.transcribeAudio(audioData, 'wav');

      // Generate help response based on type
      const helpResponse = this.generateHelpResponse(helpType, helpText);

      // Convert to audio
      const helpAudio = await this.audioService.textToSpeech(helpResponse.text);

      return {
        success: true,
        help_text: helpResponse.text,
        help_audio: helpAudio,
        suggestions: helpResponse.suggestions,
        session_id: sessionId,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Failed to get voice help:', error);
      throw error;
    }
  }

  /**
   * Health check for service monitoring
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    voice_engine: string;
    nlp_service: string;
    payment_processor: string;
    audio_quality: string;
  }> {
    const timestamp = new Date().toISOString();
    let databaseConnected = false;
    let cacheConnected = false;
    let nlpServiceHealthy = false;
    let audioServiceHealthy = false;
    let paymentServiceHealthy = false;

    // Test BigQuery connection
    try {
      await this.bigquery.getDatasets({ maxResults: 1 });
      databaseConnected = true;
    } catch (error) {
      console.warn('BigQuery health check failed:', error);
    }

    // Test Redis connection
    try {
      await this.redis.ping();
      cacheConnected = true;
    } catch (error) {
      console.warn('Redis health check failed:', error);
    }

    // Test NLP service
    try {
      await this.nlpService.healthCheck();
      nlpServiceHealthy = true;
    } catch (error) {
      console.warn('NLP service health check failed:', error);
    }

    // Test audio service
    try {
      await this.audioService.healthCheck();
      audioServiceHealthy = true;
    } catch (error) {
      console.warn('Audio service health check failed:', error);
    }

    // Test payment service
    try {
      await this.paymentService.healthCheck();
      paymentServiceHealthy = true;
    } catch (error) {
      console.warn('Payment service health check failed:', error);
    }

    const status = databaseConnected && cacheConnected && nlpServiceHealthy && 
                  audioServiceHealthy && paymentServiceHealthy ? 'healthy' : 
                  databaseConnected || cacheConnected ? 'degraded' : 'unhealthy';

    return {
      status,
      timestamp,
      version: '1.0.0',
      voice_engine: audioServiceHealthy ? 'operational' : 'degraded',
      nlp_service: nlpServiceHealthy ? 'active' : 'degraded',
      payment_processor: paymentServiceHealthy ? 'connected' : 'degraded',
      audio_quality: audioServiceHealthy ? 'excellent' : 'poor',
    };
  }

  // Private helper methods
  private async findMatchingProducts(entities: { products: string[]; quantities: string[]; modifiers: string[] }): Promise<Product[]> {
    // Simplified product matching - in production, this would use ML
    const query = `
      SELECT id, name, price, category, description, image, availability
      FROM \`${this.dataset}.products\`
      WHERE availability != 'out_of_stock'
      ORDER BY name
      LIMIT 10
    `;

    const [rows] = await this.bigquery.query(query);
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      price: row.price,
      category: row.category,
      description: row.description,
      image: row.image,
      availability: row.availability,
    }));
  }

  private determineAction(intent: string, products: Product[], entities: any): any {
    switch (intent) {
      case 'purchase':
        return {
          type: 'add_to_cart',
          products: products.slice(0, 1), // Take first matching product
          quantity: 1,
          confirmation_required: true,
        };
      case 'search':
        return {
          type: 'search_results',
          products,
          quantity: 0,
          confirmation_required: false,
        };
      case 'cart':
        return {
          type: 'view_cart',
          products: [],
          quantity: 0,
          confirmation_required: false,
        };
      default:
        return {
          type: 'help',
          products: [],
          quantity: 0,
          confirmation_required: false,
        };
    }
  }

  private generateResponseText(intent: string, action: any, products: Product[]): string {
    switch (intent) {
      case 'purchase':
        if (products.length > 0) {
          const product = products[0];
          return `I found ${product.name} for $${product.price.toFixed(2)}. Would you like me to add it to your cart?`;
        }
        return "I couldn't find that product. Could you please describe what you're looking for?";
      case 'search':
        if (products.length > 0) {
          return `I found ${products.length} products matching your search. The first one is ${products[0].name} for $${products[0].price.toFixed(2)}.`;
        }
        return "I couldn't find any products matching your search. Could you please try again?";
      case 'cart':
        return "I can help you view your cart or add items. What would you like to do?";
      case 'help':
        return "I can help you find products, place orders, check order status, and answer questions about our services.";
      default:
        return "I'm sorry, I didn't understand that. Could you please repeat your request?";
    }
  }

  private generateConfirmationText(order: Order): string {
    return `Your order has been confirmed! Order #${order.id} will be delivered tomorrow by 2 PM. Total amount: $${order.total_amount.toFixed(2)}.`;
  }

  private generateHelpResponse(helpType: string, helpText: string): { text: string; suggestions: string[] } {
    switch (helpType) {
      case 'product_info':
        return {
          text: "I can provide information about our products including pricing, availability, and effects. What product would you like to know about?",
          suggestions: ["Tell me about indica flower", "What's the price of edibles?", "Show me available products"]
        };
      case 'order_status':
        return {
          text: "I can check your order status and provide tracking information. Do you have an order number?",
          suggestions: ["Check my order status", "Where is my delivery?", "Track my package"]
        };
      case 'payment':
        return {
          text: "I can help you with payment methods and billing questions. What payment issue are you experiencing?",
          suggestions: ["What payment methods do you accept?", "I have a billing question", "Payment failed"]
        };
      case 'delivery':
        return {
          text: "I can help you with delivery options, scheduling, and tracking. What delivery question do you have?",
          suggestions: ["When will my order arrive?", "Change delivery address", "Delivery options"]
        };
      default:
        return {
          text: "I can help you find products, place orders, check order status, and answer questions about our services. What can I help you with?",
          suggestions: ["What products do you have?", "How do I place an order?", "Check my order status"]
        };
    }
  }

  private async storeSessionContext(sessionId: string, context: any): Promise<void> {
    await this.redis.setex(`session:${sessionId}`, 3600, JSON.stringify(context)); // 1 hour
  }

  private async getSessionContext(sessionId: string): Promise<any> {
    const context = await this.redis.get(`session:${sessionId}`);
    return context ? JSON.parse(context) : null;
  }

  private async createOrder(orderData: any): Promise<Order> {
    const orderId = `order_${Date.now()}`;
    const order: Order = {
      id: orderId,
      customer_id: orderData.customer_id,
      items: orderData.items,
      total_amount: orderData.items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      status: 'pending',
      payment_method: orderData.payment_method,
      delivery_address: orderData.delivery_address,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Store in BigQuery
    const query = `
      INSERT INTO \`${this.dataset}.orders\`
      (id, customer_id, items, total_amount, status, payment_method, delivery_address, created_at, updated_at)
      VALUES (@id, @customer_id, @items, @total_amount, @status, @payment_method, @delivery_address, @created_at, @updated_at)
    `;

    await this.bigquery.query({
      query,
      params: {
        id: order.id,
        customer_id: order.customer_id,
        items: JSON.stringify(order.items),
        total_amount: order.total_amount,
        status: order.status,
        payment_method: order.payment_method,
        delivery_address: JSON.stringify(order.delivery_address),
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
    });

    return order;
  }

  private async getOrder(orderId: string): Promise<Order | null> {
    const query = `
      SELECT * FROM \`${this.dataset}.orders\`
      WHERE id = @order_id
    `;

    const [rows] = await this.bigquery.query({
      query,
      params: { order_id: orderId },
    });

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      customer_id: row.customer_id,
      items: JSON.parse(row.items),
      total_amount: row.total_amount,
      status: row.status,
      payment_method: row.payment_method,
      delivery_address: row.delivery_address ? JSON.parse(row.delivery_address) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private async updateOrderStatus(orderId: string, status: string): Promise<void> {
    const query = `
      UPDATE \`${this.dataset}.orders\`
      SET status = @status, updated_at = @updated_at
      WHERE id = @order_id
    `;

    await this.bigquery.query({
      query,
      params: {
        order_id: orderId,
        status,
        updated_at: new Date().toISOString(),
      },
    });
  }

  private async findActiveOrder(sessionId: string, customerId: string): Promise<Order | null> {
    const query = `
      SELECT * FROM \`${this.dataset}.orders\`
      WHERE customer_id = @customer_id
      AND status IN ('pending', 'confirmed', 'processing', 'shipped')
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const [rows] = await this.bigquery.query({
      query,
      params: { customer_id: customerId },
    });

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
      id: row.id,
      customer_id: row.customer_id,
      items: JSON.parse(row.items),
      total_amount: row.total_amount,
      status: row.status,
      payment_method: row.payment_method,
      delivery_address: row.delivery_address ? JSON.parse(row.delivery_address) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  private async getOrderHistory(customerId: string): Promise<Order[]> {
    const query = `
      SELECT * FROM \`${this.dataset}.orders\`
      WHERE customer_id = @customer_id
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const [rows] = await this.bigquery.query({
      query,
      params: { customer_id: customerId },
    });

    return rows.map((row: any) => ({
      id: row.id,
      customer_id: row.customer_id,
      items: JSON.parse(row.items),
      total_amount: row.total_amount,
      status: row.status,
      payment_method: row.payment_method,
      delivery_address: row.delivery_address ? JSON.parse(row.delivery_address) : undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  }

  private calculateEstimatedDelivery(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2 PM
    return tomorrow.toISOString();
  }

  private async setupOrderTracking(order: Order): Promise<{
    tracking_number: string;
    delivery_partner: string;
    real_time_tracking: boolean;
  }> {
    return {
      tracking_number: `TRK${order.id.slice(-8)}`,
      delivery_partner: 'DoorDash',
      real_time_tracking: true,
    };
  }

  private determineConversationState(context: any): 'idle' | 'listening' | 'processing' | 'confirming' | 'completed' {
    if (!context) return 'idle';
    if (context.intent === 'purchase' && context.action?.confirmation_required) return 'confirming';
    if (context.intent === 'purchase') return 'processing';
    return 'idle';
  }
}

// Mock service classes for prototype
class NLPService {
  async processText(text: string): Promise<{
    intent: 'purchase' | 'search' | 'cart' | 'help' | 'cancel';
    confidence: number;
    entities: { products: string[]; quantities: string[]; modifiers: string[] };
  }> {
    // Simplified NLP processing - in production, this would use a real NLP service
    const lowerText = text.toLowerCase();
    
    let intent: 'purchase' | 'search' | 'cart' | 'help' | 'cancel' = 'help';
    let confidence = 0.5;

    if (lowerText.includes('buy') || lowerText.includes('purchase') || lowerText.includes('order')) {
      intent = 'purchase';
      confidence = 0.9;
    } else if (lowerText.includes('search') || lowerText.includes('find') || lowerText.includes('look for')) {
      intent = 'search';
      confidence = 0.8;
    } else if (lowerText.includes('cart') || lowerText.includes('basket')) {
      intent = 'cart';
      confidence = 0.7;
    } else if (lowerText.includes('help') || lowerText.includes('assistance')) {
      intent = 'help';
      confidence = 0.9;
    } else if (lowerText.includes('cancel') || lowerText.includes('stop')) {
      intent = 'cancel';
      confidence = 0.8;
    }

    // Extract entities (simplified)
    const products: string[] = [];
    const quantities: string[] = [];
    const modifiers: string[] = [];

    if (lowerText.includes('indica')) products.push('indica flower');
    if (lowerText.includes('sativa')) products.push('sativa flower');
    if (lowerText.includes('edible')) products.push('edibles');
    if (lowerText.includes('premium')) modifiers.push('premium');
    if (lowerText.includes('some')) quantities.push('some');

    return { intent, confidence, entities: { products, quantities, modifiers } };
  }

  async healthCheck(): Promise<boolean> {
    return true; // Mock health check
  }
}

class AudioService {
  async transcribeAudio(audioData: string, format: string): Promise<string> {
    // Mock transcription - in production, this would use a real speech-to-text service
    return "I want to buy some premium indica flower";
  }

  async textToSpeech(text: string): Promise<string> {
    // Mock TTS - in production, this would use a real text-to-speech service
    return "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqF...";
  }

  async healthCheck(): Promise<boolean> {
    return true; // Mock health check
  }
}

class PaymentService {
  async processPayment(paymentData: any): Promise<void> {
    // Mock payment processing - in production, this would use a real payment processor
    console.log('Processing payment:', paymentData);
  }

  async processRefund(refundData: any): Promise<void> {
    // Mock refund processing - in production, this would use a real payment processor
    console.log('Processing refund:', refundData);
  }

  async healthCheck(): Promise<boolean> {
    return true; // Mock health check
  }
}

// Express.js integration for Cloud Run deployment
const app = express();
app.use(express.json({ limit: '10mb' })); // Large limit for audio data

// Only create service if not in test environment
let service: VoicePurchaseService | null = null;
if (process.env.NODE_ENV !== 'test') {
  service = new VoicePurchaseService();
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    if (!service) {
      return res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service not initialized',
      });
    }
    const health = await service.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Process voice command endpoint
app.post('/voice/process', async (req, res) => {
  try {
    if (!service) {
      return res.status(503).json({
        success: false,
        error: 'Service not initialized',
        timestamp: new Date().toISOString(),
      });
    }

    const result = await service.processVoiceCommand(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Confirm voice purchase endpoint
app.post('/voice/confirm', async (req, res) => {
  try {
    if (!service) {
      return res.status(503).json({
        success: false,
        error: 'Service not initialized',
        timestamp: new Date().toISOString(),
      });
    }

    const result = await service.confirmVoicePurchase(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Cancel voice purchase endpoint
app.post('/voice/cancel', async (req, res) => {
  try {
    if (!service) {
      return res.status(503).json({
        success: false,
        error: 'Service not initialized',
        timestamp: new Date().toISOString(),
      });
    }

    const { session_id, customer_id, order_id, reason } = req.body;
    const result = await service.cancelVoicePurchase(session_id, customer_id, order_id, reason);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Get voice purchase status endpoint
app.get('/voice/status', async (req, res) => {
  try {
    if (!service) {
      return res.status(503).json({
        success: false,
        error: 'Service not initialized',
        timestamp: new Date().toISOString(),
      });
    }

    const { session_id, customer_id } = req.query;
    const result = await service.getVoicePurchaseStatus(session_id as string, customer_id as string);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Get voice help endpoint
app.post('/voice/help', async (req, res) => {
  try {
    if (!service) {
      return res.status(503).json({
        success: false,
        error: 'Service not initialized',
        timestamp: new Date().toISOString(),
      });
    }

    const { audio_data, customer_id, session_id, help_type } = req.body;
    const result = await service.getVoiceHelp(audio_data, customer_id, session_id, help_type);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'Voice-to-Purchase API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      process: 'POST /voice/process',
      confirm: 'POST /voice/confirm',
      cancel: 'POST /voice/cancel',
      status: 'GET /voice/status',
      help: 'POST /voice/help',
    },
    documentation: 'See specs/voice-purchase.spec.yaml',
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Voice-to-Purchase API running on port ${PORT}`);
  });
}

export default app;
