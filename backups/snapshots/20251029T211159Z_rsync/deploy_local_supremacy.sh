#!/bin/bash
# PHASE 2: M4 Max local orchestration

echo "=== PHASE 2: LOCAL MODEL SUPREMACY ==="

# 1. Install LM Studio
if ! command -v lmstudio &> /dev/null; then
    brew install --cask lm-studio
fi

# 2. Configure DeepSeek with Flash Attention
cat > Modelfile.optimized << MODELFILE
FROM deepseek-v3.1
PARAMETER num_ctx 32768
PARAMETER flash_attention true
PARAMETER kv_cache_quantization f16
PARAMETER num_gpu 1
PARAMETER temperature 0.7
MODELFILE

ollama create deepseek-v3.1-optimized -f Modelfile.optimized

# 3. Start local API server
ollama serve &
sleep 5

# 4. Install Continue extension for Cursor
code --install-extension continue.continue

# 5. Configure Continue for local DeepSeek
mkdir -p ~/.continue
cat > ~/.continue/config.json << CONTINUE
{
  "models": [
    {
      "title": "DeepSeek Local",
      "provider": "ollama",
      "model": "deepseek-v3.1-optimized",
      "apiBase": "http://localhost:11434"
    }
  ],
  "tabAutocompleteModel": {
    "title": "DeepSeek Local",
    "provider": "ollama",
    "model": "deepseek-v3.1-optimized"
  }
}
CONTINUE

echo "✅ Local DeepSeek wired to Cursor"
echo "=== PHASE 2 COMPLETE ==="
