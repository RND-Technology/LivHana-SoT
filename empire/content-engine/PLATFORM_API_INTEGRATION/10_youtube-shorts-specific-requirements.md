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
