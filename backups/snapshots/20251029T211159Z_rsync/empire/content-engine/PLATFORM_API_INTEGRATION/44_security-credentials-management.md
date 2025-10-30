## Security & Credentials Management

```javascript
// credentials-manager.mjs
import fs from 'fs';
import crypto from 'crypto';

/**
 * Encrypt credentials
 */
export function encryptCredentials(credentials, password) {
  const algorithm = 'aes-256-gcm';
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(JSON.stringify(credentials), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

/**
 * Decrypt credentials
 */
export function decryptCredentials(encryptedData, password) {
  const algorithm = 'aes-256-gcm';
  const salt = Buffer.from(encryptedData.salt, 'hex');
  const key = crypto.scryptSync(password, salt, 32);
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

/**
 * Load credentials from environment or encrypted file
 */
export function loadCredentials() {
  // Option 1: Load from environment variables
  if (process.env.CREDENTIALS_PASSWORD) {
    const encryptedFile = fs.readFileSync('./config/credentials.enc.json');
    const encryptedData = JSON.parse(encryptedFile);
    return decryptCredentials(encryptedData, process.env.CREDENTIALS_PASSWORD);
  }

  // Option 2: Load from plain file (development only)
  if (fs.existsSync('./config/credentials.json')) {
    console.warn('⚠️  Using unencrypted credentials file (development only)');
    return JSON.parse(fs.readFileSync('./config/credentials.json'));
  }

  throw new Error('No credentials found');
}

/**
 * Credentials template
 */
export const credentialsTemplate = {
  youtube: {
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    redirectUri: 'YOUR_REDIRECT_URI',
    tokenPath: './config/youtube-token.json'
  },
  tiktok: {
    clientKey: 'YOUR_TIKTOK_CLIENT_KEY',
    clientSecret: 'YOUR_TIKTOK_CLIENT_SECRET',
    redirectUri: 'YOUR_REDIRECT_URI'
  },
  instagram: {
    appId: 'YOUR_FACEBOOK_APP_ID',
    appSecret: 'YOUR_FACEBOOK_APP_SECRET',
    igAccountId: 'YOUR_INSTAGRAM_BUSINESS_ACCOUNT_ID',
    accessToken: 'YOUR_LONG_LIVED_ACCESS_TOKEN'
  },
  twitter: {
    apiKey: 'YOUR_TWITTER_API_KEY',
    apiSecret: 'YOUR_TWITTER_API_SECRET',
    accessToken: 'YOUR_TWITTER_ACCESS_TOKEN',
    accessTokenSecret: 'YOUR_TWITTER_ACCESS_TOKEN_SECRET',
    bearerToken: 'YOUR_TWITTER_BEARER_TOKEN'
  }
};
```

---
