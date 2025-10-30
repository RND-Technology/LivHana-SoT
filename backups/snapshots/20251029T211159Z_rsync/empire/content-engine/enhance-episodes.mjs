#!/usr/bin/env node
/**
 * High Noon Cartoon Episode Enhancement Engine
 * Enhances episode scripts with current events, trending hashtags, and improved dialogue
 */

import fs from 'fs/promises';
import path from 'path';

const EPISODES_DIR = './output/high-noon-cartoon';
const TRENDING_TOPICS_PATH = './output/high-noon-cartoon/trending-topics.json';

// Load trending topics
const trendingTopics = JSON.parse(await fs.readFile(TRENDING_TOPICS_PATH, 'utf-8'));

// Enhancement strategies based on episode title patterns
const enhancementStrategies = {
  compliance: {
    keywords: ['DSHS', 'Legal', 'Compliance', 'Regulation', 'Guidelines'],
    enhancements: {
      currentEvents: [
        'October 2025 DSHS emergency rules',
        '21+ age verification mandatory',
        'Governor Abbott Executive Order GA-56',
        'ISO/IEC 17025 lab testing required',
        'License revocation penalties'
      ],
      hashtags: ['#DSHS2025', '#EmergencyRules', '#21Plus', '#CannabisCompliance', '#TexasLaw'],
      dialogueUpgrades: [
        'Reference Oct 2025 enforcement start',
        'Add penalty stakes (license revocation)',
        'Mention ID verification technology',
        'Include COA QR code requirements'
      ]
    }
  },
  thca: {
    keywords: ['THCA', 'THC', 'Chemistry', 'Lab', 'Testing'],
    enhancements: {
      currentEvents: [
        'THCA legal gray area controversy',
        'Lab testing heat conversion issue',
        'Different enforcement across Texas cities',
        'THCA converts to Delta-9 when heated'
      ],
      hashtags: ['#THCA', '#CannabisChemistry', '#LabTesting', '#LegalGrayArea', '#KnowYourScience'],
      dialogueUpgrades: [
        'Explain THCA to Delta-9 conversion',
        'Joke about legal loophole chemistry',
        'Reference heat testing controversy',
        'Add Austin vs rural Texas enforcement humor'
      ]
    }
  },
  medical: {
    keywords: ['Medical', 'Patient', 'Veteran', 'Chronic Pain', 'Testimonial', 'Customer'],
    enhancements: {
      currentEvents: [
        'Texas becomes 40th state for medical cannabis',
        'HB 46 signed May 2025',
        'Expanded qualifying conditions',
        'Chronic pain now included'
      ],
      hashtags: ['#MedicalCannabis', '#Texas40thState', '#VeteransCannabis', '#ChronicPainRelief', '#HB46'],
      dialogueUpgrades: [
        'Reference 40th state milestone',
        'Mention veteran advocacy',
        'Include chronic pain expansion',
        'Celebrate medical program growth'
      ]
    }
  },
  product: {
    keywords: ['Product', 'Wall of Weed', 'Strain', 'Flower', 'Drop', 'Spotlight'],
    enhancements: {
      currentEvents: [
        '$5 billion Texas hemp industry',
        '7,000+ retail locations across Texas',
        'COA QR codes now standard',
        'Terpene education trending'
      ],
      hashtags: ['#WallOfWeed', '#LabTested', '#COACertified', '#TexasHemp', '#PremiumFlower'],
      dialogueUpgrades: [
        'Reference $5B industry size',
        'Emphasize QR code COA access',
        'Mention ISO lab certification',
        'Add terpene profile education'
      ]
    }
  },
  industry: {
    keywords: ['Industry', 'News', 'Update', 'Market', 'Trends', 'Roundup'],
    enhancements: {
      currentEvents: [
        'Governor Abbott Executive Order GA-56',
        'TABC enforcement began Oct 1, 2025',
        'Medical cannabis expansion HB 46',
        'Emergency rules reshape industry'
      ],
      hashtags: ['#IndustryNews', '#TexasCannabis', '#MarketTrends', '#ExecutiveOrder', '#CannabisBusiness'],
      dialogueUpgrades: [
        'Cover major 2025 policy shifts',
        'Reference regulatory timeline',
        'Include industry growth stats',
        'Add political/legislative context'
      ]
    }
  },
  community: {
    keywords: ['Community', 'Customer', 'Testimonial', 'Story', 'Highlight'],
    enhancements: {
      currentEvents: [
        'Texas cannabis community 7,000+ strong',
        'Medical patient access expansion',
        'Veteran cannabis advocacy success',
        'Local business compliance victories'
      ],
      hashtags: ['#TexasCannabis', '#Community', '#CustomerStories', '#CannabisFamily', '#TogetherForChange'],
      dialogueUpgrades: [
        'Feature real customer perspectives',
        'Highlight community impact',
        'Share success stories',
        'Build emotional connection'
      ]
    }
  }
};

