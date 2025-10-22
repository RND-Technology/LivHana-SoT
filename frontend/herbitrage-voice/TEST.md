# Herbitrage Voice Cockpit - Testing Guide

## Quick Test

1. **Access the Application**
   - Open: <https://herbitrage-voice-980910443251.us-central1.run.app>
   - Or once DNS propagates: <https://herbitrage.com>

2. **Login**
   - Email: `jesseniesen@gmail.com`
   - Password: `TXTOLivHanaHerbitrage`
   - Click "Sign In"

3. **Test Voice Interface**
   - You should see the cockpit with "Talk to Liv" button
   - The status should show "Ready to assist" with a green indicator

4. **Browser Compatibility**
   - **Required**: Chrome or Edge (for Web Speech API)
   - **Required**: HTTPS connection (enforced by Cloud Run)
   - **Required**: Microphone permission

## Test Scenarios

### Scenario 1: Basic Voice Interaction

1. Click "Talk to Liv" button
2. Button should turn gold and show "Listening..."
3. Speak: "Hello, who are you?"
4. Speech should appear in transcript area
5. Status changes to "Thinking..." (blue)
6. Response appears in conversation history
7. Status changes to "Speaking..." (green)
8. Audio plays with Liv's voice response

### Scenario 2: Multiple Conversations

1. Ask: "What's the weather like?"
2. Wait for response
3. Ask: "Tell me a joke"
4. Verify conversation history shows all exchanges
5. Each message labeled as "You" or "Liv Hana"

### Scenario 3: Error Handling

1. Click "Talk to Liv" but don't speak
2. Speech recognition should timeout gracefully
3. Status returns to "Ready to assist"

### Scenario 4: Logout/Login

1. Click "Logout" button
2. Should return to login screen
3. Login again
4. Conversation history should be cleared

## API Testing (For Developers)

### Test Health Endpoint

```bash
curl https://herbitrage-voice-980910443251.us-central1.run.app/health
```

Expected:

```json
{"status":"healthy","service":"herbitrage-voice"}
```

### Test Voice Service Connection

```bash
curl https://voice-service-plad5efvha-uc.a.run.app/health
```

Expected:

```json
{"status":"healthy","service":"voice-service","version":"1.0.0","timestamp":"..."}
```

## Known Limitations

1. **Browser Support**
   - Web Speech API only works in Chrome and Edge
   - Firefox and Safari not supported for voice input
   - Voice output (audio playback) works in all browsers

2. **HTTPS Requirement**
   - Speech recognition requires HTTPS
   - Cloud Run provides this automatically
   - Local testing requires ngrok or similar

3. **Voice Service Integration**
   - Depends on voice-service availability
   - CORS must allow herbitrage.com and Cloud Run URL
   - ElevenLabs API key must be configured in voice-service

4. **Session Management**
   - Uses sessionStorage (cleared on browser close)
   - No persistent authentication
   - Single-user prototype only

## Troubleshooting

### "Speech recognition not supported"

- **Cause**: Using Firefox or Safari
- **Solution**: Use Chrome or Edge

### Microphone permission denied

- **Cause**: Browser blocked microphone access
- **Solution**:
  1. Click padlock/info icon in address bar
  2. Set microphone to "Allow"
  3. Refresh page

### "Sorry, something went wrong"

- **Cause**: Voice service unreachable or API error
- **Solution**:
  1. Check browser console (F12)
  2. Verify voice-service is up
  3. Check for CORS errors

### No audio playback

- **Cause**: Browser audio blocked or ElevenLabs issue
- **Solution**:
  1. Check browser audio settings
  2. Verify volume not muted
  3. Check browser console for errors

### Login not working

- **Cause**: Incorrect credentials
- **Solution**: Use exact credentials:
  - Email: `jesseniesen@gmail.com`
  - Password: `TXTOLivHanaHerbitrage`
  - Case sensitive

## Performance Expectations

- **Login**: Instant
- **Speech Recognition**: Real-time
- **AI Response**: 10-30 seconds (depends on DeepSeek queue)
- **Voice Synthesis**: 2-5 seconds
- **Total Interaction Time**: 15-40 seconds per question

## Browser Console Debug

Open browser console (F12) to see:

- Speech recognition events
- API requests/responses
- SSE streaming events
- Audio playback status
- Error details

## Success Criteria

- [ ] Login page loads
- [ ] Authentication works
- [ ] Cockpit displays after login
- [ ] "Talk to Liv" button enabled
- [ ] Microphone permission granted
- [ ] Speech captured and displayed
- [ ] AI response received
- [ ] Voice audio plays
- [ ] Conversation history updates
- [ ] Logout returns to login

## Support

If issues persist:

1. Check Cloud Run logs:

   ```bash
   gcloud run services logs read herbitrage-voice \
     --region us-central1 \
     --project reggieanddrodispensary \
     --limit 50
   ```

2. Check browser console (F12 → Console tab)

3. Verify voice-service status:

   ```bash
   curl https://voice-service-plad5efvha-uc.a.run.app/health
   ```

4. Contact: <jesseniesen@gmail.com>
