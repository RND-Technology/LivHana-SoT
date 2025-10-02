/**
 * Test Authentication Tokens
 * LivHana Trinity E2E Testing - TIER 1
 */

export const TEST_TOKENS = {
  VALID_ADMIN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXYtdXNlci1sb2NhbCIsImlkIjoiZGV2LXVzZXItaWQiLCJyb2xlIjoiYWRtaW4iLCJyb2xlcyI6WyJhZG1pbiIsInVzZXIiXSwibmFtZSI6IkxvY2FsIERldiBVc2VyIiwiZW1haWwiOiJkZXZAbGl2aGFuYS5sb2NhbCIsImlhdCI6MTc1OTM2NDAwMCwiZXhwIjoxNzU5OTY4ODAwLCJhdWQiOiJsaXZoYW5hLWxvY2FsIiwiaXNzIjoibGl2aGFuYS1sb2NhbCJ9.dYqrD33z6XO6Ti3SABoSZPxT5uZljIrUEePByiyLy6Y',
  VALID_USER: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXVzZXItbG9jYWwiLCJpZCI6InRlc3QtdXNlci1pZCIsInJvbGUiOiJ1c2VyIiwicm9sZXMiOlsidXNlciJdLCJuYW1lIjoiVGVzdCBVc2VyIiwiZW1haWwiOiJ0ZXN0QGxpdmhhbmEubG9jYWwiLCJpYXQiOjE3NTkzNjQwMDAsImV4cCI6MTc1OTk2ODgwMCwiYXVkIjoibGl2aGFuYS1sb2NhbCIsImlzcyI6ImxpdmhhbmEtbG9jYWwifQ.testtoken',
  EXPIRED_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJleHBpcmVkLXVzZXIiLCJpZCI6ImV4cGlyZWQtaWQiLCJyb2xlIjoidXNlciIsImlhdCI6MTYwMDAwMDAwMCwiZXhwIjoxNjAwMDg2NDAwfQ.expiredtoken',
  INVALID_TOKEN: 'invalid-token-12345-not-a-jwt',
};

export function getTestToken(role: 'admin' | 'user' = 'admin'): string {
  return role === 'admin' ? TEST_TOKENS.VALID_ADMIN : TEST_TOKENS.VALID_USER;
}

export function getAuthHeader(role: 'admin' | 'user' = 'admin'): { Authorization: string } {
  return {
    Authorization: `Bearer ${getTestToken(role)}`
  };
}

// Optimized: 2025-10-02
