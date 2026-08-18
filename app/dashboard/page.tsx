'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { Activity, Clock, MessageSquare, Users, Zap } from 'lucide-react';

const stats = [
  { name: 'Active Hosts', value: '3', icon: Users },
  { name: 'Live Sessions', value: '1', icon: RadioIcon },
  { name: 'Viewers', value: '2,431', icon: Activity },
  { name: 'AI Responses', value: '1,245', icon: Zap },
  { name: 'Comments', value: '18,294', icon: MessageSquare },
  { name: 'Latency (avg)', value: '1.8s', icon: Clock },
];

const sessions = [
  { id: 1, name: 'Tori Live #12', duration: '01:42:21', viewers: '2,431', status: 'Live' },
  { id: 2, name: 'Raka Live #03', duration: '00:58:42', viewers: '842', status: 'Ended' },
];

function RadioIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="2" />
      <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M7.76 16.24a6 6 0 0 1 0-8.48" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.48" />
    </svg>
  );
}

export default function DashboardOverview() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="mt-2 text-neutral-400">Welcome back, {user?.displayName || 'Creator'}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 backdrop-blur-sm transition-colors hover:bg-neutral-800/40"
          >
            <div className="flex items-center gap-3 text-neutral-400">
              <stat.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{stat.name}</span>
            </div>
            <span className="mt-4 text-3xl font-semibold text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Recent Sessions */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm">
        <div className="border-b border-neutral-800 p-6">
          <h2 className="text-lg font-medium text-white">Recent Sessions</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-neutral-800/50 bg-neutral-900/50 p-4 transition-colors hover:bg-neutral-800"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-2 w-2 rounded-full ${session.status === 'Live' ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`} />
                  <div>
                    <h3 className="font-medium text-white">{session.name}</h3>
                    <p className="text-sm text-neutral-400">Duration: {session.duration}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium text-white">{session.viewers}</div>
                  <div className="text-sm text-neutral-400">viewers</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
