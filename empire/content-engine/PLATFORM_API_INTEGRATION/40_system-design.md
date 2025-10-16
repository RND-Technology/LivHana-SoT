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
