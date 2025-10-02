/**
 * Auto-Toon Engine: Voice Generator
 * Uses ElevenLabs API to generate character voices
 */

import { ElevenLabsClient } from 'elevenlabs';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

dotenv.config();

class VoiceGenerator {
  constructor() {
    this.client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY
    });

    // Character voice mappings
    this.voices = {
      'Jesse': 'cgSgspJ2msm6clMCkdW9', // Confident male voice
      'Liv Hana': 'EXAVITQu4vr4xnSDxMaL', // Professional female voice
      'Lt. Dan': 'TxGEqnHWrfWFTfGW9XjX', // Gruff male voice
      'Narrator': 'pNInz6obpgDQGcFmaJgB', // Neutral narrator voice
      'Chief Steve': 'VR6AewLTigWG4xSOukaG', // Authority figure
      'Aubrey Awfuls': 'ThT5KcBeYPX3keUQqHPh' // Antagonist voice
    };

    this.model = 'eleven_multilingual_v2';
  }

  /**
   * Generate audio for a single line of dialogue
   */
  async generateDialogue(character, text, outputPath) {
    const voiceId = this.voices[character] || this.voices['Narrator'];

    try {
      const audio = await this.client.generate({
        voice: voiceId,
        text: text,
        model_id: this.model
      });

      // Convert audio stream to buffer and save
      const chunks = [];
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      await fs.writeFile(outputPath, buffer);
      console.log(`✅ Generated voice: ${character} -> ${outputPath}`);

      return outputPath;
    } catch (error) {
      console.error(`❌ Voice generation failed for ${character}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate all dialogue for a scene
   */
  async generateSceneAudio(scene, episodeId) {
    const sceneDir = path.join(process.cwd(), 'output', 'audio', `episode-${episodeId}`, `scene-${scene.number}`);
    await fs.mkdir(sceneDir, { recursive: true });

    const audioFiles = [];

    for (let i = 0; i < scene.dialogue.length; i++) {
      const { character, line } = scene.dialogue[i];
      const filename = `${String(i + 1).padStart(2, '0')}-${character.toLowerCase().replace(/\s+/g, '-')}.mp3`;
      const outputPath = path.join(sceneDir, filename);

      const audioPath = await this.generateDialogue(character, line, outputPath);
      audioFiles.push({
        character,
        line,
        audioPath,
        duration: null // Will be calculated by FFmpeg
      });
    }

    return audioFiles;
  }

  /**
   * Generate all audio for complete script
   */
  async generateEpisodeAudio(script, episodeId) {
    console.log(`🎙️ Generating audio for ${script.totalScenes} scenes...`);

    const episodeAudio = [];

    for (const scene of script.scenes) {
      console.log(`\n📍 Scene ${scene.number}: ${scene.heading}`);
      const sceneAudio = await this.generateSceneAudio(scene, episodeId);
      episodeAudio.push({
        sceneNumber: scene.number,
        heading: scene.heading,
        audio: sceneAudio
      });
    }

    // Save audio manifest
    const manifestDir = path.join(process.cwd(), 'output', 'audio', `episode-${episodeId}`);
    await fs.mkdir(manifestDir, { recursive: true });
    const manifestPath = path.join(manifestDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(episodeAudio, null, 2));

    console.log(`\n✅ All audio generated: ${manifestPath}`);
    return episodeAudio;
  }

  /**
   * Test voice generation
   */
  async testVoice(character = 'Jesse', text = 'Cannabis sativa L is a plant, not a crime.') {
    const testDir = path.join(process.cwd(), 'output', 'audio', 'test');
    await fs.mkdir(testDir, { recursive: true });

    const outputPath = path.join(testDir, `test-${character.toLowerCase()}.mp3`);
    return this.generateDialogue(character, text, outputPath);
  }
}

export default VoiceGenerator;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new VoiceGenerator();
  const character = process.argv[2] || 'Jesse';
  const text = process.argv.slice(3).join(' ') || 'This is a test of the voice generation system.';

  await generator.testVoice(character, text);
}
// Last optimized: 2025-10-02

// Optimized: 2025-10-02
