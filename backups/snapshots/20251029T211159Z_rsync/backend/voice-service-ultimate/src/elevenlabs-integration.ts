/**
 * ElevenLabs Voice Integration
 * Premium TTS with Jesse voice cloning
 * Target: <300ms latency for voice generation
 */

import axios from 'axios';
import { EventEmitter } from 'events';

export interface VoiceConfig {
  voiceId: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface TTSRequest {
  text: string;
  voiceConfig?: VoiceConfig;
}

export class ElevenLabsIntegration extends EventEmitter {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  // Jesse's voice clone ID (will be created during setup)
  private jesseVoiceId = 'jesse_clone_v1';

  constructor() {
    super();
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';

    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY not found in environment');
    }
  }

  /**
   * Generate speech from text using Jesse's voice clone
   */
  async generateSpeech(request: TTSRequest): Promise<Buffer> {
    const startTime = Date.now();

    try {
      const voiceConfig: VoiceConfig = request.voiceConfig || {
        voiceId: this.jesseVoiceId,
        modelId: 'eleven_turbo_v2_5', // Fastest model, 300ms latency
        stability: 0.5,
        similarityBoost: 0.75,
        style: 0.5,
        useSpeakerBoost: true,
      };

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceConfig.voiceId}/stream`,
        {
          text: request.text,
          model_id: voiceConfig.modelId,
          voice_settings: {
            stability: voiceConfig.stability,
            similarity_boost: voiceConfig.similarityBoost,
            style: voiceConfig.style,
            use_speaker_boost: voiceConfig.useSpeakerBoost,
          },
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      const latency = Date.now() - startTime;
      this.emit('tts_complete', { latency, textLength: request.text.length });

      return Buffer.from(response.data);
    } catch (error: any) {
      const latency = Date.now() - startTime;
      this.emit('tts_error', {
        error: error.message,
        latency,
        statusCode: error.response?.status
      });
      throw error;
    }
  }

  /**
   * Stream speech generation for real-time playback
   */
  async *streamSpeech(request: TTSRequest): AsyncGenerator<Buffer> {
    const voiceConfig: VoiceConfig = request.voiceConfig || {
      voiceId: this.jesseVoiceId,
      modelId: 'eleven_turbo_v2_5',
      stability: 0.5,
      similarityBoost: 0.75,
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${voiceConfig.voiceId}/stream`,
        {
          text: request.text,
          model_id: voiceConfig.modelId,
          voice_settings: {
            stability: voiceConfig.stability,
            similarity_boost: voiceConfig.similarityBoost,
          },
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        }
      );

      for await (const chunk of response.data) {
        yield Buffer.from(chunk);
      }
    } catch (error: any) {
      this.emit('stream_error', { error: error.message });
      throw error;
    }
  }

  /**
   * Create Jesse voice clone from audio samples
   */
  async createVoiceClone(
    name: string,
    description: string,
    audioFiles: Buffer[]
  ): Promise<string> {
    const FormData = require('form-data');
    const form = new FormData();

    form.append('name', name);
    form.append('description', description);

    audioFiles.forEach((audio, index) => {
      form.append('files', audio, `sample_${index}.mp3`);
    });

    try {
      const response = await axios.post(
        `${this.baseUrl}/voices/add`,
        form,
        {
          headers: {
            'xi-api-key': this.apiKey,
            ...form.getHeaders(),
          },
        }
      );

      const voiceId = response.data.voice_id;
      this.emit('voice_clone_created', { voiceId, name });

      return voiceId;
    } catch (error: any) {
      this.emit('voice_clone_error', { error: error.message });
      throw error;
    }
  }

  /**
   * List all available voices
   */
  async listVoices(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/voices`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        }
      );

      return response.data.voices;
    } catch (error: any) {
      this.emit('list_voices_error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get voice settings for Jesse's clone
   */
  async getVoiceSettings(voiceId?: string): Promise<any> {
    const targetVoiceId = voiceId || this.jesseVoiceId;

    try {
      const response = await axios.get(
        `${this.baseUrl}/voices/${targetVoiceId}/settings`,
        {
          headers: {
            'xi-api-key': this.apiKey,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      this.emit('settings_error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update voice settings for fine-tuning
   */
  async updateVoiceSettings(
    voiceId: string,
    settings: {
      stability?: number;
      similarityBoost?: number;
      style?: number;
      useSpeakerBoost?: boolean;
    }
  ): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/voices/${voiceId}/settings/edit`,
        {
          stability: settings.stability,
          similarity_boost: settings.similarityBoost,
          style: settings.style,
          use_speaker_boost: settings.useSpeakerBoost,
        },
        {
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      this.emit('settings_updated', { voiceId, settings });
    } catch (error: any) {
      this.emit('settings_update_error', { error: error.message });
      throw error;
    }
  }

  /**
   * Health check - verify API key and connectivity
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      await this.listVoices();
      return { healthy: true, message: 'ElevenLabs API connection healthy' };
    } catch (error: any) {
      return {
        healthy: false,
        message: `ElevenLabs API error: ${error.message}`
      };
    }
  }
}
