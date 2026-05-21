'use client';

import { useEffect, useState } from 'react';
import type { ConnectionStatus } from '@/src/hooks/useNetworkStatus';

export default function ConnectionStatusBanner({ status, wasOffline }: { status: ConnectionStatus; wasOffline: boolean }) {
  const [dismissedKey, setDismissedKey] = useState('');
  const [visible, setVisible] = useState(false);
  const bannerKey = `${status}-${wasOffline ? 'was-offline' : 'fresh'}`;

  useEffect(() => {
    if (status === 'online' && !wasOffline) {
      setVisible(false);
      return undefined;
    }
    setDismissedKey('');
    setVisible(true);
    if (status === 'online') {
      const id = window.setTimeout(() => setVisible(false), 4200);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [status, wasOffline]);

  if (!visible || dismissedKey === bannerKey) return null;

  const content = status === 'offline'
    ? { icon: '📴', label: 'Offline mode', text: 'You are offline. Progress is saved locally.', tone: 'bg-yellow-100 text-yellow-950' }
    : status === 'reconnecting'
      ? { icon: '🔄', label: 'Reconnecting', text: 'Trying to reconnect...', tone: 'bg-blue-100 text-blue-950' }
      : { icon: '✅', label: 'Back online', text: 'Back online. Syncing can continue.', tone: 'bg-green-100 text-green-950' };

  return (
    <div className={`mx-auto mb-3 flex w-full max-w-7xl items-center justify-between gap-3 border-4 border-slate-950 px-3 py-2 text-[10px] font-bold shadow-pixelSm ${content.tone}`} role="status" aria-live="polite">
      <span className="min-w-0"><span className="mr-2" aria-hidden="true">{content.icon}</span><span className="uppercase tracking-wider">{content.label}</span><span className="mx-2">—</span>{content.text}</span>
      <button type="button" onClick={() => { setDismissedKey(bannerKey); setVisible(false); }} className="shrink-0 border-2 border-slate-950 bg-white px-2 py-1 text-[9px] text-slate-950 focus:outline-none focus:ring-2 focus:ring-pink-300">Dismiss</button>
    </div>
  );
}
