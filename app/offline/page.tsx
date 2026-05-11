import OfflinePageActions from '@/src/components/system/OfflinePageActions';

const statuses = ['Connection lost', 'Your save is safe', 'Reconnect to continue online features'];

export const metadata = {
  title: "You're Offline · Pixel Paws",
  description: 'Custom Pixel Paws offline fallback page.',
};

export default function OfflinePage() {
  return (
    <main className="pixel-boot-bg grid min-h-screen place-items-center overflow-hidden px-4 py-8 font-pixel text-slate-950 sm:px-6">
      <section className="relative z-10 w-full max-w-[min(92vw,38rem)] rounded-[2rem] border-4 border-slate-950 bg-white p-4 text-center text-slate-950 shadow-[8px_8px_0_#0f172a] sm:p-6">
        <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-3xl border-4 border-slate-950 bg-lime-200 text-6xl shadow-[6px_6px_0_#0f172a] animate-paw-bounce" aria-hidden="true">🐾</div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-slate-950 bg-yellow-100 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-950">
          <span aria-hidden="true">📴</span>
          <span>Offline mode</span>
        </div>
        <h1 className="font-display text-3xl leading-tight tracking-wider text-slate-950 sm:text-5xl">You're Offline</h1>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-700">Connection lost. Pixel Paws will be ready when you're back online.</p>
        <p className="mt-3 text-[10px] leading-relaxed text-slate-700">Pixel Paws can't reach the internet right now. Online features like sync, notifications, couple mode, and cloud save may be unavailable until you reconnect.</p>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {statuses.map((status) => <div key={status} className="rounded-2xl border-4 border-slate-950 bg-lime-100 p-3 text-[10px] font-bold text-slate-950 shadow-[3px_3px_0_#0f172a]">{status}</div>)}
        </div>

        <OfflinePageActions />

        <div className="mt-5 rounded-2xl border-4 border-slate-950 bg-slate-950 p-4 text-left text-white shadow-[4px_4px_0_#0f172a]">
          <h2 className="text-[11px] font-bold text-yellow-200">Tiny reconnect tips</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[10px] leading-relaxed text-lime-100">
            <li>Try turning Wi-Fi back on.</li>
            <li>Reconnect and refresh to continue caring for your pet.</li>
            <li>If this is your first visit, reconnect once so the app can finish preparing offline support.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
