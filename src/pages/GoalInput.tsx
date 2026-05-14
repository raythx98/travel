import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createSession, ApiError } from '@/lib/api';
import styles from './GoalInput.module.css';

export default function GoalInput() {
  const navigate = useNavigate();
  const [goal, setGoal] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const { id } = await createSession({ goal: goal.trim() });
      navigate(`/sessions/${id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create session');
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Plan your trip</h1>
          <p className={styles.subtitle}>
            Describe where you want to go and what you want to do — the agent handles the rest.
          </p>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            className={`input textarea ${styles.textarea}`}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. A 10-day trip to Japan in April, mix of Tokyo city life and Kyoto temples, budget around $3,000"
            autoFocus
            disabled={submitting}
          />
          <div className={styles.actions}>
            <button className="btn btn-primary" type="submit" disabled={submitting || !goal.trim()}>
              {submitting ? (
                <>
                  <span className="spinner" /> Planning…
                </>
              ) : (
                'Start planning'
              )}
            </button>
            <Link to="/sessions" className={styles.historyLink}>
              View past trips
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
