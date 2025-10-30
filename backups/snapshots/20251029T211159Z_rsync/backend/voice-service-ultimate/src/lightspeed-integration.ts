/**
 * LightSpeed Retail Integration
 * Pull inventory data for Reggie & Dro strain reports
 */

import axios from 'axios';

export interface StrainInventory {
  id: string;
  name: string;
  description: string;
  category: string;
  quantityOnHand: number;
  price: number;
  sku: string;
  customFields?: {
    thcContent?: string;
    strainType?: string; // Indica, Sativa, Hybrid
    lineage?: string;
  };
}

export class LightSpeedIntegration {
  private token: string;
  private accountId: string;
  private baseUrl = 'https://api.lightspeedapp.com/API/V3';

  constructor() {
    this.token = process.env.LIGHTSPEED_TOKEN || '';
    this.accountId = process.env.LIGHTSPEED_ACCOUNT_ID || '';

    if (!this.token || !this.accountId) {
      throw new Error('LightSpeed credentials missing');
    }
  }

  /**
   * Get all in-stock smokable THC/THCA flower
   */
  async getInStockStrains(): Promise<StrainInventory[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/Account/${this.accountId}/Item.json`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          params: {
            // Filter for flower category and in-stock items
            categoryID: 'IN', // Adjust based on actual category
            'Item.qoh': '>,0', // Quantity on hand > 0
            load_relations: '["Category", "ItemShops"]',
          },
        }
      );

      const items = response.data.Item || [];

      return items
        .filter((item: any) => {
          // Filter for smokable flower (not edibles, concentrates, etc.)
          const categoryName = item.Category?.name?.toLowerCase() || '';
          return (
            categoryName.includes('flower') ||
            categoryName.includes('bud') ||
            categoryName.includes('thc') ||
            categoryName.includes('thca')
          );
        })
        .map((item: any) => ({
          id: item.itemID,
          name: item.description || item.name,
          description: item.longDescription || '',
          category: item.Category?.name || 'Flower',
          quantityOnHand: parseFloat(item.qoh || '0'),
          price: parseFloat(item.Prices?.ItemPrice?.[0]?.amount || '0'),
          sku: item.customSku || item.sku,
          customFields: {
            thcContent: item.customFieldValues?.customField1 || '',
            strainType: item.customFieldValues?.customField2 || '',
            lineage: item.customFieldValues?.customField3 || '',
          },
        }));
    } catch (error: any) {
      console.error('LightSpeed API error:', error.message);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      await axios.get(
        `${this.baseUrl}/Account/${this.accountId}.json`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );
      return { healthy: true, message: 'LightSpeed API connection healthy' };
    } catch (error: any) {
      return {
        healthy: false,
        message: `LightSpeed API error: ${error.message}`
      };
    }
  }
}
