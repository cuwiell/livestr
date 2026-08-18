'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { auth } from '@/lib/firebase/client';
import { signOut } from 'firebase/auth';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  History,
  BarChart,
  BrainCircuit,
  Settings,
  LogOut,
  Menu,
  X,
  Play,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'HOSTS', isHeader: true },
  { label: 'My Hosts', href: '/dashboard/hosts', icon: Users },
  { label: 'Create Host', href: '/dashboard/hosts/create', icon: PlusCircle },
  { label: 'Live', isHeader: true },
  { label: 'Studio', href: '/dashboard/live/studio', icon: Play },
  { label: 'Sessions', href: '/dashboard/live/sessions', icon: History },
  { label: 'Analytics', href: '/dashboard/live/analytics', icon: BarChart },
  { label: 'AI', isHeader: true },
  { label: 'Playground', href: '/dashboard/ai/playground', icon: BrainCircuit },
  { label: 'Personality', href: '/dashboard/ai/personality', icon: Settings },
  { label: 'SETTINGS', isHeader: true },
  { label: 'Connections', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-[#050505] text-neutral-200">
        {/* Mobile sidebar toggle */}
        <div className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-[#0a0a0a] px-4 md:hidden">
          <span className="text-lg font-bold tracking-wider text-white">AI LIVE HOST</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Sidebar */}
        <div
          className={clsx(
            'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-neutral-800 bg-[#0a0a0a] transition-transform duration-300 md:static md:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="hidden h-16 items-center px-6 md:flex">
            <span className="text-xl font-bold tracking-wider text-white">AI LIVE HOST</span>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-3">
            <nav className="space-y-1">
              {navItems.map((item, idx) =>
                item.isHeader ? (
                  <div key={idx} className="pt-4 pb-2 px-3 text-xs font-semibold tracking-wider text-neutral-500">
                    {item.label}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href || '#'}
                    className={clsx(
                      'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'bg-neutral-800/80 text-white'
                        : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'
                    )}
                  >
                    {item.icon && <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />}
                    {item.label}
                  </Link>
                )
              )}
            </nav>
          </div>

          <div className="border-t border-neutral-800 p-4">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800/50 hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-neutral-500 group-hover:text-white" />
              Log out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden pt-16 md:pt-0">
          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="mx-auto max-w-6xl">{children}</div>
          </main>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </ProtectedRoute>
  );
}
