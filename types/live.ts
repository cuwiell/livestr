export type CommentState = 'pending' | 'processing' | 'answered' | 'skipped' | 'blocked';
export type LiveState = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'LIVE' | 'PAUSED' | 'ENDING' | 'ENDED' | 'ERROR';

export interface LiveComment {
  id: string;
  username: string;
  content: string;
  timestamp: number;
  priorityScore: number;
  state: CommentState;
}

export interface LiveProvider {
  connect(): Promise<void>;
  disconnect(): void;
  onComment(callback: (comment: Omit<LiveComment, 'priorityScore' | 'state'>) => void): void;
  onEvent(callback: (event: unknown) => void): void;
  getStatus(): LiveState;
}
