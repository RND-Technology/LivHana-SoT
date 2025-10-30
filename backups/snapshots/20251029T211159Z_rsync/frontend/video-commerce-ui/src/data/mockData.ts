export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  thc_content?: number;
  cbd_content?: number;
  effects?: string[];
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface VideoTimestamp {
  time: number;
  productId: string;
  description: string;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Cannabis Strain',
    description: 'High-quality cannabis with excellent effects',
    price: 29.99,
    image: 'https://via.placeholder.com/300x200',
    category: 'flower',
    thc_content: 22,
    cbd_content: 1,
    effects: ['relaxing', 'euphoric'],
    availability: 'in_stock'
  },
  {
    id: '2',
    name: 'CBD Oil Tincture',
    description: 'Pure CBD oil for wellness and relaxation',
    price: 39.99,
    image: 'https://via.placeholder.com/300x200',
    category: 'tincture',
    thc_content: 0,
    cbd_content: 25,
    effects: ['calming', 'focused'],
    availability: 'in_stock'
  }
];

export const mockTimestamps: VideoTimestamp[] = [
  { time: 0, productId: '1', description: 'Product 1 showcase' },
  { time: 30, productId: '2', description: 'Product 2 showcase' }
];
