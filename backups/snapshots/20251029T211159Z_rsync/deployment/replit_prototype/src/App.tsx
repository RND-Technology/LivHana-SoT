import React, { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('Liv Hana here, full state.');
  const [mode, setMode] = useState('mentor');

  useEffect(() => {
    // Check voice services
    checkVoiceServices();
  }, []);

  const checkVoiceServices = async () => {
    try {
      const sttResponse = await fetch('http://localhost:2022/health');
      const ttsResponse = await fetch('http://localhost:8880/health');
      
      if (sttResponse.ok && ttsResponse.ok) {
        setStatus('Voice mode active. STT: Whisper, TTS: Kokoro.');
      } else {
        setStatus('Voice mode unavailable. Using text mode.');
      }
    } catch (error) {
      setStatus('Voice services offline. Text mode only.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Liv Hana VIP</h1>
          <p className="text-gray-400">Chief of Staff AI for Cannabis Intelligence</p>
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-green-400">{status}</p>
          </div>
        </header>
        
        <div className="text-center">
          <p>Replit Prototype Ready for Deployment</p>
          <p>Voice Interface: Coming Soon</p>
          <p>Competition Tracking: Active</p>
        </div>
      </div>
    </div>
  );
}

export default App;
