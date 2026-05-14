import { getToken, clearToken } from '@/lib/auth';
import type {
  Session,
  CreateSessionRequest,
  CreateSessionResponse,
  RespondToQuestionRequest,
} from '@/lib/types';

/** Thrown when the server responds with a non-OK status. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = import.meta.env.VITE_API_URL;

async function request<T>(path: string, options: Omit<RequestInit, 'headers'> = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    throw new ApiError(401, 'Unauthorized — please log in again');
  }
  if (res.status === 429) {
    throw new ApiError(429, 'Too many requests — please slow down');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

/** Creates a new planning session and returns its ID. */
export function createSession(data: CreateSessionRequest): Promise<CreateSessionResponse> {
  return request<CreateSessionResponse>('/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Lists all sessions for the current user. */
export function listSessions(): Promise<Session[]> {
  return request<Session[]>('/sessions');
}

/** Fetches a single session by ID. */
export function getSession(id: string): Promise<Session> {
  return request<Session>(`/sessions/${id}`);
}

/** Sends the user's answer to a pending agent question. */
export function respondToQuestion(
  sessionId: string,
  data: RespondToQuestionRequest,
): Promise<void> {
  return request<void>(`/sessions/${sessionId}/respond`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Cancels a running session. */
export function interruptSession(sessionId: string): Promise<void> {
  return request<void>(`/sessions/${sessionId}/interrupt`, { method: 'POST' });
}
