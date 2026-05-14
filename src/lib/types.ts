/** A planning session returned by the API. */
export interface Session {
  id: string;
  goal: string;
  status: 'running' | 'done' | 'error';
  created_at: string;
}

/** Every event shape emitted by the SSE stream. */
export type StreamEvent =
  | { type: 'token'; content: string }
  | { type: 'tool'; name: string; status: ToolStatus }
  | { type: 'question'; id: string; text: string }
  | { type: 'done'; session_id: string }
  | { type: 'error'; message: string };

export type ToolStatus = 'running' | 'done' | 'error';

export type StreamStatus = 'idle' | 'connecting' | 'streaming' | 'done' | 'error';

/** Snapshot of a single tool call as tracked by useStream. */
export interface ToolEvent {
  name: string;
  status: ToolStatus;
}

/** A pending question from the agent. */
export interface QuestionEvent {
  id: string;
  text: string;
}

export interface CreateSessionRequest {
  goal: string;
}

export interface CreateSessionResponse {
  id: string;
}

export interface RespondToQuestionRequest {
  question_id: string;
  answer: string;
}
