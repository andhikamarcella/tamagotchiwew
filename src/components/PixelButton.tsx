'use client';

export function PixelButton({ children, onClick, disabled, className = '', type = 'button' }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string; type?: 'button' | 'submit' }) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`pixel-border-sm w-full bg-[var(--accent)] px-3 py-2 text-[10px] leading-relaxed text-slate-950 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${className}`}>{children}</button>;
}
