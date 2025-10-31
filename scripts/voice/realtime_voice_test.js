#!/usr/bin/env node

/**
 * OpenAI Realtime API Voice Test
 * Target: <510ms latency (Speech-to-Speech)
 *
 * Adaptive Cycle Testing:
 * - Measure every request
 * - Log configuration and results
 * - Adjust and iterate
 */

import WebSocket from 'ws';
import fs from 'fs';
import { execSync } from 'child_process';

// Get API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ||
  execSync('op item get "OPENAI_API_KEY" --fields credential --reveal 2>&1', { encoding: 'utf8' }).trim();

const REALTIME_API_URL = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview';

class RealtimeVoiceTest {
  constructor(config = {}) {
    this.config = {
      model: config.model || 'gpt-4o-realtime-preview',
      voice: config.voice || 'alloy',
      instructions: config.instructions || 'Liv Hana. Direct. Concise. Under 50 words.',
      vad_threshold: config.vad_threshold || 0.6,
      silence_duration_ms: config.silence_duration_ms || 400,
      ...config
    };

    this.measurements = [];
    this.iteration = 0;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const startConnect = Date.now();

      this.ws = new WebSocket(REALTIME_API_URL, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      });

      this.ws.on('open', () => {
        const connectLatency = Date.now() - startConnect;
        console.log(`✅ WebSocket connected (${connectLatency}ms)`);

        // Configure session
        this.ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['audio', 'text'],
            instructions: this.config.instructions,
            voice: this.config.voice,
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            turn_detection: {
              type: 'server_vad',
              threshold: this.config.vad_threshold,
              prefix_padding_ms: 200,
              silence_duration_ms: this.config.silence_duration_ms
            }
          }
        }));

        resolve(connectLatency);
      });

      this.ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
        reject(error);
      });

      this.ws.on('message', (data) => {
        this.handleMessage(JSON.parse(data.toString()));
      });
    });
  }

  handleMessage(event) {
    // Log all events for debugging
    if (process.env.DEBUG) {
      console.log('Event:', event.type);
    }

    switch (event.type) {
      case 'session.created':
        console.log('✅ Session created:', event.session.id);
        break;

      case 'session.updated':
        console.log('✅ Session configured');
        break;

      case 'response.audio.delta':
        // Audio chunk received - start timing
        if (!this.audioStartTime) {
          this.audioStartTime = Date.now();
        }
        // In real implementation, play this audio
        break;

      case 'response.audio.done':
        // Full audio received
        const latency = Date.now() - this.requestStartTime;
        const timeToFirstByte = this.audioStartTime - this.requestStartTime;

        console.log(`\n📊 Latency Measurement:`);
        console.log(`   Total: ${latency}ms`);
        console.log(`   Time to first audio: ${timeToFirstByte}ms`);

        this.measurements.push({
          iteration: this.iteration,
          total_latency_ms: latency,
          ttfb_ms: timeToFirstByte,
          config: this.config,
          timestamp: new Date().toISOString()
        });

        break;

      case 'error':
        console.error('❌ API Error:', event.error);
        break;
    }
  }

  async sendTextQuery(text) {
    this.iteration++;
    this.requestStartTime = Date.now();
    this.audioStartTime = null;

    console.log(`\n🎤 Test ${this.iteration}: "${text}"`);

    // Send text input (simulating voice for now)
    this.ws.send(JSON.stringify({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text: text
        }]
      }
    }));

    // Request response
    this.ws.send(JSON.stringify({
      type: 'response.create',
      response: {
        modalities: ['audio', 'text']
      }
    }));

    // Wait for response
    await new Promise(resolve => {
      const checkDone = setInterval(() => {
        if (this.measurements.length >= this.iteration) {
          clearInterval(checkDone);
          resolve();
        }
      }, 100);
    });
  }

  calculateStats() {
    if (this.measurements.length === 0) {
      return null;
    }

    const latencies = this.measurements
      .map(m => m.total_latency_ms)
      .sort((a, b) => a - b);

    const ttfbs = this.measurements
      .map(m => m.ttfb_ms)
      .sort((a, b) => a - b);

    const p50_index = Math.floor(latencies.length * 0.5);
    const p95_index = Math.floor(latencies.length * 0.95);

    return {
      sample_size: latencies.length,
      latency: {
        p50: latencies[p50_index],
        p95: latencies[p95_index],
        avg: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        min: latencies[0],
        max: latencies[latencies.length - 1]
      },
      ttfb: {
        p50: ttfbs[p50_index],
        p95: ttfbs[p95_index],
        avg: ttfbs.reduce((a, b) => a + b, 0) / ttfbs.length
      }
    };
  }

  saveResults(filename) {
    const stats = this.calculateStats();

    const results = {
      test_timestamp: new Date().toISOString(),
      configuration: this.config,
      measurements: this.measurements,
      statistics: stats,
      target_met: stats ? stats.latency.p50 < 510 : false
    };

    fs.writeFileSync(filename, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to ${filename}`);

    return results;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      console.log('\n✅ WebSocket disconnected');
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'test':
      const numTests = parseInt(process.argv[3]) || 5;

      console.log(`\n🎯 MISSION: 510ms Voice Latency`);
      console.log(`Running ${numTests} test queries...\n`);

      const tester = new RealtimeVoiceTest();

      await tester.connect();

      // Run test queries
      const queries = [
        'What time is it?',
        'Hello',
        'Status',
        'What is 2 plus 2?',
        'Explain latency'
      ];

      for (let i = 0; i < Math.min(numTests, queries.length); i++) {
        await tester.sendTextQuery(queries[i]);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Pause between tests
      }

      // Calculate and display results
      const stats = tester.calculateStats();

      console.log(`\n\n📊 RESULTS (${stats.sample_size} samples):`);
      console.log(`   P50 Latency: ${stats.latency.p50}ms`);
      console.log(`   P95 Latency: ${stats.latency.p95}ms`);
      console.log(`   Avg Latency: ${Math.round(stats.latency.avg)}ms`);
      console.log(`   Time to First Byte: ${stats.ttfb.p50}ms (P50)`);

      if (stats.latency.p50 < 510) {
        console.log(`\n✅ TARGET MET: P50 ${stats.latency.p50}ms < 510ms`);
      } else {
        console.log(`\n⚠️  ABOVE TARGET: P50 ${stats.latency.p50}ms > 510ms`);
        console.log(`   Need to reduce by ${stats.latency.p50 - 510}ms`);
      }

      // Save results
      const filename = `tmp/voice_sessions/realtime_test_${Date.now()}.json`;
      tester.saveResults(filename);

      tester.disconnect();
      break;

    case 'cycle':
      // Adaptive cycle testing
      const cycleNum = parseInt(process.argv[3]) || 1;

      console.log(`\n🔄 ADAPTIVE CYCLE ${cycleNum}`);

      // Cycle-specific configurations
      const configs = [
        { // Cycle 1: Baseline
          instructions: 'Liv Hana. Direct. Concise.',
          vad_threshold: 0.5,
          silence_duration_ms: 500
        },
        { // Cycle 2: Optimize VAD
          instructions: 'Liv Hana. Direct.',
          vad_threshold: 0.6,
          silence_duration_ms: 400
        },
        { // Cycle 3: Minimal prompt
          instructions: 'Direct. <50 words.',
          vad_threshold: 0.65,
          silence_duration_ms: 350
        }
      ];

      const config = configs[cycleNum - 1] || configs[0];
      const cycleTester = new RealtimeVoiceTest(config);

      await cycleTester.connect();

      // Run 10 tests
      for (let i = 0; i < 10; i++) {
        await cycleTester.sendTextQuery(`Test query ${i + 1}`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const cycleStats = cycleTester.calculateStats();

      console.log(`\n📊 CYCLE ${cycleNum} RESULTS:`);
      console.log(`   P50: ${cycleStats.latency.p50}ms`);
      console.log(`   Config: ${JSON.stringify(config, null, 2)}`);

      cycleTester.saveResults(`tmp/voice_sessions/cycle${cycleNum}_${Date.now()}.json`);
      cycleTester.disconnect();
      break;

    default:
      console.log(`
OpenAI Realtime Voice Testing

Usage:
  node realtime_voice_test.js test [num_tests]
  node realtime_voice_test.js cycle [cycle_number]

Examples:
  node realtime_voice_test.js test 5
  node realtime_voice_test.js cycle 1
      `);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RealtimeVoiceTest };
