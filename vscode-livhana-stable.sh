#!/bin/bash
export NODE_OPTIONS="--max-old-space-size=8192"
CRASH_PROOF_FLAGS=(--no-sandbox --disable-gpu-sandbox --no-proxy-server --js-flags="--gc-interval=1000")
if [ -d "/Applications/Visual Studio Code - Insiders.app" ]; then
    "/Applications/Visual Studio Code - Insiders.app/Contents/MacOS/Electron" "${CRASH_PROOF_FLAGS[@]}" "$@"
else
    "/Applications/Visual Studio Code.app/Contents/MacOS/Electron" "${CRASH_PROOF_FLAGS[@]}" "$@"
fi
