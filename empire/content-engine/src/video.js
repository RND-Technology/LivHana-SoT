#!/usr/bin/env node
/**
 * HNC VIDEO GENERATOR
 * Template-based video composition using FFmpeg
 */

import fs from 'fs/promises';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';

export class VideoGenerator {
  constructor() {
    this.resolution = '1920x1080'; // 1080p
    this.fps = 30;
    this.backgroundColor = '#1a1a2e';
    this.textColor = '#ffd700';
  }

  /**
   * Create video from audio files and script data
   * Simple template-based approach for MVP
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

      // Step 2: Create scene videos with narration
      const sceneVideos = [];
      for (let i = 0; i < parsedScript.scenes.length; i++) {
        const scene = parsedScript.scenes[i];
        const sceneAudio = audioResults.files.filter(f => f.scene === scene.act);

        const sceneVideo = await this.createSceneVideo(
          scene,
          sceneAudio,
          path.join(tempDir, `scene-${i}.mp4`)
        );

        sceneVideos.push(sceneVideo);
      }

      // Step 3: Create end card (5 seconds)
      const endCard = await this.createEndCard(
        parsedScript.metadata,
        path.join(tempDir, 'endcard.mp4')
      );

      // Step 4: Concatenate all videos
      await this.concatenateVideos(
        [titleCard, ...sceneVideos, endCard],
        outputPath
      );

      console.log('✅ Video generation complete!');
      console.log(`📹 Output: ${outputPath}`);

      return {
        success: true,
        path: outputPath,
        duration: audioResults.totalDuration + 10, // +10s for title/end cards
        scenes: sceneVideos.length
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
   * Create title card with episode info
   */
  async createTitleCard(title, episodeNumber, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(`color=c=${this.backgroundColor}:s=${this.resolution}:d=5`)
        .inputFormat('lavfi')
        .outputOptions([
          '-vf',
          `drawtext=text='HEMP NATION CHRONICLES':fontsize=60:fontcolor=${this.textColor}:x=(w-text_w)/2:y=h/3:fontfile=/System/Library/Fonts/Helvetica.ttc,` +
          `drawtext=text='Episode ${episodeNumber}':fontsize=40:fontcolor=white:x=(w-text_w)/2:y=h/2:fontfile=/System/Library/Fonts/Helvetica.ttc,` +
          `drawtext=text='${title}':fontsize=50:fontcolor=${this.textColor}:x=(w-text_w)/2:y=2*h/3:fontfile=/System/Library/Fonts/Helvetica.ttc`,
          `-t 5`,
          `-pix_fmt yuv420p`
        ])
        .output(outputPath)
        .on('end', () => {
          console.log('✅ Title card created');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('❌ Title card error:', err);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Create scene video with text and audio
   */
  async createSceneVideo(scene, audioFiles, outputPath) {
    if (audioFiles.length === 0) {
      console.log(`⚠️ No audio for ${scene.act}, skipping...`);
      return null;
    }

    // For MVP: Create simple video with scene title and background
    // TODO: Add stock footage, transitions, advanced effects

    const duration = audioFiles.reduce((sum, f) => sum + f.duration, 0);
    const sceneTitle = `${scene.act}: ${scene.title}`.replace(/'/g, "\\'");

    return new Promise((resolve, reject) => {
      let cmd = ffmpeg()
        .input(`color=c=${this.backgroundColor}:s=${this.resolution}:d=${Math.ceil(duration)}`)
        .inputFormat('lavfi');

      // Add all audio files
      audioFiles.forEach(audio => {
        cmd = cmd.input(audio.path);
      });

      // Add visual overlays
      const filterComplex = [
        `drawtext=text='${sceneTitle}':fontsize=48:fontcolor=${this.textColor}:x=(w-text_w)/2:y=50:fontfile=/System/Library/Fonts/Helvetica.ttc`
      ];

      // Add narration text overlays (simplified for MVP)
      scene.narration.slice(0, 3).forEach((narr, idx) => {
        const text = narr.text.replace(/'/g, "\\'").substring(0, 100);
        filterComplex.push(
          `drawtext=text='${text}':fontsize=28:fontcolor=white:x=(w-text_w)/2:y=h-200+${idx * 40}:fontfile=/System/Library/Fonts/Helvetica.ttc`
        );
      });

      cmd
        .outputOptions([
          '-filter_complex', `${filterComplex.join(',')}`,
          '-map', '0:v',
          '-map', '1:a',
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-shortest',
          '-pix_fmt', 'yuv420p'
        ])
        .output(outputPath)
        .on('end', () => {
          console.log(`✅ Scene video created: ${scene.act}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error(`❌ Scene video error: ${err}`);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Create end card with CTA
   */
  async createEndCard(metadata, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(`color=c=${this.backgroundColor}:s=${this.resolution}:d=5`)
        .inputFormat('lavfi')
        .outputOptions([
          '-vf',
          `drawtext=text='THANK YOU FOR WATCHING':fontsize=50:fontcolor=${this.textColor}:x=(w-text_w)/2:y=h/3:fontfile=/System/Library/Fonts/Helvetica.ttc,` +
          `drawtext=text='Visit reggieanddro.com':fontsize=40:fontcolor=white:x=(w-text_w)/2:y=h/2:fontfile=/System/Library/Fonts/Helvetica.ttc,` +
          `drawtext=text='Subscribe for Episode 2':fontsize=35:fontcolor=${this.textColor}:x=(w-text_w)/2:y=2*h/3:fontfile=/System/Library/Fonts/Helvetica.ttc`,
          `-t 5`,
          `-pix_fmt yuv420p`
        ])
        .output(outputPath)
        .on('end', () => {
          console.log('✅ End card created');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('❌ End card error:', err);
          reject(err);
        })
        .run();
    });
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
