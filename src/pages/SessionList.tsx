import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listSessions, ApiError } from '@/lib/api';
import type { Session } from '@/lib/types';
import styles from './SessionList.module.css';

export default function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load sessions'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Your trips</h1>
            {!loading && (
              <p className={styles.subtitle}>
                {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
              </p>
            )}
          </div>
          <Link to="/" className="btn btn-primary">
            New trip
          </Link>
        </div>

        {loading && (
          <div className={styles.loading}>
            <span className="spinner" />
            <span>Loading sessions…</span>
          </div>
        )}

        {error && <div className="error">{error}</div>}

        {!loading && !error && sessions.length === 0 && (
          <div className={styles.empty}>
            No trips yet. <Link to="/">Plan your first trip.</Link>
          </div>
        )}

        <div className={styles.list}>
          {sessions.map((session) => (
            <Link key={session.id} to={`/sessions/${session.id}`} className={styles.item}>
              <span className={styles.goal}>{session.goal}</span>
              <div className={styles.meta}>
                <span className={`badge badge-${session.status}`}>
                  <span className={`dot dot-${session.status}`} />
                  {session.status}
                </span>
                <span className={styles.date}>
                  {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
