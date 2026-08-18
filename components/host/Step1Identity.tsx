'use client';

import { useHostStore } from '@/hooks/useHostStore';

export function Step1Identity() {
  const { hostData, updateData } = useHostStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-semibold text-white">Identity</h2>
        <p className="text-sm text-neutral-400">Basic information about your AI host.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Host Name</label>
          <input
            type="text"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
            placeholder="e.g. Tori"
            value={hostData.name}
            onChange={(e) => updateData({ name: e.target.value })}
          />
        </div>
        
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Description</label>
          <textarea
            className="h-24 w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
            placeholder="Brief background story or context..."
            value={hostData.description}
            onChange={(e) => updateData({ description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-300">Gender</label>
            <select
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-white focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
              value={hostData.gender}
              onChange={(e) => updateData({ gender: e.target.value })}
            >
              <option value="">Select gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Robot/AI">Robot / AI</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-300">Age</label>
            <input
              type="text"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-white placeholder-neutral-500 focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
              placeholder="e.g. 21"
              value={hostData.age}
              onChange={(e) => updateData({ age: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-300">Language</label>
          <select
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-white focus:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-700"
            value={hostData.language}
            onChange={(e) => updateData({ language: e.target.value })}
          >
            <option value="id-ID">Bahasa Indonesia</option>
            <option value="en-US">English (US)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
