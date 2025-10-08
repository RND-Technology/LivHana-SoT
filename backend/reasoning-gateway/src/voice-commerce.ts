// VOICE COMMERCE ENGINE - PROTOTYPE 5
// Voice command to product purchase pipeline using Claude
// Implements intent extraction and order creation

import Anthropic from '@anthropic-ai/sdk';
import axios, { AxiosInstance } from 'axios';
import { BigQuery } from '@google-cloud/bigquery';

// TypeScript strict mode - no 'any' types allowed
interface VoiceIntent {
  intent: 'reorder' | 'new_purchase' | 'question' | 'feedback' | 'unknown';
  product?: string;
  quantity?: number;
  confidence: number;
}

interface VoiceCommandRequest {
  transcript: string;
  customerId: string;
}

interface VoiceCommandResponse {
  success: boolean;
  message: string;
  order_id?: string;
  intent: string;
  confidence: number;
}

interface CustomerProduct {
  product_id: string;
  product_name: string;
  purchase_count: number;
}

export class VoiceCommerceEngine {
  private claude: Anthropic;
  private lightspeed: AxiosInstance;
  private bigquery: BigQuery;
  private dataset: string;

  constructor() {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const lightspeedToken = process.env.LIGHTSPEED_TOKEN;

    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable required');
    }

    if (!lightspeedToken) {
      throw new Error('LIGHTSPEED_TOKEN environment variable required');
    }

    this.claude = new Anthropic({ apiKey: anthropicKey });

    this.lightspeed = axios.create({
      baseURL: 'https://api.lightspeedapp.com/API',
      headers: {
        'Authorization': `Bearer ${lightspeedToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID || 'reggieanddrodispensary',
    });

    this.dataset = process.env.BIGQUERY_DATASET || 'livhana_prod';
  }

  /**
   * Process voice command and execute appropriate action
   */
  async processVoiceCommand(transcript: string, customerId: string): Promise<VoiceCommandResponse> {
    if (!transcript || transcript.trim().length === 0) {
      return {
        success: false,
        message: 'Empty transcript',
        intent: 'unknown',
        confidence: 0,
      };
    }

    if (!customerId) {
      return {
        success: false,
        message: 'Customer ID required',
        intent: 'unknown',
        confidence: 0,
      };
    }

    try {
      // Get customer purchase history for context
      const history = await this.getCustomerHistory(customerId);

      // Extract intent using Claude
      const intent = await this.extractIntent(transcript, history);

      // Handle based on intent
      if (intent.intent === 'reorder' && intent.product) {
        return await this.handleReorder(intent, customerId, history);
      }

      if (intent.intent === 'new_purchase' && intent.product) {
        return await this.handleNewPurchase(intent, customerId);
      }

      // For other intents, return helpful message
      return {
        success: false,
        message: this.getHelpfulResponse(intent),
        intent: intent.intent,
        confidence: intent.confidence,
      };
    } catch (error) {
      console.error('Voice command processing failed:', error);
      return {
        success: false,
        message: 'Failed to process voice command',
        intent: 'unknown',
        confidence: 0,
      };
    }
  }

  /**
   * Extract intent from transcript using Claude
   */
  private async extractIntent(transcript: string, history: CustomerProduct[]): Promise<VoiceIntent> {
    const historyContext = history.length > 0
      ? history.slice(0, 10).map(p => `${p.product_name} (purchased ${p.purchase_count}x)`).join(', ')
      : 'No previous purchases';

    const intentPrompt = `
Analyze this customer voice command and extract the intent.

Voice command: "${transcript}"
Customer's purchase history: ${historyContext}

Extract:
1. Intent: "reorder" (wants to buy something they bought before), "new_purchase" (wants something new), "question" (asking about products/orders), "feedback" (giving feedback), or "unknown"
2. Product: The product name or category mentioned (if any)
3. Quantity: The quantity mentioned (if any, default to 1)
4. Confidence: Your confidence in the intent (0.0 to 1.0)

Respond ONLY with valid JSON in this exact format:
{
  "intent": "reorder|new_purchase|question|feedback|unknown",
  "product": "product name or null",
  "quantity": 1,
  "confidence": 0.95
}
`;

    try {
      const message = await this.claude.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1024,
        messages: [{ role: 'user', content: intentPrompt }],
      });

      const text = message.content[0]?.type === 'text' ? message.content[0].text : '{}';
      const intent = JSON.parse(text) as VoiceIntent;

      // Validate intent
      if (!['reorder', 'new_purchase', 'question', 'feedback', 'unknown'].includes(intent.intent)) {
        intent.intent = 'unknown';
      }

      return intent;
    } catch (error) {
      console.error('Intent extraction failed:', error);
      return {
        intent: 'unknown',
        product: undefined,
        quantity: undefined,
        confidence: 0,
      };
    }
  }

  /**
   * Handle reorder intent
   */
  private async handleReorder(
    intent: VoiceIntent,
    customerId: string,
    history: CustomerProduct[]
  ): Promise<VoiceCommandResponse> {
    // Find matching product from history
    const product = await this.findProduct(intent.product!, customerId, history);

    if (!product) {
      return {
        success: false,
        message: `I couldn't find "${intent.product}" in your previous purchases. Would you like to try a new product?`,
        intent: 'reorder',
        confidence: intent.confidence,
      };
    }

    // Create order in Lightspeed
    try {
      const order = await this.createLightspeedOrder(customerId, product.product_id, intent.quantity || 1);

      return {
        success: true,
        message: `Ordered ${intent.quantity || 1}x ${product.product_name}. Order ID: ${order.saleID}`,
        order_id: order.saleID,
        intent: 'reorder',
        confidence: intent.confidence,
      };
    } catch (error) {
      console.error('Order creation failed:', error);
      return {
        success: false,
        message: 'Failed to create order. Please try again.',
        intent: 'reorder',
        confidence: intent.confidence,
      };
    }
  }

