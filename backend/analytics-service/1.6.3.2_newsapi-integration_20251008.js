// RPM DNA: 1.6.3.2 (RND → Technology → NewsAPI Integration)
// Purpose: Real-time cannabis news pipeline for HNC content generation
// Owner: Claude Code CLI
// Status: READY FOR API KEY
// Timestamp: 2025-10-08

const axios = require('axios');
const { BigQuery } = require('@google-cloud/bigquery');

/**
 * Cannabis News Pipeline
 * Ingests real-time cannabis industry news for content generation
 * Filters for relevance, sentiment, and engagement potential
 */
class NewsAPIIntegration {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('NewsAPI.org key required. Get from: https://newsapi.org/register');
    }

    this.apiKey = apiKey;
    this.baseUrl = 'https://newsapi.org/v2';

    this.bigquery = new BigQuery({
      projectId: process.env.GCP_PROJECT_ID
    });

    this.dataset = 'commerce';
    this.table = 'cannabis_news_feed';
  }

  /**
   * Fetch cannabis-related news
   * @param {Object} options - Search options
   * @returns {Promise<Array>} News articles
   */
  async fetchNews(options = {}) {
    const {
      query = 'cannabis OR marijuana OR CBD OR hemp',
      language = 'en',
      sortBy = 'publishedAt',
      pageSize = 100
    } = options;

    try {
      const response = await axios.get(`${this.baseUrl}/everything`, {
        params: {
          q: query,
          language,
          sortBy,
          pageSize,
          apiKey: this.apiKey
        }
      });

      const articles = response.data.articles;
      console.log(`✅ Fetched ${articles.length} cannabis news articles`);

      return articles.map(article => ({
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        urlToImage: article.urlToImage,
        publishedAt: article.publishedAt,
        source: article.source.name,
        author: article.author,
        fetchedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('❌ NewsAPI error:', error.message);
      throw error;
    }
  }

  /**
   * Filter articles for content generation quality
   * @param {Array} articles - Raw news articles
   * @returns {Array} Filtered high-quality articles
   */
  filterForQuality(articles) {
    return articles.filter(article => {
      // Must have title and description
      if (!article.title || !article.description) return false;

      // Filter out removed/deleted content
      if (article.title.includes('[Removed]')) return false;

      // Must have content (not just headline)
      if (!article.content || article.content.length < 200) return false;

      // Filter for relevance keywords
      const relevantKeywords = [
        'legalization', 'dispensary', 'CBD', 'THC', 'medical marijuana',
        'cannabis business', 'hemp', 'marijuana laws', 'cannabis research',
        'cannabis industry', 'cannabis stocks', 'weed', 'pot'
      ];

      const fullText = `${article.title} ${article.description} ${article.content}`.toLowerCase();
      const hasRelevantKeyword = relevantKeywords.some(keyword =>
        fullText.includes(keyword.toLowerCase())
      );

      return hasRelevantKeyword;
    });
  }

  /**
   * Categorize articles by topic
   * @param {Array} articles - Filtered articles
   * @returns {Object} Categorized articles
   */
  categorizeArticles(articles) {
    const categories = {
      legalization: [],
      business: [],
      research: [],
      medical: [],
      recreational: [],
      enforcement: [],
      stocks: [],
      other: []
    };

    articles.forEach(article => {
      const fullText = `${article.title} ${article.description} ${article.content}`.toLowerCase();

      if (/legaliz|law|bill|legislat|congress|senate|vote/i.test(fullText)) {
        categories.legalization.push(article);
      } else if (/business|dispensary|sales|revenue|profit|market/i.test(fullText)) {
        categories.business.push(article);
      } else if (/research|study|scientist|university|clinical/i.test(fullText)) {
        categories.research.push(article);
      } else if (/medical|patient|doctor|prescription|treatment/i.test(fullText)) {
        categories.medical.push(article);
      } else if (/recreational|adult.use|consumer/i.test(fullText)) {
        categories.recreational.push(article);
      } else if (/arrest|police|raid|illegal|crime/i.test(fullText)) {
        categories.enforcement.push(article);
      } else if (/stock|nasdaq|nyse|ipo|investor|wall.street/i.test(fullText)) {
        categories.stocks.push(article);
      } else {
        categories.other.push(article);
      }
    });

    return categories;
  }

  /**
   * Extract story hooks for HNC episode generation
   * @param {Object} categorizedArticles - Categorized news
   * @returns {Array} Story hooks with engagement scores
   */
  extractStoryHooks(categorizedArticles) {
    const hooks = [];

    Object.entries(categorizedArticles).forEach(([category, articles]) => {
      articles.forEach(article => {
        const hook = {
          category,
          title: article.title,
          angle: this.determineAngle(article, category),
          engagementScore: this.calculateEngagementScore(article),
          tpopsAlignment: this.checkTPOPSAlignment(article),
          dogWhistles: this.identifyDogWhistles(article),
          publishedAt: article.publishedAt,
          sourceUrl: article.url
        };

        hooks.push(hook);
      });
    });

    // Sort by engagement score
    return hooks.sort((a, b) => b.engagementScore - a.engagementScore);
  }

  /**
   * Determine storytelling angle
   */
  determineAngle(article, category) {
    const angles = {
      legalization: 'Freedom vs Control',
      business: 'Entrepreneur Success',
      research: 'Science vs Politics',
      medical: 'Healing vs Stigma',
      recreational: 'Culture War',
      enforcement: 'Justice vs Injustice',
      stocks: 'Money Talks'
    };

    return angles[category] || 'General Interest';
  }

  /**
   * Calculate engagement score (0-100)
   */
  calculateEngagementScore(article) {
    let score = 50; // Base score

    // Title quality
    if (article.title.includes('?')) score += 5; // Questions engage
    if (article.title.includes('!')) score += 5; // Excitement
    if (/\d+/.test(article.title)) score += 5; // Numbers attract

    // Controversy keywords
    const controversialTerms = ['ban', 'illegal', 'arrest', 'fight', 'debate', 'controversial'];
    if (controversialTerms.some(term => article.title.toLowerCase().includes(term))) {
      score += 10;
    }

    // Timeliness
    const publishedDate = new Date(article.publishedAt);
    const hoursSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60);
    if (hoursSincePublished < 24) score += 15; // Fresh news
    else if (hoursSincePublished < 72) score += 5;

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Check alignment with TPOPS (The People's Plant Sovereignty)
   */
  checkTPOPSAlignment(article) {
    const tpopsKeywords = [
      'sovereignty', 'freedom', 'rights', 'people', 'plant',
      'natural', 'medicine', 'choice', 'liberty', 'autonomy'
    ];

    const fullText = `${article.title} ${article.description} ${article.content}`.toLowerCase();
    const matches = tpopsKeywords.filter(keyword => fullText.includes(keyword));

    return {
      aligned: matches.length >= 2,
      matchedKeywords: matches,
      strength: matches.length
    };
  }

  /**
   * Identify dog whistles for target audience
   */
  identifyDogWhistles(article) {
    const whistles = [];
    const fullText = `${article.title} ${article.description} ${article.content}`.toLowerCase();

    if (/trump|republican|conservative/i.test(fullText)) whistles.push('conservative');
    if (/biden|democrat|liberal/i.test(fullText)) whistles.push('liberal');
    if (/texas|southern|midwest/i.test(fullText)) whistles.push('regional');
    if (/business|entrepreneur|profit/i.test(fullText)) whistles.push('capitalist');
    if (/medical|patient|healing/i.test(fullText)) whistles.push('compassionate');
    if (/freedom|liberty|rights/i.test(fullText)) whistles.push('libertarian');

    return whistles;
  }

  /**
   * Store news to BigQuery
   */
  async storeToBigQuery(articles) {
    try {
      const rows = articles.map(article => ({
        title: article.title,
        description: article.description,
        content: article.content,
        url: article.url,
        image_url: article.urlToImage,
        published_at: article.publishedAt,
        source: article.source,
        author: article.author,
        fetched_at: article.fetchedAt,
        category: article.category || 'uncategorized'
      }));

      await this.bigquery
        .dataset(this.dataset)
        .table(this.table)
        .insert(rows);

      console.log(`✅ Stored ${rows.length} articles to BigQuery`);
    } catch (error) {
      console.error('❌ BigQuery insert error:', error.message);
      throw error;
    }
  }

  /**
   * Run complete news pipeline
   */
  async runPipeline() {
    console.log('📰 Starting cannabis news pipeline...');

    // Fetch news
    const rawArticles = await this.fetchNews();

    // Filter for quality
    const qualityArticles = this.filterForQuality(rawArticles);
    console.log(`✅ Filtered to ${qualityArticles.length} quality articles`);

    // Categorize
    const categorized = this.categorizeArticles(qualityArticles);
    console.log('📊 Categories:', Object.entries(categorized).map(([cat, arts]) =>
      `${cat}: ${arts.length}`
    ).join(', '));

    // Extract story hooks
    const hooks = this.extractStoryHooks(categorized);
    console.log(`✅ Extracted ${hooks.length} story hooks`);

    // Store to BigQuery
    await this.storeToBigQuery(qualityArticles);

    return {
      rawCount: rawArticles.length,
      qualityCount: qualityArticles.length,
      categories: categorized,
      hooks: hooks.slice(0, 20), // Top 20 hooks
      timestamp: new Date().toISOString()
    };
  }
}

// Export for use in other modules
module.exports = NewsAPIIntegration;

// CLI execution
if (require.main === module) {
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    console.error('❌ NEWSAPI_KEY environment variable required');
    console.error('💡 Get your API key from: https://newsapi.org/register');
    console.error('💡 Add to .env.master: NEWSAPI_KEY=op://LivHana-Ops-Keys/NEWSAPI_KEY/credential');
    process.exit(1);
  }

  const newsAPI = new NewsAPIIntegration(apiKey);

  (async () => {
    const results = await newsAPI.runPipeline();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Pipeline Results:');
    console.log(`   Raw articles: ${results.rawCount}`);
    console.log(`   Quality articles: ${results.qualityCount}`);
    console.log(`   Top story hooks: ${results.hooks.length}`);
    console.log('\n🏆 Top 5 Story Hooks:');
    results.hooks.slice(0, 5).forEach((hook, i) => {
      console.log(`\n   ${i + 1}. ${hook.title}`);
      console.log(`      Category: ${hook.category}`);
      console.log(`      Angle: ${hook.angle}`);
      console.log(`      Engagement: ${hook.engagementScore}/100`);
      console.log(`      TPOPS: ${hook.tpopsAlignment.aligned ? '✅' : '❌'}`);
    });
  })();
}

// Optimized: 2025-10-08
// Last updated: 2025-10-08
