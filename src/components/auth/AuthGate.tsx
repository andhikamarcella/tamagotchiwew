'use client';
import type { ReactNode } from 'react';
import LoginRequiredScreen from './LoginRequiredScreen';
import { useAuth } from '@/src/hooks/useAuth';
import { isFirebaseConfigured } from '@/src/lib/firebase';

export default function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  if (!isFirebaseConfigured()) return <main className="grid min-h-screen place-items-center bg-lime-100 p-4 font-pixel text-xs"><section className="pixel-border max-w-md bg-white p-4 text-center"><h1 className="mb-2 text-sm">Firebase setup needed</h1><p className="text-[10px] leading-relaxed">Add Firebase env vars to enable login and online play.</p></section></main>;
  if (!auth.authReady) return <main className="grid min-h-screen place-items-center bg-[var(--bg)] font-pixel text-xs">🐾 Checking login...</main>;
  if (!auth.isAuthenticated) return <LoginRequiredScreen />;
  return <>{children}</>;
}
