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
