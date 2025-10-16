#### 1. API Key Not Configured

**Error:** `API key not configured`

**Solution:**
```bash
# Check environment variables
echo $ELEVENLABS_API_KEY
echo $OPENAI_API_KEY

# Set if missing
export ELEVENLABS_API_KEY=your-key-here
```
