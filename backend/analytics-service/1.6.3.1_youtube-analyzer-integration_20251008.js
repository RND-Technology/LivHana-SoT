// RPM DNA: 1.6.3.1 (RND → Technology → YouTube Analytics Integration)
// Purpose: Viral pattern analyzer for cannabis content
// Owner: Claude Code CLI
// Status: READY FOR API KEY
// Timestamp: 2025-10-08

const { google } = require('googleapis');
const { BigQuery } = require('@google-cloud/bigquery');

/**
 * YouTube Viral Pattern Analyzer
 * Analyzes cannabis-related videos for viral patterns
 * Extracts winning thumbnails, titles, and engagement hooks
 */
class YouTubeAnalyzer {
  constructor(apiKey) {
    // WORKAROUND: Allow mock mode if no API key
    this.mockMode = !apiKey || apiKey === 'PENDING';

    if (this.mockMode) {
      console.warn('⚠️  YouTube API key not found - running in MOCK MODE');
      console.warn('   Get key from: https://console.cloud.google.com/apis/credentials');
      this.youtube = null;
    } else {
      this.youtube = google.youtube({
        version: 'v3',
        auth: apiKey
      });
    }

    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID
    });

    this.dataset = 'commerce';
    this.table = 'youtube_viral_patterns';
  }

  /**
   * Search for viral cannabis content
   * @param {string} query - Search query (default: cannabis-related terms)
   * @param {number} maxResults - Maximum results to fetch (default: 50)
   * @returns {Promise<Array>} Video data with analytics
   */
  async searchViralContent(query = 'cannabis dispensary', maxResults = 50) {
    // MOCK MODE: Return sample data if no API key
    if (this.mockMode) {
      console.log('🧪 MOCK MODE: Returning sample viral patterns');
      return this.generateMockData(query, maxResults);
    }

    try {
      const response = await this.youtube.search.list({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: maxResults,
        order: 'viewCount',
        videoDefinition: 'high',
        relevanceLanguage: 'en',
        regionCode: 'US'
      });

      const videos = response.data.items;
      console.log(`✅ Found ${videos.length} videos for query: "${query}"`);

      // Get detailed statistics for each video
      const videoIds = videos.map(v => v.id.videoId).join(',');
      const statsResponse = await this.youtube.videos.list({
        part: 'statistics,contentDetails',
        id: videoIds
      });

      // Combine search results with statistics
      return videos.map((video, index) => {
        const stats = statsResponse.data.items[index];
        return {
          videoId: video.id.videoId,
          title: video.snippet.title,
          description: video.snippet.description,
          channelTitle: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt,
          thumbnailUrl: video.snippet.thumbnails.high.url,
          viewCount: parseInt(stats.statistics.viewCount || 0),
          likeCount: parseInt(stats.statistics.likeCount || 0),
          commentCount: parseInt(stats.statistics.commentCount || 0),
          duration: stats.contentDetails.duration,
          engagementRate: this.calculateEngagementRate(stats.statistics)
        };
      });
    } catch (error) {
      console.error('❌ YouTube API error:', error.message);
      throw error;
    }
  }

  /**
   * Generate mock data for testing without API key
   */
  generateMockData(query, maxResults) {
    const mockVideos = [];
    for (let i = 0; i < Math.min(maxResults, 10); i++) {
      mockVideos.push({
        videoId: `mock-video-${i}`,
        title: `${query} - Top Video ${i + 1} (MOCK DATA)`,
        description: 'This is mock data. Get YouTube API key to see real results.',
        channelTitle: 'Mock Channel',
        publishedAt: new Date().toISOString(),
        thumbnailUrl: 'https://via.placeholder.com/1280x720?text=Mock+Thumbnail',
        viewCount: Math.floor(Math.random() * 1000000),
        likeCount: Math.floor(Math.random() * 50000),
        commentCount: Math.floor(Math.random() * 5000),
        duration: 'PT10M30S',
        engagementRate: Math.random() * 5
      });
    }
    return mockVideos;
  }

  /**
   * Calculate engagement rate
   * @param {Object} stats - Video statistics
   * @returns {number} Engagement rate percentage
   */
  calculateEngagementRate(stats) {
    const views = parseInt(stats.viewCount || 0);
    const likes = parseInt(stats.likeCount || 0);
    const comments = parseInt(stats.commentCount || 0);

    if (views === 0) return 0;

    const engagement = ((likes + comments) / views) * 100;
    return Math.round(engagement * 100) / 100; // Round to 2 decimals
  }

  /**
   * Extract viral patterns from video data
   * @param {Array} videos - Video data array
   * @returns {Object} Pattern analysis
   */
  extractViralPatterns(videos) {
    // Sort by engagement rate
    const sorted = [...videos].sort((a, b) => b.engagementRate - a.engagementRate);
    const topPerformers = sorted.slice(0, 10);

    // Analyze title patterns
    const titlePatterns = this.analyzeTitlePatterns(topPerformers);

    // Analyze thumbnail characteristics
    const thumbnailPatterns = this.analyzeThumbnailPatterns(topPerformers);

    // Analyze engagement hooks
    const engagementHooks = this.analyzeEngagementHooks(topPerformers);

    return {
      topPerformers,
      titlePatterns,
      thumbnailPatterns,
      engagementHooks,
      averageEngagement: topPerformers.reduce((sum, v) => sum + v.engagementRate, 0) / topPerformers.length
    };
  }

  /**
   * Analyze title patterns in top performers
   */
  analyzeTitlePatterns(videos) {
    const patterns = {
      commonWords: {},
      averageLength: 0,
      capsPercentage: 0,
      numberUsage: 0
    };

    videos.forEach(video => {
      const title = video.title;

      // Word frequency
      title.toLowerCase().split(/\s+/).forEach(word => {
        patterns.commonWords[word] = (patterns.commonWords[word] || 0) + 1;
      });

      // Average length
      patterns.averageLength += title.length;

      // Caps usage
      const capsCount = (title.match(/[A-Z]/g) || []).length;
      patterns.capsPercentage += (capsCount / title.length) * 100;

      // Number usage
      if (/\d/.test(title)) patterns.numberUsage++;
    });

    patterns.averageLength = Math.round(patterns.averageLength / videos.length);
    patterns.capsPercentage = Math.round(patterns.capsPercentage / videos.length);
    patterns.numberUsage = Math.round((patterns.numberUsage / videos.length) * 100);

    // Get top 10 words
    patterns.topWords = Object.entries(patterns.commonWords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    delete patterns.commonWords;

    return patterns;
  }

  /**
   * Analyze thumbnail patterns
   */
  analyzeThumbnailPatterns(videos) {
    return {
      highResThumbnails: videos.map(v => ({
        videoId: v.videoId,
        url: v.thumbnailUrl,
        engagementRate: v.engagementRate
      })),
      recommendation: 'Use high-contrast, human faces, text overlays'
    };
  }

  /**
   * Analyze engagement hooks
   */
  analyzeEngagementHooks(videos) {
    return {
      avgViewCount: Math.round(videos.reduce((sum, v) => sum + v.viewCount, 0) / videos.length),
      avgLikeCount: Math.round(videos.reduce((sum, v) => sum + v.likeCount, 0) / videos.length),
      avgCommentCount: Math.round(videos.reduce((sum, v) => sum + v.commentCount, 0) / videos.length),
      topChannels: [...new Set(videos.map(v => v.channelTitle))].slice(0, 5)
    };
  }

  /**
   * Store analysis in BigQuery
   * @param {Object} analysis - Pattern analysis results
   */
  async storeToBigQuery(analysis) {
    try {
      const rows = analysis.topPerformers.map(video => ({
        video_id: video.videoId,
        title: video.title,
        channel_title: video.channelTitle,
        published_at: video.publishedAt,
        view_count: video.viewCount,
        like_count: video.likeCount,
        comment_count: video.commentCount,
        engagement_rate: video.engagementRate,
        thumbnail_url: video.thumbnailUrl,
        analyzed_at: new Date().toISOString()
      }));

      await this.bigquery
        .dataset(this.dataset)
        .table(this.table)
        .insert(rows);

      console.log(`✅ Stored ${rows.length} viral patterns to BigQuery`);
    } catch (error) {
      console.error('❌ BigQuery insert error:', error.message);
      throw error;
    }
  }

  /**
   * Run complete viral analysis pipeline
   * @param {string} query - Search query
   * @returns {Promise<Object>} Complete analysis results
   */
  async runAnalysis(query = 'cannabis dispensary') {
    console.log(`🔍 Starting viral pattern analysis for: "${query}"`);

    // Search for videos
    const videos = await this.searchViralContent(query, 50);

    // Extract patterns
    const patterns = this.extractViralPatterns(videos);

    // Store to BigQuery
    await this.storeToBigQuery(patterns);

    console.log('✅ Analysis complete!');
    console.log(`📊 Average engagement rate: ${patterns.averageEngagement.toFixed(2)}%`);
    console.log(`🏆 Top performer: ${patterns.topPerformers[0].title}`);

    return patterns;
  }
}

// Export for use in other modules
module.exports = YouTubeAnalyzer;

// CLI execution
if (require.main === module) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('❌ YOUTUBE_API_KEY environment variable required');
    console.error('💡 Get your API key from: https://console.cloud.google.com/apis/credentials');
    console.error('💡 Add to .env.master: YOUTUBE_API_KEY=op://LivHana-Ops-Keys/YOUTUBE_API_KEY/credential');
    process.exit(1);
  }

  const analyzer = new YouTubeAnalyzer(apiKey);

  // Run analysis with different queries
  const queries = [
    'cannabis dispensary',
    'CBD products',
    'marijuana business',
    'hemp products'
  ];

  (async () => {
    for (const query of queries) {
      await analyzer.runAnalysis(query);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
  })();
}

// Optimized: 2025-10-08
// Last updated: 2025-10-08