// Additional trending hashtags to add variety
const trendingHashtags = trendingTopics.categories.viralHashtags2025.topPerformers.slice(0, 5);
const texasHashtags = trendingTopics.categories.viralHashtags2025.texasSpecific;
const ctaHooks = trendingTopics.keyMessages;

function detectEpisodeCategory(episode) {
  const titleLower = episode.title.toLowerCase();

  for (const [category, config] of Object.entries(enhancementStrategies)) {
    if (config.keywords.some(keyword => titleLower.includes(keyword.toLowerCase()))) {
      return category;
    }
  }

  return 'general';
}

function enhanceScriptBeat(originalBeat, category, episodeNumber) {
  // If script beat is generic/repetitive, create unique content
  const isGeneric = originalBeat.some(line =>
    line.includes('In the great state of Texas') ||
    line.includes('They said we couldn\'t do it')
  );

  if (isGeneric || originalBeat.length < 3) {
    const strategy = enhancementStrategies[category];
    if (!strategy) return originalBeat;

    // Create themed dialogue based on category
    const currentEvent = strategy.enhancements.currentEvents[episodeNumber % strategy.enhancements.currentEvents.length];

    return [
      `Jesse: "Texas cannabis fam, let's talk about ${currentEvent}!"`,
      `Liv Hana: "${strategy.enhancements.dialogueUpgrades[0]}"`,
      `Jesse: "That's what I'm talking about! ${strategy.enhancements.dialogueUpgrades[1]}"`,
      `Liv: "Stay informed, stay compliant, stay TOONED!"`
    ];
  }

  // Enhance existing beat with current references
  return originalBeat.map(line => {
    // Add specific year references
    if (line.includes('DSHS') && !line.includes('2025')) {
      return line.replace('DSHS', 'DSHS (Oct 2025 rules)');
    }
    if (line.includes('legal') && !line.includes('$5')) {
      return line.replace('legal', 'legal ($5B industry)');
    }
    return line;
  });
}

function enhanceSEOAnchors(original, category, episodeNumber) {
  const enhanced = [...original];

  // Always keep core branding hashtags
  const coreHashtags = ['#TexasTHC', '#StayTOONED', '#ReggieAndDro'];

  // Add category-specific hashtags
  const strategy = enhancementStrategies[category];
  if (strategy) {
    enhanced.push(...strategy.enhancements.hashtags.slice(0, 3));
  }

  // Add rotating trending hashtags
  const trendingIndex = episodeNumber % trendingHashtags.length;
  enhanced.push(trendingHashtags[trendingIndex]);

  // Add Texas-specific hashtag
  const texasIndex = episodeNumber % texasHashtags.length;
  enhanced.push(texasHashtags[texasIndex]);

  // Remove duplicates and limit to 10
  return [...new Set(enhanced)].slice(0, 10);
}

function enhanceCTA(originalCTA, category, episodeNumber) {
  const ctaOptions = trendingTopics.callToActionHooks;
  const categoryStrategy = enhancementStrategies[category];

  // If CTA is generic, replace with more compelling one
  if (originalCTA.length < 30 || originalCTA === 'Stay TOONED for more Texas THC Tales!') {
    const newCTA = ctaOptions[episodeNumber % ctaOptions.length];
    return `${newCTA} 🎬 ReggieAndDro.com`;
  }

  // Enhance existing CTA
  if (!originalCTA.includes('21+') && category === 'compliance') {
    return `${originalCTA.replace('!', '')} - 21+ only!`;
  }

  return originalCTA;
}

function addEasterEgg(episode, category) {
  const currentEgg = episode.easterEgg || '';

  // Add current events reference
  if (!currentEgg.includes('2025')) {
    return `${currentEgg} - References Oct 2025 Texas cannabis policy changes`;
  }

  return currentEgg;
}

