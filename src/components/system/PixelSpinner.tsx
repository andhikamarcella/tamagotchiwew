'use client';

export default function PixelSpinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-label={label}>
      <div className="relative grid h-24 w-24 place-items-center rounded-3xl border-4 border-slate-950 bg-lime-200 shadow-[6px_6px_0_#0f172a] sm:h-28 sm:w-28">
        <div className="absolute inset-2 rounded-2xl border-2 border-dashed border-slate-950/50" aria-hidden="true" />
        <div className="animate-paw-bounce text-5xl drop-shadow-[3px_3px_0_rgba(15,23,42,.35)] sm:text-6xl" aria-hidden="true">🐾</div>
        <div className="absolute -right-3 -top-3 h-6 w-6 animate-pixel-blink border-4 border-slate-950 bg-yellow-300 shadow-[3px_3px_0_#0f172a]" aria-hidden="true" />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
