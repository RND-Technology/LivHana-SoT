export class AudioService {
  async transcribeAudio(_audioData: string, _format: string): Promise<string> {
    // Prototype: replace with real STT
    return 'I want to buy some premium indica flower';
  }

  async textToSpeech(_text: string): Promise<string> {
    // Prototype: replace with real TTS
    return 'UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqF...';
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}


