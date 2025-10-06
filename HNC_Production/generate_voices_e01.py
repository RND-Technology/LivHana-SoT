#!/usr/bin/env python3
"""
HNC Episode 1 Voice Generation Script
Generates all character voices using ElevenLabs API

Usage:
    python3 generate_voices_e01.py

Requirements:
    - ElevenLabs Pro account ($99/mo)
    - ELEVENLABS_API_KEY environment variable
    - Internet connection

Output:
    - ./audio/e01/01_jesse_San_Antonio_October.mp3
    - ./audio/e01/02_liv_Good_afternoon_Jesse.mp3
    - ... (27 total audio files)
"""

import os
import json
import time
from elevenlabs import Voice, VoiceSettings, generate, save

# Character voice configurations
CHARACTERS = {
    'jesse': {
        'voice_id': 'pNInz6obpgDQGcFmaJgB',  # Adam (deep, authoritative)
        'description': 'Jesse Niesen - CEO, authoritative baritone'
    },
    'liv': {
        'voice_id': 'EXAVITQu4vr4xnSDxMaL',  # Bella (intelligent, airy)
        'description': 'Liv Hana - AI EA, intelligent mezzo-soprano'
    },
    'dan': {
        'voice_id': 'VR6AewLTigWG4xSOukaG',  # Josh (gravelly, veteran)
        'description': 'Lt. Dan - Skeptical veteran, gravelly voice'
    },
    'steve': {
        'voice_id': 'AZnzlk1XvdvUeBnXmlld',  # Antoni (nervous, anxious)
        'description': 'Chief Steve - Nervous police chief, anxious tone'
    }
}

# Episode 1 dialogue script
DIALOGUE = [
    {
        'id': '01',
        'character': 'jesse',
        'text': 'San Antonio, October 6th, 2025. I\'m Jesse Niesen, CEO of Reggie & Dro, and I\'m about to launch the most audacious mission in Texas cannabis history.',
        'duration': 15
    },
    {
        'id': '02',
        'character': 'liv',
        'text': 'Good afternoon, Jesse. I\'m Liv Hana, your AI Executive Assistant. I\'ve analyzed the Texas hemp regulations and prepared our strategy.',
        'duration': 12
    },
    {
        'id': '03',
        'character': 'jesse',
        'text': 'Liv, what\'s our mission?',
        'duration': 3
    },
    {
        'id': '04',
        'character': 'liv',
        'text': 'To deschedule Cannabis sativa L entirely in Texas. We\'re building a Wall of Weed - 50 feet tall, 84 days to complete.',
        'duration': 10
    },
    {
        'id': '05',
        'character': 'jesse',
        'text': 'A Wall of Weed?',
        'duration': 2
    },
    {
        'id': '06',
        'character': 'liv',
        'text': 'Yes. Every day we\'ll add another foot. By day 84, Texas will wake up to a 50-foot wall of legal hemp, proving prohibition is theater.',
        'duration': 12
    },
    {
        'id': '07',
        'character': 'jesse',
        'text': 'And if they try to stop us?',
        'duration': 4
    },
    {
        'id': '08',
        'character': 'liv',
        'text': 'We\'re operating within Texas DSHS hemp regulations. 0.3% THC limit, COA validated, NIST standards. Completely legal.',
        'duration': 10
    },
    {
        'id': '09',
        'character': 'dan',
        'text': 'Hold up there, Jesse. This sounds like trouble.',
        'duration': 5
    },
    {
        'id': '10',
        'character': 'jesse',
        'text': 'Lt. Dan! What brings you here?',
        'duration': 4
    },
    {
        'id': '11',
        'character': 'dan',
        'text': 'Heard about your Wall of Weed. As a veteran, I\'ve seen enough walls. What makes this one different?',
        'duration': 8
    },
    {
        'id': '12',
        'character': 'jesse',
        'text': 'This wall grows freedom, Dan. Every foot represents another day Texas chooses truth over prohibition.',
        'duration': 9
    },
    {
        'id': '13',
        'character': 'dan',
        'text': 'I\'m skeptical, but I\'ll watch. Veterans deserve better than this 0.3% nonsense.',
        'duration': 7
    },
    {
        'id': '14',
        'character': 'steve',
        'text': 'Jesse! Chief Steve here. We need to talk about this Wall of Weed situation.',
        'duration': 8
    },
    {
        'id': '15',
        'character': 'jesse',
        'text': 'Chief Steve! What can I do for you?',
        'duration': 4
    },
    {
        'id': '16',
        'character': 'steve',
        'text': 'Look, I\'m all for legal hemp, but a 50-foot wall? That\'s going to attract attention.',
        'duration': 8
    },
    {
        'id': '17',
        'character': 'jesse',
        'text': 'That\'s the point, Chief. We want attention. We want Texas to see what freedom looks like.',
        'duration': 9
    },
    {
        'id': '18',
        'character': 'steve',
        'text': 'Just... just make sure everything\'s legal. I don\'t want any trouble.',
        'duration': 6
    },
    {
        'id': '19',
        'character': 'liv',
        'text': 'Chief, we\'ve triple-checked every regulation. We\'re operating well within legal limits.',
        'duration': 8
    },
    {
        'id': '20',
        'character': 'jesse',
        'text': 'Today, we start with three feet. Three feet of pure Texas hemp, COA validated, NIST compliant.',
        'duration': 10
    },
    {
        'id': '21',
        'character': 'liv',
        'text': 'The foundation is laid. Tomorrow, four feet. The day after, five feet. And so on.',
        'duration': 9
    },
    {
        'id': '22',
        'character': 'jesse',
        'text': 'By day 84, Texas will have a choice: tear down the wall, or embrace the future.',
        'duration': 9
    },
    {
        'id': '23',
        'character': 'dan',
        'text': 'I\'ll be watching. Veterans fought for freedom. Time to see if Texas remembers that.',
        'duration': 8
    },
    {
        'id': '24',
        'character': 'steve',
        'text': 'Just... just be careful, Jesse. Walls have a way of changing things.',
        'duration': 6
    },
    {
        'id': '25',
        'character': 'jesse',
        'text': 'That\'s exactly what we\'re counting on, Chief.',
        'duration': 5
    },
    {
        'id': '26',
        'character': 'liv',
        'text': 'Mission parameters set. Wall of Weed construction begins now.',
        'duration': 6
    },
    {
        'id': '27',
        'character': 'jesse',
        'text': 'Welcome to the Texas THC Tale. The Empire Awakens.',
        'duration': 6
    }
]

