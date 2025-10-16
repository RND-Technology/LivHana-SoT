### Voice Mode (Frontend)
```javascript
// File: public/js/voice-interface.js

class VoiceInterface {
  constructor() {
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
  }

  async startListening() {
    this.isListening = true;
    this.recognition.start();
    updateStatus("Listening...");

    this.recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      addMessage('user', transcript);

      // Send to HERB reasoning engine
      const response = await fetch('/api/herb/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: transcript, userId: getCurrentUserId() })
      });

      const data = await response.json();
      addMessage('herb', data.response);
      this.speak(data.response);
    };
  }

  speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.synthesis.getVoices().find(v => v.name.includes('Female'));
    this.synthesis.speak(utterance);
  }
}

// Initialize
const voiceInterface = new VoiceInterface();
document.getElementById('voiceBtn').addEventListener('click', () => {
  voiceInterface.startListening();
});
```
