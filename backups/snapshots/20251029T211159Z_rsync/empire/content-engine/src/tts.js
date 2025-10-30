#!/usr/bin/env node
/**
 * HNC VOICE GENERATOR
 * Text-to-Speech via ElevenLabs API
 */

import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

export class VoiceGenerator {
  constructor() {
    // Use ElevenLabs TTS
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    
    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }

    // Voice mapping for characters (ElevenLabs voice IDs)
    this.voices = {
      'narrator': 'pNInz6obpgDQGcFmaJgB',      // Adam (male, deep)
      'deep-authoritative': 'pNInz6obpgDQGcFmaJgB',
      'jesse': 'EXAVITQu4vr4xnSDxMaL',         // Bella (female, conversational)
      'conversational': 'EXAVITQu4vr4xnSDxMaL',
      'system': 'VR6AewLTigWG4xSOukaG',        // Arnold (male, neutral)
      'neutral': 'VR6AewLTigWG4xSOukaG'        // Default neutral
    };
  }

  /**
   * Generate speech from text using ElevenLabs
   */
  async generateSpeech(text, voiceType = 'neutral', outputPath) {
    const voiceId = this.voices[voiceType.toLowerCase()] || this.voices['neutral'];

    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceId}`,
        {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          responseType: 'arraybuffer'
        }
      );

      await fs.writeFile(outputPath, response.data);

      return {
        success: true,
        path: outputPath,
        voice: voiceId,
        text: text
      };

    } catch (error) {
      console.error('❌ TTS error:', error.response?.status, error.response?.data || error.message);
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
        results.totalDuration += narration.text.length * 0.05; // Estimate duration
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
          results.totalDuration += dialogue.text.length * 0.05; // Estimate duration
        } else {
          results.errors.push(`Failed to generate ${filename}: ${result.error}`);
        }

        index++;
      }
    }

    return results;
  }
}
