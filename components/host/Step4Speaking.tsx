'use client';

import { useHostStore } from '@/hooks/useHostStore';

export function Step4Speaking() {
  const { hostData, updateNestedData } = useHostStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-semibold text-white">Speaking Style</h2>
        <p className="text-sm text-neutral-400">How should your host talk to the audience?</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-300">Response Length</label>
          <div className="flex gap-4">
            {['short', 'medium', 'long'].map((length) => (
              <label key={length} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="responseLength"
                  value={length}
                  checked={hostData.speakingStyle.responseLength === length}
                  onChange={(e) => updateNestedData('speakingStyle', { responseLength: e.target.value })}
                  className="text-white focus:ring-white focus:ring-offset-neutral-900 bg-neutral-900 border-neutral-700"
                />
                <span className="text-sm capitalize text-neutral-300">{length}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-300">Formality</label>
          <div className="flex gap-4">
            {['formal', 'casual', 'very_casual'].map((formality) => (
              <label key={formality} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="formality"
                  value={formality}
                  checked={hostData.speakingStyle.formality === formality}
                  onChange={(e) => updateNestedData('speakingStyle', { formality: e.target.value })}
                  className="text-white focus:ring-white focus:ring-offset-neutral-900 bg-neutral-900 border-neutral-700"
                />
                <span className="text-sm capitalize text-neutral-300">{formality.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="mb-2 flex justify-between">
              <label className="text-sm font-medium text-neutral-300">Energy Level</label>
              <span className="text-xs text-neutral-500">
                {Math.round(hostData.speakingStyle.energyLevel * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={hostData.speakingStyle.energyLevel}
              onChange={(e) => updateNestedData('speakingStyle', { energyLevel: parseFloat(e.target.value) })}
              className="h-2 w-full appearance-none rounded-full bg-neutral-800 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
          <div>
            <div className="mb-2 flex justify-between">
              <label className="text-sm font-medium text-neutral-300">Humor Level</label>
              <span className="text-xs text-neutral-500">
                {Math.round(hostData.speakingStyle.humorLevel * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={hostData.speakingStyle.humorLevel}
              onChange={(e) => updateNestedData('speakingStyle', { humorLevel: parseFloat(e.target.value) })}
              className="h-2 w-full appearance-none rounded-full bg-neutral-800 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