def generate_voice_clip(dialogue_item, output_dir):
    """Generate a single voice clip using ElevenLabs API"""
    character = dialogue_item['character']
    text = dialogue_item['text']
    clip_id = dialogue_item['id']
    
    print(f"🎤 Generating {character} - {clip_id}: {text[:50]}...")
    
    try:
        # Get voice configuration
        voice_config = CHARACTERS[character]
        voice_id = voice_config['voice_id']
        
        # Generate audio
        audio = generate(
            text=text,
            voice=Voice(
                voice_id=voice_id,
                settings=VoiceSettings(
                    stability=0.75,
                    similarity_boost=0.8,
                    style=0.5,
                    use_speaker_boost=True
                )
            )
        )
        
        # Save to file
        filename = f"{clip_id}_{character}_{text[:30].replace(' ', '_').replace(',', '').replace('.', '').replace('?', '').replace('!', '')}.mp3"
        filepath = os.path.join(output_dir, filename)
        
        save(audio, filepath)
        
        print(f"✅ Saved: {filename}")
        return {
            'id': clip_id,
            'character': character,
            'text': text,
            'file': filename,
            'duration': dialogue_item['duration']
        }
        
    except Exception as e:
        print(f"❌ Error generating {character} - {clip_id}: {e}")
        return None

def main():
    """Main execution function"""
    print("🎬 HNC Episode 1 Voice Generation")
    print("=" * 50)
    
    # Check for API key
    api_key = os.getenv('ELEVENLABS_API_KEY')
    if not api_key:
        print("❌ ELEVENLABS_API_KEY environment variable not set")
        print("Get your API key from: https://elevenlabs.io/")
        return
    
    # Create output directory
    output_dir = "./audio/e01"
    os.makedirs(output_dir, exist_ok=True)
    
    print(f"📁 Output directory: {output_dir}")
    print(f"🎭 Characters: {list(CHARACTERS.keys())}")
    print(f"📝 Dialogue clips: {len(DIALOGUE)}")
    print()
    
    # Generate all voice clips
    generated_clips = []
    start_time = time.time()
    
    for dialogue_item in DIALOGUE:
        result = generate_voice_clip(dialogue_item, output_dir)
        if result:
            generated_clips.append(result)
        
        # Small delay to avoid rate limiting
        time.sleep(0.5)
    
    # Create manifest file
    manifest = {
        'episode': 'HNC_E01_The_Empire_Awakens',
        'generated_at': time.strftime('%Y-%m-%d %H:%M:%S'),
        'total_clips': len(generated_clips),
        'characters': CHARACTERS,
        'clips': generated_clips
    }
    
    manifest_path = os.path.join(output_dir, 'manifest.json')
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    # Summary
    elapsed_time = time.time() - start_time
    print()
    print("🎉 Voice Generation Complete!")
    print(f"⏱️ Total time: {elapsed_time:.1f} seconds")
    print(f"✅ Generated: {len(generated_clips)} clips")
    print(f"📄 Manifest: {manifest_path}")
    print()
    print("🎯 Next: Generate music tracks (Suno)")
    print("🎯 Then: Generate visuals (Midjourney)")
    print("🎯 Finally: Assemble video (FFmpeg)")

if __name__ == "__main__":
    main()
