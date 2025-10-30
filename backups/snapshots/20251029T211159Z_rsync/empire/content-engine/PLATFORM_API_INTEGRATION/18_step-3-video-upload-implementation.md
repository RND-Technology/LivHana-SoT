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
