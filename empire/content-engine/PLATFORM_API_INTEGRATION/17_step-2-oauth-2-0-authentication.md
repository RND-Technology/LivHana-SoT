#### Step 2: OAuth 2.0 Authentication

```javascript
// tiktok-auth.mjs
import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';

const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TOKEN_PATH = './config/tiktok-token.json';

/**
 * Generate TikTok authorization URL
 */
export function getTikTokAuthUrl(clientKey, redirectUri) {
  const csrfState = crypto.randomBytes(16).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  // Store for later use
  fs.writeFileSync('./config/tiktok-pkce.json', JSON.stringify({
    csrfState,
    codeVerifier
  }));

  const params = new URLSearchParams({
    client_key: clientKey,
    scope: 'user.info.basic,video.publish',
    response_type: 'code',
    redirect_uri: redirectUri,
    state: csrfState,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return `${TIKTOK_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function getTikTokAccessToken(clientKey, clientSecret, code, redirectUri) {
  try {
    const pkce = JSON.parse(fs.readFileSync('./config/tiktok-pkce.json'));

    const response = await axios.post(TIKTOK_TOKEN_URL, {
      client_key: clientKey,
      client_secret: clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code_verifier: pkce.codeVerifier
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const tokenData = response.data;

    // Store tokens
    fs.writeFileSync(TOKEN_PATH, JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    }));

    console.log('✓ TikTok access token obtained');
    return tokenData;

  } catch (error) {
    console.error('Error getting TikTok access token:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Refresh TikTok access token
 */
export async function refreshTikTokToken(clientKey, clientSecret) {
  try {
    const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));

    const response = await axios.post(TIKTOK_TOKEN_URL, {
      client_key: clientKey,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const tokenData = response.data;

    // Update stored tokens
    fs.writeFileSync(TOKEN_PATH, JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    }));

    console.log('✓ TikTok access token refreshed');
    return tokenData;

  } catch (error) {
    console.error('Error refreshing TikTok token:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get valid access token (refresh if expired)
 */
export async function getValidTikTokToken(clientKey, clientSecret) {
  const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH));

  // Check if token is expired or expiring soon (within 1 hour)
  if (Date.now() >= tokens.expires_at - 3600000) {
    return refreshTikTokToken(clientKey, clientSecret);
  }

  return tokens;
}
```
