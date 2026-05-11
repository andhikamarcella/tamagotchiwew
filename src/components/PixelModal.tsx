'use client';

import type { ReactNode } from 'react';
import { useBodyScrollLock } from '@/src/hooks/useBodyScrollLock';

export function PixelModal({ title, description, children, footer, onClose, maxWidth = 'sm:max-w-3xl', panelClassName = 'bg-[var(--panel)]' }: { title?: string; description?: string; children: ReactNode; footer?: ReactNode; onClose?: () => void; maxWidth?: string; panelClassName?: string }) {
  useBodyScrollLock(true);
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-hidden bg-black/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" onWheel={(event) => event.stopPropagation()}>
      <section className={`flex max-h-[88dvh] w-full flex-col overflow-hidden rounded-t-2xl border-4 border-zinc-950 shadow-[6px_6px_0_#111] sm:rounded-2xl ${maxWidth} ${panelClassName}`}>
        {(title || onClose) && (
          <header className="sticky top-0 z-20 flex shrink-0 items-start justify-between gap-3 border-b-4 border-zinc-950 bg-inherit p-3 sm:p-4">
            <div className="min-w-0"><h2 className="text-sm">{title}</h2>{description && <p className="mt-1 text-[9px] leading-relaxed text-slate-700">{description}</p>}</div>
            {onClose && <button type="button" onClick={onClose} className="pixel-border-sm shrink-0 bg-white px-3 py-2 text-[10px]">Cancel</button>}
          </header>
        )}
        <div className="modal-scroll-area min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-3 sm:p-4">{children}</div>
        {footer && <footer className="shrink-0 border-t-4 border-zinc-950 bg-inherit p-3 sm:p-4">{footer}</footer>}
      </section>
    </div>
  );
}

export default PixelModal;
