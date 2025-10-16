### Codegen (P2)
```typescript
// backend/reasoning-gateway/src/voice-commerce.ts

import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

export class VoiceCommerceEngine {
  private claude: Anthropic;
  private lightspeed: axios.AxiosInstance;

  constructor() {
    this.claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.lightspeed = axios.create({
      baseURL: 'https://api.lightspeedapp.com/API',
      headers: { 'Authorization': `Bearer ${process.env.LIGHTSPEED_TOKEN}` },
    });
  }

  async processVoiceCommand(transcript: string, customerId: string) {
    const history = await this.getCustomerHistory(customerId);

    const intentPrompt = `
User said: "${transcript}"
Customer purchases: ${JSON.stringify(history)}

Extract:
1. Intent (reorder | new_purchase | question | feedback)
2. Product (if mentioned)
3. Quantity (if mentioned)

Response format: { intent, product, quantity }
`;

    const message = await this.claude.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{ role: 'user', content: intentPrompt }],
    });

    const intent = JSON.parse(message.content[0]?.text ?? '{}');

    if (intent.intent === 'reorder') {
      const product = await this.findProduct(intent.product, customerId);

      const order = await this.lightspeed.post('/Account/1/Sale.json', {
        customerID: customerId,
        SaleLines: [{
          itemID: product.id,
          unitQuantity: intent.quantity ?? 1,
        }],
      });

      return {
        success: true,
        message: `Ordered ${product.name}. Total: $${order.data.total}`,
        order_id: order.data.saleID,
      };
    }

    return { success: false, message: 'Could not process command' };
  }

  private async getCustomerHistory(customerId: string) {
    const [rows] = await this.bigquery.query({
      query: `SELECT product_name, COUNT(*) as count FROM livhana_prod.sales WHERE customer_id = @customerId GROUP BY product_name ORDER BY count DESC LIMIT 10`,
      params: { customerId },
    });
    return rows;
  }

  private async findProduct(productName: string, customerId: string) {
    const [rows] = await this.bigquery.query({
      query: `SELECT product_id, product_name FROM livhana_prod.sales WHERE customer_id = @customerId AND product_name LIKE @productName LIMIT 1`,
      params: { customerId, productName: `%${productName}%` },
    });
    return rows[0];
  }
}
```

---
