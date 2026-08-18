'use client';

import { useState } from 'react';
import { useHostStore } from '@/hooks/useHostStore';
import { Plus, X } from 'lucide-react';

export function Step6Behavior() {
  const { hostData, updateNestedData } = useHostStore();
  const [topicInput, setTopicInput] = useState('');
  const [forbiddenInput, setForbiddenInput] = useState('');

  const addTopic = (type: 'allowedTopics' | 'forbiddenTopics', value: string, setter: (val: string) => void) => {
    if (!value.trim()) return;
    const currentList = hostData.behavior[type];
    if (!currentList.includes(value.trim())) {
      updateNestedData('behavior', { [type]: [...currentList, value.trim()] });
    }
    setter('');
  };

  const removeTopic = (type: 'allowedTopics' | 'forbiddenTopics', value: string) => {
    updateNestedData('behavior', { 
      [type]: hostData.behavior[type].filter((t) => t !== value) 
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-semibold text-white">Behavior Restrictions</h2>
        <p className="text-sm text-neutral-400">Set boundaries for your AI host.</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-2 flex justify-between">
            <label className="text-sm font-medium text-neutral-300">Response Cooldown (sec)</label>
            <span className="text-xs text-neutral-500">{hostData.behavior.responseCooldownMs / 1000}s</span>
          </div>
          <input
            type="range"
            min="1000"
            max="10000"
            step="500"
            value={hostData.behavior.responseCooldownMs}
            onChange={(e) => updateNestedData('behavior', { responseCooldownMs: parseInt(e.target.value) })}
            className="h-2 w-full appearance-none rounded-full bg-neutral-800 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Allowed Topics (Optional)</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 focus:border-neutral-700 focus:outline-none"
              placeholder="e.g. Gaming, Anime"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTopic('allowedTopics', topicInput, setTopicInput)}
            />
            <button
              onClick={() => addTopic('allowedTopics', topicInput, setTopicInput)}
              className="flex items-center justify-center rounded-lg bg-neutral-800 px-4 text-white hover:bg-neutral-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {hostData.behavior.allowedTopics.map((topic) => (
              <span key={topic} className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400 border border-green-500/20">
                {topic}
                <button onClick={() => removeTopic('allowedTopics', topic)}><X className="h-3 w-3 hover:text-white" /></button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Forbidden Topics</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 focus:border-neutral-700 focus:outline-none"
              placeholder="e.g. Politics, Religion"
              value={forbiddenInput}
              onChange={(e) => setForbiddenInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTopic('forbiddenTopics', forbiddenInput, setForbiddenInput)}
            />
            <button
              onClick={() => addTopic('forbiddenTopics', forbiddenInput, setForbiddenInput)}
              className="flex items-center justify-center rounded-lg bg-neutral-800 px-4 text-white hover:bg-neutral-700"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {hostData.behavior.forbiddenTopics.map((topic) => (
              <span key={topic} className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-sm text-red-400 border border-red-500/20">
                {topic}
                <button onClick={() => removeTopic('forbiddenTopics', topic)}><X className="h-3 w-3 hover:text-white" /></button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
