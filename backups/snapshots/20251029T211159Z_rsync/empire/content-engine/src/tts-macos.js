#!/usr/bin/env node
/**
 * HNC VOICE GENERATOR - MACOS SAY COMMAND FALLBACK
 * Uses built-in macOS text-to-speech (no API key needed)
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class VoiceGenerator {
  constructor() {
    console.log('🎤 Using macOS built-in TTS (say command)');

    // macOS voices
    this.voices = {
      'narrator': 'Alex',           // Male, clear
      'deep-authoritative': 'Alex',
      'jesse': 'Samantha',          // Female, warm
      'conversational': 'Samantha',
      'system': 'Daniel',           // Male, neutral
      'neutral': 'Daniel'
    };
  }

  /**
   * Generate speech using macOS say command
   */
  async generateSpeech(text, voiceType = 'neutral', outputPath) {
    const voice = this.voices[voiceType.toLowerCase()] || 'Alex';

    try {
      // Create parent directory
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Generate to AIFF first (macOS say default format)
      const aiffPath = outputPath.replace('.mp3', '.aiff');
      const command = `say -v "${voice}" -o "${aiffPath}" "${text.replace(/"/g, '\\"')}"`;

      await execAsync(command);

      // Convert to mp3 using ffmpeg
      const convertCmd = `ffmpeg -i "${aiffPath}" -acodec libmp3lame -ab 128k "${outputPath}" -y 2>/dev/null`;

      try {
        await execAsync(convertCmd);
        await fs.unlink(aiffPath); // Remove intermediate file
      } catch (e) {
        // If ffmpeg not available, just use AIFF
        console.warn(`⚠️  FFmpeg conversion failed, using AIFF: ${e.message}`);
        await fs.rename(aiffPath, outputPath);
      }

      return {
        success: true,
        path: outputPath,
        voice: voice,
        text: text
      };

    } catch (error) {
      console.error('❌ macOS TTS error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate all audio for an episode
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
