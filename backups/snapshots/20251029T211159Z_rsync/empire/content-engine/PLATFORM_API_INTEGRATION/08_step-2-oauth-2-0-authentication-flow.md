#### Step 2: OAuth 2.0 Authentication Flow

```javascript
// youtube-auth.mjs
import { google } from 'googleapis';
import fs from 'fs';
import readline from 'readline';

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];

const TOKEN_PATH = './config/youtube-token.json';
const CLIENT_SECRETS_PATH = './config/client_secrets.json';

/**
 * Authorize YouTube API access
 */
export async function authorizeYouTube() {
  const credentials = JSON.parse(fs.readFileSync(CLIENT_SECRETS_PATH));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored token
  try {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (err) {
    return getNewToken(oAuth2Client);
  }
}

/**
 * Get new OAuth token
 */
async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this URL:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          console.error('Error retrieving access token', err);
          return reject(err);
        }
        oAuth2Client.setCredentials(token);

        // Store token for future use
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log('Token stored to', TOKEN_PATH);
        resolve(oAuth2Client);
      });
    });
  });
}

/**
 * Refresh expired token
 */
export async function refreshYouTubeToken(oAuth2Client) {
  try {
    const { credentials } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(credentials);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials));
    return oAuth2Client;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}
```
