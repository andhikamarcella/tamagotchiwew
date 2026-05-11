'use client';

import { PixelButton } from '@/src/components/PixelButton';
import PixelCard from '@/src/components/PixelCard';

export default function MaintenanceGate({ message, onRefresh, loading }: { message: string; onRefresh: () => void; loading?: boolean }) {
  const devBypass = process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('adminBypass') === '1';
  if (devBypass) return null;
  return <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-4 font-pixel text-xs"><PixelCard className="max-w-xl bg-yellow-100 text-center"><div className="text-5xl">🛠️</div><h1 className="mt-3 text-base">Pixel Paws Maintenance</h1><p className="my-4 text-[10px] leading-relaxed">{message}</p><PixelButton onClick={onRefresh} disabled={loading}>{loading ? 'Checking...' : 'Refresh / Check again'}</PixelButton><p className="mt-3 text-[9px]">If Remote Config fails, the app falls back to local defaults and will not lock players out.</p></PixelCard></main>;
}
