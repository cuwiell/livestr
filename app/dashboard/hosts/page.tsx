'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Host } from '@/types/host';
import { PlusCircle, Settings2, Trash2, Edit2 } from 'lucide-react';

export default function HostsOverview() {
  const { user } = useAuth();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHosts = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, 'hosts'), where('ownerId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Host));
        setHosts(data);
      } catch (error) {
        console.error('Error fetching hosts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHosts();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this host?')) {
      await deleteDoc(doc(db, 'hosts', id));
      setHosts(hosts.filter(h => h.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">My Hosts</h1>
          <p className="mt-2 text-neutral-400">Manage your virtual AI personalities.</p>
        </div>
        <Link
          href="/dashboard/hosts/create"
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-black transition-colors hover:bg-neutral-200"
        >
          <PlusCircle className="h-4 w-4" /> Create Host
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-600 border-t-white"></div>
        </div>
      ) : hosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 py-32">
          <Settings2 className="mb-4 h-12 w-12 text-neutral-600" />
          <h3 className="text-lg font-medium text-white">No hosts found</h3>
          <p className="mt-1 text-sm text-neutral-400">Get started by creating your first AI host.</p>
          <Link
            href="/dashboard/hosts/create"
            className="mt-6 rounded-lg bg-white px-6 py-2 font-medium text-black hover:bg-neutral-200"
          >
            Create your first Host
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hosts.map(host => (
            <div key={host.id} className="group relative flex flex-col rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition-all hover:border-neutral-600 hover:bg-neutral-800/80">
              <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100 flex gap-2">
                <Link href={`/dashboard/hosts/${host.id}/edit`} className="rounded-md p-2 text-neutral-400 hover:bg-blue-500/20 hover:text-blue-400">
                  <Edit2 className="h-4 w-4" />
                </Link>
                <button onClick={() => handleDelete(host.id!)} className="rounded-md p-2 text-neutral-400 hover:bg-red-500/20 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800 text-2xl border border-neutral-700">
                  {host.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{host.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span>{host.status}</span>
                    <span>•</span>
                    <span>{host.gender}</span>
                  </div>
                </div>
              </div>
              
              <p className="mb-6 line-clamp-2 text-sm text-neutral-400">{host.description}</p>
              
              <div className="mt-auto grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-neutral-900 p-2 border border-neutral-800 text-center">
                  <div className="text-neutral-500">Personality</div>
                  <div className="font-medium text-neutral-200 mt-1 capitalize">
                    {Object.entries(host.personality).sort((a,b) => b[1] - a[1])[0][0]}
                  </div>
                </div>
                <div className="rounded bg-neutral-900 p-2 border border-neutral-800 text-center">
                  <div className="text-neutral-500">Voice</div>
                  <div className="font-medium text-neutral-200 mt-1 truncate">
                    {host.voice.voiceId}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
