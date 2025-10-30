#!/usr/bin/env node
/**
 * HNC VOICE GENERATOR - OPENAI TTS FALLBACK
 * Uses OpenAI TTS API (cheaper, faster, more reliable)
 */

import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

export class VoiceGenerator {
  constructor() {
    // Try multiple API keys
    this.apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY or ANTHROPIC_API_KEY required');
    }

    this.client = new OpenAI({
      apiKey: this.apiKey
    });

    // OpenAI TTS voices
    this.voices = {
      'narrator': 'onyx',           // Deep male
      'deep-authoritative': 'onyx',
      'jesse': 'echo',              // Male conversational
      'conversational': 'echo',
      'system': 'fable',            // Neutral
      'neutral': 'alloy'            // Default
    };
  }

  /**
   * Generate speech from text using OpenAI TTS
   */
  async generateSpeech(text, voiceType = 'neutral', outputPath) {
    const voice = this.voices[voiceType.toLowerCase()] || 'alloy';

    try {
      const mp3 = await this.client.audio.speech.create({
        model: 'tts-1-hd',
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
        text: text
      };

    } catch (error) {
      console.error('❌ OpenAI TTS error:', error.message);
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
        results.files.push(outputPath);
        results.totalDuration += narration.text.length * 0.05;
      } else {
        results.errors.push(`Failed to generate ${filename}: ${result.error}`);
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
          results.files.push(outputPath);
          results.totalDuration += dialogue.text.length * 0.05;
        } else {
          results.errors.push(`Failed to generate ${filename}: ${result.error}`);
        }

        index++;
      }
    }

    return results;
  }
}
