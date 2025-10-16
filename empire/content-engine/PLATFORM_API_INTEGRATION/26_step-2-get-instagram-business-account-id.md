#### Step 2: Get Instagram Business Account ID

```javascript
// instagram-setup.mjs
import axios from 'axios';

/**
 * Get Instagram Business Account ID from Facebook Page
 */
export async function getInstagramBusinessAccountId(pageId, accessToken) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v18.0/${pageId}`,
      {
        params: {
          fields: 'instagram_business_account',
          access_token: accessToken
        }
      }
    );

    const igAccountId = response.data.instagram_business_account?.id;

    if (!igAccountId) {
      throw new Error('No Instagram Business Account found for this page');
    }

    console.log('✓ Instagram Business Account ID:', igAccountId);
    return igAccountId;

  } catch (error) {
    console.error('Error getting Instagram account:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Convert short-lived token to long-lived token (60 days)
 */
export async function getLongLivedToken(appId, appSecret, shortLivedToken) {
  try {
    const response = await axios.get(
      'https://graph.facebook.com/v18.0/oauth/access_token',
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: appId,
          client_secret: appSecret,
          fb_exchange_token: shortLivedToken
        }
      }
    );

    const longLivedToken = response.data.access_token;
    console.log('✓ Long-lived token obtained (expires in 60 days)');

    return longLivedToken;

  } catch (error) {
    console.error('Error getting long-lived token:', error.response?.data || error.message);
    throw error;
  }
}
```
