// LightSpeed X-Series OAuth Initialization
// Handles OAuth flow without blocking core system startup

const https = require('https');
const fs = require('fs');
const path = require('path');

// OAuth Configuration
const config = {
  authEndpoint: process.env.LIGHTSPEED_AUTH_ENDPOINT,
  tokenEndpoint: process.env.LIGHTSPEED_TOKEN_ENDPOINT,
  clientId: process.env.LIGHTSPEED_CLIENT_ID,
  clientSecret: process.env.LIGHTSPEED_CLIENT_SECRET,
  scopes: ['employee:all', 'customer:all', 'inventory:all'],
  redirectUri: 'https://api.livhana.com/oauth/callback'
};

// Ensure required environment variables are present
const requiredEnvVars = [
  'LIGHTSPEED_AUTH_ENDPOINT',
  'LIGHTSPEED_TOKEN_ENDPOINT',
  'LIGHTSPEED_CLIENT_ID',
  'LIGHTSPEED_CLIENT_SECRET'
];

const validateConfig = () => {
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  if (missing.length > 0) {
    console.error('⚠️  Missing required environment variables:', missing.join(', '));
    console.error('Integration service will run in limited mode');
    process.exit(1);
  }
};

// Token management
const saveTokens = async (tokens) => {
  const tokenPath = path.join(__dirname, '../tmp/integrations/lightspeed_tokens.json');
  await fs.promises.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
  console.log('✅ OAuth tokens saved successfully');
};

const refreshAccessToken = async (refreshToken) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      grant_type: 'refresh_token',
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: refreshToken
    });

    const options = {
      hostname: 'api.lightspeedapp.com',
      path: '/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const tokens = JSON.parse(responseData);
          if (tokens.access_token) {
            resolve(tokens);
          } else {
            reject(new Error('Invalid token response'));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
};

// Token refresh monitoring
const startTokenMonitor = async () => {
  try {
    const tokenPath = path.join(__dirname, '../tmp/integrations/lightspeed_tokens.json');
    
    // Check if we have existing tokens
    if (fs.existsSync(tokenPath)) {
      const tokens = JSON.parse(await fs.promises.readFile(tokenPath, 'utf8'));
      
      // Set up refresh cycle
      setInterval(async () => {
        try {
          const newTokens = await refreshAccessToken(tokens.refresh_token);
          await saveTokens(newTokens);
          console.log('🔄 OAuth tokens refreshed successfully');
        } catch (err) {
          console.error('⚠️  Failed to refresh OAuth tokens:', err.message);
          console.log('Integration service may be degraded');
        }
      }, 25 * 60 * 1000); // Refresh every 25 minutes (tokens expire at 30)
      
      console.log('✅ OAuth token monitor active');
    } else {
      console.log('⚠️  No existing OAuth tokens found');
      console.log('Please complete initial OAuth flow');
    }
  } catch (err) {
    console.error('⚠️  OAuth initialization error:', err.message);
    console.log('Integration service will run in limited mode');
  }
};

// Main initialization
const init = async () => {
  try {
    validateConfig();
    await startTokenMonitor();
    
    // Log successful initialization
    const logPath = path.join(__dirname, '../logs/autonomous/oauth.log');
    const timestamp = new Date().toISOString();
    await fs.promises.appendFile(
      logPath,
      `[${timestamp}] OAuth initialization complete\n`
    );
  } catch (err) {
    console.error('❌ OAuth initialization failed:', err.message);
    process.exit(1);
  }
};

// Start initialization
init().catch(console.error);
