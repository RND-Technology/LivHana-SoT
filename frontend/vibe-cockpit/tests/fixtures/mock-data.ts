/**
 * Mock Test Data
 * LivHana Trinity E2E Testing - TIER 1
 */

export const MOCK_SQUARE_PRODUCTS = [
  {
    id: 'PROD-001',
    name: 'Premium THCA Flower - 3.5g',
    price: 45.00,
    sku: 'THCA-35',
    category: 'THCA Flower',
    in_stock: true,
  },
  {
    id: 'PROD-002',
    name: 'THCA Pre-Roll Pack - 5pc',
    price: 35.00,
    sku: 'THCA-PR5',
    category: 'Pre-Rolls',
    in_stock: true,
  },
  {
    id: 'PROD-003',
    name: 'Delta-8 Gummies - 25mg',
    price: 29.99,
    sku: 'D8-GUM-25',
    category: 'Edibles',
    in_stock: true,
  },
];

export const MOCK_BIGQUERY_DASHBOARD = {
  metrics: {
    todayRevenue: 1250.50,
    weekRevenue: 8750.25,
    monthRevenue: 35600.00,
    yearRevenue: 892345.67,
    totalTransactions: 12847,
    totalCustomers: 3421,
    avgOrderValue: 69.42,
    topProducts: [
      { name: 'Premium THCA Flower', revenue: 12500 },
      { name: 'THCA Pre-Rolls', revenue: 8750 },
    ],
  },
  recentTransactions: [
    {
      id: 'TXN-001',
      amount: 125.00,
      customer_id: 'CUST-001',
      created_at: '2025-10-01T12:30:00Z',
      status: 'completed'
    },
    {
      id: 'TXN-002',
      amount: 89.99,
      customer_id: 'CUST-002',
      created_at: '2025-10-01T11:15:00Z',
      status: 'completed'
    },
  ],
  bigQueryStatus: {
    enabled: true,
    mode: 'live',
    lastRefresh: new Date().toISOString(),
    lastError: null,
  }
};

export const MOCK_MEMBERSHIP_TIERS = {
  BRONZE: {
    id: 'TIER-BRONZE',
    name: 'Bronze',
    price: 47.00,
    discount_percent: 10,
    benefits: ['10% discount on all products', 'Early access to new products'],
  },
  SILVER: {
    id: 'TIER-SILVER',
    name: 'Silver',
    price: 97.00,
    discount_percent: 20,
    benefits: ['20% discount on all products', 'Priority customer support', 'Free shipping'],
  },
  GOLD: {
    id: 'TIER-GOLD',
    name: 'Gold',
    price: 197.00,
    discount_percent: 30,
    benefits: ['30% discount on all products', 'VIP support', 'Free shipping', 'Exclusive products'],
  },
};

export const MOCK_VOICE_SETTINGS = {
  voices: [
    { id: 'rachel', name: 'Rachel', gender: 'female' },
    { id: 'domi', name: 'Domi', gender: 'female' },
    { id: 'bella', name: 'Bella', gender: 'female' },
    { id: 'elli', name: 'Elli', gender: 'female' },
  ],
  defaultVoice: 'rachel',
  defaultStability: 0.75,
  defaultSimilarityBoost: 0.75,
};

export const MOCK_AUTONOMOUS_CAPABILITIES = {
  actions: [
    {
      name: 'analyze_sales',
      description: 'Analyze sales trends and generate insights',
      parameters: ['time_period', 'product_category'],
    },
    {
      name: 'inventory_check',
      description: 'Check inventory levels and alert on low stock',
      parameters: ['threshold'],
    },
    {
      name: 'customer_analysis',
      description: 'Analyze customer behavior and preferences',
      parameters: ['customer_id', 'date_range'],
    },
  ],
};

// Optimized: 2025-10-02

// Last optimized: 2025-10-02
