'use client';

import { useHostStore } from '@/hooks/useHostStore';
import clsx from 'clsx';
import { UserCircle } from 'lucide-react';

const mockAvatars = [
  { id: 'avatar-anime-1', name: 'Anime Girl 1', type: '2D' },
  { id: 'avatar-anime-2', name: 'Anime Boy 1', type: '2D' },
  { id: 'avatar-3d-1', name: '3D Character 1', type: '3D' },
  { id: 'avatar-realistic-1', name: 'Realistic Woman', type: 'Realistic' },
];

export function Step2Appearance() {
  const { hostData, updateData } = useHostStore();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-semibold text-white">Appearance</h2>
        <p className="text-sm text-neutral-400">Select a visual representation for your host.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {mockAvatars.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => updateData({ avatarUrl: avatar.id, avatarType: avatar.type })}
            className={clsx(
              'flex flex-col items-center justify-center rounded-xl border p-6 transition-all',
              hostData.avatarUrl === avatar.id
                ? 'border-white bg-white/10'
                : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-800'
            )}
          >
            <UserCircle className={clsx("mb-3 h-12 w-12", hostData.avatarUrl === avatar.id ? "text-white" : "text-neutral-500")} />
            <span className="font-medium text-white">{avatar.name}</span>
            <span className="text-xs text-neutral-500">{avatar.type}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
