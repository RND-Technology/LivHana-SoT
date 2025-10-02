/**
 * Auto-Toon Engine: Video Compositor
 * Uses FFmpeg to assemble scenes, audio, and music into final video
 */

import ffmpeg from 'fluent-ffmpeg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VideoCompositor {
  constructor() {
    this.fps = parseInt(process.env.VIDEO_FPS) || 30;
    this.format = process.env.VIDEO_FORMAT || 'mp4';
    this.quality = process.env.VIDEO_QUALITY || 'high';

    // Ken Burns effect settings
    this.kenBurns = {
      zoomDuration: 10, // seconds
      zoomScale: 1.2,   // 120% zoom
      panSpeed: 'slow'
    };
  }

  /**
   * Create video from single scene (image + audio)
   */
  async createSceneVideo(sceneData, outputPath) {
    const { imagePath, audioFiles, duration = 10 } = sceneData;

    return new Promise((resolve, reject) => {
      const cmd = ffmpeg();

      // Add image input with Ken Burns zoom effect
      cmd.input(imagePath)
        .inputOptions([
          '-loop 1',
          '-t', String(duration)
        ])
        .videoFilters([
          `zoompan=z='min(zoom+0.0015,1.5)':d=${this.fps * duration}:s=1792x1024:fps=${this.fps}`,
          'format=yuv420p'
        ]);

      // Add audio if exists
      if (audioFiles && audioFiles.length > 0) {
        audioFiles.forEach(audioFile => {
          cmd.input(audioFile.audioPath);
        });
        cmd.complexFilter([
          `concat=n=${audioFiles.length}:v=0:a=1[aout]`
        ]);
        cmd.outputOptions(['-map', '0:v', '-map', '[aout]']);
      }

      cmd.output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format(this.format)
        .on('start', (command) => {
          console.log(`🎬 FFmpeg command: ${command}`);
        })
        .on('progress', (progress) => {
          console.log(`⏳ Processing: ${progress.percent?.toFixed(1)}%`);
        })
        .on('end', () => {
          console.log(`✅ Scene video created: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error(`❌ Video creation failed: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Concatenate multiple scene videos into final episode
   */
  async concatenateScenes(sceneVideos, outputPath) {
    return new Promise((resolve, reject) => {
      const cmd = ffmpeg();

      // Add all scene videos as inputs
      sceneVideos.forEach(video => {
        cmd.input(video);
      });

      // Create concat filter
      const filterComplex = sceneVideos.map((_, i) => `[${i}:v][${i}:a]`).join('') +
                           `concat=n=${sceneVideos.length}:v=1:a=1[outv][outa]`;

      cmd.complexFilter(filterComplex)
        .outputOptions([
          '-map', '[outv]',
          '-map', '[outa]'
        ])
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format(this.format)
        .on('start', (command) => {
          console.log(`🎬 Concatenating ${sceneVideos.length} scenes...`);
        })
        .on('progress', (progress) => {
          console.log(`⏳ Processing: ${progress.percent?.toFixed(1)}%`);
        })
        .on('end', () => {
          console.log(`✅ Final video created: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error(`❌ Concatenation failed: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Add background music from Artlist.io
   */
  async addBackgroundMusic(videoPath, musicPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(musicPath)
        .complexFilter([
          '[1:a]volume=0.3[music]',  // Lower music volume to 30%
          '[0:a][music]amix=inputs=2:duration=first:dropout_transition=2[aout]'
        ])
        .outputOptions([
          '-map', '0:v',
          '-map', '[aout]',
          '-c:v', 'copy'  // Don't re-encode video
        ])
        .output(outputPath)
        .on('end', () => {
          console.log(`✅ Music added: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error(`❌ Music addition failed: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Generate complete episode video
   */
  async generateEpisode(script, images, audio, episodeId) {
    console.log(`🎬 Starting video composition for Episode ${episodeId}...`);

    const videoDir = path.join(process.cwd(), 'output', 'videos', `episode-${episodeId}`);
    await fs.mkdir(videoDir, { recursive: true });

    const sceneVideos = [];

    // Generate video for each scene
    for (let i = 0; i < script.scenes.length; i++) {
      const scene = script.scenes[i];
      const image = images.find(img => img.sceneNumber === scene.number);
      const sceneAudio = audio.find(a => a.sceneNumber === scene.number);

      if (!image) {
        console.warn(`⚠️ No image found for scene ${scene.number}, skipping...`);
        continue;
      }

      const sceneVideoPath = path.join(videoDir, `scene-${String(scene.number).padStart(2, '0')}.mp4`);

      const sceneData = {
        imagePath: image.imagePath,
        audioFiles: sceneAudio?.audio || [],
        duration: scene.timing || 10
      };

      const videoPath = await this.createSceneVideo(sceneData, sceneVideoPath);
      sceneVideos.push(videoPath);
    }

    // Concatenate all scenes
    const episodeVideoPath = path.join(videoDir, `episode-${episodeId}-final.mp4`);
    await this.concatenateScenes(sceneVideos, episodeVideoPath);

    console.log(`\n✅ Episode ${episodeId} video complete: ${episodeVideoPath}`);
    return episodeVideoPath;
  }

  /**
   * Quick test video (image + text overlay)
   */
  async createTestVideo(imagePath, text = 'Test Video', outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(imagePath)
        .inputOptions(['-loop 1', '-t 5'])
        .videoFilters([
          `drawtext=text='${text}':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.5:boxborderw=5`,
          'format=yuv420p'
        ])
        .output(outputPath)
        .videoCodec('libx264')
        .format('mp4')
        .on('end', () => {
          console.log(`✅ Test video created: ${outputPath}`);
          resolve(outputPath);
        })
        .on('error', reject)
        .run();
    });
  }
}

export default VideoCompositor;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const compositor = new VideoCompositor();
  const imagePath = process.argv[2];
  const text = process.argv[3] || 'High Noon Cartoon';
  const outputPath = process.argv[4] || path.join(process.cwd(), 'output', 'videos', 'test', 'test-video.mp4');

  if (!imagePath) {
    console.error('Usage: node video-compositor.js <imagePath> [text] [outputPath]');
    process.exit(1);
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await compositor.createTestVideo(imagePath, text, outputPath);
}
