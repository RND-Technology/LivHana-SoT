import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_REASONING_API_BASE ?? import.meta.env.REACT_APP_REASONING_API_BASE ?? '/api/reasoning';
const STREAM_TIMEOUT_MS = Number(import.meta.env.VITE_REASONING_STREAM_TIMEOUT_MS ?? import.meta.env.REACT_APP_REASONING_STREAM_TIMEOUT_MS ?? 60000);

export const useReasoningJob = () => {
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);
  const timeoutRef = useRef(null);

  const reset = useCallback(() => {
    setJobId(null);
    setStatus('idle');
    setResult(null);
    setError(null);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const streamJob = useCallback((id) => {
    if (!id) return;

    if (typeof window === 'undefined') {
      return;
    }

    const source = new EventSource(`${API_BASE}/stream/${id}`);
    eventSourceRef.current = source;

    timeoutRef.current = setTimeout(() => {
      source.close();
      setStatus('timeout');
      setError('Reasoning job timed out');
    }, STREAM_TIMEOUT_MS);

    source.addEventListener('progress', (event) => {
      const data = JSON.parse(event.data ?? '{}');
      setStatus('progress');
      setResult((prev) => ({ ...prev, partial: data.delta ?? data, final: prev?.final }));
    });

    source.addEventListener('completed', (event) => {
      clearTimeout(timeoutRef.current);
      const data = JSON.parse(event.data ?? '{}');
      setStatus('completed');
      setResult((prev) => ({ ...prev, final: data.output ?? data, partial: prev?.partial }));
      source.close();
    });

    source.addEventListener('failed', (event) => {
      clearTimeout(timeoutRef.current);
      const data = JSON.parse(event.data ?? '{}');
      setStatus('failed');
      setError(data.error ?? 'Reasoning job failed');
      source.close();
    });

    source.onerror = () => {
      clearTimeout(timeoutRef.current);
      setStatus('error');
      setError('Stream connection lost');
      source.close();
    };
  }, []);

  const submitJob = useCallback(async ({ prompt, sessionId, metadata }) => {
    try {
      setStatus('submitting');
      setError(null);
      setResult(null);

      const response = await axios.post(`${API_BASE}/enqueue`, { prompt, sessionId, metadata });
      const { jobId: newJobId } = response.data;
      setJobId(newJobId);
      setStatus('queued');
      streamJob(newJobId);
      return newJobId;
    } catch (submissionError) {
      const message = submissionError.response?.data?.error ?? submissionError.message;
      setStatus('error');
      setError(message);
      throw submissionError;
    }
  }, [streamJob]);

  const fetchResult = useCallback(async (id) => {
    if (!id) return null;
    const response = await axios.get(`${API_BASE}/result/${id}`);
    return response.data;
  }, []);

  const fetchHealth = useCallback(async () => {
    const voiceServiceBase = import.meta.env.VITE_VOICE_API_BASE || 'http://localhost:4001/api';
    const healthUrl = voiceServiceBase.replace('/api', '/health/voice-mode');
    const response = await axios.get(healthUrl);
    return response.data;
  }, []);

  useEffect(() => () => reset(), [reset]);

  return {
    jobId,
    status,
    result,
    error,
    submitJob,
    fetchResult,
    fetchHealth,
    reset,
  };
};

// Optimized: 2025-10-02

// Last updated: 2025-10-02

// Last optimized: 2025-10-02
