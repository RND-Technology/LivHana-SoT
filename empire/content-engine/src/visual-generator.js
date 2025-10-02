/**
 * Auto-Toon Engine: Visual Generator
 * Uses DALL-E 3 to generate scene images
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

dotenv.config();

class VisualGenerator {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.model = 'dall-e-3';
    this.size = process.env.DEFAULT_IMAGE_SIZE || '1792x1024'; // Wide format for video
    this.quality = process.env.DEFAULT_IMAGE_QUALITY || 'hd';
  }

  /**
   * Generate image for a scene
   */
  async generateSceneImage(scene, episodeContext) {
    // Build detailed prompt
    const prompt = this.buildPrompt(scene, episodeContext);

    console.log(`🎨 Generating image for Scene ${scene.number}...`);
    console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);

    try {
      const response = await this.client.images.generate({
        model: this.model,
        prompt: prompt,
        n: 1,
        size: this.size,
        quality: this.quality,
        response_format: 'url'
      });

      const imageUrl = response.data[0].url;

      // Download and save image
      const sceneDir = path.join(process.cwd(), 'output', 'images', `episode-${episodeContext.episodeId}`);
      await fs.mkdir(sceneDir, { recursive: true });

      const filename = `scene-${String(scene.number).padStart(2, '0')}.png`;
      const outputPath = path.join(sceneDir, filename);

      await this.downloadImage(imageUrl, outputPath);

      console.log(`✅ Image saved: ${outputPath}`);

      return {
        sceneNumber: scene.number,
        imagePath: outputPath,
        prompt: prompt,
        url: imageUrl
      };
    } catch (error) {
      console.error(`❌ Image generation failed for Scene ${scene.number}:`, error.message);
      throw error;
    }
  }

  /**
   * Build optimized prompt for DALL-E 3
   */
  buildPrompt(scene, context) {
    const { heading, visualDescription, dialogue } = scene;
    const { style = 'animated cartoon', setting = 'Texas' } = context;

    // Extract key visual elements
    const location = heading.match(/(INT\.|EXT\.)\s+(.+)/i)?.[2] || 'generic location';
    const characters = dialogue.map(d => d.character).join(', ');

    // Build prompt with consistent style
    let prompt = `High-quality animated cartoon in the style of King of the Hill meets South Park. `;
    prompt += `Setting: ${location}, ${setting}. `;
    prompt += `Characters visible: ${characters}. `;
    prompt += `Scene: ${visualDescription || heading}. `;
    prompt += `Art style: Clean lines, vibrant colors, satirical political cartoon aesthetic. `;
    prompt += `Mood: Dramatic but humorous. Wide cinematic shot. 16:9 aspect ratio.`;

    return prompt;
  }

  /**
   * Download image from URL
   */
  async downloadImage(url, outputPath) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    await fs.writeFile(outputPath, response.data);
  }

  /**
   * Generate all images for script
   */
  async generateEpisodeImages(script, episodeId) {
    console.log(`🎨 Generating images for ${script.totalScenes} scenes...`);

    const episodeContext = {
      episodeId,
      style: 'animated cartoon',
      setting: 'Texas'
    };

    const images = [];

    for (const scene of script.scenes) {
      const imageData = await this.generateSceneImage(scene, episodeContext);
      images.push(imageData);

      // Rate limit: DALL-E 3 has 5 RPM limit on free tier
      // Wait 12 seconds between requests to stay under limit
      if (scene.number < script.totalScenes) {
        console.log('⏳ Waiting 12 seconds (rate limit)...');
        await new Promise(resolve => setTimeout(resolve, 12000));
      }
    }

    // Save image manifest
    const manifestDir = path.join(process.cwd(), 'output', 'images', `episode-${episodeId}`);
    await fs.mkdir(manifestDir, { recursive: true });
    const manifestPath = path.join(manifestDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(images, null, 2));

    console.log(`\n✅ All images generated: ${manifestPath}`);
    return images;
  }

  /**
   * Test image generation
   */
  async testImage(prompt = 'Texas State Capitol building exterior, animated cartoon style, wide shot') {
    const testDir = path.join(process.cwd(), 'output', 'images', 'test');
    await fs.mkdir(testDir, { recursive: true });

    console.log(`🎨 Generating test image...`);
    console.log(`📝 Prompt: ${prompt}`);

    const response = await this.client.images.generate({
      model: this.model,
      prompt: prompt,
      n: 1,
      size: this.size,
      quality: this.quality
    });

    const imageUrl = response.data[0].url;
    const outputPath = path.join(testDir, 'test-image.png');

    await this.downloadImage(imageUrl, outputPath);

    console.log(`✅ Test image saved: ${outputPath}`);
    return outputPath;
  }
}

export default VisualGenerator;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new VisualGenerator();
  const prompt = process.argv.slice(2).join(' ') || undefined;
  await generator.testImage(prompt);
}
// Last optimized: 2025-10-02
