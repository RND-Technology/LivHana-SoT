/**
 * Test User Data
 * LivHana Trinity E2E Testing - TIER 1
 */

import { TEST_TOKENS } from './auth-tokens';

export const TEST_USERS = {
  ADMIN: {
    id: 'USER-ADMIN-001',
    email: 'admin@livhana.local',
    name: 'Local Dev User',
    role: 'admin',
    roles: ['admin', 'user'],
    token: TEST_TOKENS.VALID_ADMIN,
  },
  REGULAR_USER: {
    id: 'USER-001',
    email: 'user@livhana.local',
    name: 'Test User',
    role: 'user',
    roles: ['user'],
    token: TEST_TOKENS.VALID_USER,
  },
  CUSTOMER_WITH_GOLD_MEMBERSHIP: {
    id: 'CUST-GOLD-001',
    email: 'gold-member@test.com',
    name: 'Gold Member',
    membershipTier: 'GOLD',
    membershipId: 'MEM-GOLD-001',
    discountPercent: 30,
    ageVerified: true,
  },
  CUSTOMER_WITH_SILVER_MEMBERSHIP: {
    id: 'CUST-SILVER-001',
    email: 'silver-member@test.com',
    name: 'Silver Member',
    membershipTier: 'SILVER',
    membershipId: 'MEM-SILVER-001',
    discountPercent: 20,
    ageVerified: true,
  },
  CUSTOMER_NO_MEMBERSHIP: {
    id: 'CUST-002',
    email: 'regular@test.com',
    name: 'Regular Customer',
    membershipTier: null,
    membershipId: null,
    discountPercent: 0,
    ageVerified: true,
  },
  CUSTOMER_NO_VERIFICATION: {
    id: 'CUST-003',
    email: 'unverified@test.com',
    name: 'Unverified Customer',
    membershipTier: null,
    membershipId: null,
    discountPercent: 0,
    ageVerified: false,
  },
};

export function getTestUser(type: keyof typeof TEST_USERS) {
  return TEST_USERS[type];
}
