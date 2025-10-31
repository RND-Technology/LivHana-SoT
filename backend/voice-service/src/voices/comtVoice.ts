import { ElevenLabsClient } from 'elevenlabs';
import { Readable } from 'stream';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

interface ComtVoiceConfig {
  voiceId: string;
  modelId: string;
  style: number;
  clarity: number;
}

const COMT_VOICE_CONFIG: ComtVoiceConfig = {
  voiceId: process.env.COMT_VOICE_ID || 'a_default_comt_voice_id',
  modelId: 'eleven_multilingual_v2',
  style: 0.8,
  clarity: 0.75,
};

export async function generateComtVoice(text: string): Promise<Readable> {
  console.log('[ComtVoice] Generating audio with COMT configuration.');
  try {
    const audioStream = await elevenlabs.generate({
      voice: COMT_VOICE_CONFIG.voiceId,
      model_id: COMT_VOICE_CONFIG.modelId,
      text,
      voice_settings: {
        style: COMT_VOICE_CONFIG.style,
        similarity_boost: COMT_VOICE_CONFIG.clarity, // Using similarity_boost for clarity-like effect
      },
    });
    return audioStream;
  } catch (error) {
    console.error('[ComtVoice] Error generating voice:', error);
    throw new Error('Failed to generate COMT voice stream.');
  }
}
