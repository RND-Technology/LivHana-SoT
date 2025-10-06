import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 8086;

// HCN Production Pipeline System
class HCNProductionPipeline {
  constructor() {
    this.productionQueue = new Map();
    this.contentTemplates = new Map();
    this.characterDatabase = new Map();
    this.episodePipeline = new Map();
    
    // Initialize characters
    this.initializeCharacters();
    
    // Initialize content templates
    this.initializeTemplates();
  }
  
  // Initialize characters
  initializeCharacters() {
    const characters = {
      JESSE: {
        id: 'jesse',
        name: 'JESSE',
        role: 'Lead',
        personality: 'Entrepreneurial, Texas-proud, cannabis advocate',
        voice: 'Authentic, passionate, educational',
        catchphrases: ['Cheetah Power!', 'Texas Takeover!', 'Unicorn Race!']
      },
      LIV_HANNA: {
        id: 'liv_hanna',
        name: 'LIV HANNA',
        role: 'Co-star',
        personality: 'AI-powered, analytical, supportive',
        voice: 'Intelligent, helpful, innovative',
        catchphrases: ['Analyzing...', 'Processing...', 'Optimizing...']
      },
      LT_DAN: {
        id: 'lt_dan',
        name: 'Lt. Dan',
        role: 'Authority Figure',
        personality: 'Law enforcement, conflicted, evolving',
        voice: 'Official, questioning, growing',
        catchphrases: ['That\'s not how we do things', 'Wait, that makes sense']
      },
      CHIEF_STEVE: {
        id: 'chief_steve',
        name: 'Chief Steve',
        role: 'Policy Maker',
        personality: 'Bureaucratic, cautious, learning',
        voice: 'Formal, careful, considering',
        catchphrases: ['We need to follow procedure', 'Let me check the regulations']
      },
      AUBREY_AWFULS: {
        id: 'aubrey_awfuls',
        name: 'Aubrey Awfuls',
        role: 'Antagonist',
        personality: 'Oppositional, outdated, resistant',
        voice: 'Negative, dismissive, stuck',
        catchphrases: ['That will never work', 'We\'ve always done it this way']
      }
    };
    
    Object.entries(characters).forEach(([key, character]) => {
      this.characterDatabase.set(key, character);
    });
  }
  
  // Initialize content templates
  initializeTemplates() {
    const templates = {
      episode: {
        structure: [
          'Hook (0-15s)',
          'Setup (15-45s)',
          'Conflict (45-90s)',
          'Resolution (90-120s)',
          'Call to Action (120s)'
        ],
        elements: [
          'Character introduction',
          'Problem presentation',
          'Solution demonstration',
          'Educational moment',
          'Community engagement'
        ]
      },
      logline: {
        format: '[CHARACTER] must [ACTION] when [CONFLICT] threatens [STAKES]',
        examples: [
          'JESSE must convince Lt. Dan when outdated regulations threaten Texas cannabis progress',
          'LIV HANNA must optimize compliance when bureaucratic barriers threaten business growth',
          'Chief Steve must adapt policy when innovation threatens traditional approaches'
        ]
      },
      script: {
        style: 'South Park style',
        tone: 'Satirical, educational, entertaining',
        length: '60-120 seconds',
        format: 'Character dialogue with visual gags'
      },
      captions: {
        variants: [
          'Educational focus',
          'Entertainment focus',
          'Compliance focus',
          'Community focus'
        ],
        style: 'Clear, engaging, accessible'
      },
      thumbnails: {
        concepts: [
          'Character close-up',
          'Action scene',
          'Educational moment',
          'Comedy moment'
        ],
        style: 'Eye-catching, professional, Texas-themed'
      }
    };
    
    Object.entries(templates).forEach(([key, template]) => {
      this.contentTemplates.set(key, template);
    });
  }
  
