/**
 * Auto-Toon Engine: Episode Orchestrator
 * Coordinates all components to generate complete episodes
 */

import ScriptGenerator from './script-generator.js';
import VoiceGenerator from './voice-generator.js';
import VisualGenerator from './visual-generator.js';
import VideoCompositor from './video-compositor.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

class EpisodeOrchestrator {
  constructor() {
    this.scriptGen = new ScriptGenerator();
    this.voiceGen = new VoiceGenerator();
    this.visualGen = new VisualGenerator();
    this.videoComp = new VideoCompositor();

    this.maxCostPerEpisode = parseFloat(process.env.MAX_COST_PER_EPISODE) || 50;
    this.monthlyBudget = parseFloat(process.env.MONTHLY_BUDGET) || 2000;
    this.emergencyStop = parseFloat(process.env.EMERGENCY_STOP_AT) || 5000;

    this.costTracking = {
      currentMonth: 0,
      episodes: []
    };
  }

  /**
   * Generate complete episode from brief
   */
  async generateEpisode(brief, episodeId) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎬 AUTO-TOON ENGINE - Episode ${episodeId}`);
    console.log(`${'='.repeat(60)}\n`);

    const startTime = Date.now();
    const costs = { script: 0, voice: 0, visuals: 0, video: 0, total: 0 };

    try {
      // Step 1: Generate script
      console.log(`\n📝 STEP 1: Script Generation`);
      const script = await this.scriptGen.generateScript(brief);
      await this.scriptGen.saveScript(script, episodeId);
      costs.script = 0.50; // Estimated Claude API cost

      // Step 2: Generate voices
      console.log(`\n🎙️ STEP 2: Voice Generation`);
      const audio = await this.voiceGen.generateEpisodeAudio(script, episodeId);
      costs.voice = 0; // ElevenLabs on paid plan

      // Step 3: Generate images
      console.log(`\n🎨 STEP 3: Visual Generation`);
      const images = await this.visualGen.generateEpisodeImages(script, episodeId);
      costs.visuals = script.totalScenes * 0.04; // DALL-E 3 cost per image

      // Step 4: Compose video
      console.log(`\n🎬 STEP 4: Video Composition`);
      const videoPath = await this.videoComp.generateEpisode(script, images, audio, episodeId);
      costs.video = 0; // FFmpeg is free

      // Calculate totals
      costs.total = costs.script + costs.voice + costs.visuals + costs.video;
      const duration = (Date.now() - startTime) / 1000;

      // Save episode metadata
      const metadata = {
        episodeId,
        brief,
        script: {
          totalScenes: script.totalScenes,
          estimatedDuration: script.estimatedDuration
        },
        costs,
        duration: `${duration.toFixed(1)}s`,
        videoPath,
        generatedAt: new Date().toISOString()
      };

      const metadataPath = path.join(process.cwd(), 'output', 'videos', `episode-${episodeId}`, 'metadata.json');
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

      // Track costs
      this.costTracking.currentMonth += costs.total;
      this.costTracking.episodes.push(metadata);

      // Budget check
      if (this.costTracking.currentMonth > this.emergencyStop) {
        console.error(`\n🚨 EMERGENCY STOP: Monthly costs ($${this.costTracking.currentMonth}) exceeded limit ($${this.emergencyStop})`);
        process.exit(1);
      }

      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ EPISODE ${episodeId} COMPLETE!`);
      console.log(`${'='.repeat(60)}`);
      console.log(`📁 Video: ${videoPath}`);
      console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
      console.log(`💰 Cost: $${costs.total.toFixed(2)}`);
      console.log(`📊 Monthly Total: $${this.costTracking.currentMonth.toFixed(2)} / $${this.monthlyBudget}`);
      console.log(`${'='.repeat(60)}\n`);

      return metadata;
    } catch (error) {
      console.error(`\n❌ Episode generation failed: ${error.message}`);
      console.error(error.stack);
      throw error;
    }
  }

  /**
   * Generate 30-second test episode
   */
  async generateTest() {
    const brief = {
      title: 'Texas Truth - Cold Open',
      length: 30,
      characters: ['Jesse', 'Liv Hana', 'Narrator'],
      plot: 'Jesse testifies at Texas Capitol on April 7, 2025. Liv Hana provides data backup. Will Texas listen to facts or fear?',
      tone: 'Dramatic but factual',
      setting: 'Texas State Capitol, Austin'
    };

    return this.generateEpisode(brief, 'test-001');
  }

  /**
   * Generate Episode 1 (full 5-minute episode)
   */
  async generateEpisode1() {
    const brief = {
      title: 'Texas Truth - Episode 1: The Testimony',
      length: 300, // 5 minutes
      characters: ['Jesse', 'Liv Hana', 'Lt. Dan', 'Chief Steve', 'Aubrey Awfuls'],
      plot: `Jesse Niesen prepares to testify before the Texas Legislature on April 7, 2025.
             Liv Hana helps him gather data on hemp's economic impact. Lt. Dan provides moral support.
             At the Capitol, Jesse presents facts about hemp creating 15,000 Texas jobs and $2.3B in economic impact.
             Chief Steve and Aubrey Awfuls oppose, citing "safety concerns."
             The episode ends with legislators deliberating - will they choose facts or fear?`,
      tone: 'King of the Hill + South Park hybrid - satirical but factual',
      setting: 'San Antonio and Austin, Texas'
    };

    return this.generateEpisode(brief, '001');
  }
}

export default EpisodeOrchestrator;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const orchestrator = new EpisodeOrchestrator();
  const command = process.argv[2];

  switch (command) {
    case 'test':
      await orchestrator.generateTest();
      break;
    case 'episode1':
      await orchestrator.generateEpisode1();
      break;
    case 'generate':
      console.error('Usage: node episode-orchestrator.js <test|episode1>');
      break;
    default:
      console.log('Auto-Toon Engine - Episode Orchestrator');
      console.log('\nCommands:');
      console.log('  test      - Generate 30-second test episode');
      console.log('  episode1  - Generate full Episode 1 (5 minutes)');
  }
}
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
