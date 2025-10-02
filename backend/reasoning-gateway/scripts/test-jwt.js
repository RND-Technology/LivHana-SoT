#!/usr/bin/env node
/**
 * Test JWT token validation
 */

import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'livhana-local';
const JWT_ISSUER = process.env.JWT_ISSUER || 'livhana-local';

const token = process.argv[2];

if (!token) {
  console.error('Usage: node test-jwt.js <token>');
  process.exit(1);
}

console.log('Testing token validation...\n');
console.log('JWT_SECRET:', JWT_SECRET ? `${JWT_SECRET.substring(0, 10)}...` : 'NOT SET');
console.log('JWT_AUDIENCE:', JWT_AUDIENCE);
console.log('JWT_ISSUER:', JWT_ISSUER);
console.log('\nToken:', token);

try {
  const decoded = jwt.verify(token, JWT_SECRET, {
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
    algorithms: ['HS256']
  });

  console.log('\n✓ Token is VALID\n');
  console.log('Decoded payload:', JSON.stringify(decoded, null, 2));

  // Check admin role
  const isAdmin = decoded.role === 'admin' || decoded.roles?.includes('admin');
  console.log('\nAdmin check:', isAdmin ? '✓ IS ADMIN' : '✗ NOT ADMIN');

} catch (error) {
  console.log('\n✗ Token is INVALID\n');
  console.log('Error:', error.message);
  console.log('Error name:', error.name);

  if (error.name === 'TokenExpiredError') {
    console.log('Token expired at:', error.expiredAt);
  }
}
// Last optimized: 2025-10-02

// Optimized: 2025-10-02
