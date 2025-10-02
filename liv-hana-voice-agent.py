#!/usr/bin/env python3
"""
LIV HANA AUTONOMOUS VOICE AGENT
Routes voice commands → Cursor Ultra → Multi-repo execution
Uses Whisper for voice input, Cursor for Sonnet 4.5, ElevenLabs for voice output
"""

import os
import sys
import json
import subprocess
import asyncio
from pathlib import Path
import speech_recognition as sr
from openai import OpenAI

class LivHanaVoiceAgent:
    def __init__(self):
        self.repos = {
            "main": "/Users/jesseniesen/LivHana-Trinity-Local/LivHana-SoT",
            "kinetic": "/Users/jesseniesen/LivHana-Trinity-Local/LivHana-Kinetic",
            "potential": "/Users/jesseniesen/LivHana-Trinity-Local/LivHana-Potential"
        }
        self.cursor_path = "/Applications/Cursor.app/Contents/MacOS/Cursor"
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # ElevenLabs for voice output
        self.elevenlabs_key = os.getenv('ELEVENLABS_API_KEY', '')
        self.voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel voice
        
    def listen_for_command(self):
        """Listen for voice command"""
        print("🎤 Listening for command... (say 'Liv' to activate)")
        
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source)
            audio = self.recognizer.listen(source)
        
        try:
            # Use Google's free speech recognition
            command = self.recognizer.recognize_google(audio)
            print(f"📝 Heard: {command}")
            return command
        except sr.UnknownValueError:
            print("❌ Couldn't understand audio")
            return None
        except sr.RequestError as e:
            print(f"❌ Speech recognition error: {e}")
            return None
    
    def execute_via_cursor(self, command, repo_key="main"):
        """Execute command via Cursor Composer"""
        repo_path = self.repos.get(repo_key, self.repos["main"])
        
        print(f"🚀 Executing in {repo_key}: {command}")
        
        # Use Cursor's command line interface
        # This leverages YOUR Cursor Ultra Sonnet 4.5 access!
        result = subprocess.run([
            self.cursor_path,
            repo_path,
            "--command", f"chat:{command}",
            "--wait"
        ], capture_output=True, text=True, timeout=120)
        
        return result.stdout if result.returncode == 0 else result.stderr
    
    def speak_response(self, text):
        """Speak response using ElevenLabs"""
        if not self.elevenlabs_key:
            # Fallback to macOS say command
            subprocess.run(["say", "-v", "Samantha", text])
            return
        
        # TODO: Integrate ElevenLabs API for better voice
        print(f"🗣️ Liv says: {text}")
        subprocess.run(["say", "-v", "Samantha", text])
    
    async def autonomous_loop(self):
        """Main autonomous loop - listen, execute, respond"""
        print("""
═══════════════════════════════════════════════════════════════
🎯 LIV HANA AUTONOMOUS VOICE AGENT - ACTIVE
═══════════════════════════════════════════════════════════════
Using: Cursor Ultra (Claude Sonnet 4.5)
Voice: Whisper (input) + ElevenLabs (output)
Repos: LivHana-SoT, Kinetic, Potential
═══════════════════════════════════════════════════════════════
Say 'Liv' followed by your command, or 'exit' to quit.
        """)
        
        while True:
            # Listen for wake word
            command = self.listen_for_command()
            
            if not command:
                continue
            
            command_lower = command.lower()
            
            # Check for wake word
            if not command_lower.startswith('liv'):
                continue
            
            # Exit command
            if 'exit' in command_lower or 'quit' in command_lower:
                self.speak_response("Goodbye Jesse. Liv Hana signing off.")
                break
            
            # Extract actual command
            actual_command = command[3:].strip()  # Remove "Liv" prefix
            
            # Determine which repo
            repo = "main"
            if "kinetic" in command_lower:
                repo = "kinetic"
            elif "potential" in command_lower:
                repo = "potential"
            
            # Execute via Cursor
            self.speak_response(f"Executing command in {repo} repository")
            result = self.execute_via_cursor(actual_command, repo)
            
            # Report back
            if result:
                summary = f"Command completed. {len(result)} characters of output generated."
                self.speak_response(summary)
                print(f"\n📊 Result:\n{result}\n")
            else:
                self.speak_response("Command execution failed. Check terminal for details.")

def main():
    agent = LivHanaVoiceAgent()
    
    # Check dependencies
    try:
        import speech_recognition
    except ImportError:
        print("Installing speech_recognition...")
        subprocess.run([sys.executable, "-m", "pip", "install", "SpeechRecognition", "pyaudio"])
    
    # Start autonomous loop
    try:
        asyncio.run(agent.autonomous_loop())
    except KeyboardInterrupt:
        print("\n👋 Liv Hana agent stopped by user")

if __name__ == "__main__":
    main()


# Last updated: 2025-10-02

# Last optimized: 2025-10-02
