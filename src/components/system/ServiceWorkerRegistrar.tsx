'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let cancelled = false;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        if (!cancelled) await registration.update().catch(() => undefined);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') console.warn('Pixel Paws service worker registration failed:', error);
      }
    };

    if (document.readyState === 'complete') void register();
    else window.addEventListener('load', () => { void register(); }, { once: true });

    return () => { cancelled = true; };
  }, []);

  return null;
}
