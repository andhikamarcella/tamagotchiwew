'use client';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function AppShell({ page, setPage, coins, children }: { page: string; setPage: (page: string) => void; coins: number; children: React.ReactNode }) {
  return <div className="mx-auto flex max-w-7xl gap-4 p-3 pb-24 md:pb-3"><Sidebar page={page} setPage={setPage} coins={coins} /><div className="min-w-0 flex-1">{children}</div><BottomNav page={page} setPage={setPage} /></div>;
}
