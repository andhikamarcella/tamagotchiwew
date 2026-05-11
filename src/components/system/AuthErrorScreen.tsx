'use client';

import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import PixelStatusCard from './PixelStatusCard';

export default function AuthErrorScreen({
  message = "We couldn't verify your session.",
  detail = 'Possible network or Firebase issue.',
  onRetry,
  onSignIn,
  onContinueGuest,
  canContinueGuest = true,
}: {
  message?: string;
  detail?: string;
  onRetry?: () => void;
  onSignIn?: () => void;
  onContinueGuest?: () => void;
  canContinueGuest?: boolean;
}) {
  const network = useNetworkStatus();
  const safeDetail = network.connectionStatus === 'offline' ? "You're offline. Trying to reconnect..." : detail;

  return (
    <main className="pixel-boot-bg grid min-h-screen place-items-center overflow-hidden px-4 py-8 font-pixel text-slate-950 sm:px-6">
      <PixelStatusCard title="Login check failed" subtitle={message} tone="error">
        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl border-4 border-slate-950 bg-red-100 p-4 text-center text-red-950 shadow-[4px_4px_0_#0f172a]" role="alert" aria-live="assertive">
            <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl border-4 border-slate-950 bg-white text-4xl shadow-[3px_3px_0_#0f172a]" aria-hidden="true">⚠️</div>
            <p className="text-sm font-bold">We couldn't verify your session.</p>
            <p className="mt-2 text-[10px] leading-relaxed text-red-900">{safeDetail}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={onRetry} className="pixel-border-sm bg-lime-200 px-4 py-3 text-[10px] text-slate-950 focus:outline-none focus:ring-4 focus:ring-pink-300">Retry</button>
            <button type="button" onClick={onSignIn} className="pixel-border-sm bg-white px-4 py-3 text-[10px] text-slate-950 focus:outline-none focus:ring-4 focus:ring-pink-300">Sign In</button>
            <button type="button" onClick={onContinueGuest} disabled={!canContinueGuest} className="pixel-border-sm bg-yellow-100 px-4 py-3 text-[10px] text-slate-950 focus:outline-none focus:ring-4 focus:ring-pink-300 disabled:cursor-not-allowed disabled:opacity-55">Continue as Guest</button>
          </div>
          <p className="text-center text-[10px] font-semibold text-slate-700">Safe details: network unavailable, Firebase unavailable, or session expired.</p>
        </div>
      </PixelStatusCard>
    </main>
  );
}
