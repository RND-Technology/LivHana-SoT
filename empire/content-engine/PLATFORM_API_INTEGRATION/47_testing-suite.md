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
