import { useState } from 'react';
import { respondToQuestion, ApiError } from '@/lib/api';
import type { QuestionEvent } from '@/lib/types';
import styles from './AgentQuestion.module.css';

interface Props {
  sessionId: string;
  question: QuestionEvent;
  onAnswered: () => void;
}

export default function AgentQuestion({ sessionId, question, onAnswered }: Props) {
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await respondToQuestion(sessionId, { question_id: question.id, answer: answer.trim() });
      onAnswered();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send answer');
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.container}>
      <p className={styles.question}>{question.text}</p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={`input ${styles.input}`}
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer…"
          autoFocus
          disabled={submitting}
        />
        <button className="btn btn-primary" type="submit" disabled={submitting || !answer.trim()}>
          {submitting ? <span className="spinner" /> : 'Answer'}
        </button>
      </form>
    </div>
  );
}
