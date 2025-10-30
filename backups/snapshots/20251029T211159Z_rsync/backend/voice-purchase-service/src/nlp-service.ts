export type VoiceIntent = 'purchase' | 'search' | 'cart' | 'help' | 'cancel';

export interface NlpEntities {
  products: string[];
  quantities: string[];
  modifiers: string[];
}

export interface NlpResult {
  intent: VoiceIntent;
  confidence: number;
  entities: NlpEntities;
}

export class NLPService {
  async processText(text: string): Promise<NlpResult> {
    const lowerText = text.toLowerCase();

    let intent: VoiceIntent = 'help';
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
    return true;
  }
}


