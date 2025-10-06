#!/usr/bin/env node
/**
 * HNC SCRIPT PARSER
 * Converts markdown scripts into structured production data
 */

import fs from 'fs/promises';

export class ScriptParser {
  constructor() {
    this.scenes = [];
    this.metadata = {};
    this.narration = [];
    this.visuals = [];
  }

  /**
   * Parse HNC markdown script into production data
   */
  async parse(scriptPath) {
    const content = await fs.readFile(scriptPath, 'utf-8');
    const lines = content.split('\n');

    let currentScene = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Extract metadata
      if (line.startsWith('- **Title:**')) {
        this.metadata.title = line.split(':**')[1].trim();
      }
      if (line.startsWith('- **Duration:**')) {
        this.metadata.duration = line.split(':**')[1].trim();
      }
      if (line.startsWith('- **Episode Number:**')) {
        this.metadata.episodeNumber = line.split(':**')[1].trim();
      }

      // Detect scene headers (### Act N: Title (timestamp))
      const sceneMatch = line.match(/^### (Act \d+): ([^(]+)\(([^)]+)\)/);
      if (sceneMatch) {
        if (currentScene) {
          this.scenes.push(currentScene);
        }
        currentScene = {
          act: sceneMatch[1],
          title: sceneMatch[2].trim(),
          timestamp: sceneMatch[3].trim(),
          narration: [],
          dialogue: [],
          visuals: []
        };
        continue;
      }

      // Extract narration (starts with **Narrator**)
      if (line.startsWith('**Narrator')) {
        const narratorLine = lines[i + 1]?.trim().replace(/^"/, '').replace(/"$/, '');
        if (narratorLine && currentScene) {
          currentScene.narration.push({
            speaker: 'Narrator',
            text: narratorLine,
            voice: 'deep-authoritative'
          });
          this.narration.push({
            scene: currentScene.act,
            speaker: 'Narrator',
            text: narratorLine
          });
        }
        continue;
      }

      // Extract dialogue (starts with **Name**)
      const dialogueMatch = line.match(/^\*\*([^*]+)\*\*/);
      if (dialogueMatch && !line.includes('Narrator')) {
        const speaker = dialogueMatch[1].replace(/\(.*?\)/, '').trim();
        const dialogueLine = lines[i + 1]?.trim().replace(/^"/, '').replace(/"$/, '');
        if (dialogueLine && currentScene) {
          currentScene.dialogue.push({
            speaker,
            text: dialogueLine,
            voice: speaker.toLowerCase() === 'jesse' ? 'conversational' : 'neutral'
          });
        }
        continue;
      }

      // Extract visual cues (starts with *[Visual: )
      const visualMatch = line.match(/^\*\[Visual: ([^\]]+)\]/);
      if (visualMatch && currentScene) {
        currentScene.visuals.push({
          description: visualMatch[1],
          type: this.categorizeVisual(visualMatch[1])
        });
        this.visuals.push({
          scene: currentScene.act,
          description: visualMatch[1],
          type: this.categorizeVisual(visualMatch[1])
        });
        continue;
      }
    }

    // Add last scene
    if (currentScene) {
      this.scenes.push(currentScene);
    }

    return {
      metadata: this.metadata,
      scenes: this.scenes,
      narration: this.narration,
      visuals: this.visuals,
      totalScenes: this.scenes.length
    };
  }

  /**
   * Categorize visual type for automation
   */
  categorizeVisual(description) {
    const desc = description.toLowerCase();
    if (desc.includes('aerial') || desc.includes('landscape')) return 'stock-footage';
    if (desc.includes('dashboard') || desc.includes('metrics')) return 'screen-capture';
    if (desc.includes('logo') || desc.includes('tagline')) return 'graphic';
    if (desc.includes('speaking') || desc.includes('camera')) return 'talking-head';
    if (desc.includes('montage') || desc.includes('split screen')) return 'composite';
    return 'stock-footage';
  }

  /**
   * Export to JSON for production pipeline
   */
  async exportJSON(outputPath) {
    const data = {
      metadata: this.metadata,
      scenes: this.scenes,
      narration: this.narration,
      visuals: this.visuals,
      totalScenes: this.scenes.length,
      generatedAt: new Date().toISOString()
    };

    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
    return data;
  }
}

// CLI usage: node parser.js <script-path> <output-path>
if (import.meta.url === `file://${process.argv[1]}`) {
  const scriptPath = process.argv[2] || '../../HNC_EPISODE_1_THE_EMPIRE_AWAKENS.md';
  const outputPath = process.argv[3] || '../output/scripts/episode-1.json';

  const parser = new ScriptParser();
  const result = await parser.parse(scriptPath);
  await parser.exportJSON(outputPath);

  console.log('✅ Script parsed successfully!');
  console.log(`📄 Scenes: ${result.totalScenes}`);
  console.log(`🎤 Narration lines: ${result.narration.length}`);
  console.log(`🎬 Visual cues: ${result.visuals.length}`);
  console.log(`💾 Output: ${outputPath}`);
}
