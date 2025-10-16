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
