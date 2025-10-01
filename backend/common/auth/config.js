// Shared JWT configuration for all services
// This ensures consistent auth across the entire backend

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.JWT_ISSUER,
  algorithms: ['HS256'],
  expiresIn: '24h'
};

// Validate that required env vars are set
export const validateJWTConfig = () => {
  const required = ['JWT_SECRET', 'JWT_AUDIENCE', 'JWT_ISSUER'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required JWT environment variables: ${missing.join(', ')}`);
  }
};