  // Create episode from trigger
  createEpisode(trigger, episodeNumber) {
    const episodeId = uuidv4();
    const episode = {
      id: episodeId,
      number: episodeNumber,
      trigger,
      logline: this.generateLogline(trigger),
      script: this.generateScript(trigger),
      shotList: this.generateShotList(trigger),
      captions: this.generateCaptions(trigger),
      thumbnails: this.generateThumbnails(trigger),
      seoTags: this.generateSEOTags(trigger),
      compliance: this.checkCompliance(trigger),
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    
    this.episodePipeline.set(episodeId, episode);
    return episode;
  }
  
  // Generate logline
  generateLogline(trigger) {
    const templates = this.contentTemplates.get('logline');
    const randomTemplate = templates.examples[Math.floor(Math.random() * templates.examples.length)];
    
    return {
      template: randomTemplate,
      trigger: trigger,
      characters: this.selectCharacters(trigger),
      conflict: this.identifyConflict(trigger),
      stakes: this.identifyStakes(trigger)
    };
  }
  
  // Generate script
  generateScript(trigger) {
    const script = {
      style: 'South Park style',
      tone: 'Satirical, educational, entertaining',
      length: '60-120 seconds',
      scenes: []
    };
    
    // Generate scenes based on episode structure
    const structure = this.contentTemplates.get('episode').structure;
    structure.forEach((scene, index) => {
      script.scenes.push({
        name: scene,
        duration: this.calculateSceneDuration(scene),
        dialogue: this.generateDialogue(trigger, scene),
        characters: this.selectCharacters(trigger),
        visualGags: this.generateVisualGags(trigger, scene)
      });
    });
    
    return script;
  }
  
  // Generate shot list
  generateShotList(trigger) {
    const shots = [];
    const characters = this.selectCharacters(trigger);
    
    // Opening shot
    shots.push({
      number: 1,
      type: 'Establishing',
      description: 'Texas landscape with cannabis plants',
      duration: 3,
      characters: []
    });
    
    // Character introductions
    characters.forEach((character, index) => {
      shots.push({
        number: index + 2,
        type: 'Close-up',
        description: `${character.name} introduction`,
        duration: 2,
        characters: [character]
      });
    });
    
    // Action shots
    shots.push({
      number: shots.length + 1,
      type: 'Action',
      description: 'Problem demonstration',
      duration: 15,
      characters: characters
    });
    
    // Resolution shot
    shots.push({
      number: shots.length + 1,
      type: 'Resolution',
      description: 'Solution implementation',
      duration: 10,
      characters: characters
    });
    
    return shots;
  }
  
  // Generate captions
  generateCaptions(trigger) {
    const variants = this.contentTemplates.get('captions').variants;
    
    return variants.map(variant => ({
      variant,
      content: this.generateCaptionContent(trigger, variant),
      style: 'Clear, engaging, accessible',
      length: '60-120 seconds'
    }));
  }
  
  // Generate thumbnails
  generateThumbnails(trigger) {
    const concepts = this.contentTemplates.get('thumbnails').concepts;
    
    return concepts.map(concept => ({
      concept,
      description: this.generateThumbnailDescription(trigger, concept),
      style: 'Eye-catching, professional, Texas-themed',
      elements: ['Texas colors', 'Cannabis imagery', 'Character focus']
    }));
  }
  
  // Generate SEO tags
  generateSEOTags(trigger) {
    const baseTags = ['Texas', 'THC', 'Wall of Weed', 'Stay TOONED'];
    const triggerTags = this.extractKeywords(trigger);
    const characterTags = this.selectCharacters(trigger).map(c => c.name);
    
    return {
      primary: baseTags,
      secondary: triggerTags,
      character: characterTags,
      compliance: ['21+', 'Educational', 'Compliance', 'Legal'],
      engagement: ['Satire', 'Comedy', 'Education', 'Community']
    };
  }
  
  // Check compliance
  checkCompliance(trigger) {
    const compliance = {
      age21: true,
      disclaimers: true,
      noMedicalClaims: true,
      educational: true,
      satirical: true,
      issues: []
    };
    
    // Check for medical claims
    if (this.containsMedicalClaims(trigger)) {
      compliance.noMedicalClaims = false;
      compliance.issues.push('Contains medical claims');
    }
    
    // Check for age verification
    if (!this.containsAgeVerification(trigger)) {
      compliance.age21 = false;
      compliance.issues.push('Missing age verification');
    }
    
    return compliance;
  }
  
  // Helper methods
  selectCharacters(trigger) {
    const characters = Array.from(this.characterDatabase.values());
    const selected = [];
    
    // Always include JESSE
    selected.push(characters.find(c => c.id === 'jesse'));
    
    // Add LIV_HANNA for tech/AI topics
    if (trigger.toLowerCase().includes('ai') || trigger.toLowerCase().includes('tech')) {
      selected.push(characters.find(c => c.id === 'liv_hanna'));
    }
    
    // Add authority figures for compliance topics
    if (trigger.toLowerCase().includes('compliance') || trigger.toLowerCase().includes('legal')) {
      selected.push(characters.find(c => c.id === 'lt_dan'));
      selected.push(characters.find(c => c.id === 'chief_steve'));
    }
    
    // Add antagonist for conflict
    if (trigger.toLowerCase().includes('opposition') || trigger.toLowerCase().includes('resistance')) {
      selected.push(characters.find(c => c.id === 'aubrey_awfuls'));
    }
    
    return selected.filter(Boolean);
  }
  
  identifyConflict(trigger) {
    const conflicts = [
      'outdated regulations',
      'bureaucratic barriers',
      'compliance challenges',
      'market resistance',
      'policy confusion'
    ];
    
    return conflicts[Math.floor(Math.random() * conflicts.length)];
  }
  
  identifyStakes(trigger) {
    const stakes = [
      'Texas cannabis progress',
      'business growth',
      'community access',
      'innovation adoption',
      'compliance success'
    ];
    
    return stakes[Math.floor(Math.random() * stakes.length)];
  }
  
  calculateSceneDuration(scene) {
    const durations = {
      'Hook (0-15s)': 15,
      'Setup (15-45s)': 30,
      'Conflict (45-90s)': 45,
      'Resolution (90-120s)': 30,
      'Call to Action (120s)': 15
    };
    
    return durations[scene] || 15;
  }
  
  generateDialogue(trigger, scene) {
    const characters = this.selectCharacters(trigger);
    const dialogue = [];
    
    characters.forEach(character => {
      dialogue.push({
        character: character.name,
        line: this.generateCharacterLine(character, scene),
        emotion: this.selectEmotion(scene)
      });
    });
    
    return dialogue;
  }
  
  generateCharacterLine(character, scene) {
    const lines = {
      JESSE: {
        'Hook (0-15s)': 'Cheetah Power! Let\'s talk Texas cannabis!',
        'Setup (15-45s)': 'Here\'s what\'s happening in the Lone Star State...',
        'Conflict (45-90s)': 'But wait, there\'s a problem...',
        'Resolution (90-120s)': 'Here\'s how we solve this...',
        'Call to Action (120s)': 'Stay TOONED for more Texas Takeover!'
      },
      LIV_HANNA: {
        'Hook (0-15s)': 'Analyzing Texas cannabis data...',
        'Setup (15-45s)': 'Processing compliance requirements...',
        'Conflict (45-90s)': 'Error: Regulatory conflict detected...',
        'Resolution (90-120s)': 'Solution optimized and implemented...',
        'Call to Action (120s)': 'Continue monitoring for updates...'
      }
    };
    
    return lines[character.name]?.[scene] || 'Character dialogue placeholder';
  }
  
  selectEmotion(scene) {
    const emotions = {
      'Hook (0-15s)': 'Excited',
      'Setup (15-45s)': 'Informative',
      'Conflict (45-90s)': 'Concerned',
      'Resolution (90-120s)': 'Confident',
      'Call to Action (120s)': 'Engaging'
    };
    
    return emotions[scene] || 'Neutral';
  }
  
  generateVisualGags(trigger, scene) {
    return [
      'Texas flag animation',
      'Cannabis plant growth',
      'Compliance checklist',
      'Character reactions',
      'Educational graphics'
    ];
  }
  
  generateCaptionContent(trigger, variant) {
    const content = {
      'Educational focus': 'Learn about Texas cannabis compliance and regulations',
      'Entertainment focus': 'Enjoy satirical take on cannabis industry challenges',
      'Compliance focus': 'Understand legal requirements and best practices',
      'Community focus': 'Join the Texas cannabis community discussion'
    };
    
    return content[variant] || 'Caption content placeholder';
  }
  
  generateThumbnailDescription(trigger, concept) {
    const descriptions = {
      'Character close-up': 'JESSE looking confident with Texas background',
      'Action scene': 'Dynamic scene showing cannabis industry action',
      'Educational moment': 'Clear visual explaining compliance concepts',
      'Comedy moment': 'Funny scene highlighting industry absurdities'
    };
    
    return descriptions[concept] || 'Thumbnail description placeholder';
  }
  
  extractKeywords(trigger) {
    const words = trigger.toLowerCase().split(' ');
    const keywords = words.filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'with', 'that', 'this', 'from', 'they', 'have', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 'could', 'other', 'after', 'first', 'well', 'also', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'may', 'use', 'her', 'than', 'its', 'who', 'oil', 'sit', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
    );
    
    return keywords;
  }
  
