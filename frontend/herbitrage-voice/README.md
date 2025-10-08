# Herbitrage Voice Cockpit - Liv Hana

Voice-enabled AI cockpit for Herbitrage.com with secure login and real-time voice conversations.

## Features

- **Secure Login**: Simple authentication system
  - Username: jesseniesen@gmail.com
  - Password: TXTOLivHanaHerbitrage

- **Voice Interface**:
  - Web Speech API for speech-to-text (browser-based, no API keys needed)
  - Talk to Liv button for voice interactions
  - Real-time conversation display

- **AI Integration**:
  - DeepSeek reasoning via voice-service queue
  - ElevenLabs text-to-speech for natural voice responses
  - Server-Sent Events (SSE) for real-time progress updates

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Node.js + Express
- **Voice Service**: https://voice-service-980910443251.us-central1.run.app
- **Deployment**: Docker + Google Cloud Run

## Architecture

```
User → Browser (Web Speech API) → Voice Cockpit
  ↓
Voice Service → DeepSeek Reasoning Queue
  ↓
ElevenLabs TTS → Audio Response → User
```

## Development

```bash
# Install dependencies
npm install

# Run locally
npm start

# Access at http://localhost:8080
```

## Deployment

```bash
# Build and deploy to Cloud Run
./deploy.sh
```

Or manually:

```bash
# Build Docker image
docker build --platform linux/amd64 -t gcr.io/reggieanddrodispensary/herbitrage-voice:latest .

# Push to GCR
docker push gcr.io/reggieanddrodispensary/herbitrage-voice:latest

# Deploy to Cloud Run
gcloud run deploy herbitrage-voice \
  --image gcr.io/reggieanddrodispensary/herbitrage-voice:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --service-account cloudrun-service-account@reggieanddrodispensary.iam.gserviceaccount.com \
  --project reggieanddrodispensary
```

## URLs

- **Cloud Run Service**: https://herbitrage-voice-980910443251.us-central1.run.app
- **Custom Domain**: https://herbitrage.com (DNS propagation may take time)

## Usage

1. Navigate to https://herbitrage-voice-980910443251.us-central1.run.app (or herbitrage.com once DNS propagates)
2. Login with the provided credentials
3. Click "Talk to Liv" button
4. Speak your question or request
5. Liv will process your request and respond with voice

## Browser Compatibility

- **Web Speech API**: Chrome, Edge (recommended)
- **Audio Playback**: All modern browsers
- **HTTPS Required**: Speech recognition requires HTTPS

## Voice Service Integration

The cockpit integrates with the voice-service API at:
- **Base URL**: https://voice-service-980910443251.us-central1.run.app
- **Reasoning**: POST /api/reasoning/enqueue
- **Streaming**: GET /api/reasoning/stream/:jobId
- **Text-to-Speech**: POST /api/elevenlabs/synthesize

See `backend/voice-service/README.md` for full API documentation.

## Security

- Simple hardcoded authentication (suitable for single-user prototype)
- Session storage for login state
- HTTPS enforced by Cloud Run
- Service account: cloudrun-service-account@reggieanddrodispensary.iam.gserviceaccount.com

## Future Enhancements

- Database-backed authentication
- Multi-user support with JWT
- Conversation history persistence
- Voice customization options
- Mobile app wrapper

## Support

Contact: jesseniesen@gmail.com

## License

Proprietary - LivHana Trinity
