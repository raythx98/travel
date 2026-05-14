const TOKEN_KEY = 'travel_auth_token';

/** Returns the stored auth token, or null if not set. */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Persists an auth token. */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/** Removes the stored auth token. */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
