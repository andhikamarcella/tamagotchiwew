'use client';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ToastMessage = { id: string; message: string; type?: ToastType };

const toneByType: Record<ToastType, string> = {
  success: 'bg-emerald-100',
  error: 'bg-rose-100',
  info: 'bg-sky-100',
  warning: 'bg-yellow-100',
};

export default function ToastProvider({ toasts, onClose }: { toasts: ToastMessage[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed inset-x-3 top-3 z-[70] grid gap-2 sm:left-auto sm:right-4 sm:top-4 sm:w-80">
      {toasts.slice(-4).map((toast) => (
        <div key={toast.id} className={`pixel-border-sm animate-pop flex items-start justify-between gap-3 p-3 text-[10px] leading-relaxed text-slate-950 ${toneByType[toast.type ?? 'info']}`}>
          <span>{toast.message}</span>
          <button type="button" onClick={() => onClose(toast.id)} className="shrink-0 text-xs leading-none" aria-label="Close toast">×</button>
        </div>
      ))}
    </div>
  );
}
