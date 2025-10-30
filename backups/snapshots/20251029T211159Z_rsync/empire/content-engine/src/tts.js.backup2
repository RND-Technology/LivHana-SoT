#!/usr/bin/env node
/**
 * HNC VOICE GENERATOR
 * Text-to-Speech via OpenAI TTS API (cheaper than ElevenLabs, faster)
 */

import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

export class VoiceGenerator {
  constructor() {
    // Use OpenAI TTS (tts-1-hd model)
    // Cost: $15/million chars = ~$0.08 per 15-min episode
    this.client = new OpenAI({
      apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY
    });

    // Voice mapping for characters
    this.voices = {
      'narrator': 'onyx',      // Deep, authoritative (male)
      'deep-authoritative': 'onyx',
      'jesse': 'echo',         // Conversational (male)
      'conversational': 'echo',
      'system': 'fable',       // AI voice (neutral)
      'neutral': 'alloy'       // Default neutral
    };
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(text, voiceType = 'neutral', outputPath) {
    const voice = this.voices[voiceType.toLowerCase()] || 'alloy';

    try {
      const mp3 = await this.client.audio.speech.create({
        model: 'tts-1-hd',  // High quality
        voice: voice,
        input: text,
        speed: 1.0
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());
      await fs.writeFile(outputPath, buffer);

      return {
        success: true,
        path: outputPath,
        voice: voice,
        duration: this.estimateDuration(text)
      };
    } catch (error) {
      console.error(`❌ TTS error: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate all audio for an episode from parsed script
   */
  async generateEpisodeAudio(parsedScript, outputDir) {
    const results = {
      files: [],
      totalDuration: 0,
      errors: []
    };

    await fs.mkdir(outputDir, { recursive: true });

    // Generate narration
    let index = 0;
    for (const narration of parsedScript.narration) {
      const filename = `narration-${index.toString().padStart(3, '0')}.mp3`;
      const outputPath = path.join(outputDir, filename);

      console.log(`🎤 Generating: ${filename} (${narration.speaker})`);

      const result = await this.generateSpeech(
        narration.text,
        narration.voice || 'neutral',
        outputPath
      );

      if (result.success) {
        results.files.push({
          type: 'narration',
          scene: narration.scene,
          speaker: narration.speaker,
          path: outputPath,
          duration: result.duration
        });
        results.totalDuration += result.duration;
      } else {
        results.errors.push({
          file: filename,
          error: result.error
        });
      }

      index++;
    }

    // Generate dialogue from scenes
    for (const scene of parsedScript.scenes) {
      for (const dialogue of scene.dialogue) {
        const filename = `dialogue-${scene.act.replace(/\s+/g, '-')}-${index.toString().padStart(3, '0')}.mp3`;
        const outputPath = path.join(outputDir, filename);

        console.log(`🎤 Generating: ${filename} (${dialogue.speaker})`);

        const result = await this.generateSpeech(
          dialogue.text,
          dialogue.voice || 'neutral',
          outputPath
        );

        if (result.success) {
          results.files.push({
            type: 'dialogue',
            scene: scene.act,
            speaker: dialogue.speaker,
            path: outputPath,
            duration: result.duration
          });
          results.totalDuration += result.duration;
        } else {
          results.errors.push({
            file: filename,
            error: result.error
          });
        }

        index++;
      }
    }

    return results;
  }

  /**
   * Estimate audio duration from text (rough approximation)
   * Average speaking rate: 150 words per minute
   */
  estimateDuration(text) {
    const words = text.split(/\s+/).length;
    return (words / 150) * 60; // seconds
  }
}

// CLI usage: node tts.js "Your text here" narrator output.mp3
if (import.meta.url === `file://${process.argv[1]}`) {
  const text = process.argv[2] || 'Hello from Hemp Nation Chronicles';
  const voiceType = process.argv[3] || 'narrator';
  const outputPath = process.argv[4] || '../output/audio/test.mp3';

  const generator = new VoiceGenerator();
  const result = await generator.generateSpeech(text, voiceType, outputPath);

  if (result.success) {
    console.log(`✅ Audio generated: ${result.path}`);
    console.log(`🎙️ Voice: ${result.voice}`);
    console.log(`⏱️ Estimated duration: ${result.duration.toFixed(1)}s`);
  } else {
    console.log(`❌ Failed: ${result.error}`);
  }
}
