'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AuthBootState } from '@/src/hooks/useAuth';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import PixelSpinner from './PixelSpinner';
import PixelStatusCard from './PixelStatusCard';

const bootLabels: Record<AuthBootState, string> = {
  idle: 'Preparing Pixel Paws...',
  initializing: 'Connecting to Firebase...',
  'checking-auth': 'Checking login...',
  'loading-profile': 'Loading your save...',
  ready: 'Preparing Pixel Paws...',
  'signed-out': 'Opening sign in...',
  error: 'Checking login...',
};

const progressLabels = ['Connecting to Firebase...', 'Checking session...', 'Loading profile...', 'Preparing Pixel Paws...'];
const tips = ['Tip: Feed your pet every day!', 'Tip: Restore energy by sleeping.', 'Tip: Couple mode unlocks shared care.', 'Tip: Play mini-games to earn rewards.'];

export default function AuthCheckingScreen({
  state = 'checking-auth',
  timedOut = false,
  onRetry,
  onSignIn,
}: {
  state?: AuthBootState;
  timedOut?: boolean;
  onRetry?: () => void;
  onSignIn?: () => void;
}) {
  const [tick, setTick] = useState(0);
  const network = useNetworkStatus();

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 1800);
    return () => window.clearInterval(id);
  }, []);

  const statusLabel = network.connectionStatus === 'offline' ? "You're offline. Trying to reconnect..." : timedOut ? 'Still working...' : bootLabels[state];
  const progressLabel = useMemo(() => progressLabels[tick % progressLabels.length], [tick]);
  const tip = useMemo(() => tips[tick % tips.length], [tick]);

  return (
    <main className="pixel-boot-bg grid min-h-screen place-items-center overflow-hidden px-4 py-8 font-pixel text-slate-950 sm:px-6" aria-busy="true">
      <PixelStatusCard title="PIXEL PAWS" subtitle="Checking login...">
        <div className="mt-6 grid gap-5">
          <PixelSpinner label={statusLabel} />
          <div className="rounded-2xl border-4 border-slate-950 bg-slate-950 p-4 text-center text-white shadow-[4px_4px_0_#0f172a]" aria-live="polite">
            <p className="text-base font-bold text-white sm:text-lg">{statusLabel}<span className="inline-block min-w-8 animate-loading-dots text-yellow-200" aria-hidden="true">...</span></p>
            <p className="mt-2 text-[10px] text-lime-100">{network.connectionStatus === 'offline' ? 'Network unavailable' : progressLabel}</p>
          </div>
          <div className="h-5 overflow-hidden rounded-full border-4 border-slate-950 bg-white shadow-[3px_3px_0_#0f172a]" aria-hidden="true">
            <div className="h-full w-2/3 animate-pixel-progress bg-gradient-to-r from-pink-400 via-yellow-300 to-lime-300" />
          </div>
          {network.connectionStatus === 'offline' && <div className="rounded-2xl border-4 border-slate-950 bg-yellow-100 p-3 text-center text-[10px] font-semibold text-yellow-950">Offline mode detected. We are trying to reconnect...</div>}
          {timedOut && (
            <div className="rounded-2xl border-4 border-slate-950 bg-yellow-100 p-4 text-center text-slate-950 shadow-[3px_3px_0_#0f172a]" role="alert">
              <h2 className="text-sm font-bold">This is taking longer than usual.</h2>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-700">Possible network or Firebase issue.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={onRetry} className="pixel-border-sm bg-lime-200 px-4 py-3 text-[10px] text-slate-950 focus:outline-none focus:ring-4 focus:ring-pink-300">Retry</button>
                <button type="button" onClick={onSignIn} className="pixel-border-sm bg-white px-4 py-3 text-[10px] text-slate-950 focus:outline-none focus:ring-4 focus:ring-pink-300">Go to Sign In</button>
              </div>
            </div>
          )}
          <p className="text-center text-[10px] font-semibold text-slate-700">{tip}</p>
        </div>
      </PixelStatusCard>
    </main>
  );
}
