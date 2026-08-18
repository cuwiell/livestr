import { LiveComment, CommentState } from '@/types/live';

export class CommentQueue {
  private queue: LiveComment[] = [];
  private maxQueueSize: number;
  private recentComments: string[] = []; // For duplicate detection

  constructor(maxQueueSize: number = 20) {
    this.maxQueueSize = maxQueueSize;
  }

  /**
   * Pipeline step 1: Add raw comment to queue after normalization and scoring
   */
  addComment(rawComment: Omit<LiveComment, 'priorityScore' | 'state'>) {
    if (!rawComment || !rawComment.content) return;
    
    // Prevent exact duplicate IDs from polling overlap
    if (this.queue.some(c => c.id === rawComment.id)) {
      return;
    }

    const normalized = String(rawComment.content).trim().toLowerCase();
    
    // Duplicate Detection (drop if exactly same as last 5)
    if (this.recentComments.includes(normalized)) {
      return; // Skip duplicate entirely
    }

    // Keep recent history for duplicate detection
    this.recentComments.push(normalized);
    if (this.recentComments.length > 5) {
      this.recentComments.shift();
    }

    // Moderation (Spam / Unsafe) - basic implementation
    if (normalized.length > 200 || normalized.includes('http')) {
      return; // Block URL and spam
    }

    // Scoring
    let score = 0;
    if (rawComment.content.includes('?')) score += 5; // Question
    if (rawComment.content.includes('@Tori') || rawComment.content.includes('@Host')) score += 4; // Mention
    if (normalized.length < 3) score -= 2; // Too short, low priority

    const newComment: LiveComment = {
      ...rawComment,
      priorityScore: score,
      state: 'pending'
    };

    this.queue.push(newComment);
    this.sortAndPruneQueue();
  }

  /**
   * Sort queue by priority and drop lowest if exceeding max size
   */
  private sortAndPruneQueue() {
    // Only sort pending comments
    const pending = this.queue.filter(c => c.state === 'pending');
    
    // Sort descending by score, then ascending by timestamp (older first if same score)
    pending.sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return a.timestamp - b.timestamp; 
    });

    // Prune if too long
    if (pending.length > this.maxQueueSize) {
      // Mark dropped comments as skipped
      const dropped = pending.splice(this.maxQueueSize);
      dropped.forEach(c => {
        const idx = this.queue.findIndex(q => q.id === c.id);
        if (idx !== -1) this.queue[idx].state = 'skipped';
      });
    }
  }

  /**
   * Get the next highest priority comment to process
   */
  getNextComment(): LiveComment | null {
    const pending = this.queue.filter(c => c.state === 'pending');
    if (pending.length === 0) return null;

    // Find highest score (since we already sorted on insert, it's usually the first one)
    let highest = pending[0];
    for (const comment of pending) {
      if (comment.priorityScore > highest.priorityScore) {
        highest = comment;
      }
    }

    // Mark as processing
    const idx = this.queue.findIndex(c => c.id === highest.id);
    if (idx !== -1) this.queue[idx].state = 'processing';

    return highest;
  }

  /**
   * Mark a comment as answered or skipped
   */
  markState(id: string, state: CommentState) {
    const idx = this.queue.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.queue[idx].state = state;
    }
  }

  /**
   * Get all comments for UI rendering
   */
  getQueue(): LiveComment[] {
    return [...this.queue];
  }
}
