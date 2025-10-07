#!/usr/bin/env node

/**
 * REAL-TIME CANNABIS NEWS INGESTION PIPELINE
 *
 * Continuously monitors and ingests cannabis news from Texas and US federal sources.
 * Extracts key talking points for High Noon Cartoon episodes.
 * Scores news items by viral potential + advocacy opportunity.
 *
 * Run daily via cron: 0 9 * * * cd /path/to/empire/content-engine && node news-ingestion-pipeline.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OUTPUT_DIR = path.join(__dirname, 'output', 'news');
const TODAY = new Date().toISOString().split('T')[0];

// Search query configurations
const SEARCH_QUERIES = {
  texas: [
    'Texas cannabis hemp THC DSHS legislation',
    'Texas marijuana arrest law enforcement',
    'Texas hemp business dispensary',
    'Greg Abbott cannabis executive order Texas'
  ],
  federal: [
    'federal cannabis legalization DEA',
    'Biden Trump marijuana rescheduling',
    'DEA Schedule III cannabis',
    'Congressional cannabis bill'
  ],
  culture: [
    'cannabis culture trends viral',
    'marijuana social media Reddit',
    'cannabis wellness movement 2025',
    'weed infused pre-rolls trending'
  ],
  advocacy: [
    'cannabis social justice reform',
    'marijuana legalization advocacy',
    'cannabis arrest racial disparity',
    'hemp farmers rights'
  ]
};

// HNC Character angles for different news types
const CHARACTER_ANGLES = {
  legislation: {
    reggie: "Reggie's cynical take on politicians who can't get their act together",
    dro: "Dro's optimistic spin on why this could lead to full legalization",
    tex: "Tex's business analysis on what this means for hemp shops"
  },
  arrest: {
    reggie: "Reggie's rage against the injustice of cannabis arrests in 2025",
    dro: "Dro's personal story about friends caught in the system",
    tex: "Tex's lawyer mode - what your rights are if you get stopped"
  },
  business: {
    reggie: "Reggie sees opportunity in chaos - how to navigate the grey market",
    dro: "Dro's vision for community-owned dispensaries",
    tex: "Tex breaks down the economics and licensing requirements"
  },
  federal: {
    reggie: "Reggie's skepticism about federal promises vs. state reality",
    dro: "Dro's hope that change is finally coming",
    tex: "Tex analyzes the political chess game between parties"
  },
  culture: {
    reggie: "Reggie mocks mainstream co-opting of cannabis culture",
    dro: "Dro celebrates the normalization and wellness movement",
    tex: "Tex explores what trends mean for Texas consumers"
  }
};

// Scoring functions
function calculateViralPotential(newsItem) {
  let score = 5; // Base score

  // Controversy adds viral potential
  if (newsItem.summary.match(/ban|arrest|lawsuit|raid|conflict/i)) score += 3;

  // Celebrity/political figures boost virality
  if (newsItem.summary.match(/Abbott|Biden|Trump|DEA|governor|president/i)) score += 2;

  // Business angle adds interest
  if (newsItem.summary.match(/\$|billion|million|business|market|dispensary/i)) score += 1;

  // Youth/culture angle
  if (newsItem.summary.match(/youth|college|culture|Reddit|viral|trend/i)) score += 1;

  return Math.min(score, 10);
}

function identifyAdvocacyOpportunity(newsItem) {
  const opportunities = [];

  if (newsItem.summary.match(/arrest|jail|prison|criminal/i)) {
    opportunities.push("Criminal justice reform - highlight the human cost of prohibition");
  }

  if (newsItem.summary.match(/business|license|regulation|ban/i)) {
    opportunities.push("Economic opportunity - show how regulation can create jobs and tax revenue");
  }

  if (newsItem.summary.match(/medical|patient|health|wellness/i)) {
    opportunities.push("Medical access - emphasize patient rights and health benefits");
  }

  if (newsItem.summary.match(/youth|minor|age|21/i)) {
    opportunities.push("Public safety - advocate for smart regulation over prohibition");
  }

  if (newsItem.summary.match(/federal|state|conflict|enforcement/i)) {
    opportunities.push("State vs. federal rights - highlight the absurdity of conflicting laws");
  }

  return opportunities.length > 0 ? opportunities.join("; ") : "General legalization advocacy";
}

function determineNewsType(headline, summary) {
  const text = (headline + " " + summary).toLowerCase();

  if (text.match(/arrest|jail|prison|enforcement|police/)) return 'arrest';
  if (text.match(/business|dispensary|shop|license|market/)) return 'business';
  if (text.match(/bill|law|legislation|executive|order|dshs|tabc/)) return 'legislation';
  if (text.match(/federal|dea|biden|trump|congress|schedule/)) return 'federal';
  if (text.match(/culture|trend|reddit|viral|social/)) return 'culture';

  return 'general';
}

function generateHNCAngle(newsItem, newsType) {
  const angles = CHARACTER_ANGLES[newsType] || CHARACTER_ANGLES.legislation;
  const characterDialogue = [];

  // Generate specific dialogue hooks based on the news
  if (newsType === 'legislation') {
    characterDialogue.push({
      character: "REGGIE",
      hook: `"Y'all see this? ${extractKeyPoint(newsItem)}. Politicians acting like they doing something, but really just making it harder for regular folks."`
    });
    characterDialogue.push({
      character: "DRO",
      hook: `"Hold up Reg, at least they're talking about it. ${extractPositive(newsItem)}. Progress is progress, even if it's slow."`
    });
  } else if (newsType === 'arrest') {
    characterDialogue.push({
      character: "REGGIE",
      hook: `"Another one. ${extractKeyPoint(newsItem)}. In 2025! While hemp shops on every corner selling the same thing!"`
    });
    characterDialogue.push({
      character: "TEX",
      hook: `"That's the contradiction. ${extractLegalPoint(newsItem)}. Know your rights, people."`
    });
  } else if (newsType === 'business') {
    characterDialogue.push({
      character: "TEX",
      hook: `"Let's talk money. ${extractKeyPoint(newsItem)}. This is a ${extractBusinessValue(newsItem)} industry in Texas."`
    });
    characterDialogue.push({
      character: "DRO",
      hook: `"Imagine if that money stayed in our communities. ${extractCommunityAngle(newsItem)}."`
    });
  }

  return {
    summary: angles.reggie + " vs. " + angles.dro,
    dialogue_hooks: characterDialogue,
    scene_setting: `INT. REGGIE'S APARTMENT - DAY\nThe crew is watching the news about ${extractKeyPoint(newsItem)}`
  };
}

function extractKeyPoint(newsItem) {
  // Extract the most important sentence
  const sentences = newsItem.summary.split(/[.!?]+/);
  return sentences[0].trim() || newsItem.headline;
}

function extractPositive(newsItem) {
  // Look for positive keywords
  if (newsItem.summary.match(/expand|grow|legal|allow|approve/i)) {
    const match = newsItem.summary.match(/([^.!?]*(?:expand|grow|legal|allow|approve)[^.!?]*)/i);
    return match ? match[0] : "at least it's movement in the right direction";
  }
  return "at least it's movement in the right direction";
}

function extractLegalPoint(newsItem) {
  if (newsItem.summary.match(/\d+ ounce|possession|misdemeanor|felony/i)) {
    const match = newsItem.summary.match(/([^.!?]*(?:\d+ ounce|possession|misdemeanor|felony)[^.!?]*)/i);
    return match ? match[0] : "the law is inconsistent";
  }
  return "the law is inconsistent";
}

function extractBusinessValue(newsItem) {
  const dollarMatch = newsItem.summary.match(/\$[\d.]+ (?:billion|million)/i);
  return dollarMatch ? dollarMatch[0] : "multi-billion dollar";
}

function extractCommunityAngle(newsItem) {
  if (newsItem.summary.match(/license|dispensary|business/i)) {
    return "Community ownership, local jobs, reinvestment";
  }
  return "Economic justice starts with access";
}

// Main ingestion function
async function ingestCannabisNews(manualData = null) {
  console.log(`\n🌿 CANNABIS NEWS INGESTION PIPELINE - ${TODAY}\n`);

  const newsData = {
    date: TODAY,
    generated_at: new Date().toISOString(),
    texas_news: [],
    federal_news: [],
    culture_trends: [],
    advocacy_opportunities: [],
    top_3_episode_ideas: []
  };

  if (manualData) {
    // Process manually provided news data (from WebSearch results)
    console.log("📊 Processing manually gathered news data...\n");

    // Process Texas news
    if (manualData.texas) {
      manualData.texas.forEach(item => {
        const newsType = determineNewsType(item.headline, item.summary);
        const processedItem = {
          headline: item.headline,
          source: item.source || "Web Search",
          summary: item.summary,
          url: item.url || "",
          news_type: newsType,
          hnc_angle: generateHNCAngle(item, newsType),
          advocacy_opportunity: identifyAdvocacyOpportunity(item),
          viral_potential: calculateViralPotential(item),
          date_found: TODAY
        };
        newsData.texas_news.push(processedItem);
      });
    }

    // Process Federal news
    if (manualData.federal) {
      manualData.federal.forEach(item => {
        const newsType = 'federal';
        const processedItem = {
          headline: item.headline,
          source: item.source || "Web Search",
          summary: item.summary,
          url: item.url || "",
          news_type: newsType,
          hnc_angle: generateHNCAngle(item, newsType),
          advocacy_opportunity: identifyAdvocacyOpportunity(item),
          viral_potential: calculateViralPotential(item),
          date_found: TODAY
        };
        newsData.federal_news.push(processedItem);
      });
    }

    // Process Culture trends
    if (manualData.culture) {
      manualData.culture.forEach(item => {
        const newsType = 'culture';
        const processedItem = {
          headline: item.headline,
          source: item.source || "Web Search",
          summary: item.summary,
          url: item.url || "",
          news_type: newsType,
          hnc_angle: generateHNCAngle(item, newsType),
          advocacy_opportunity: identifyAdvocacyOpportunity(item),
          viral_potential: calculateViralPotential(item),
          date_found: TODAY
        };
        newsData.culture_trends.push(processedItem);
      });
    }
  } else {
    console.log("⚠️  No manual data provided. In production, this would use WebSearch API.\n");
    console.log("To use this pipeline:");
    console.log("1. Integrate with a news API (NewsAPI, Google News, etc.)");
    console.log("2. Set up Claude API access for WebSearch");
    console.log("3. Schedule via cron for daily execution\n");
  }

  // Generate top 3 episode ideas
  const allNews = [
    ...newsData.texas_news,
    ...newsData.federal_news,
    ...newsData.culture_trends
  ];

  // Sort by viral potential
  const topStories = allNews
    .sort((a, b) => b.viral_potential - a.viral_potential)
    .slice(0, 3);

  newsData.top_3_episode_ideas = topStories.map((story, index) => ({
    rank: index + 1,
    episode_concept: `"${story.headline}" - ${story.hnc_angle.summary}`,
    key_story: story.headline,
    viral_potential: story.viral_potential,
    advocacy_angle: story.advocacy_opportunity,
    dialogue_hooks: story.hnc_angle.dialogue_hooks || [],
    scene_ideas: [
      story.hnc_angle.scene_setting || "INT. REGGIE'S APARTMENT - DAY",
      "INT. LOCAL DISPENSARY - DAY (B-ROLL of actual Texas hemp shop)",
      "INT. CAPITOL BUILDING - DAY (News footage overlay)"
    ],
    target_length: "3-5 minutes",
    platforms: ["YouTube Shorts", "TikTok", "Instagram Reels", "Twitter/X"]
  }));

  // Compile advocacy opportunities
  const advocacyMap = new Map();
  allNews.forEach(item => {
    const opps = item.advocacy_opportunity.split(';');
    opps.forEach(opp => {
      const trimmed = opp.trim();
      if (trimmed) {
        advocacyMap.set(trimmed, (advocacyMap.get(trimmed) || 0) + 1);
      }
    });
  });

  newsData.advocacy_opportunities = Array.from(advocacyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([opportunity, count]) => ({
      opportunity,
      frequency: count,
      priority: count >= 3 ? "HIGH" : count >= 2 ? "MEDIUM" : "LOW"
    }));

  // Summary statistics
  newsData.summary = {
    total_items: allNews.length,
    texas_items: newsData.texas_news.length,
    federal_items: newsData.federal_news.length,
    culture_items: newsData.culture_trends.length,
    high_viral_potential: allNews.filter(n => n.viral_potential >= 8).length,
    medium_viral_potential: allNews.filter(n => n.viral_potential >= 5 && n.viral_potential < 8).length,
    top_advocacy_priority: newsData.advocacy_opportunities[0]?.opportunity || "N/A"
  };

  return newsData;
}

// Save function
function saveDailyBrief(data) {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const filename = `daily-cannabis-brief-${TODAY}.json`;
  const filepath = path.join(OUTPUT_DIR, filename);

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`✅ Daily brief saved to: ${filepath}\n`);

  // Also save latest.json for easy access
  const latestPath = path.join(OUTPUT_DIR, 'latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(data, null, 2));
  console.log(`✅ Latest brief updated: ${latestPath}\n`);

  return filepath;
}

// Print summary
function printSummary(data) {
  console.log("═══════════════════════════════════════════════════════");
  console.log("📰 DAILY CANNABIS NEWS BRIEF SUMMARY");
  console.log("═══════════════════════════════════════════════════════\n");

  console.log(`📅 Date: ${data.date}`);
  console.log(`📊 Total News Items: ${data.summary.total_items}`);
  console.log(`   - Texas: ${data.summary.texas_items}`);
  console.log(`   - Federal: ${data.summary.federal_items}`);
  console.log(`   - Culture: ${data.summary.culture_items}`);
  console.log(`\n🔥 High Viral Potential: ${data.summary.high_viral_potential} items`);
  console.log(`⚡ Medium Viral Potential: ${data.summary.medium_viral_potential} items`);
  console.log(`\n🎯 Top Advocacy Priority: ${data.summary.top_advocacy_priority}\n`);

  console.log("═══════════════════════════════════════════════════════");
  console.log("🎬 TOP 3 EPISODE IDEAS");
  console.log("═══════════════════════════════════════════════════════\n");

  data.top_3_episode_ideas.forEach((idea, index) => {
    console.log(`${index + 1}. ${idea.key_story}`);
    console.log(`   Viral Score: ${idea.viral_potential}/10`);
    console.log(`   Concept: ${idea.episode_concept}`);
    console.log(`   Advocacy: ${idea.advocacy_angle}`);
    if (idea.dialogue_hooks.length > 0) {
      console.log(`   Sample Dialogue:`);
      idea.dialogue_hooks.forEach(hook => {
        console.log(`     ${hook.character}: ${hook.hook}`);
      });
    }
    console.log();
  });

  console.log("═══════════════════════════════════════════════════════\n");
}

// Main execution
async function main() {
  try {
    // This is where you'd normally call WebSearch API
    // For now, we'll process the data we gathered manually
    console.log("🚀 Starting Cannabis News Ingestion Pipeline...\n");

    // In production, replace this with actual API calls
    const manualNewsData = {
      texas: [], // Will be populated with real data
      federal: [],
      culture: []
    };

    const newsData = await ingestCannabisNews(manualNewsData);
    const filepath = saveDailyBrief(newsData);
    printSummary(newsData);

    console.log("✨ Pipeline execution complete!\n");
    console.log("📝 Next steps:");
    console.log("   1. Review the daily brief JSON");
    console.log("   2. Share top episode ideas with HNC writers");
    console.log("   3. Schedule follow-up searches on high-priority stories");
    console.log("   4. Set up cron job for daily automation\n");

  } catch (error) {
    console.error("❌ Pipeline error:", error);
    process.exit(1);
  }
}

// Export for use as module
export { ingestCannabisNews, saveDailyBrief, printSummary };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
