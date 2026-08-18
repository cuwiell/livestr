import { buildSystemPrompt } from '../../lib/ai/promptBuilder';
import { Host } from '../../types/host';
import { defaultHostData } from '../../hooks/useHostStore';

describe('System Prompt Builder', () => {
  it('should include basic identity information', () => {
    const host: Host = {
      ...defaultHostData,
      name: 'TestBot',
      description: 'A test AI host.',
      gender: 'Robot',
      age: '99',
    };
    
    const prompt = buildSystemPrompt(host);
    expect(prompt).toContain('TestBot');
    expect(prompt).toContain('A test AI host');
    expect(prompt).toContain('Gender: Robot');
    expect(prompt).toContain('Age: 99');
  });

  it('should adjust prompt based on high humor level', () => {
    const host: Host = {
      ...defaultHostData,
      personality: {
        ...defaultHostData.personality,
        funny: 0.9,
      }
    };
    
    const prompt = buildSystemPrompt(host);
    expect(prompt).toContain('highly humorous');
  });

  it('should include forbidden topics if provided', () => {
    const host: Host = {
      ...defaultHostData,
      behavior: {
        ...defaultHostData.behavior,
        forbiddenTopics: ['Politics', 'Religion'],
      }
    };
    
    const prompt = buildSystemPrompt(host);
    expect(prompt).toContain('NEVER talk about these topics: Politics, Religion');
  });
});
