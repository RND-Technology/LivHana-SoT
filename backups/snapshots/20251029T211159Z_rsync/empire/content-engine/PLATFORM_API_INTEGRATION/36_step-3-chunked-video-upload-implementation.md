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
