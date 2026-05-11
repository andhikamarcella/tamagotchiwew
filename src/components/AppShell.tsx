'use client';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import GuestTrialBadge from '@/src/components/auth/GuestTrialBadge';
import { useAuth } from '@/src/hooks/useAuth';

export function AppShell({ page, setPage, coins, children }: { page: string; setPage: (page: string) => void; coins: number; children: ReactNode }) {
  const auth = useAuth();
  return <div className="mx-auto flex max-w-7xl gap-4 p-3 pb-24 md:pb-3"><Sidebar page={page} setPage={setPage} coins={coins} /><div className="min-w-0 flex-1">{auth.isGuest && !auth.isGuestTrialExpired && <GuestTrialBadge remainingMs={auth.guestTrialRemainingMs} onLogin={() => void auth.signOutUser()} />}{children}</div><BottomNav page={page} setPage={setPage} /></div>;
}
