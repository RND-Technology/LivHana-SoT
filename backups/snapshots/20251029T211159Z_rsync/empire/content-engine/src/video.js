#!/usr/bin/env node
/**
 * HNC VIDEO GENERATOR
 * Template-based video composition using FFmpeg
 */

import fs from 'fs/promises';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Set ffmpeg path explicitly
ffmpeg.setFfmpegPath('/opt/homebrew/bin/ffmpeg');

export class VideoGenerator {
  constructor() {
    this.resolution = '1920x1080'; // 1080p
    this.fps = 30;
    this.backgroundColor = '#1a1a2e';
    this.textColor = '#ffd700';
    this.ffmpegPath = '/opt/homebrew/bin/ffmpeg';
  }

  /**
   * Create video from audio files and script data
   * Simplified MVP: Title card + Main video + End card
   */
  async generateEpisode(parsedScript, audioResults, outputPath) {
    console.log('🎬 Starting video generation...');

    const workDir = path.dirname(outputPath);
    const tempDir = path.join(workDir, 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    try {
      // Step 1: Create title card (5 seconds)
      const titleCard = await this.createTitleCard(
        parsedScript.metadata.title,
        parsedScript.metadata.episodeNumber,
        path.join(tempDir, 'title.mp4')
      );

      // Step 2: Concatenate all audio files
      const allAudioPath = path.join(tempDir, 'all-audio.mp3');
      await this.concatenateAudio(audioResults.files, allAudioPath);

      // Step 3: Create main video with concatenated audio
      const mainVideo = await this.createMainVideo(
        parsedScript.metadata.title,
        allAudioPath,
        path.join(tempDir, 'main.mp4')
      );

      // Step 4: Create end card (5 seconds)
      const endCard = await this.createEndCard(
        parsedScript.metadata,
        path.join(tempDir, 'endcard.mp4')
      );

      // Step 5: Concatenate all videos
      await this.concatenateVideos(
        [titleCard, mainVideo, endCard],
        outputPath
      );

      console.log('✅ Video generation complete!');
      console.log(`📹 Output: ${outputPath}`);

      return {
        success: true,
        path: outputPath,
        duration: audioResults.totalDuration + 10 // +10s for title/end cards
      };
    } catch (error) {
      console.error(`❌ Video generation failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Concatenate audio files into single file
   */
  async concatenateAudio(audioFiles, outputPath) {
    try {
      // Create file list for concat
      const fileList = audioFiles.map(f => `file '${f}'`).join('\n');
      const listPath = `${outputPath}.txt`;
      await fs.writeFile(listPath, fileList);

      const cmd = `${this.ffmpegPath} -f concat -safe 0 -i "${listPath}" -c copy -y "${outputPath}"`;
      await execAsync(cmd);

      console.log('✅ Audio concatenated');
      return outputPath;
    } catch (error) {
      console.error('❌ Audio concatenation error:', error.message);
      throw error;
    }
  }

  /**
   * Create main video with title and audio
   */
  async createMainVideo(title, audioPath, outputPath) {
    try {
      const titleEscaped = title.replace(/'/g, "'\\''");

      // Get audio duration
      const probeCmd = `${this.ffmpegPath} -i "${audioPath}" 2>&1 | grep Duration | cut -d ' ' -f 4 | sed s/,//`;
      const { stdout: durationStr } = await execAsync(probeCmd);
      const duration = this.parseDuration(durationStr.trim()) || 60;

      // Create video with title overlay
      const cmd = `${this.ffmpegPath} -f lavfi -i "color=c=${this.backgroundColor}:s=${this.resolution}:d=${Math.ceil(duration)}" ` +
        `-i "${audioPath}" ` +
        `-vf "drawtext=text='${titleEscaped}':fontsize=60:fontcolor=${this.textColor}:x=(w-text_w)/2:y=(h-text_h)/2:fontfile=/System/Library/Fonts/Helvetica.ttc" ` +
        `-map 0:v -map 1:a -c:v libx264 -c:a aac -shortest -pix_fmt yuv420p -y "${outputPath}"`;

      await execAsync(cmd);
      console.log('✅ Main video created');
      return outputPath;
    } catch (error) {
      console.error('❌ Main video error:', error.message);
      throw error;
    }
  }

  /**
   * Create title card with episode info
   * Using direct ffmpeg exec to bypass fluent-ffmpeg lavfi detection bug
   */
  async createTitleCard(title, episodeNumber, outputPath) {
    try {
      // Escape title for shell
      const titleEscaped = title.replace(/'/g, "'\\''");

      const cmd = `${this.ffmpegPath} -f lavfi -i "color=c=${this.backgroundColor}:s=${this.resolution}:d=5" ` +
        `-vf "drawtext=text='HEMP NATION CHRONICLES':fontsize=60:fontcolor=${this.textColor}:x=(w-text_w)/2:y=h/3:fontfile=/System/Library/Fonts/Helvetica.ttc,` +
        `drawtext=text='Episode ${episodeNumber}':fontsize=40:fontcolor=white:x=(w-text_w)/2:y=h/2:fontfile=/System/Library/Fonts/Helvetica.ttc,` +
        `drawtext=text='${titleEscaped}':fontsize=50:fontcolor=${this.textColor}:x=(w-text_w)/2:y=2*h/3:fontfile=/System/Library/Fonts/Helvetica.ttc" ` +
        `-t 5 -pix_fmt yuv420p -y "${outputPath}"`;

      await execAsync(cmd);
      console.log('✅ Title card created');
      return outputPath;
    } catch (error) {
      console.error('❌ Title card error:', error.message);
      throw error;
    }
  }

  /**
   * Create scene video with text and audio
   * Simplified MVP version: Just use single audio file per scene
   */
  async createSceneVideo(scene, audioFiles, outputPath) {
    if (audioFiles.length === 0) {
      console.log(`⚠️ No audio for ${scene.act}, skipping...`);
      return null;
    }

    try {
      // Use first audio file for the scene (simplified for MVP)
      const audioPath = audioFiles[0];
      const sceneTitle = `${scene.act}: ${scene.title}`.replace(/'/g, "'\\''");

      // Get audio duration
      const probeCmd = `${this.ffmpegPath} -i "${audioPath}" 2>&1 | grep Duration | cut -d ' ' -f 4 | sed s/,//`;
      const { stdout: durationStr } = await execAsync(probeCmd);
      const duration = this.parseDuration(durationStr.trim()) || 10;

      // Create video with audio
      const cmd = `${this.ffmpegPath} -f lavfi -i "color=c=${this.backgroundColor}:s=${this.resolution}:d=${Math.ceil(duration)}" ` +
        `-i "${audioPath}" ` +
        `-vf "drawtext=text='${sceneTitle}':fontsize=48:fontcolor=${this.textColor}:x=(w-text_w)/2:y=50:fontfile=/System/Library/Fonts/Helvetica.ttc" ` +
        `-map 0:v -map 1:a -c:v libx264 -c:a aac -shortest -pix_fmt yuv420p -y "${outputPath}"`;

      await execAsync(cmd);
      console.log(`✅ Scene video created: ${scene.act}`);
      return outputPath;
    } catch (error) {
      console.error(`❌ Scene video error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parse ffmpeg duration string (HH:MM:SS.ms) to seconds
   */
  parseDuration(durationStr) {
    const parts = durationStr.split(':');
    if (parts.length !== 3) return null;
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Create end card with CTA
   * Using direct ffmpeg exec to bypass fluent-ffmpeg lavfi detection bug
   */
  async createEndCard(metadata, outputPath) {
    try {
      const cmd = `${this.ffmpegPath} -f lavfi -i "color=c=${this.backgroundColor}:s=${this.resolution}:d=5" ` +
        `-vf "drawtext=text='THANK YOU FOR WATCHING':fontsize=50:fontcolor=${this.textColor}:x=(w-text_w)/2:y=h/3:fontfile=/System/Library/Fonts/Helvetica.ttc,` +
        `drawtext=text='Visit reggieanddro.com':fontsize=40:fontcolor=white:x=(w-text_w)/2:y=h/2:fontfile=/System/Library/Fonts/Helvetica.ttc,` +
        `drawtext=text='Subscribe for Episode 2':fontsize=35:fontcolor=${this.textColor}:x=(w-text_w)/2:y=2*h/3:fontfile=/System/Library/Fonts/Helvetica.ttc" ` +
        `-t 5 -pix_fmt yuv420p -y "${outputPath}"`;

      await execAsync(cmd);
      console.log('✅ End card created');
      return outputPath;
    } catch (error) {
      console.error('❌ End card error:', error.message);
      throw error;
    }
  }

  /**
   * Concatenate multiple videos into final output
   */
  async concatenateVideos(videoPaths, outputPath) {
    // Filter out null paths
    const validPaths = videoPaths.filter(p => p !== null);

    // Create concat file list
    const concatFile = path.join(path.dirname(outputPath), 'concat.txt');
    const fileList = validPaths.map(p => `file '${p}'`).join('\n');
    await fs.writeFile(concatFile, fileList);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(concatFile)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions([
          '-c', 'copy'
        ])
        .output(outputPath)
        .on('end', () => {
          console.log('✅ Final video assembled');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('❌ Concatenation error:', err);
          reject(err);
        })
        .run();
    });
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🎬 Video Generator - Use via API or import as module');
}
