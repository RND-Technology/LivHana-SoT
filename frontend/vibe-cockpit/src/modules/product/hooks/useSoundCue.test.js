import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSoundCue } from './useSoundCue.jsx';

const mockAudioContext = () => {
  const destination = {};
  const oscillator = {
    start: vi.fn(),
    stop: vi.fn(),
    connect: vi.fn(() => gain),
    frequency: { value: 0 },
    type: '',
  };
  const gain = {
    gain: { value: 0 },
    connect: vi.fn(() => destination),
  };

  return {
    createOscillator: vi.fn(() => oscillator),
    createGain: vi.fn(() => gain),
    destination,
    currentTime: 0,
  };
};

describe('useSoundCue', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns no-op when AudioContext is unavailable', async () => {
    const originalContext = globalThis.AudioContext;
    delete globalThis.AudioContext;

    const { result } = renderHook(() => useSoundCue());
    await expect(result.current.playSoftCue()).resolves.toBeUndefined();
    await expect(result.current.playAttentionCue()).resolves.toBeUndefined();

    globalThis.AudioContext = originalContext;
  });

  it('plays tones when AudioContext is available', async () => {
    const mockCtx = mockAudioContext();
    globalThis.AudioContext = vi.fn(() => mockCtx);

    const { result } = renderHook(() => useSoundCue());
    await result.current.playSoftCue();
    expect(mockCtx.createOscillator).toHaveBeenCalled();

    await result.current.playAttentionCue();
    expect(mockCtx.createOscillator).toHaveBeenCalledTimes(2);
  });
});
// Last optimized: 2025-10-02

// Optimized: 2025-10-02
