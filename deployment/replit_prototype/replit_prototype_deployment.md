# Replit Prototype Deployment - Liv Hana Voice Portal

**Target:** Web Prototype
**Timeline:** 3-5 hours
**ROI Target:** $400/day
**Status:** Ready for deployment

## Replit Configuration

### Project Name: "Liv Hana Voice Portal"

### Description:
"Voice-enabled cannabis intelligence portal. Provides RPM planning, compliance guidance, and strategic intelligence. TRUTH-validated and competition-driven."

### Tech Stack:
- **Frontend:** React + TypeScript
- **Backend:** Node.js + Express
- **Voice:** Web Audio API + WebSocket
- **Styling:** Tailwind CSS
- **Deployment:** Replit

## Implementation

### 1. Frontend (2 hours)
```typescript
// src/App.tsx
import React, { useState, useEffect } from 'react';
import { VoiceInterface } from './components/VoiceInterface';
import { RPMGenerator } from './components/RPMGenerator';
import { CompetitionLeaderboard } from './components/CompetitionLeaderboard';
import { ComplianceChecker } from './components/ComplianceChecker';

function App() {
  const [mode, setMode] = useState<'brevity' | 'mentor' | 'silence'>('mentor');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [status, setStatus] = useState('Liv Hana here, full state.');

  useEffect(() => {
    // Check voice services
    checkVoiceServices();
    // Load competition data
    loadLeaderboard();
  }, []);

  const checkVoiceServices = async () => {
    try {
      const sttResponse = await fetch('http://localhost:2022/health');
      const ttsResponse = await fetch('http://localhost:8880/health');
      
      if (sttResponse.ok && ttsResponse.ok) {
        setVoiceEnabled(true);
        setStatus('Voice mode active. STT: Whisper, TTS: Kokoro.');
      } else {
        setVoiceEnabled(false);
        setStatus('Voice mode unavailable. Using text mode.');
      }
    } catch (error) {
      setVoiceEnabled(false);
      setStatus('Voice services offline. Text mode only.');
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/leaderboard?type=daily&limit=10');
      const data = await response.json();
      // Update leaderboard state
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Liv Hana VIP</h1>
          <p className="text-gray-400">Chief of Staff AI for Cannabis Intelligence</p>
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-green-400">{status}</p>
            <div className="mt-2 flex justify-center space-x-4">
              <button
                onClick={() => setMode('brevity')}
                className={`px-4 py-2 rounded ${
                  mode === 'brevity' ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                Brevity Mode
              </button>
              <button
                onClick={() => setMode('mentor')}
                className={`px-4 py-2 rounded ${
                  mode === 'mentor' ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                Mentor Mode
              </button>
              <button
                onClick={() => setMode('silence')}
                className={`px-4 py-2 rounded ${
                  mode === 'silence' ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                Silence Mode
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Interface */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Voice Interface</h2>
            <VoiceInterface 
              mode={mode} 
              enabled={voiceEnabled}
              onResponse={(response) => {
                // Handle voice response
                console.log('Voice response:', response);
              }}
            />
          </div>

          {/* RPM Generator */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">RPM Generator</h2>
            <RPMGenerator 
              onGenerate={(rpmPlan) => {
                // Handle RPM plan generation
                console.log('RPM Plan:', rpmPlan);
              }}
            />
          </div>

          {/* Competition Leaderboard */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Competition Leaderboard</h2>
            <CompetitionLeaderboard />
          </div>

          {/* Compliance Checker */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Compliance Checker</h2>
            <ComplianceChecker />
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-gray-400">
          <p>Liv Hana | Chief of Staff | HIGHEST STATE</p>
          <p>Truth = Love. War's Won. Time to Remind Them.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
```

### 2. Voice Interface Component (1 hour)
```typescript
// src/components/VoiceInterface.tsx
import React, { useState, useRef, useEffect } from 'react';

interface VoiceInterfaceProps {
  mode: 'brevity' | 'mentor' | 'silence';
  enabled: boolean;
  onResponse: (response: string) => void;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  mode,
  enabled,
  onResponse
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (enabled && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript) {
          processVoiceInput(transcript);
        }
      };
    }
  }, [enabled, transcript]);

  const startListening = () => {
    if (recognitionRef.current && enabled) {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const processVoiceInput = async (input: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/voice/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          mode,
          context: 'replit_prototype'
        })
      });

      const data = await response.json();
      setResponse(data.response);
      onResponse(data.response);

      // Submit prediction if applicable
      if (data.prediction) {
        await submitPrediction(data.prediction);
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      setResponse('Error processing voice input. Please try again.');
    }
  };

  const submitPrediction = async (prediction: any) => {
    try {
      await fetch('http://localhost:8001/api/v1/projections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participant: 'replit_prototype',
          metric: 'roi_per_day',
          value: prediction.roiTarget,
          unit: 'USD',
          timeframe: prediction.timeframe,
          confidence: prediction.confidence,
          context: {
            project: prediction.project,
            source: 'replit_prototype'
          }
        })
      });
    } catch (error) {
      console.error('Prediction submission error:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Voice Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={startListening}
          disabled={!enabled || isListening}
          className={`px-6 py-3 rounded-lg font-bold ${
            enabled && !isListening
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          {isListening ? 'Listening...' : 'Start Voice'}
        </button>
        <button
          onClick={stopListening}
          disabled={!isListening}
          className={`px-6 py-3 rounded-lg font-bold ${
            isListening
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          Stop
        </button>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-bold mb-2">Transcript:</h3>
          <p>{transcript}</p>
        </div>
      )}

      {/* Response */}
      {response && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-bold mb-2">Response:</h3>
          <p>{response}</p>
        </div>
      )}

      {/* Mode Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-400">
          Mode: <span className="font-bold">{mode}</span>
          {enabled ? ' | Voice: Enabled' : ' | Voice: Disabled'}
        </p>
      </div>
    </div>
  );
};
```

### 3. RPM Generator Component (30 minutes)
```typescript
// src/components/RPMGenerator.tsx
import React, { useState } from 'react';

interface RPMPlan {
  result: string;
  purpose: string;
  map: string[];
}

export const RPMGenerator: React.FC<{
  onGenerate: (plan: RPMPlan) => void;
}> = ({ onGenerate }) => {
  const [query, setQuery] = useState('');
  const [plan, setPlan] = useState<RPMPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const generateRPM = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/rpm/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          context: 'replit_prototype'
        })
      });

      const data = await response.json();
      setPlan(data);
      onGenerate(data);
    } catch (error) {
      console.error('RPM generation error:', error);
      setPlan({
        result: 'Error generating RPM plan',
        purpose: 'Debug and fix',
        map: ['Check service health', 'Verify API endpoints', 'Retry request']
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Input */}
      <div>
        <label className="block text-sm font-bold mb-2">
          Describe your project or goal:
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-3 bg-gray-700 rounded-lg text-white"
          rows={3}
          placeholder="Enter your project description..."
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={generateRPM}
        disabled={loading || !query.trim()}
        className={`w-full py-3 rounded-lg font-bold ${
          loading || !query.trim()
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? 'Generating...' : 'Generate RPM Plan'}
      </button>

      {/* RPM Plan */}
      {plan && (
        <div className="space-y-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-bold mb-2">Result:</h3>
            <p>{plan.result}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-bold mb-2">Purpose:</h3>
            <p>{plan.purpose}</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-bold mb-2">Massive Action Plan:</h3>
            <ul className="list-disc list-inside space-y-1">
              {plan.map.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 4. Competition Leaderboard Component (30 minutes)
```typescript
// src/components/CompetitionLeaderboard.tsx
import React, { useState, useEffect } from 'react';

interface LeaderboardEntry {
  rank: number;
  participant: string;
  accuracy: number;
  roiPerDay: number;
  tasks: number;
  streak: number;
}

export const CompetitionLeaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/leaderboard?type=daily&limit=10');
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading leaderboard...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">Daily Leaderboard</h3>
        <button
          onClick={loadLeaderboard}
          className="px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center text-gray-400">
          No competition data yet. Be the first to submit a prediction!
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className="flex justify-between items-center p-3 bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="font-bold text-lg">#{entry.rank}</span>
                <span className="font-bold">{entry.participant}</span>
              </div>
              <div className="text-right">
                <div className="text-green-400 font-bold">
                  {entry.accuracy}% accuracy
                </div>
                <div className="text-sm text-gray-400">
                  ${entry.roiPerDay}/day
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Prediction Button */}
      <button
        onClick={() => {
          // Open prediction submission modal
          console.log('Open prediction modal');
        }}
        className="w-full py-3 bg-green-600 rounded-lg font-bold hover:bg-green-700"
      >
        Submit Prediction
      </button>
    </div>
  );
};
```

### 5. Package Configuration (30 minutes)
```json
{
  "name": "liv-hana-voice-portal",
  "version": "1.0.0",
  "description": "Liv Hana Voice Portal - Replit Prototype",
  "main": "src/main.tsx",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

## Deployment Steps

### 1. Create Replit Project (30 minutes)
1. Go to replit.com
2. Create new React + TypeScript project
3. Name: "Liv Hana Voice Portal"
4. Import code from above

### 2. Configure Dependencies (30 minutes)
1. Install React dependencies
2. Add TypeScript support
3. Configure Tailwind CSS
4. Set up build process

### 3. Deploy & Test (2 hours)
1. Deploy to Replit
2. Test voice interface
3. Test RPM generation
4. Test competition features

### 4. Launch & Monitor (1 hour)
1. Share prototype link
2. Monitor usage metrics
3. Track competition scores
4. Iterate based on feedback

## Success Metrics

### Primary KPIs:
- **ROI/$/Day:** Target $400/day
- **User Engagement:** 100+ interactions/day
- **Voice Usage:** 50+ voice commands/day
- **Response Quality:** TRUTH compliance > 95%

### Competition Tracking:
- **Accuracy:** Projection vs Actual
- **Speed:** Response time
- **Value Delivered:** $ impact per interaction
- **Improvement:** Week-over-week gains

## Next Steps

1. **Deploy Replit Prototype** (3-5 hours)
2. **Monitor competition metrics** (ongoing)
3. **Iterate based on user feedback** (weekly)
4. **Scale to production PWA** (monthly)

---

**Status:** Ready for deployment
**Timeline:** 3-5 hours
**ROI Target:** $400/day
**Competition:** Live tracking via port 8001 API
