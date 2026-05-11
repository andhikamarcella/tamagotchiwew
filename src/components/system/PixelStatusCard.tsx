'use client';

import type { ReactNode } from 'react';

export default function PixelStatusCard({
  eyebrow = 'Pixel Paws',
  title = 'PIXEL PAWS',
  subtitle,
  children,
  tone = 'default',
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  tone?: 'default' | 'error' | 'warning';
}) {
  const badgeClass = tone === 'error' ? 'bg-red-100 text-red-950' : tone === 'warning' ? 'bg-yellow-100 text-yellow-950' : 'bg-lime-100 text-slate-950';
  return (
    <section className="relative z-10 w-full max-w-[min(92vw,34rem)] rounded-[2rem] border-4 border-slate-950 bg-white p-4 text-slate-950 shadow-[8px_8px_0_#0f172a] sm:p-6" aria-labelledby="pixel-status-title">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className={`inline-flex items-center gap-2 rounded-full border-2 border-slate-950 px-3 py-1 text-[9px] uppercase tracking-[0.2em] ${badgeClass}`}>
          <span aria-hidden="true">🐾</span>
          <span>{eyebrow}</span>
        </div>
        <div className="flex gap-1" aria-hidden="true"><span className="h-3 w-3 border-2 border-slate-950 bg-pink-300" /><span className="h-3 w-3 border-2 border-slate-950 bg-yellow-300" /><span className="h-3 w-3 border-2 border-slate-950 bg-sky-300" /></div>
      </div>
      <div className="text-center">
        <h1 id="pixel-status-title" className="font-display text-3xl leading-tight tracking-wider text-slate-950 sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 text-sm font-semibold text-slate-700">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
