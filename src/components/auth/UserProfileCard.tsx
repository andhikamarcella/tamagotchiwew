'use client';

export default function UserProfileCard({ name, email, isGuest }: { name?: string | null; email?: string | null; isGuest?: boolean }) {
  return <div className="rounded-2xl border-4 border-slate-950 bg-white/80 p-3 text-[10px] shadow-[3px_3px_0_#0f172a]"><div>{isGuest ? 'Guest Keeper' : name ?? 'Pixel Keeper'}</div>{email && <div className="mt-1 break-all text-slate-600">{email}</div>}</div>;
}
