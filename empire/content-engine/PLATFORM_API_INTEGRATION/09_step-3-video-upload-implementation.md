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