  containsMedicalClaims(trigger) {
    const medicalWords = ['cure', 'treat', 'heal', 'medicine', 'therapeutic'];
    return medicalWords.some(word => trigger.toLowerCase().includes(word));
  }
  
  containsAgeVerification(trigger) {
    return trigger.includes('21+') || trigger.includes('age verification');
  }
}

// Initialize HCN Production Pipeline
const hcnPipeline = new HCNProductionPipeline();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'hcn-production-pipeline',
    timestamp: new Date().toISOString(),
    features: ['episode-creation', 'script-generation', 'compliance-check', 'seo-optimization']
  });
});

// Create episode endpoint
app.post('/api/hcn/create-episode', (req, res) => {
  const { trigger, episodeNumber } = req.body;
  
  try {
    const episode = hcnPipeline.createEpisode(trigger, episodeNumber);
    res.status(201).json({
      message: 'Episode created successfully',
      episode
    });
  } catch (error) {
    console.error('Episode creation error:', error);
    res.status(500).json({ error: 'Episode creation failed' });
  }
});

// Get episode endpoint
app.get('/api/hcn/episode/:episodeId', (req, res) => {
  const { episodeId } = req.params;
  
  try {
    const episode = hcnPipeline.episodePipeline.get(episodeId);
    if (episode) {
      res.status(200).json({ episode });
    } else {
      res.status(404).json({ error: 'Episode not found' });
    }
  } catch (error) {
    console.error('Episode retrieval error:', error);
    res.status(500).json({ error: 'Episode retrieval failed' });
  }
});

