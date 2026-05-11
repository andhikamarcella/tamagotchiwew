'use client';
import type { ReactNode } from 'react';
import LoginRequiredScreen from './LoginRequiredScreen';
import { useAuth } from '@/src/hooks/useAuth';
import { isFirebaseConfigured } from '@/src/lib/firebase';
import { useAudioUnlock } from '@/src/hooks/useAudioUnlock';

export default function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  useAudioUnlock();
  if (!isFirebaseConfigured()) return <main className="grid min-h-screen place-items-center bg-lime-100 p-4 font-pixel text-xs"><section className="pixel-border max-w-md bg-white p-4 text-center"><h1 className="mb-2 text-sm">Firebase setup needed</h1><p className="text-[10px] leading-relaxed">Add Firebase env vars to enable login and online play.</p></section></main>;
  if (!auth.authReady) return <main className="grid min-h-screen place-items-center bg-slate-950 p-4 font-pixel text-xs text-white"><section className="text-center"><div className="mx-auto mb-3 h-9 w-9 animate-spin border-4 border-white border-t-yellow-300" />🐾 Checking login...</section></main>;
  if (!auth.isAuthenticated) return <LoginRequiredScreen />;
  return <>{children}</>;
}
