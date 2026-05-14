import { useState, useEffect } from 'react';
import { getToken } from '@/lib/auth';
import type { StreamEvent, StreamStatus, ToolEvent, QuestionEvent } from '@/lib/types';

export interface UseStreamResult {
  /** Accumulated raw text tokens — join to form the full output. */
  tokens: string[];
  /** Latest known status for each tool the agent has invoked. */
  tools: ToolEvent[];
  /** Active question from the agent, or null when none is pending. */
  question: QuestionEvent | null;
  status: StreamStatus;
  /** Call after the user answers to clear the pending question. */
  clearQuestion: () => void;
}

/**
 * Opens the SSE stream for a session and returns parsed event state.
 * Cleans up the fetch connection when the component unmounts or sessionId changes.
 */
export function useStream(sessionId: string | null): UseStreamResult {
  const [tokens, setTokens] = useState<string[]>([]);
  const [tools, setTools] = useState<ToolEvent[]>([]);
  const [question, setQuestion] = useState<QuestionEvent | null>(null);
  const [status, setStatus] = useState<StreamStatus>('idle');

  useEffect(() => {
    if (!sessionId) return;

    const controller = new AbortController();
    setTokens([]);
    setTools([]);
    setQuestion(null);
    setStatus('connecting');

    async function run(): Promise<void> {
      try {
        const token = getToken();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/sessions/${sessionId}/stream`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          setStatus('error');
          return;
        }

        setStatus('streaming');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() ?? '';

          for (const part of parts) {
            const dataLine = part.split('\n').find((l) => l.startsWith('data: '));
            if (!dataLine) continue;
            try {
              const event = JSON.parse(dataLine.slice(6)) as StreamEvent;
              applyEvent(event);
            } catch {
              // skip malformed events
            }
          }
        }

        setStatus((prev) => (prev === 'streaming' ? 'done' : prev));
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setStatus('error');
        }
      }
    }

    function applyEvent(event: StreamEvent): void {
      switch (event.type) {
        case 'token':
          setTokens((prev) => [...prev, event.content]);
          break;
        case 'tool': {
          const next: ToolEvent = { name: event.name, status: event.status };
          setTools((prev) => {
            const idx = prev.findIndex((t) => t.name === event.name);
            return idx >= 0 ? prev.map((t, i) => (i === idx ? next : t)) : [...prev, next];
          });
          break;
        }
        case 'question':
          setQuestion({ id: event.id, text: event.text });
          break;
        case 'done':
          setStatus('done');
          break;
        case 'error':
          setStatus('error');
          break;
      }
    }

    void run();
    return () => controller.abort();
  }, [sessionId]);

  return {
    tokens,
    tools,
    question,
    status,
    clearQuestion: () => setQuestion(null),
  };
}