async function enhanceEpisode(episodePath) {
  const episodeData = JSON.parse(await fs.readFile(episodePath, 'utf-8'));

  // Skip if already enhanced in v2.0.0
  if (episodeData.status === 'enhanced' && episodeData.productionMetadata?.enhancementVersion === '2.0.0') {
    console.log(`✓ ${episodeData.id} already enhanced`);
    return { episode: episodeData.id, status: 'already_enhanced' };
  }

  const episodeNumber = parseInt(episodeData.id.split('_')[1]);
  const category = detectEpisodeCategory(episodeData);

  console.log(`Enhancing ${episodeData.id} (${episodeData.title}) - Category: ${category}`);

  // Enhance components
  const enhanced = {
    ...episodeData,
    scriptBeat: enhanceScriptBeat(episodeData.scriptBeat, category, episodeNumber),
    seoAnchors: enhanceSEOAnchors(episodeData.seoAnchors, category, episodeNumber),
    cta: enhanceCTA(episodeData.cta, category, episodeNumber),
    easterEgg: addEasterEgg(episodeData, category),
    status: 'enhanced',
    productionMetadata: {
      ...episodeData.productionMetadata,
      enhancedAt: new Date().toISOString(),
      enhancementVersion: '2.0.0',
      enhancementCategory: category
    }
  };

  // Write enhanced episode
  await fs.writeFile(episodePath, JSON.stringify(enhanced, null, 2));

  return {
    episode: episodeData.id,
    status: 'enhanced',
    category,
    changes: {
      scriptBeatUpdated: JSON.stringify(episodeData.scriptBeat) !== JSON.stringify(enhanced.scriptBeat),
      hashtagsAdded: enhanced.seoAnchors.length - episodeData.seoAnchors.length,
      ctaUpdated: episodeData.cta !== enhanced.cta
    }
  };
}

async function enhanceAllEpisodes() {
  const files = await fs.readdir(EPISODES_DIR);
  const episodeFiles = files.filter(f => f.startsWith('episode_') && f.endsWith('.json'));

  console.log(`Found ${episodeFiles.length} episodes to process\n`);

  const results = [];

  for (const file of episodeFiles.sort()) {
    const episodePath = path.join(EPISODES_DIR, file);
    try {
      const result = await enhanceEpisode(episodePath);
      results.push(result);
    } catch (error) {
      console.error(`Error enhancing ${file}:`, error.message);
      results.push({ episode: file, status: 'error', error: error.message });
    }
  }

  // Generate summary
  const summary = {
    total: results.length,
    enhanced: results.filter(r => r.status === 'enhanced').length,
    alreadyEnhanced: results.filter(r => r.status === 'already_enhanced').length,
    errors: results.filter(r => r.status === 'error').length,
    byCategory: {}
  };

  results.forEach(r => {
    if (r.category) {
      summary.byCategory[r.category] = (summary.byCategory[r.category] || 0) + 1;
    }
  });

  console.log('\n=== ENHANCEMENT SUMMARY ===');
  console.log(`Total Episodes: ${summary.total}`);
  console.log(`Newly Enhanced: ${summary.enhanced}`);
  console.log(`Already Enhanced: ${summary.alreadyEnhanced}`);
  console.log(`Errors: ${summary.errors}`);
  console.log('\nBy Category:');
  Object.entries(summary.byCategory).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
  });

  // Save enhancement log
  const logPath = path.join(EPISODES_DIR, 'enhancement-log.json');
  await fs.writeFile(logPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary,
    details: results,
    trendingTopicsUsed: {
      totalHashtags: trendingTopics.categories.viralHashtags2025.topPerformers.length,
      categoriesApplied: Object.keys(enhancementStrategies),
      currentEventsIncluded: [
        'October 2025 DSHS emergency rules',
        'Governor Abbott Executive Order GA-56',
        'Texas 40th state for medical cannabis',
        '$5 billion Texas hemp industry',
        '7,000+ retail locations'
      ]
    }
  }, null, 2));

  console.log(`\nEnhancement log saved to: ${logPath}`);

  return results;
}

// Run enhancement
console.log('🚀 High Noon Cartoon Episode Enhancement Engine\n');
console.log('Integrating current Texas cannabis news, trending hashtags, and viral content strategies...\n');

await enhanceAllEpisodes();

console.log('\n✅ Enhancement complete! Stay TOONED! 🎬');
