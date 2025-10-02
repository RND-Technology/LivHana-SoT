import { useCallback, useRef } from 'react';

const createTonePlayer = () => {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') {
    return null;
  }
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  return new AudioContext();
};

const playTone = async (audioContext, { frequency, duration }) => {
  if (!audioContext) return;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const destination = audioContext.destination;
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.08;
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
};

export const useSoundCue = () => {
  const contextRef = useRef(null);

  const getContext = () => {
    if (!contextRef.current) {
      contextRef.current = createTonePlayer();
    }
    return contextRef.current;
  };

  const playSoftCue = useCallback(async () => {
    const ctx = getContext();
    await playTone(ctx, { frequency: 880, duration: 0.15 });
  }, []);

  const playAttentionCue = useCallback(async () => {
    const ctx = getContext();
    await playTone(ctx, { frequency: 440, duration: 0.4 });
  }, []);

  return { playSoftCue, playAttentionCue };
};
// Last optimized: 2025-10-02

// Optimized: 2025-10-02

// Last updated: 2025-10-02