// Get characters endpoint
app.get('/api/hcn/characters', (req, res) => {
  try {
    const characters = Array.from(hcnPipeline.characterDatabase.values());
    res.status(200).json({ characters });
  } catch (error) {
    console.error('Characters retrieval error:', error);
    res.status(500).json({ error: 'Characters retrieval failed' });
  }
});

// Get templates endpoint
app.get('/api/hcn/templates', (req, res) => {
  try {
    const templates = Array.from(hcnPipeline.contentTemplates.entries());
    res.status(200).json({ templates });
  } catch (error) {
    console.error('Templates retrieval error:', error);
    res.status(500).json({ error: 'Templates retrieval failed' });
  }
});

// Compliance check endpoint
app.post('/api/hcn/compliance', (req, res) => {
  const { trigger } = req.body;
  
  try {
    const compliance = hcnPipeline.checkCompliance(trigger);
    res.status(200).json({ compliance });
  } catch (error) {
    console.error('Compliance check error:', error);
    res.status(500).json({ error: 'Compliance check failed' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🎬 HCN Production Pipeline running on port ${PORT}`);
  console.log(`🎭 Characters: JESSE, LIV HANNA, Lt. Dan, Chief Steve, Aubrey Awfuls`);
  console.log(`📝 Script generation ready`);
  console.log(`🎨 Thumbnail concepts ready`);
  console.log(`📱 Caption variants ready`);
  console.log(`🔍 SEO optimization active`);
  console.log(`📋 Compliance checking ready`);
  console.log(`🚀 Netflix attention/deal preparation complete`);
});
