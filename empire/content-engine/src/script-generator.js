/**
 * Auto-Toon Engine: Script Generator
 * Uses Claude API to generate episode scripts
 */

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

class ScriptGenerator {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
    this.model = 'claude-sonnet-4-20250514';
  }

  /**
   * Generate episode script from brief
   */
  async generateScript(brief) {
    const {
      title,
      length = 300, // seconds
      characters = ['Jesse', 'Liv Hana'],
      plot,
      tone = 'King of the Hill + South Park hybrid',
      setting = 'Texas'
    } = brief;

    const prompt = `You are a writer for "High Noon Cartoon" - a satirical animated series about cannabis legalization in Texas.

# Episode Brief:
- Title: ${title}
- Length: ${length} seconds (${Math.floor(length/60)} minutes)
- Characters: ${characters.join(', ')}
- Plot: ${plot}
- Tone: ${tone}
- Setting: ${setting}

# Character Descriptions:
- Jesse: 30-50, entrepreneur, cannabis advocate, testified before Texas Legislature
- Liv Hana: AI assistant, data-driven, holographic presence, supportive but factual
- Lt. Dan: Veteran, comic relief, skeptical but loyal friend
- Chief Steve Lie/Dye: Law enforcement, prohibition stance, antagonist
- Aubrey Awfuls: Prohibitionist villain, bureaucrat, main antagonist

# Requirements:
1. Use TRADITIONAL SCREENPLAY FORMAT (not markdown):
   - Scene headings: INT. LOCATION - TIME
   - Visual descriptions in plain text below scene heading
   - Character names in ALL CAPS on their own line
   - Dialogue on line after character name
   - (Parentheticals) for character actions
   - [MUSIC CUE] and [SFX] markers

2. Example format:
INT. TEXAS CAPITOL - DAY

The hearing room is packed. JESSE sits at the witness table.

[MUSIC CUE: Tense]

JESSE
(confident)
Members of the committee, hemp creates 15,000 Texas jobs.

3. Make it funny but factual on cannabis policy
4. Conservative-friendly messaging (economic liberty, states' rights)
5. Each scene should be ~10 seconds

Generate the complete script now in traditional screenplay format (not markdown):`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const script = response.content[0].text;
    console.log(`\n📜 Raw script received (${script.length} chars):\n${script.substring(0, 500)}...\n`);

    // Parse script into structured format
    const structuredScript = this.parseScript(script);

    return structuredScript;
  }

  /**
   * Parse raw script into structured scenes
   */
  parseScript(rawScript) {
    const lines = rawScript.split('\n');
    const scenes = [];
    let currentScene = null;
    let sceneNumber = 0;
    let inVisualBlock = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and markdown headers
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---') || trimmed.match(/^FADE (IN|OUT)/i)) {
        continue;
      }

      // Scene heading (INT./EXT. or **INT./EXT.**)
      if (trimmed.match(/^\*?\*?(INT\.|EXT\.)/i)) {
        if (currentScene) {
          scenes.push(currentScene);
        }
        sceneNumber++;
        const heading = trimmed.replace(/\*\*/g, '').replace(/\*/g, '');
        currentScene = {
          number: sceneNumber,
          heading: heading,
          visualDescription: '',
          dialogue: [],
          timing: 10, // default
          musicCue: null,
          sfx: []
        };
        inVisualBlock = false;
      }
      // Visual description (between *..* or *(...)*)
      else if (trimmed.match(/^\*(.+)\*$/)) {
        if (currentScene) {
          inVisualBlock = true;
          const visual = trimmed.replace(/\*/g, '').replace(/^Visual:\s*/i, '');
          currentScene.visualDescription += visual + ' ';
        }
      }
      // Character dialogue (**CHARACTER**)
      else if (trimmed.match(/^\*\*[A-Z\s]+\*\*$/)) {
        inVisualBlock = false;
        // Next line will have the dialogue
      }
      // Parenthetical action/dialogue direction
      else if (trimmed.match(/^\(.+\)$/)) {
        if (currentScene) {
          const direction = trimmed.replace(/[()]/g, '');
          // Store as part of last dialogue or as visual description
          if (currentScene.dialogue.length > 0) {
            currentScene.dialogue[currentScene.dialogue.length - 1].direction = direction;
          } else {
            currentScene.visualDescription += direction + ' ';
          }
        }
      }
      // Music cue
      else if (trimmed.match(/^\*?\*?\[MUSIC.*\]/i)) {
        if (currentScene) {
          currentScene.musicCue = trimmed.match(/\[(.*)\]/)[1];
        }
      }
      // SFX
      else if (trimmed.match(/^\*?\*?\[SFX.*\]/i)) {
        if (currentScene) {
          currentScene.sfx.push(trimmed.match(/\[(.*)\]/)[1]);
        }
      }
      // Regular dialogue line (after character name)
      else if (currentScene && !inVisualBlock && trimmed.length > 0) {
        // Check if previous line was a character name
        const lastDialogue = currentScene.dialogue[currentScene.dialogue.length - 1];
        if (lastDialogue && !lastDialogue.line) {
          lastDialogue.line = trimmed;
        } else {
          // Could be a character name or continuation of dialogue
          if (trimmed === trimmed.toUpperCase() && trimmed.length < 30 && !trimmed.match(/[.!?]$/)) {
            // Likely a character name
            currentScene.dialogue.push({
              character: trimmed,
              line: ''
            });
          } else if (lastDialogue && lastDialogue.line) {
            // Continuation of previous dialogue
            lastDialogue.line += ' ' + trimmed;
          }
        }
      }
    }

    if (currentScene) {
      scenes.push(currentScene);
    }

    // Filter out any dialogue entries without lines
    scenes.forEach(scene => {
      scene.dialogue = scene.dialogue.filter(d => d.line && d.line.length > 0);
    });

    return {
      scenes,
      totalScenes: scenes.length,
      estimatedDuration: scenes.reduce((sum, s) => sum + s.timing, 0)
    };
  }

  /**
   * Save script to file
   */
  async saveScript(script, episodeId) {
    const scriptsDir = path.join(process.cwd(), 'output', 'scripts');
    await fs.mkdir(scriptsDir, { recursive: true });
    const outputPath = path.join(scriptsDir, `episode-${episodeId}.json`);
    await fs.writeFile(outputPath, JSON.stringify(script, null, 2));
    console.log(`✅ Script saved: ${outputPath}`);
    return outputPath;
  }

  /**
   * Generate test script (30 seconds)
   */
  async generateTestScript() {
    const brief = {
      title: 'Texas Truth - Cold Open',
      length: 30,
      characters: ['Jesse', 'Liv Hana', 'Narrator'],
      plot: 'Jesse testifies at Texas Capitol on April 7, 2025. Liv Hana provides data backup. Will Texas listen to facts or fear?',
      tone: 'Dramatic but factual',
      setting: 'Texas State Capitol, Austin'
    };

    return this.generateScript(brief);
  }
}

export default ScriptGenerator;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const generator = new ScriptGenerator();
  const script = await generator.generateTestScript();
  console.log(JSON.stringify(script, null, 2));
  await generator.saveScript(script, 'test-001');
}
// Last optimized: 2025-10-02
