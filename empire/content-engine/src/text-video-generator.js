#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Text-based video generator (no image API required)
 * Creates video using FFmpeg text overlays + audio
 */
class TextVideoGenerator {
  constructor() {
    this.outputDir = path.join(__dirname, '../output');
  }

  /**
   * Generate video from script and audio files
   */
  async generateVideo(episodeId) {
    console.log(`\n🎬 Generating video for ${episodeId}...`);

    const scriptPath = path.join(this.outputDir, 'scripts', `${episodeId}.json`);
    const videoDir = path.join(this.outputDir, 'videos', episodeId);

    // Load script
    const script = JSON.parse(fs.readFileSync(scriptPath, 'utf-8'));

    // Create output directory
    fs.mkdirSync(videoDir, { recursive: true });

    // Generate video for each scene
    const sceneVideos = [];
    for (const scene of script.scenes) {
      const sceneVideo = await this.generateSceneVideo(episodeId, scene);
      sceneVideos.push(sceneVideo);
    }

    // Concatenate all scenes
    const finalVideo = await this.concatenateScenes(episodeId, sceneVideos);

    console.log(`✅ Video complete: ${finalVideo}`);
    return finalVideo;
  }

  /**
   * Generate video for a single scene
   */
  async generateSceneVideo(episodeId, scene) {
    console.log(`\n📹 Processing scene ${scene.number}...`);

    const sceneDir = path.join(this.outputDir, 'audio', episodeId, `scene-${scene.number}`);
    const videoDir = path.join(this.outputDir, 'videos', episodeId);
    const sceneVideoPath = path.join(videoDir, `scene-${scene.number}.mp4`);

    // Get all audio files for this scene
    const manifest = JSON.parse(
      fs.readFileSync(path.join(sceneDir, 'manifest.json'), 'utf-8')
    );

    // Create video segments for each dialogue line
    const segments = [];
    for (let i = 0; i < manifest.dialogueFiles.length; i++) {
      const dialogueFile = manifest.dialogueFiles[i];
      const audioPath = path.join(sceneDir, dialogueFile.filename);
      const dialogue = scene.dialogue[i];

      const segmentPath = path.join(videoDir, `scene-${scene.number}-segment-${i}.mp4`);

      await this.createTextVideoSegment({
        audioPath,
        text: `${dialogue.character}:\n"${dialogue.line}"`,
        outputPath: segmentPath,
        sceneHeading: scene.heading
      });

      segments.push(segmentPath);
    }

    // Concatenate segments into scene video
    await this.concatenateSegments(segments, sceneVideoPath);

    // Clean up segments
    segments.forEach(seg => fs.unlinkSync(seg));

    console.log(`✅ Scene ${scene.number} complete`);
    return sceneVideoPath;
  }

  /**
   * Create a single video segment with text overlay
   */
  async createTextVideoSegment({ audioPath, text, outputPath, sceneHeading }) {
    return new Promise((resolve, reject) => {
      // Get audio duration
      ffmpeg.ffprobe(audioPath, (err, metadata) => {
        if (err) return reject(err);

        const audioDuration = metadata.format.duration;

        // Create video with text overlay
        ffmpeg()
          // Create blank video (1920x1080, black background)
          .input('color=c=black:s=1920x1080:d=' + audioDuration)
          .inputFormat('lavfi')

          // Add audio
          .input(audioPath)

          // Text overlay for scene heading (top, smaller)
          .complexFilter([
            {
              filter: 'drawtext',
              options: {
                text: sceneHeading,
                fontfile: '/System/Library/Fonts/Helvetica.ttc',
                fontsize: 24,
                fontcolor: 'gray',
                x: '(w-text_w)/2',
                y: '30',
                borderw: 2,
                bordercolor: 'black'
              }
            },
            {
              filter: 'drawtext',
              options: {
                text: text.replace(/"/g, '\\"').replace(/\n/g, '\\n'),
                fontfile: '/System/Library/Fonts/Helvetica.ttc',
                fontsize: 48,
                fontcolor: 'white',
                x: '(w-text_w)/2',
                y: '(h-text_h)/2',
                borderw: 3,
                bordercolor: 'black',
                box: 1,
                boxcolor: 'black@0.5',
                boxborderw: 20
              }
            }
          ])

          // Output settings
          .outputOptions([
            '-c:v libx264',
            '-preset fast',
            '-c:a aac',
            '-b:a 128k',
            '-pix_fmt yuv420p'
          ])
          .output(outputPath)
          .on('end', () => resolve(outputPath))
          .on('error', (err) => reject(err))
          .run();
      });
    });
  }

  /**
   * Concatenate video segments
   */
  async concatenateSegments(segments, outputPath) {
    return new Promise((resolve, reject) => {
      const listFile = outputPath + '.list.txt';
      const listContent = segments.map(s => `file '${s}'`).join('\n');
      fs.writeFileSync(listFile, listContent);

      ffmpeg()
        .input(listFile)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c copy'])
        .output(outputPath)
        .on('end', () => {
          fs.unlinkSync(listFile);
          resolve(outputPath);
        })
        .on('error', (err) => {
          if (fs.existsSync(listFile)) fs.unlinkSync(listFile);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Concatenate all scenes into final video
   */
  async concatenateScenes(episodeId, sceneVideos) {
    return new Promise((resolve, reject) => {
      const videoDir = path.join(this.outputDir, 'videos', episodeId);
      const finalPath = path.join(videoDir, `${episodeId}-final.mp4`);
      const listFile = path.join(videoDir, 'concat-list.txt');

      const listContent = sceneVideos.map(v => `file '${path.basename(v)}'`).join('\n');
      fs.writeFileSync(listFile, listContent);

      ffmpeg()
        .input(listFile)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c copy'])
        .output(finalPath)
        .on('end', () => {
          fs.unlinkSync(listFile);
          console.log(`\n🎉 Final video: ${finalPath}`);
          resolve(finalPath);
        })
        .on('error', (err) => {
          if (fs.existsSync(listFile)) fs.unlinkSync(listFile);
          reject(err);
        })
        .run();
    });
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new TextVideoGenerator();
  const episodeId = process.argv[2] || 'episode-test-001';

  generator.generateVideo(episodeId)
    .then(videoPath => {
      console.log(`\n✅ SUCCESS: ${videoPath}`);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ ERROR:', error.message);
      process.exit(1);
    });
}

export default TextVideoGenerator;

// Optimized: 2025-10-02
