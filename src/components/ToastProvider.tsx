'use client';
export interface ToastMessage { id: string; message: string; }
export function ToastProvider({ toasts }: { toasts: ToastMessage[] }) {
  return <div className="fixed right-3 top-3 z-50 space-y-2">{toasts.map((toast) => <div key={toast.id} className="pixel-border-sm animate-pop bg-white p-3 text-[10px]">{toast.message}</div>)}</div>;
}
