import { useState, useEffect, useCallback } from 'react';
import { getSession, ApiError } from '@/lib/api';
import type { Session } from '@/lib/types';

export interface UseSessionResult {
  session: Session | null;
  loading: boolean;
  error: string | null;
  /** Re-fetch the session — stable reference, safe to use in effect deps. */
  refetch: () => void;
}

/** Fetches a session by ID and exposes a stable refetch callback. */
export function useSession(id: string | null): UseSessionResult {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getSession(id)
      .then((s) => {
        if (!cancelled) setSession(s);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load session');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return { session, loading, error, refetch };
}
