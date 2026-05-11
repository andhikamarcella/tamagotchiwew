'use client';

import { useCallback, useEffect, useState } from 'react';

export default function OfflinePageActions() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const retry = useCallback(() => {
    window.location.reload();
  }, []);

  const goHome = useCallback(() => {
    window.location.href = '/';
  }, []);

  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-2" aria-live="polite">
      <button type="button" onClick={retry} className="pixel-border-sm bg-lime-200 px-4 py-3 text-[10px] font-bold text-slate-950 focus:outline-none focus:ring-4 focus:ring-pink-300">
        {online ? 'Retry Connection' : 'Still Offline — Retry'}
      </button>
      <button type="button" onClick={goHome} className="pixel-border-sm bg-white px-4 py-3 text-[10px] font-bold text-slate-950 focus:outline-none focus:ring-4 focus:ring-pink-300">
        Go to Home
      </button>
    </div>
  );
}
