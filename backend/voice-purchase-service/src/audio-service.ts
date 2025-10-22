export class AudioService {
  async transcribeAudio(audioData: string, format: string): Promise<string> {
    // Prototype: replace with real STT
    return 'I want to buy some premium indica flower';
  }

  async textToSpeech(text: string): Promise<string> {
    // Prototype: replace with real TTS
    return 'UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqF...';
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}


