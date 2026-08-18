import { CommentQueue } from '../../lib/live/commentQueue';

describe('CommentQueue Priority and Filtering logic', () => {
  it('should correctly prioritize comments based on questions and length', () => {
    const queue = new CommentQueue(10);
    
    queue.addComment({
      id: '1', username: 'A', content: 'hi', timestamp: 1
    }); // score: -2 (too short)
    
    queue.addComment({
      id: '2', username: 'B', content: 'Siapa nama kamu?', timestamp: 2
    }); // score: +5 (question)

    queue.addComment({
      id: '3', username: 'C', content: 'Halo kak @Tori', timestamp: 3
    }); // score: +4 (mention)

    const highest = queue.getNextComment();
    expect(highest?.id).toBe('2'); // question should win

    const second = queue.getNextComment();
    expect(second?.id).toBe('3'); // mention should be second
    
    const third = queue.getNextComment();
    expect(third?.id).toBe('1'); // short text should be last
  });

  it('should drop exact duplicate comments', () => {
    const queue = new CommentQueue(10);
    queue.addComment({ id: '1', username: 'A', content: 'test', timestamp: 1 });
    queue.addComment({ id: '2', username: 'B', content: 'test', timestamp: 2 }); // exact same content

    const all = queue.getQueue();
    expect(all.length).toBe(1); // duplicate is dropped
  });

  it('should drop low priority comments when queue limit is reached', () => {
    const queue = new CommentQueue(2); // limit to 2
    
    queue.addComment({ id: '1', username: 'A', content: 'haloo', timestamp: 1 }); // score 0
    queue.addComment({ id: '2', username: 'B', content: 'apa kabar?', timestamp: 2 }); // score 5
    queue.addComment({ id: '3', username: 'C', content: 'dimana?', timestamp: 3 }); // score 5

    // queue has 3 items, limit is 2. The lowest score (id 1) should be marked as skipped.
    const all = queue.getQueue();
    const skipped = all.find(c => c.id === '1');
    
    expect(skipped?.state).toBe('skipped');
    
    // The others should be pending
    const pending = all.filter(c => c.state === 'pending');
    expect(pending.length).toBe(2);
  });
});
