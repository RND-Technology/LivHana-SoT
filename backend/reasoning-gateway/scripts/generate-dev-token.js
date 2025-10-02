#!/usr/bin/env node
/**
 * Generate a valid JWT token for local development
 * This token will be used by the frontend to authenticate with reasoning-gateway
 */

import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'livhana-local';
const JWT_ISSUER = process.env.JWT_ISSUER || 'livhana-local';

if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET not found in environment');
  process.exit(1);
}

const payload = {
  sub: 'dev-user-local',
  id: 'dev-user-id',
  role: 'admin',
  roles: ['admin', 'user'],
  name: 'Local Dev User',
  email: 'dev@livhana.local'
};

const options = {
  audience: JWT_AUDIENCE,
  issuer: JWT_ISSUER,
  algorithm: 'HS256',
  expiresIn: '7d' // 7 days
};

try {
  const token = jwt.sign(payload, JWT_SECRET, options);

  console.log('\n=== DEV JWT TOKEN GENERATED ===\n');
  console.log('Token:', token);
  console.log('\nPayload:', JSON.stringify(payload, null, 2));
  console.log('\nExpires in:', options.expiresIn);
  console.log('\n=== USAGE ===');
  console.log('Add this to localStorage in browser console:');
  console.log(`localStorage.setItem('livhana_session_token', '${token}');`);
  console.log('\nOr use in curl:');
  console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:4002/api/autonomous/capabilities`);
  console.log('\n');

  // Verify the token works
  jwt.verify(token, JWT_SECRET, {
    audience: JWT_AUDIENCE,
    issuer: JWT_ISSUER,
    algorithms: ['HS256']
  });

  console.log('✓ Token verified successfully\n');

} catch (error) {
  console.error('ERROR generating token:', error.message);
  process.exit(1);
}

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
