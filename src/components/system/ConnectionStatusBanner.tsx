'use client';

import type { ConnectionStatus } from '@/src/hooks/useNetworkStatus';

export default function ConnectionStatusBanner({ status, wasOffline }: { status: ConnectionStatus; wasOffline: boolean }) {
  if (status === 'online' && !wasOffline) return null;
  const content = status === 'offline'
    ? { icon: '📴', text: 'Offline mode — progress is saved locally.', tone: 'bg-yellow-100' }
    : status === 'reconnecting'
      ? { icon: '🔄', text: 'Reconnecting…', tone: 'bg-blue-100' }
      : { icon: '✅', text: 'Back online — syncing.', tone: 'bg-green-100' };
  return <div className={`mx-auto mb-3 w-full max-w-7xl border-4 border-slate-950 px-3 py-2 text-[10px] shadow-pixelSm ${content.tone}`} role="status"><span className="mr-2">{content.icon}</span>{content.text}</div>;
}
