'use client';

import { useCallback, useEffect, useState } from 'react';

export default function OfflinePageActions() {
  const [online, setOnline] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [message, setMessage] = useState('Checking connection...');

  useEffect(() => {
    const update = () => {
      const isOnline = navigator.onLine;
      setOnline(isOnline);
      setMessage(isOnline ? 'Connection looks available. Retry can return to Pixel Paws.' : 'Still offline. Your save stays in this browser until Wi-Fi returns.');
    };
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const retry = useCallback(() => {
    if (navigator.onLine) window.location.href = '/';
    else setMessage('Still offline — retry after reconnecting. Local progress remains safe.');
  }, []);

  return (
    <div className="mt-5" aria-live="polite">
      <p className="mb-3 text-[10px] leading-relaxed">{message}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={retry} className="pixel-border-sm bg-lime-200 px-4 py-3 text-[10px] font-bold text-slate-950 focus:outline-none focus:ring-4 focus:ring-pink-300">
          {online ? 'Retry Connection' : 'Still Offline — Retry'}
        </button>
        <button type="button" onClick={() => setHelpOpen((open) => !open)} aria-expanded={helpOpen} className="pixel-border-sm bg-white px-4 py-3 text-[10px] font-bold text-slate-950 focus:outline-none focus:ring-4 focus:ring-pink-300">
          Offline Help
        </button>
      </div>
      {helpOpen && (
        <div id="offline-help" className="pixel-border-sm mt-4 bg-indigo-50 p-3 text-left text-[10px] leading-relaxed">
          <h2 className="mb-2 text-xs">Offline Help</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>Care actions and local save continue in this browser after the app has loaded once.</li>
            <li>Cloud sync, Couple Mode, FCM token creation, and latest news need internet.</li>
            <li>Do not clear browser site data while offline if you have unsynced progress.</li>
            <li>When Wi-Fi returns, tap Retry Connection and use Settings → Offline & Sync → Sync now if needed.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
