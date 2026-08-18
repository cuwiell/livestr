'use client';

import { useHostStore } from '@/hooks/useHostStore';
import clsx from 'clsx';
import { Mic2 } from 'lucide-react';

const mockVoices = [
  { id: 'voice-female-1', name: 'Female Voice 1', provider: 'mock' },
  { id: 'voice-female-2', name: 'Female Voice 2', provider: 'mock' },
  { id: 'voice-male-1', name: 'Male Voice 1', provider: 'mock' },
  { id: 'voice-robot-1', name: 'Robot Voice', provider: 'mock' },
];

export function Step5Voice() {
  const { hostData, updateNestedData } = useHostStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-semibold text-white">Voice Selection</h2>
        <p className="text-sm text-neutral-400">Choose the AI voice model for your host.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {mockVoices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => updateNestedData('voice', { voiceId: voice.id, provider: voice.provider })}
            className={clsx(
              'flex flex-col items-center justify-center rounded-xl border p-4 transition-all',
              hostData.voice.voiceId === voice.id
                ? 'border-white bg-white/10'
                : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-800'
            )}
          >
            <Mic2 className={clsx("mb-2 h-8 w-8", hostData.voice.voiceId === voice.id ? "text-white" : "text-neutral-500")} />
            <span className="font-medium text-white">{voice.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <div className="mb-2 flex justify-between">
            <label className="text-sm font-medium text-neutral-300">Pitch</label>
            <span className="text-xs text-neutral-500">{hostData.voice.pitch.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={hostData.voice.pitch}
            onChange={(e) => updateNestedData('voice', { pitch: parseFloat(e.target.value) })}
            className="h-2 w-full appearance-none rounded-full bg-neutral-800 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
        </div>
        <div>
          <div className="mb-2 flex justify-between">
            <label className="text-sm font-medium text-neutral-300">Speed</label>
            <span className="text-xs text-neutral-500">{hostData.voice.speed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={hostData.voice.speed}
            onChange={(e) => updateNestedData('voice', { speed: parseFloat(e.target.value) })}
            className="h-2 w-full appearance-none rounded-full bg-neutral-800 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
        </div>
      </div>
    </div>
  );
}
