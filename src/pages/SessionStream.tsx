import { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStream } from '@/lib/sse';
import { useSession } from '@/hooks/useSession';
import { interruptSession } from '@/lib/api';
import ToolStatusBar from '@/components/ToolStatusBar/ToolStatusBar';
import AgentQuestion from '@/components/AgentQuestion/AgentQuestion';
import styles from './SessionStream.module.css';

export default function SessionStream() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, error: sessionError, refetch } = useSession(id ?? null);
  const { tokens, tools, question, status, clearQuestion } = useStream(id ?? null);
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (status === 'done') refetch();
  }, [status, refetch]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [tokens]);

  const output = tokens.join('');
  const isActive = status === 'connecting' || status === 'streaming';
  // Don't show a stream error if the session itself completed — stream endpoint
  // may 404 for already-finished sessions depending on backend behaviour.
  const showStreamError = status === 'error' && session?.status !== 'done';

  async function handleInterrupt() {
    if (!id) return;
    try {
      await interruptSession(id);
    } catch {
      // ignore — navigate regardless
    }
    navigate('/');
  }

  return (
    <div className="page">
      <div className="container">
        <div className={styles.topBar}>
          <Link to="/sessions" className={styles.back}>
            ← All trips
          </Link>
          {isActive && (
            <button className="btn btn-ghost" onClick={handleInterrupt}>
              Stop agent
            </button>
          )}
        </div>

        {session && (
          <div className={styles.header}>
            <h1 className={styles.goal}>{session.goal}</h1>
            <span className={`badge badge-${session.status}`}>
              <span className={`dot dot-${session.status}`} />
              {session.status}
            </span>
          </div>
        )}

        {sessionError && <div className="error">{sessionError}</div>}

        <ToolStatusBar tools={tools} />

        {question && id && (
          <AgentQuestion sessionId={id} question={question} onAnswered={clearQuestion} />
        )}

        {isActive && output.length === 0 && (
          <div className={styles.waiting}>
            <span className="spinner" />
            <span>{status === 'connecting' ? 'Connecting…' : 'Agent is thinking…'}</span>
          </div>
        )}

        {output && (
          <div className={styles.outputWrap}>
            <pre ref={outputRef} className={`output ${styles.output}`}>
              {output}
            </pre>
          </div>
        )}

        {showStreamError && (
          <div className="error">Stream error — the agent may have stopped unexpectedly.</div>
        )}

        {status === 'done' && (
          <div className={styles.doneBar}>
            <span className={styles.doneLabel}>Planning complete</span>
            <Link to="/" className="btn btn-primary">
              Plan another trip
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