  /**
   * Handle new purchase intent
   */
  private async handleNewPurchase(intent: VoiceIntent, customerId: string): Promise<VoiceCommandResponse> {
    // For new purchases, we'd need to search product catalog
    // This is a simplified version that returns a helpful message
    return {
      success: false,
      message: `I understand you're interested in "${intent.product}". Let me check our catalog for you.`,
      intent: 'new_purchase',
      confidence: intent.confidence,
    };
  }

  /**
   * Get helpful response for non-purchase intents
   */
  private getHelpfulResponse(intent: VoiceIntent): string {
    switch (intent.intent) {
      case 'question':
        return 'I can help you with that! What would you like to know?';
      case 'feedback':
        return 'Thank you for your feedback! We appreciate it.';
      default:
        return 'I didn\'t quite understand. Could you rephrase that?';
    }
  }

  /**
   * Get customer purchase history from BigQuery
   */
  private async getCustomerHistory(customerId: string): Promise<CustomerProduct[]> {
    const query = `
      SELECT
        product_id,
        product_name,
        COUNT(*) as purchase_count
      FROM \`${this.dataset}.sales\`
      WHERE customer_id = @customerId
      GROUP BY product_id, product_name
      ORDER BY purchase_count DESC
      LIMIT 20
    `;

    try {
      const [rows] = await this.bigquery.query({
        query,
        params: { customerId },
        location: 'US',
      });

      return rows as CustomerProduct[];
    } catch (error) {
      console.warn('Failed to fetch customer history:', error);
      return [];
    }
  }

