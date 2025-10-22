/**
 * Voice Commerce Engine
 * Core business logic for voice commerce operations
 */

import Anthropic from '@anthropic-ai/sdk';
import { BigQuery } from '@google-cloud/bigquery';
import { LightspeedClient } from './clients/lightspeed-client';
import { BigQueryClient } from './clients/bigquery-client';

interface VoiceIntent {
  intent: 'reorder' | 'new_purchase' | 'question' | 'feedback' | 'unknown';
  product?: string;
  quantity?: number;
  confidence: number;
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
  private lightspeedClient: LightspeedClient;
  private bigqueryClient: BigQueryClient;

  constructor() {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable required');
    }

    this.claude = new Anthropic({ apiKey: anthropicKey });
    this.lightspeedClient = new LightspeedClient();
    this.bigqueryClient = new BigQueryClient();
  }

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
      const history = await this.bigqueryClient.getCustomerHistory(customerId);
      const intent = await this.extractIntent(transcript, history);

      if (intent.intent === 'reorder' && intent.product) {
        return await this.handleReorder(intent, customerId, history);
      }

      if (intent.intent === 'new_purchase' && intent.product) {
        return await this.handleNewPurchase(intent, customerId);
      }

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

  private async handleReorder(
    intent: VoiceIntent,
    customerId: string,
    history: CustomerProduct[]
  ): Promise<VoiceCommandResponse> {
    const product = await this.bigqueryClient.findProduct(intent.product!, customerId, history);

    if (!product) {
      return {
        success: false,
        message: `I couldn't find "${intent.product}" in your previous purchases. Would you like to try a new product?`,
        intent: 'reorder',
        confidence: intent.confidence,
      };
    }

    try {
      const order = await this.lightspeedClient.createOrder(customerId, product.product_id, intent.quantity || 1);

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

  private async handleNewPurchase(intent: VoiceIntent, customerId: string): Promise<VoiceCommandResponse> {
    return {
      success: false,
      message: `I understand you're interested in "${intent.product}". Let me check our catalog for you.`,
      intent: 'new_purchase',
      confidence: intent.confidence,
    };
  }

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

    try {
      claudeConfigured = !!process.env.ANTHROPIC_API_KEY;
    } catch (error) {
      console.warn('Claude check failed:', error);
    }

    try {
      lightspeedConnected = await this.lightspeedClient.isConnected();
    } catch (error) {
      console.warn('Lightspeed health check failed:', error);
    }

    try {
      bigqueryConnected = await this.bigqueryClient.isConnected();
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

