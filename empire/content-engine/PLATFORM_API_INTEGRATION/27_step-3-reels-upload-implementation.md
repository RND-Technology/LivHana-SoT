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
