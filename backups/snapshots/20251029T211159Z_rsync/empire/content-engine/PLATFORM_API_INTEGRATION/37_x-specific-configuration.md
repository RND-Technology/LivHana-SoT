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
