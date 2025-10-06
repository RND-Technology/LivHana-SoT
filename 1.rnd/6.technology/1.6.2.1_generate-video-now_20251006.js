#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎬 HIGH NOON CARTOON - Video Generator (Text-Based)');
console.log('================================================\n');

const episodeId = 'episode-test-001';
const audioDir = path.join(__dirname, 'output/audio', episodeId, 'scene-1');
const videoDir = path.join(__dirname, 'output/videos', episodeId);
const scriptPath = path.join(__dirname, 'output/scripts', `${episodeId}.json`);

// Create video directory
fs.mkdirSync(videoDir, { recursive: true });

// Load script
const script = JSON.parse(fs.readFileSync(scriptPath, 'utf-8'));
const scene = script.scenes[0];

// Get audio files
const audioFiles = fs.readdirSync(audioDir)
  .filter(f => f.endsWith('.mp3') && !f.includes('manifest'))
  .sort();

console.log(`📝 Scene: ${scene.heading}`);
console.log(`🎙️ Audio files: ${audioFiles.length}`);
console.log(`💬 Dialogue lines: ${scene.dialogue.length}\n`);

// Generate video segment for each audio file
const segments = [];
for (let i = 0; i < audioFiles.length && i < scene.dialogue.length; i++) {
  const audioFile = audioFiles[i];
  const dialogue = scene.dialogue[i];
  const audioPath = path.join(audioDir, audioFile);
  const segmentPath = path.join(videoDir, `segment-${i}.mp4`);

  console.log(`\n[${i+1}/${audioFiles.length}] ${dialogue.character}`);
  console.log(`   Audio: ${audioFile}`);

  await new Promise((resolve, reject) => {
    // Get audio duration
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) return reject(err);

      const duration = metadata.format.duration;
      console.log(`   Duration: ${duration.toFixed(2)}s`);

      // Create video with text overlay
      const textLines = [
        scene.heading,
        '',
        `${dialogue.character}:`,
        `"${dialogue.line}"`
      ].join('\\n');

      ffmpeg()
        .input(`color=c=#1a1a1a:s=1920x1080:d=${duration}`)
        .inputFormat('lavfi')
        .input(audioPath)
        .complexFilter([
          `drawtext=text='${textLines.replace(/'/g, "\\\\'")}':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=36:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2:borderw=2:bordercolor=black`
        ])
        .outputOptions([
          '-c:v libx264',
          '-preset ultrafast',
          '-c:a aac',
          '-b:a 128k',
          '-pix_fmt yuv420p',
          '-shortest'
        ])
        .output(segmentPath)
        .on('end', () => {
          console.log(`   ✅ Segment created`);
          segments.push(segmentPath);
          resolve();
        })
        .on('error', reject)
        .run();
    });
  });
}

console.log(`\n🎞️ Concatenating ${segments.length} segments...`);

// Concatenate all segments
const listFile = path.join(videoDir, 'concat.txt');
fs.writeFileSync(listFile, segments.map(s => `file '${path.basename(s)}'`).join('\n'));

const finalPath = path.join(videoDir, `${episodeId}-FINAL.mp4`);

await new Promise((resolve, reject) => {
  ffmpeg()
    .input(listFile)
    .inputOptions(['-f concat', '-safe 0'])
    .outputOptions(['-c copy'])
    .output(finalPath)
    .on('end', () => {
      console.log(`\n✅ FINAL VIDEO CREATED: ${finalPath}`);

      // Clean up
      fs.unlinkSync(listFile);
      segments.forEach(s => fs.unlinkSync(s));

      // Get file size
      const stats = fs.statSync(finalPath);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`   Size: ${sizeMB} MB`);

      // Get duration
      ffmpeg.ffprobe(finalPath, (err, metadata) => {
        if (!err) {
          const duration = metadata.format.duration;
          console.log(`   Duration: ${duration.toFixed(2)}s`);
        }

        console.log(`\n🎉 SUCCESS! Video ready at:`);
        console.log(`   ${finalPath}`);
        console.log(`\n💰 Cost: $0 (no image generation needed)`);
        console.log(`⏱️  Total time: ~${segments.length * 3}s\n`);

        resolve();
      });
    })
    .on('error', reject)
    .run();
});

// Optimized: 2025-10-02