  /**
   * Find product matching search term in customer history
   */
  private async findProduct(
    searchTerm: string,
    customerId: string,
    history: CustomerProduct[]
  ): Promise<CustomerProduct | null> {
    // First, try to match in customer history (local search)
    const lowerSearch = searchTerm.toLowerCase();
    const match = history.find(p =>
      p.product_name.toLowerCase().includes(lowerSearch) ||
      p.product_id.toLowerCase().includes(lowerSearch)
    );

    if (match) {
      return match;
    }

    // If not found in history, search BigQuery
    const query = `
      SELECT
        product_id,
        product_name,
        COUNT(*) as purchase_count
      FROM \`${this.dataset}.sales\`
      WHERE customer_id = @customerId
        AND (LOWER(product_name) LIKE @searchTerm OR LOWER(product_id) LIKE @searchTerm)
      GROUP BY product_id, product_name
      ORDER BY purchase_count DESC
      LIMIT 1
    `;

    try {
      const [rows] = await this.bigquery.query({
        query,
        params: { customerId, searchTerm: `%${lowerSearch}%` },
        location: 'US',
      });

      return rows.length > 0 ? (rows[0] as CustomerProduct) : null;
    } catch (error) {
      console.warn('Failed to search products:', error);
      return null;
    }
  }

  /**
   * Create order in Lightspeed
   */
  private async createLightspeedOrder(
    customerId: string,
    productId: string,
    quantity: number
  ): Promise<{ saleID: string; total: number }> {
    const response = await this.lightspeed.post('/Account/1/Sale.json', {
      customerID: customerId,
      completed: false,
      SaleLines: [
        {
          itemID: productId,
          unitQuantity: quantity,
        },
      ],
    });

    return {
      saleID: response.data.Sale.saleID,
      total: parseFloat(response.data.Sale.calcTotal || '0'),
    };
  }

  /**
   * Health check for service monitoring
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    claude_configured: boolean;
    lightspeed_connected: boolean;
    bigquery_connected: boolean;
  }> {
    const timestamp = new Date().toISOString();
    let claudeConfigured = false;
    let lightspeedConnected = false;
    let bigqueryConnected = false;

    // Check Claude configuration
    try {
      claudeConfigured = !!process.env.ANTHROPIC_API_KEY;
    } catch (error) {
      console.warn('Claude check failed:', error);
    }

    // Test Lightspeed connection
    try {
      await this.lightspeed.get('/Account/1.json', { timeout: 5000 });
      lightspeedConnected = true;
    } catch (error) {
      console.warn('Lightspeed health check failed:', error);
    }

    // Test BigQuery connection
    try {
      await this.bigquery.getDatasets({ maxResults: 1 });
      bigqueryConnected = true;
    } catch (error) {
      console.warn('BigQuery health check failed:', error);
    }

    const allHealthy = claudeConfigured && lightspeedConnected && bigqueryConnected;
    const someHealthy = claudeConfigured || lightspeedConnected || bigqueryConnected;

    return {
      status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
      timestamp,
      claude_configured: claudeConfigured,
      lightspeed_connected: lightspeedConnected,
      bigquery_connected: bigqueryConnected,
    };
  }
}

// Express.js integration for Cloud Run deployment
import express from 'express';

const app = express();
app.use(express.json());

// Only create engine if not in test environment
let voiceEngine: VoiceCommerceEngine | null = null;
if (process.env.NODE_ENV !== 'test') {
  voiceEngine = new VoiceCommerceEngine();
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    if (!voiceEngine) {
      return res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Engine not initialized',
      });
    }
    const health = await voiceEngine.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Process voice command
app.post('/api/voice-commerce', async (req, res) => {
  try {
    if (!voiceEngine) {
      return res.status(503).json({
        success: false,
        error: 'Engine not initialized',
        timestamp: new Date().toISOString(),
      });
    }

    const { transcript, customerId } = req.body;

    if (!transcript || !customerId) {
      return res.status(400).json({
        success: false,
        error: 'transcript and customerId are required',
        timestamp: new Date().toISOString(),
      });
    }

    const result = await voiceEngine.processVoiceCommand(transcript, customerId);
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
    service: 'Voice Commerce Engine',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      voiceCommerce: 'POST /api/voice-commerce',
    },
    documentation: 'See specs/voice-commerce.spec.yaml',
  });
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 8083;
  app.listen(PORT, () => {
    console.log(`Voice Commerce Engine running on port ${PORT}`);
  });
}

export default app;
