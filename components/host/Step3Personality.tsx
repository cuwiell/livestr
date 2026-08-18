'use client';

import { useHostStore } from '@/hooks/useHostStore';
import { HostPersonality } from '@/types/host';

const personalityTraits: { key: keyof HostPersonality; label: string }[] = [
  { key: 'friendly', label: 'Friendly' },
  { key: 'funny', label: 'Funny' },
  { key: 'energetic', label: 'Energetic' },
  { key: 'calm', label: 'Calm' },
  { key: 'curious', label: 'Curious' },
  { key: 'playful', label: 'Playful' },
  { key: 'serious', label: 'Serious' },
  { key: 'sarcastic', label: 'Sarcastic' },
];

export function Step3Personality() {
  const { hostData, updateNestedData } = useHostStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-semibold text-white">Personality</h2>
        <p className="text-sm text-neutral-400">Define the core traits of your AI host.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {personalityTraits.map(({ key, label }) => (
          <div key={key}>
            <div className="mb-2 flex justify-between">
              <label className="text-sm font-medium text-neutral-300">{label}</label>
              <span className="text-xs text-neutral-500">
                {Math.round(hostData.personality[key] * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={hostData.personality[key]}
              onChange={(e) => updateNestedData('personality', { [key]: parseFloat(e.target.value) })}
              className="h-2 w-full appearance-none rounded-full bg-neutral-800 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
