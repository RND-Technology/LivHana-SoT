# Platform API Integration Guide

## Executive Summary

This document provides comprehensive technical guidance for integrating High Noon Cartoon (HNC) with YouTube, TikTok, Instagram, and X (Twitter) APIs for automated video upload, metadata management, scheduling, and analytics tracking.

**Integration Goals**:
1. Automate video uploads across all platforms
2. Schedule posts for optimal timing
3. Manage metadata (titles, descriptions, hashtags)
4. Track performance analytics
5. Ensure compliance with platform policies
6. Build scalable, maintainable automation

---

## Table of Contents

1. [YouTube Data API v3 Integration](#youtube-data-api-v3-integration)
2. [TikTok Content Posting API Integration](#tiktok-content-posting-api-integration)
3. [Instagram Graph API Integration](#instagram-graph-api-integration)
4. [X (Twitter) API v2 Integration](#x-twitter-api-v2-integration)
5. [Multi-Platform Uploader Architecture](#multi-platform-uploader-architecture)
6. [Scheduling System](#scheduling-system)
7. [Error Handling & Retry Logic](#error-handling--retry-logic)
8. [Security & Credentials Management](#security--credentials-management)
9. [Rate Limiting & Quota Management](#rate-limiting--quota-management)
10. [Testing & Deployment](#testing--deployment)

---

## YouTube Data API v3 Integration

### Overview

The YouTube Data API v3 allows programmatic video uploads, metadata management, and analytics tracking. As of 2025, unverified projects created after July 28, 2020, upload videos as private by default.

### Prerequisites

**Required**:
- Google Cloud Platform account
- YouTube channel
- OAuth 2.0 credentials
- API quota allocation

**Important Restriction**:
- Videos uploaded via unverified API projects default to private
- Public uploads require Google audit/verification
- Personal accounts exempt from verification for self-use

### Setup Instructions

#### Step 1: Google Cloud Console Setup

```bash
# 1. Visit Google Cloud Console
# https://console.cloud.google.com/

# 2. Create new project
#    - Project name: "High Noon Cartoon Uploader"
#    - Organization: Your organization

# 3. Enable YouTube Data API v3
#    - Navigate to: APIs & Services > Library
#    - Search: "YouTube Data API v3"
#    - Click: Enable

# 4. Create OAuth 2.0 Credentials
#    - Navigate to: APIs & Services > Credentials
#    - Click: Create Credentials > OAuth 2.0 Client ID
#    - Application type: Desktop app or Web application
#    - Name: "HNC Video Uploader"
#    - Download JSON file as: client_secrets.json
```

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

#### Step 3: Video Upload Implementation

```javascript
// youtube-uploader.mjs
import { google } from 'googleapis';
import fs from 'fs';
import { authorizeYouTube, refreshYouTubeToken } from './youtube-auth.mjs';

/**
 * Upload video to YouTube Shorts
 */
export async function uploadYouTubeShort(videoConfig) {
  try {
    const auth = await authorizeYouTube();
    const youtube = google.youtube({ version: 'v3', auth });

    const {
      videoPath,
      title,
      description,
      tags,
      categoryId = '27', // Education category
      privacyStatus = 'public', // 'public', 'private', 'unlisted'
      madeForKids = false,
      selfDeclaredMadeForKids = false
    } = videoConfig;

    // Validate video file exists
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    const fileSize = fs.statSync(videoPath).size;
    console.log(`Uploading video: ${title} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

    // Upload video
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title,
          description,
          tags,
          categoryId,
          defaultLanguage: 'en',
          defaultAudioLanguage: 'en'
        },
        status: {
          privacyStatus,
          selfDeclaredMadeForKids,
          madeForKids
        }
      },
      media: {
        body: fs.createReadStream(videoPath)
      }
    }, {
      // Progress tracking
      onUploadProgress: (evt) => {
        const progress = (evt.bytesRead / fileSize) * 100;
        console.log(`Upload progress: ${progress.toFixed(2)}%`);
      }
    });

    const videoId = response.data.id;
    const videoUrl = `https://youtube.com/shorts/${videoId}`;

    console.log(`✓ Video uploaded successfully!`);
    console.log(`Video ID: ${videoId}`);
    console.log(`URL: ${videoUrl}`);

    return {
      success: true,
      videoId,
      videoUrl,
      data: response.data
    };

  } catch (error) {
    console.error('Error uploading to YouTube:', error.message);

    // Handle specific errors
    if (error.code === 401) {
      console.log('Token expired, refreshing...');
      const auth = await refreshYouTubeToken();
      // Retry upload
      return uploadYouTubeShort(videoConfig);
    }

    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

/**
 * Update video metadata
 */
export async function updateYouTubeVideo(videoId, updates) {
  try {
    const auth = await authorizeYouTube();
    const youtube = google.youtube({ version: 'v3', auth });

    const response = await youtube.videos.update({
      part: ['snippet', 'status'],
      requestBody: {
        id: videoId,
        snippet: updates.snippet || {},
        status: updates.status || {}
      }
    });

    console.log(`✓ Video ${videoId} updated successfully`);
    return {
      success: true,
      data: response.data
    };

  } catch (error) {
    console.error('Error updating YouTube video:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get video analytics
 */
export async function getYouTubeVideoAnalytics(videoId) {
  try {
    const auth = await authorizeYouTube();
    const youtube = google.youtube({ version: 'v3', auth });

    const response = await youtube.videos.list({
      part: ['statistics', 'contentDetails', 'status'],
      id: videoId
    });

    if (response.data.items.length === 0) {
      throw new Error('Video not found');
    }

    const video = response.data.items[0];
    const stats = video.statistics;

    return {
      success: true,
      videoId,
      views: parseInt(stats.viewCount || 0),
      likes: parseInt(stats.likeCount || 0),
      comments: parseInt(stats.commentCount || 0),
      duration: video.contentDetails.duration,
      status: video.status.uploadStatus
    };

  } catch (error) {
    console.error('Error fetching YouTube analytics:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### YouTube Shorts Specific Requirements

```javascript
// youtube-shorts-config.mjs

/**
 * Generate YouTube Shorts optimized metadata
 */
export function generateYouTubeShortsMetadata(episode) {
  const {
    episodeNumber,
    title,
    topic,
    description,
    hashtags = []
  } = episode;

  // Title optimization (max 100 chars, but 70 recommended for mobile)
  const shortTitle = `Texas Cannabis ${title} #${episodeNumber} #Shorts`;

  // Description with hashtags and links
  const fullDescription = `
${description}

🎬 High Noon Cartoon | Episode ${episodeNumber}
📚 60-second Texas cannabis compliance education
🤠 Making compliance entertaining

Episode Topic: ${topic}

🔗 Watch the full series:
📺 YouTube: [Your Channel URL]
📱 TikTok: @HighNoonCartoon
📷 Instagram: @HighNoonCartoon
🐦 X: @HighNoonCartoon

DISCLAIMER: This content is for educational and informational purposes only. Nothing in this video constitutes legal advice. Cannabis and hemp laws vary by jurisdiction. Consult with a licensed attorney for compliance guidance specific to your situation.

Age Restricted: 18+ only

${hashtags.map(tag => `#${tag}`).join(' ')}

#Shorts #CannabisEducation #TexasCannabis #CannabisCompliance #HempLaw #ComplianceEducation #HighNoonCartoon
`.trim();

  // Tags (max 500 chars total, 30 chars per tag)
  const tags = [
    'cannabis education',
    'texas cannabis',
    'cannabis compliance',
    'hemp law',
    'texas hemp',
    'cannabis business',
    'compliance training',
    'animated education',
    'high noon cartoon',
    'shorts',
    ...hashtags.slice(0, 10) // Top 10 custom hashtags
  ];

  return {
    title: shortTitle,
    description: fullDescription,
    tags,
    categoryId: '27', // Education
    privacyStatus: 'public',
    madeForKids: false,
    selfDeclaredMadeForKids: false
  };
}
```

### Rate Limits & Quotas

**Default Quota**: 10,000 units per day

**Operation Costs**:
- Video upload: 1,600 units
- Video update: 50 units
- Video list: 1 unit

**Daily Capacity**:
- ~6 video uploads per day (basic quota)
- Request quota increase if needed

**Quota Management**:
```javascript
// youtube-quota.mjs

export class YouTubeQuotaManager {
  constructor(dailyLimit = 10000) {
    this.dailyLimit = dailyLimit;
    this.used = 0;
    this.resetDate = new Date();
    this.resetDate.setHours(24, 0, 0, 0); // Resets at midnight PT
  }

  checkQuota(operation) {
    const costs = {
      upload: 1600,
      update: 50,
      list: 1,
      search: 100
    };

    const cost = costs[operation] || 0;

    if (this.used + cost > this.dailyLimit) {
      throw new Error(`Quota exceeded. Used: ${this.used}/${this.dailyLimit}`);
    }

    this.used += cost;
    return true;
  }

  getRemainingQuota() {
    return this.dailyLimit - this.used;
  }

  resetIfNeeded() {
    if (new Date() >= this.resetDate) {
      this.used = 0;
      this.resetDate = new Date();
      this.resetDate.setHours(24, 0, 0, 0);
    }
  }
}
```

---

## TikTok Content Posting API Integration

### Overview

TikTok offers two APIs for video posting:
1. **Content Posting API**: For general developers (direct post or draft)
2. **Marketing API**: For business accounts and ads

For HNC, we'll use the Content Posting API with Direct Post mode.

### Prerequisites

**Required**:
- TikTok Business Account
- TikTok Developer Account
- App registration and approval
- OAuth 2.0 credentials

**Important Restrictions**:
- Unaudited clients: Videos restricted to private
- Requires audit for public posting
- video.publish scope required

### Setup Instructions

#### Step 1: TikTok Developer Portal Setup

```bash
# 1. Visit TikTok for Developers
# https://developers.tiktok.com/

# 2. Create Developer Account
#    - Sign up with TikTok Business Account
#    - Complete verification

# 3. Create New App
#    - App name: "High Noon Cartoon Uploader"
#    - Category: Content Publishing
#    - Platform: Web

# 4. Request Scopes
#    - video.publish: Post videos to user accounts
#    - user.info.basic: Get user information

# 5. Get Credentials
#    - Client Key (App ID)
#    - Client Secret
#    - Redirect URI: https://yourdomain.com/tiktok/callback
```

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

#### Step 3: Video Upload Implementation

```javascript
// tiktok-uploader.mjs
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import { getValidTikTokToken } from './tiktok-auth.mjs';

const TIKTOK_API_BASE = 'https://open.tiktokapis.com';

/**
 * Upload video to TikTok
 */
export async function uploadTikTokVideo(videoConfig, credentials) {
  try {
    const {
      videoPath,
      title, // TikTok uses this as caption
      privacyLevel = 'PUBLIC_TO_EVERYONE', // or 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY'
      disableComment = false,
      disableDuet = false,
      disableStitch = false,
      videoMeta = {}
    } = videoConfig;

    const { clientKey, clientSecret } = credentials;

    // Validate video file
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    const fileSize = fs.statSync(videoPath).size;
    const maxSize = 72 * 1024 * 1024; // 72MB for Android, 287.6MB for iOS

    if (fileSize > maxSize) {
      throw new Error(`Video file too large: ${(fileSize / 1024 / 1024).toFixed(2)}MB (max 72MB)`);
    }

    console.log(`Uploading to TikTok: ${title} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

    // Get valid access token
    const tokens = await getValidTikTokToken(clientKey, clientSecret);

    // Step 1: Initialize upload
    const initResponse = await axios.post(
      `${TIKTOK_API_BASE}/v2/post/publish/inbox/video/init/`,
      {
        post_info: {
          title: title,
          privacy_level: privacyLevel,
          disable_comment: disableComment,
          disable_duet: disableDuet,
          disable_stitch: disableStitch,
          video_cover_timestamp_ms: 1000 // Cover frame at 1 second
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: fileSize,
          chunk_size: fileSize, // Single chunk for files under 64MB
          total_chunk_count: 1
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json; charset=UTF-8'
        }
      }
    );

    const { publish_id, upload_url } = initResponse.data.data;
    console.log('✓ Upload initialized:', publish_id);

    // Step 2: Upload video file
    const videoBuffer = fs.readFileSync(videoPath);

    await axios.put(upload_url, videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': fileSize
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      onUploadProgress: (progressEvent) => {
        const progress = (progressEvent.loaded / fileSize) * 100;
        console.log(`Upload progress: ${progress.toFixed(2)}%`);
      }
    });

    console.log('✓ Video uploaded to TikTok');

    // Step 3: Publish video
    const publishResponse = await axios.post(
      `${TIKTOK_API_BASE}/v2/post/publish/status/fetch/`,
      {
        publish_id: publish_id
      },
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json; charset=UTF-8'
        }
      }
    );

    const status = publishResponse.data.data.status;
    console.log('✓ Publish status:', status);

    return {
      success: true,
      publishId: publish_id,
      status: status,
      message: 'Video uploaded to TikTok successfully'
    };

  } catch (error) {
    console.error('Error uploading to TikTok:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
}

/**
 * Check TikTok video publish status
 */
export async function checkTikTokPublishStatus(publishId, credentials) {
  try {
    const { clientKey, clientSecret } = credentials;
    const tokens = await getValidTikTokToken(clientKey, clientSecret);

    const response = await axios.post(
      `${TIKTOK_API_BASE}/v2/post/publish/status/fetch/`,
      {
        publish_id: publishId
      },
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json; charset=UTF-8'
        }
      }
    );

    const data = response.data.data;

    return {
      success: true,
      status: data.status, // 'PROCESSING_UPLOAD', 'PUBLISH_COMPLETE', 'FAILED'
      failReason: data.fail_reason,
      uploadedBytes: data.uploaded_bytes,
      videoId: data.share_id
    };

  } catch (error) {
    console.error('Error checking TikTok status:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### TikTok-Specific Metadata Configuration

```javascript
// tiktok-config.mjs

/**
 * Generate TikTok optimized caption and metadata
 */
export function generateTikTokMetadata(episode) {
  const {
    episodeNumber,
    title,
    topic,
    hashtags = []
  } = episode;

  // TikTok caption optimization (max 2,200 characters, optimal 100-150)
  const caption = `${title} 🤠

Episode ${episodeNumber} | High Noon Cartoon

${topic}

Follow @HighNoonCartoon for daily Texas cannabis compliance education 📚

#CannabisEducation #TexasCannabis #TexasHemp #LearnOnTikTok #FYP #HighNoonCartoon ${hashtags.slice(0, 4).map(tag => `#${tag}`).join(' ')}`;

  return {
    title: caption,
    privacyLevel: 'PUBLIC_TO_EVERYONE',
    disableComment: false, // Enable community engagement
    disableDuet: false, // Allow duets for virality
    disableStitch: false, // Allow stitches for virality
    videoMeta: {
      coverTimestamp: 1000 // 1 second in for cover frame
    }
  };
}
```

### Rate Limits

**TikTok API Rate Limits**:
- 1,000 requests per day per user
- Video upload: No specific daily limit documented
- Best practice: Space out uploads (1-2 per hour)

---

## Instagram Graph API Integration

### Overview

Instagram Graph API (via Facebook Graph API) allows Reels upload, metadata management, and analytics for Instagram Business and Creator accounts.

### Prerequisites

**Required**:
- Instagram Business or Creator account
- Facebook Page linked to Instagram account
- Facebook Developer account
- App with Instagram Content Publishing permissions

**2025 Updates**:
- Most accounts: 90-second Reels
- Some accounts: 60-second limit (account-dependent)
- Strict URL requirements (direct, public, no redirects)

### Setup Instructions

#### Step 1: Facebook Developer Setup

```bash
# 1. Visit Facebook for Developers
# https://developers.facebook.com/

# 2. Create App
#    - App name: "High Noon Cartoon Publisher"
#    - App type: Business
#    - Add products: Instagram API

# 3. Configure Instagram Product
#    - Add Instagram Business Account
#    - Request permissions:
#      - instagram_basic
#      - instagram_content_publish
#      - pages_read_engagement

# 4. Get Credentials
#    - App ID
#    - App Secret
#    - Generate User Access Token (Graph API Explorer)
#    - Convert to Long-Lived Token (60 days)
```

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

#### Step 3: Reels Upload Implementation

```javascript
// instagram-uploader.mjs
import axios from 'axios';
import fs from 'fs';

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/**
 * Upload Reel to Instagram
 */
export async function uploadInstagramReel(videoConfig, credentials) {
  try {
    const {
      videoUrl, // MUST be direct, public URL to MP4 file
      caption,
      coverUrl, // Optional cover image URL
      shareToFeed = true,
      locationId = null,
      collaborators = []
    } = videoConfig;

    const { igAccountId, accessToken } = credentials;

    console.log(`Uploading Reel to Instagram: ${caption.substring(0, 50)}...`);

    // Step 1: Create media container
    const containerParams = {
      media_type: 'REELS',
      video_url: videoUrl,
      caption: caption,
      share_to_feed: shareToFeed,
      access_token: accessToken
    };

    if (coverUrl) {
      containerParams.cover_url = coverUrl;
    }

    if (locationId) {
      containerParams.location_id = locationId;
    }

    if (collaborators.length > 0) {
      containerParams.collaborators = collaborators;
    }

    const containerResponse = await axios.post(
      `${GRAPH_API_BASE}/${igAccountId}/media`,
      containerParams
    );

    const containerId = containerResponse.data.id;
    console.log('✓ Media container created:', containerId);

    // Step 2: Check container status (wait for processing)
    let status = 'IN_PROGRESS';
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max wait time

    while (status === 'IN_PROGRESS' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds

      const statusResponse = await axios.get(
        `${GRAPH_API_BASE}/${containerId}`,
        {
          params: {
            fields: 'status_code,status',
            access_token: accessToken
          }
        }
      );

      status = statusResponse.data.status_code;
      console.log(`Processing status: ${status} (attempt ${attempts + 1}/${maxAttempts})`);
      attempts++;
    }

    if (status !== 'FINISHED') {
      throw new Error(`Video processing failed or timed out. Status: ${status}`);
    }

    // Step 3: Publish media container
    const publishResponse = await axios.post(
      `${GRAPH_API_BASE}/${igAccountId}/media_publish`,
      {
        creation_id: containerId,
        access_token: accessToken
      }
    );

    const mediaId = publishResponse.data.id;
    console.log('✓ Reel published successfully!');
    console.log('Media ID:', mediaId);

    return {
      success: true,
      mediaId: mediaId,
      containerId: containerId,
      message: 'Reel uploaded to Instagram successfully'
    };

  } catch (error) {
    console.error('Error uploading to Instagram:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
}

/**
 * Get Instagram Reel insights/analytics
 */
export async function getInstagramReelInsights(mediaId, accessToken) {
  try {
    // Available metrics for Reels
    const metrics = [
      'plays',
      'reach',
      'total_interactions',
      'likes',
      'comments',
      'shares',
      'saves'
    ];

    const response = await axios.get(
      `${GRAPH_API_BASE}/${mediaId}/insights`,
      {
        params: {
          metric: metrics.join(','),
          access_token: accessToken
        }
      }
    );

    const insights = {};
    response.data.data.forEach(metric => {
      insights[metric.name] = metric.values[0].value;
    });

    return {
      success: true,
      mediaId,
      insights
    };

  } catch (error) {
    console.error('Error getting Instagram insights:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
```

### Instagram-Specific Requirements

```javascript
// instagram-config.mjs

/**
 * Generate Instagram Reels optimized metadata
 */
export function generateInstagramReelsMetadata(episode) {
  const {
    episodeNumber,
    title,
    description,
    hashtags = []
  } = episode;

  // Caption optimization (max 2,200 chars, but shorter is better for engagement)
  const caption = `${title} 🤠

${description}

Episode ${episodeNumber} | High Noon Cartoon
Your 60-second guide to Texas cannabis compliance

Making compliance education entertaining, one episode at a time 📚

Follow @HighNoonCartoon for daily episodes across all platforms!

#CannabisCompliance #TexasCannabis #CannabisEducation #TexasHemp #ComplianceEducation #CannabisBusiness #Reels #HighNoonCartoon ${hashtags.slice(0, 10).map(tag => `#${tag}`).join(' ')}`;

  return {
    caption,
    shareToFeed: true, // Also appears in main feed
    locationId: null, // Add Texas location ID if available
    collaborators: [] // Add collaborator account IDs if applicable
  };
}

/**
 * Host video file and get public URL
 * Instagram requires direct, public, no-redirect URLs
 */
export async function prepareVideoForInstagram(localVideoPath) {
  // Options:
  // 1. Upload to cloud storage (AWS S3, Google Cloud Storage)
  // 2. Host on your own server with direct access
  // 3. Use CDN with direct URLs

  // Example: Upload to S3 and get public URL
  // This is a placeholder - implement based on your hosting solution

  const publicUrl = `https://your-cdn.com/videos/hnc-episode-${Date.now()}.mp4`;

  // IMPORTANT: URL must be:
  // - Direct link to MP4 file
  // - Publicly accessible (no auth)
  // - No redirects
  // - HTTPS

  return publicUrl;
}
```

### Rate Limits

**Instagram Content Publishing Limits**:
- 25 API calls per user per hour
- 200 API calls per app per hour
- 25 media container creates per 24 hours
- No specific Reels upload limit (follows general media limits)

---

## X (Twitter) API v2 Integration

### Overview

As of June 2025, X deprecated v1.1 media upload endpoints. X API v2 requires chunked upload for videos.

### Prerequisites

**Required**:
- X Developer Account
- App with write permissions
- API keys and tokens
- Elevated or higher access tier

### Setup Instructions

#### Step 1: X Developer Portal Setup

```bash
# 1. Visit X Developer Portal
# https://developer.x.com/

# 2. Create Project and App
#    - Project name: "High Noon Cartoon Distribution"
#    - App name: "HNC Video Uploader"
#    - Environment: Production

# 3. Configure App Permissions
#    - Read and Write permissions
#    - Enable OAuth 2.0

# 4. Get Credentials
#    - API Key (Consumer Key)
#    - API Secret (Consumer Secret)
#    - Access Token
#    - Access Token Secret
#    - Bearer Token (for OAuth 2.0)
```

#### Step 2: OAuth 1.0a Authentication

```javascript
// twitter-auth.mjs
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';

/**
 * Create OAuth 1.0a instance for X API
 */
export function createTwitterOAuth(apiKey, apiSecret) {
  return new OAuth({
    consumer: {
      key: apiKey,
      secret: apiSecret
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) => {
      return crypto
        .createHmac('sha1', key)
        .update(baseString)
        .digest('base64');
    }
  });
}

/**
 * Get OAuth authorization header
 */
export function getTwitterAuthHeader(oauth, url, method, token) {
  const authHeader = oauth.toHeader(
    oauth.authorize(
      { url, method },
      token
    )
  );
  return authHeader.Authorization;
}
```

#### Step 3: Chunked Video Upload Implementation

```javascript
// twitter-uploader.mjs
import axios from 'axios';
import fs from 'fs';
import { createTwitterOAuth, getTwitterAuthHeader } from './twitter-auth.mjs';

const TWITTER_MEDIA_UPLOAD_URL = 'https://upload.twitter.com/1.1/media/upload.json';
const TWITTER_TWEET_URL = 'https://api.twitter.com/2/tweets';

/**
 * Upload video to X (Twitter) using chunked upload
 */
export async function uploadTwitterVideo(videoConfig, credentials) {
  try {
    const {
      videoPath,
      tweetText,
      replyToTweetId = null
    } = videoConfig;

    const {
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret
    } = credentials;

    // Validate video file
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    const fileSize = fs.statSync(videoPath).size;
    const maxSize = 512 * 1024 * 1024; // 512MB for most accounts

    if (fileSize > maxSize) {
      throw new Error(`Video too large: ${(fileSize / 1024 / 1024).toFixed(2)}MB (max 512MB)`);
    }

    console.log(`Uploading to X: ${tweetText.substring(0, 50)}... (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

    const oauth = createTwitterOAuth(apiKey, apiSecret);
    const token = {
      key: accessToken,
      secret: accessTokenSecret
    };

    // STEP 1: INIT - Initialize upload
    console.log('Step 1: Initializing upload...');
    const initResponse = await axios.post(
      TWITTER_MEDIA_UPLOAD_URL,
      new URLSearchParams({
        command: 'INIT',
        total_bytes: fileSize,
        media_type: 'video/mp4',
        media_category: 'tweet_video' // or 'amplify_video' for promoted content
      }),
      {
        headers: {
          'Authorization': getTwitterAuthHeader(oauth, TWITTER_MEDIA_UPLOAD_URL, 'POST', token),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const mediaId = initResponse.data.media_id_string;
    console.log('✓ Upload initialized. Media ID:', mediaId);

    // STEP 2: APPEND - Upload video in chunks
    console.log('Step 2: Uploading chunks...');
    const chunkSize = 1 * 1024 * 1024; // 1MB chunks
    const videoBuffer = fs.readFileSync(videoPath);
    const totalChunks = Math.ceil(fileSize / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileSize);
      const chunk = videoBuffer.slice(start, end);

      const formData = new FormData();
      formData.append('command', 'APPEND');
      formData.append('media_id', mediaId);
      formData.append('segment_index', i);
      formData.append('media', chunk, {
        filename: 'chunk',
        contentType: 'application/octet-stream'
      });

      await axios.post(TWITTER_MEDIA_UPLOAD_URL, formData, {
        headers: {
          'Authorization': getTwitterAuthHeader(oauth, TWITTER_MEDIA_UPLOAD_URL, 'POST', token),
          ...formData.getHeaders()
        }
      });

      const progress = ((i + 1) / totalChunks) * 100;
      console.log(`Chunk ${i + 1}/${totalChunks} uploaded (${progress.toFixed(2)}%)`);
    }

    console.log('✓ All chunks uploaded');

    // STEP 3: FINALIZE - Complete upload
    console.log('Step 3: Finalizing upload...');
    const finalizeResponse = await axios.post(
      TWITTER_MEDIA_UPLOAD_URL,
      new URLSearchParams({
        command: 'FINALIZE',
        media_id: mediaId
      }),
      {
        headers: {
          'Authorization': getTwitterAuthHeader(oauth, TWITTER_MEDIA_UPLOAD_URL, 'POST', token),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // STEP 4: Check processing status (if required)
    if (finalizeResponse.data.processing_info) {
      console.log('Step 4: Processing video...');
      await waitForTwitterProcessing(mediaId, oauth, token);
    }

    console.log('✓ Video processing complete');

    // STEP 5: Create tweet with video
    console.log('Step 5: Creating tweet...');
    const tweetPayload = {
      text: tweetText,
      media: {
        media_ids: [mediaId]
      }
    };

    if (replyToTweetId) {
      tweetPayload.reply = {
        in_reply_to_tweet_id: replyToTweetId
      };
    }

    const tweetResponse = await axios.post(
      TWITTER_TWEET_URL,
      tweetPayload,
      {
        headers: {
          'Authorization': `Bearer ${credentials.bearerToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const tweetId = tweetResponse.data.data.id;
    const tweetUrl = `https://x.com/HighNoonCartoon/status/${tweetId}`;

    console.log('✓ Tweet posted successfully!');
    console.log('Tweet ID:', tweetId);
    console.log('URL:', tweetUrl);

    return {
      success: true,
      mediaId,
      tweetId,
      tweetUrl
    };

  } catch (error) {
    console.error('Error uploading to X:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
}

/**
 * Wait for Twitter video processing to complete
 */
async function waitForTwitterProcessing(mediaId, oauth, token, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const statusResponse = await axios.get(
      TWITTER_MEDIA_UPLOAD_URL,
      {
        params: {
          command: 'STATUS',
          media_id: mediaId
        },
        headers: {
          'Authorization': getTwitterAuthHeader(oauth, TWITTER_MEDIA_UPLOAD_URL, 'GET', token)
        }
      }
    );

    const processingInfo = statusResponse.data.processing_info;

    if (processingInfo.state === 'succeeded') {
      console.log('✓ Video processing succeeded');
      return true;
    }

    if (processingInfo.state === 'failed') {
      throw new Error(`Video processing failed: ${processingInfo.error?.message}`);
    }

    const waitTime = processingInfo.check_after_secs || 5;
    console.log(`Processing... (${processingInfo.state}). Checking again in ${waitTime}s`);
    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
  }

  throw new Error('Video processing timeout');
}
```

### X-Specific Configuration

```javascript
// twitter-config.mjs

/**
 * Generate X (Twitter) optimized tweet text
 */
export function generateTwitterMetadata(episode) {
  const {
    episodeNumber,
    title,
    description,
    hashtags = []
  } = episode;

  // Tweet text optimization (280 chars max, but video takes ~24 chars for link)
  // Optimal: 200-260 chars for engagement
  const tweetText = `🚨 Texas Cannabis Compliance Alert

Episode ${episodeNumber}: ${title}

${description}

🎬 High Noon Cartoon
📚 Making compliance entertaining

#TexasCannabis #CannabisCompliance ${hashtags.slice(0, 2).map(tag => `#${tag}`).join(' ')}`;

  return {
    tweetText: tweetText.substring(0, 280), // Ensure under limit
    replyToTweetId: null // Set if creating thread
  };
}

/**
 * Create thread structure for episode context
 */
export function generateTwitterThread(episode) {
  const {
    episodeNumber,
    title,
    topic,
    keyPoints = [],
    resources = []
  } = episode;

  const tweets = [];

  // Tweet 1: Video + hook
  tweets.push({
    text: `🚨 Texas Cannabis Compliance Alert

Episode ${episodeNumber}: ${title}

Watch this 60-second breakdown 👇`,
    hasVideo: true
  });

  // Tweet 2: Context
  tweets.push({
    text: `Here's what you need to know about ${topic}:

${keyPoints.slice(0, 3).map((point, i) => `${i + 1}. ${point}`).join('\n\n')}`
  });

  // Tweet 3: Action items
  tweets.push({
    text: `How to stay compliant:

✅ ${keyPoints[0] || 'Review your current practices'}
✅ ${keyPoints[1] || 'Consult with legal counsel'}
✅ ${keyPoints[2] || 'Document your compliance'}

Don't let this catch you off guard.`
  });

  // Tweet 4: CTA
  tweets.push({
    text: `This is Episode ${episodeNumber} of High Noon Cartoon.

84 episodes breaking down Texas cannabis compliance—one 60-second short at a time.

Follow @HighNoonCartoon for daily doses 🤠

#TexasCannabis #CannabisCompliance`
  });

  return tweets;
}
```

### Rate Limits

**X API v2 Rate Limits** (per 15-minute window):
- Tweet creation: 300 requests (user context)
- Media upload: No specific limit (but use reasonable spacing)
- Timeline: 180 requests

**Best Practices**:
- Space out uploads (max 10-15 per hour)
- Monitor rate limit headers
- Implement exponential backoff

---

## Multi-Platform Uploader Architecture

### System Design

```javascript
// multi-platform-uploader.mjs
import { uploadYouTubeShort, generateYouTubeShortsMetadata } from './youtube-uploader.mjs';
import { uploadTikTokVideo, generateTikTokMetadata } from './tiktok-uploader.mjs';
import { uploadInstagramReel, generateInstagramReelsMetadata, prepareVideoForInstagram } from './instagram-uploader.mjs';
import { uploadTwitterVideo, generateTwitterMetadata, generateTwitterThread } from './twitter-uploader.mjs';
import fs from 'fs';
import path from 'path';

/**
 * Upload video to all platforms
 */
export async function uploadToAllPlatforms(episodeConfig, credentials, options = {}) {
  const {
    videoPath,
    episodeNumber,
    title,
    description,
    topic,
    hashtags = [],
    keyPoints = []
  } = episodeConfig;

  const {
    platforms = ['youtube', 'tiktok', 'instagram', 'twitter'], // Which platforms to upload to
    sequential = false, // Upload sequentially vs. parallel
    createThreads = true // Create Twitter threads
  } = options;

  console.log(`\n========================================`);
  console.log(`Uploading Episode ${episodeNumber}: ${title}`);
  console.log(`========================================\n`);

  const results = {
    episodeNumber,
    title,
    uploads: {},
    timestamp: new Date().toISOString()
  };

  // Prepare platform-specific configurations
  const uploadConfigs = {};

  if (platforms.includes('youtube')) {
    const ytMetadata = generateYouTubeShortsMetadata(episodeConfig);
    uploadConfigs.youtube = {
      videoPath,
      ...ytMetadata
    };
  }

  if (platforms.includes('tiktok')) {
    const ttMetadata = generateTikTokMetadata(episodeConfig);
    uploadConfigs.tiktok = {
      videoPath,
      ...ttMetadata
    };
  }

  if (platforms.includes('instagram')) {
    const igMetadata = generateInstagramReelsMetadata(episodeConfig);
    // Instagram requires public URL
    const videoUrl = await prepareVideoForInstagram(videoPath);
    uploadConfigs.instagram = {
      videoUrl,
      ...igMetadata
    };
  }

  if (platforms.includes('twitter')) {
    const twMetadata = generateTwitterMetadata(episodeConfig);
    uploadConfigs.twitter = {
      videoPath,
      ...twMetadata,
      thread: createThreads ? generateTwitterThread(episodeConfig) : null
    };
  }

  // Upload logic
  if (sequential) {
    // Sequential uploads (safer for rate limits)
    for (const platform of platforms) {
      console.log(`\n--- Uploading to ${platform.toUpperCase()} ---`);
      results.uploads[platform] = await uploadToPlatform(
        platform,
        uploadConfigs[platform],
        credentials[platform]
      );

      // Wait between uploads to avoid rate limits
      if (platforms.indexOf(platform) < platforms.length - 1) {
        console.log('Waiting 30 seconds before next platform...');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
  } else {
    // Parallel uploads (faster but more likely to hit rate limits)
    const uploadPromises = platforms.map(platform =>
      uploadToPlatform(platform, uploadConfigs[platform], credentials[platform])
        .then(result => ({ platform, result }))
    );

    const uploadResults = await Promise.allSettled(uploadPromises);

    uploadResults.forEach(({ status, value, reason }) => {
      if (status === 'fulfilled') {
        results.uploads[value.platform] = value.result;
      } else {
        results.uploads[value?.platform || 'unknown'] = {
          success: false,
          error: reason.message
        };
      }
    });
  }

  // Save results
  const resultsPath = `./logs/uploads/episode-${episodeNumber}-${Date.now()}.json`;
  fs.mkdirSync(path.dirname(resultsPath), { recursive: true });
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

  console.log(`\n========================================`);
  console.log(`Upload Complete - Episode ${episodeNumber}`);
  console.log(`Results saved to: ${resultsPath}`);
  console.log(`========================================\n`);

  return results;
}

/**
 * Upload to specific platform
 */
async function uploadToPlatform(platform, config, credentials) {
  try {
    switch (platform) {
      case 'youtube':
        return await uploadYouTubeShort(config, credentials);

      case 'tiktok':
        return await uploadTikTokVideo(config, credentials);

      case 'instagram':
        return await uploadInstagramReel(config, credentials);

      case 'twitter':
        const result = await uploadTwitterVideo(config, credentials);

        // Create thread if configured
        if (config.thread && result.success) {
          await createTwitterThread(result.tweetId, config.thread, credentials);
        }

        return result;

      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  } catch (error) {
    console.error(`Error uploading to ${platform}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create Twitter thread
 */
async function createTwitterThread(firstTweetId, tweets, credentials) {
  let previousTweetId = firstTweetId;

  for (let i = 1; i < tweets.length; i++) {
    const tweet = tweets[i];

    try {
      const result = await uploadTwitterVideo({
        tweetText: tweet.text,
        replyToTweetId: previousTweetId
      }, credentials);

      if (result.success) {
        previousTweetId = result.tweetId;
        console.log(`✓ Thread tweet ${i + 1}/${tweets.length} posted`);
      }

      // Wait between thread tweets
      await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
      console.error(`Error posting thread tweet ${i + 1}:`, error.message);
      break;
    }
  }
}

/**
 * Batch upload multiple episodes
 */
export async function batchUploadEpisodes(episodes, credentials, options = {}) {
  const {
    delayBetweenEpisodes = 300000, // 5 minutes default
    sequential = true
  } = options;

  const results = [];

  for (const episode of episodes) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Processing Episode ${episode.episodeNumber} of ${episodes.length}`);
    console.log(${'='.repeat(50)}\n`);

    const result = await uploadToAllPlatforms(episode, credentials, {
      ...options,
      sequential
    });

    results.push(result);

    // Wait between episodes
    if (episodes.indexOf(episode) < episodes.length - 1) {
      const minutesWait = delayBetweenEpisodes / 60000;
      console.log(`\nWaiting ${minutesWait} minutes before next episode...\n`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenEpisodes));
    }
  }

  // Save batch results
  const batchResultsPath = `./logs/batch-uploads/batch-${Date.now()}.json`;
  fs.mkdirSync(path.dirname(batchResultsPath), { recursive: true });
  fs.writeFileSync(batchResultsPath, JSON.stringify({
    totalEpisodes: episodes.length,
    timestamp: new Date().toISOString(),
    results
  }, null, 2));

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Batch Upload Complete`);
  console.log(`Total Episodes: ${episodes.length}`);
  console.log(`Results: ${batchResultsPath}`);
  console.log(${'='.repeat(50)}\n`);

  return results;
}
```

---

## Scheduling System

### Scheduling Architecture

```javascript
// scheduler.mjs
import cron from 'node-cron';
import fs from 'fs';
import { uploadToAllPlatforms } from './multi-platform-uploader.mjs';

/**
 * Schedule episodes for automatic posting
 */
export class EpisodeScheduler {
  constructor(credentials) {
    this.credentials = credentials;
    this.schedules = [];
    this.schedulePath = './config/schedule.json';
    this.loadSchedule();
  }

  /**
   * Load schedule from file
   */
  loadSchedule() {
    try {
      if (fs.existsSync(this.schedulePath)) {
        this.schedules = JSON.parse(fs.readFileSync(this.schedulePath));
        console.log(`✓ Loaded ${this.schedules.length} scheduled episodes`);
      }
    } catch (error) {
      console.error('Error loading schedule:', error.message);
      this.schedules = [];
    }
  }

  /**
   * Save schedule to file
   */
  saveSchedule() {
    try {
      fs.writeFileSync(this.schedulePath, JSON.stringify(this.schedules, null, 2));
      console.log('✓ Schedule saved');
    } catch (error) {
      console.error('Error saving schedule:', error.message);
    }
  }

  /**
   * Schedule episode for posting
   */
  scheduleEpisode(episode, postTime, platforms = ['youtube', 'tiktok', 'instagram', 'twitter']) {
    const scheduleEntry = {
      episodeNumber: episode.episodeNumber,
      episode,
      postTime: postTime.toISOString(),
      platforms,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    this.schedules.push(scheduleEntry);
    this.saveSchedule();

    // Create cron job for this episode
    this.createCronJob(scheduleEntry);

    console.log(`✓ Episode ${episode.episodeNumber} scheduled for ${postTime.toLocaleString()}`);
  }

  /**
   * Create cron job for scheduled episode
   */
  createCronJob(scheduleEntry) {
    const postTime = new Date(scheduleEntry.postTime);
    const cronExpression = `${postTime.getMinutes()} ${postTime.getHours()} ${postTime.getDate()} ${postTime.getMonth() + 1} *`;

    cron.schedule(cronExpression, async () => {
      console.log(`\n🚀 Auto-posting Episode ${scheduleEntry.episodeNumber}...`);

      try {
        const result = await uploadToAllPlatforms(
          scheduleEntry.episode,
          this.credentials,
          { platforms: scheduleEntry.platforms, sequential: true }
        );

        // Update schedule status
        scheduleEntry.status = 'posted';
        scheduleEntry.postedAt = new Date().toISOString();
        scheduleEntry.result = result;
        this.saveSchedule();

        console.log(`✓ Episode ${scheduleEntry.episodeNumber} posted successfully`);

      } catch (error) {
        console.error(`Error posting Episode ${scheduleEntry.episodeNumber}:`, error.message);
        scheduleEntry.status = 'failed';
        scheduleEntry.error = error.message;
        this.saveSchedule();
      }
    });

    console.log(`✓ Cron job created for Episode ${scheduleEntry.episodeNumber}`);
  }

  /**
   * Schedule entire series with optimal posting times
   */
  scheduleEntireSeries(episodes, startDate, postingSchedule) {
    /*
    postingSchedule example:
    {
      youtube: { days: ['monday', 'wednesday', 'friday'], time: '16:00' },
      tiktok: { days: ['daily'], time: '12:00' },
      instagram: { days: ['tuesday', 'thursday', 'saturday'], time: '17:00' },
      twitter: { days: ['daily'], time: '09:00' }
    }
    */

    const dayMap = {
      'sunday': 0,
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6
    };

    let currentDate = new Date(startDate);

    episodes.forEach((episode, index) => {
      // Schedule for each platform based on its schedule
      Object.entries(postingSchedule).forEach(([platform, schedule]) => {
        const { days, time } = schedule;
        const [hours, minutes] = time.split(':').map(Number);

        // Find next valid day for this platform
        let scheduledDate = new Date(currentDate);

        if (days[0] === 'daily') {
          // Daily posting - use current date
          scheduledDate.setHours(hours, minutes, 0, 0);
        } else {
          // Find next valid day of week
          const targetDays = days.map(day => dayMap[day.toLowerCase()]);
          let daysToAdd = 0;

          while (!targetDays.includes((scheduledDate.getDay() + daysToAdd) % 7)) {
            daysToAdd++;
          }

          scheduledDate.setDate(scheduledDate.getDate() + daysToAdd);
          scheduledDate.setHours(hours, minutes, 0, 0);
        }

        // Schedule this episode for this platform
        this.scheduleEpisode(episode, scheduledDate, [platform]);
      });

      // Move to next day for next episode
      currentDate.setDate(currentDate.getDate() + 1);
    });

    console.log(`✓ Scheduled ${episodes.length} episodes across all platforms`);
  }

  /**
   * Get upcoming scheduled episodes
   */
  getUpcomingSchedule(days = 7) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return this.schedules
      .filter(schedule => {
        const postTime = new Date(schedule.postTime);
        return postTime >= now && postTime <= futureDate && schedule.status === 'scheduled';
      })
      .sort((a, b) => new Date(a.postTime) - new Date(b.postTime));
  }

  /**
   * Cancel scheduled episode
   */
  cancelSchedule(episodeNumber) {
    const index = this.schedules.findIndex(s => s.episodeNumber === episodeNumber && s.status === 'scheduled');

    if (index !== -1) {
      this.schedules[index].status = 'cancelled';
      this.schedules[index].cancelledAt = new Date().toISOString();
      this.saveSchedule();
      console.log(`✓ Schedule cancelled for Episode ${episodeNumber}`);
      return true;
    }

    return false;
  }
}
```

---

## Error Handling & Retry Logic

```javascript
// error-handler.mjs

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    exponentialBase = 2,
    onRetry = () => {}
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      const delay = Math.min(
        baseDelay * Math.pow(exponentialBase, attempt),
        maxDelay
      );

      console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
      onRetry(attempt + 1, delay, error);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Platform-specific error handlers
 */
export const errorHandlers = {
  youtube: (error) => {
    if (error.code === 401) {
      return { retry: true, message: 'Token expired, refreshing...' };
    }
    if (error.code === 403) {
      return { retry: false, message: 'Quota exceeded or permissions issue' };
    }
    return { retry: true, message: error.message };
  },

  tiktok: (error) => {
    if (error.response?.status === 429) {
      return { retry: true, message: 'Rate limit exceeded', delay: 60000 };
    }
    if (error.response?.status === 401) {
      return { retry: true, message: 'Token expired' };
    }
    return { retry: true, message: error.message };
  },

  instagram: (error) => {
    if (error.response?.data?.error?.code === 'API_EC_RATE_LIMIT') {
      return { retry: true, message: 'Rate limit exceeded', delay: 3600000 };
    }
    if (error.response?.data?.error?.message?.includes('processing')) {
      return { retry: true, message: 'Video still processing' };
    }
    return { retry: true, message: error.message };
  },

  twitter: (error) => {
    if (error.response?.status === 429) {
      return { retry: true, message: 'Rate limit exceeded', delay: 900000 };
    }
    if (error.response?.status === 503) {
      return { retry: true, message: 'Service temporarily unavailable' };
    }
    return { retry: true, message: error.message };
  }
};
```

---

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

## Rate Limiting & Quota Management

```javascript
// rate-limiter.mjs

export class RateLimiter {
  constructor(config) {
    this.limits = config;
    this.usage = {};
    this.resetTimes = {};
  }

  /**
   * Check if request can be made
   */
  async checkLimit(platform, operation = 'default') {
    const key = `${platform}:${operation}`;
    const limit = this.limits[platform]?.[operation] || { requests: 100, window: 3600000 };

    // Initialize tracking
    if (!this.usage[key]) {
      this.usage[key] = [];
      this.resetTimes[key] = Date.now() + limit.window;
    }

    // Reset if window has passed
    if (Date.now() >= this.resetTimes[key]) {
      this.usage[key] = [];
      this.resetTimes[key] = Date.now() + limit.window;
    }

    // Remove old requests outside window
    const cutoff = Date.now() - limit.window;
    this.usage[key] = this.usage[key].filter(timestamp => timestamp > cutoff);

    // Check if limit reached
    if (this.usage[key].length >= limit.requests) {
      const oldestRequest = this.usage[key][0];
      const waitTime = limit.window - (Date.now() - oldestRequest);
      throw new Error(`Rate limit exceeded for ${platform}. Retry in ${Math.ceil(waitTime / 1000)}s`);
    }

    // Record this request
    this.usage[key].push(Date.now());
    return true;
  }

  /**
   * Get remaining requests for platform
   */
  getRemaining(platform, operation = 'default') {
    const key = `${platform}:${operation}`;
    const limit = this.limits[platform]?.[operation]?.requests || 100;
    const used = this.usage[key]?.length || 0;
    return limit - used;
  }
}

/**
 * Platform rate limit configurations
 */
export const rateLimitConfig = {
  youtube: {
    upload: { requests: 6, window: 86400000 }, // 6 per day
    update: { requests: 100, window: 86400000 }
  },
  tiktok: {
    upload: { requests: 20, window: 86400000 }, // Estimated limit
    default: { requests: 1000, window: 86400000 }
  },
  instagram: {
    upload: { requests: 25, window: 86400000 },
    default: { requests: 200, window: 3600000 }
  },
  twitter: {
    tweet: { requests: 300, window: 900000 }, // 300 per 15 min
    media: { requests: 15, window: 3600000 }
  }
};
```

---

## Testing & Deployment

### Testing Suite

```javascript
// test-uploader.mjs
import { uploadToAllPlatforms } from './multi-platform-uploader.mjs';
import { loadCredentials } from './credentials-manager.mjs';

/**
 * Test episode configuration
 */
const testEpisode = {
  videoPath: './test-videos/test-episode.mp4',
  episodeNumber: 0,
  title: 'Test Episode - Do Not Share',
  description: 'This is a test upload for API integration testing.',
  topic: 'API Testing',
  hashtags: ['test', 'development'],
  keyPoints: ['Test point 1', 'Test point 2', 'Test point 3']
};

/**
 * Run integration tests
 */
async function runTests() {
  console.log('Starting API integration tests...\n');

  try {
    const credentials = loadCredentials();

    // Test YouTube upload
    console.log('Testing YouTube upload...');
    const ytResult = await uploadToAllPlatforms(
      testEpisode,
      credentials,
      { platforms: ['youtube'], sequential: true }
    );
    console.log('YouTube result:', ytResult.uploads.youtube);

    // Test TikTok upload
    console.log('\nTesting TikTok upload...');
    const ttResult = await uploadToAllPlatforms(
      testEpisode,
      credentials,
      { platforms: ['tiktok'], sequential: true }
    );
    console.log('TikTok result:', ttResult.uploads.tiktok);

    // Test Instagram upload
    console.log('\nTesting Instagram upload...');
    const igResult = await uploadToAllPlatforms(
      testEpisode,
      credentials,
      { platforms: ['instagram'], sequential: true }
    );
    console.log('Instagram result:', igResult.uploads.instagram);

    // Test Twitter upload
    console.log('\nTesting Twitter upload...');
    const twResult = await uploadToAllPlatforms(
      testEpisode,
      credentials,
      { platforms: ['twitter'], sequential: true }
    );
    console.log('Twitter result:', twResult.uploads.twitter);

    console.log('\n✓ All integration tests completed');

  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
```

### Deployment Checklist

```markdown
## Pre-Deployment Checklist

### Credentials Setup
- [ ] All API credentials obtained and tested
- [ ] Credentials encrypted and stored securely
- [ ] Environment variables configured
- [ ] Backup credentials stored in secure location

### API Verification
- [ ] YouTube API project verified (if public uploads needed)
- [ ] TikTok app approved and audited
- [ ] Instagram Business Account connected
- [ ] X (Twitter) app configured with correct permissions

### Testing
- [ ] Test uploads to all platforms successful
- [ ] Rate limiting tested and working
- [ ] Error handling verified
- [ ] Scheduling system tested
- [ ] Analytics tracking functional

### Infrastructure
- [ ] Server/hosting configured
- [ ] Cron jobs or scheduler set up
- [ ] Logging system in place
- [ ] Monitoring/alerting configured
- [ ] Backup system implemented

### Documentation
- [ ] API integration documented
- [ ] Troubleshooting guide created
- [ ] Runbook for common issues
- [ ] Credentials rotation procedure documented

### Security
- [ ] Credentials never committed to git
- [ ] .env files in .gitignore
- [ ] API keys rotated from defaults
- [ ] Access logs enabled
- [ ] Security audit completed

### Go-Live
- [ ] Initial episode batch uploaded successfully
- [ ] All platforms confirmed posting
- [ ] Analytics tracking verified
- [ ] Monitoring alerts tested
- [ ] Team trained on system

## Post-Deployment Monitoring

### Daily
- [ ] Check upload success rate
- [ ] Monitor API quota usage
- [ ] Review error logs
- [ ] Verify scheduled posts

### Weekly
- [ ] Analyze platform performance
- [ ] Review rate limit usage
- [ ] Check credential expiration dates
- [ ] Update documentation as needed

### Monthly
- [ ] Audit API usage and costs
- [ ] Review and optimize upload schedule
- [ ] Update platform SDKs/libraries
- [ ] Security review

```

---

## Conclusion

This API integration guide provides a complete system for automating High Noon Cartoon distribution across YouTube, TikTok, Instagram, and X (Twitter). The modular architecture allows for:

1. **Independent platform management**: Each platform can be updated without affecting others
2. **Flexible scheduling**: Episodes can be posted individually or in batches
3. **Robust error handling**: Automatic retries and detailed logging
4. **Scalability**: Designed to handle 84+ episodes efficiently
5. **Security**: Encrypted credentials and secure token management

**Next Steps**:
1. Set up all platform API credentials
2. Test each platform integration individually
3. Run full multi-platform test
4. Configure scheduling for first week of episodes
5. Monitor and iterate based on performance

**Support Resources**:
- YouTube API Documentation: https://developers.google.com/youtube/v3
- TikTok API Documentation: https://developers.tiktok.com/
- Instagram API Documentation: https://developers.facebook.com/docs/instagram-api
- X API Documentation: https://developer.x.com/en/docs/twitter-api

---

*Last Updated: October 7, 2025*
*Document Version: 1.0*
*Author: High Noon Cartoon Technical Team*
