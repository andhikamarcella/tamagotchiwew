'use client';

import type { OfflineSyncStatus } from '@/src/hooks/useOfflineSync';

export default function SaveSyncStatus({ status, pendingCount }: { status: OfflineSyncStatus; pendingCount: number }) {
  const label = status === 'syncing' ? 'Syncing…' : status === 'failed' ? 'Sync failed' : status === 'saved_offline' ? 'Saved offline' : status === 'synced' ? 'Synced' : status === 'saved' ? 'Saved' : 'Online';
  const tone = status === 'failed' ? 'bg-red-100' : status === 'syncing' ? 'bg-blue-100' : status === 'saved_offline' ? 'bg-yellow-100' : 'bg-white';
  return <div className={`inline-flex items-center gap-2 border-2 border-slate-950 px-2 py-1 text-[9px] ${tone}`}><span>{label}</span>{pendingCount > 0 && <span>· {pendingCount} pending</span>}</div>;
}
