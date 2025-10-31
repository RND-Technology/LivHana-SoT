import { ElevenLabsClient } from 'elevenlabs';
import { Readable } from 'stream';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

interface AtlasVoiceConfig {
  voiceId: string;
  modelId: string;
  stability: number;
  similarity: number;
}

const ATLAS_VOICE_CONFIG: AtlasVoiceConfig = {
  voiceId: process.env.ATLAS_VOICE_ID || 'a_default_atlas_voice_id',
  modelId: 'eleven_turbo_v2',
  stability: 0.6,
  similarity: 0.9,
};

export async function generateAtlasVoice(text: string): Promise<Readable> {
  console.log('[AtlasVoice] Generating audio with Atlas configuration.');
  try {
    const audioStream = await elevenlabs.generate({
      voice: ATLAS_VOICE_CONFIG.voiceId,
      model_id: ATLAS_VOICE_CONFIG.modelId,
      text,
      voice_settings: {
        stability: ATLAS_VOICE_CONFIG.stability,
        similarity_boost: ATLAS_VOICE_CONFIG.similarity,
      },
    });
    return audioStream;
  } catch (error) {
    console.error('[AtlasVoice] Error generating voice:', error);
    throw new Error('Failed to generate Atlas voice stream.');
  }
}
