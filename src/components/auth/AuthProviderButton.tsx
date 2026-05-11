'use client';

function MicrosoftIcon() {
  return <span className="grid h-4 w-4 grid-cols-2 gap-0.5" aria-hidden="true"><span className="bg-[#f25022]" /><span className="bg-[#7fba00]" /><span className="bg-[#00a4ef]" /><span className="bg-[#ffb900]" /></span>;
}

function GoogleIcon() {
  return <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-slate-950 bg-white text-[11px] font-bold text-blue-600" aria-hidden="true">G</span>;
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" aria-hidden="true" />;
}

export default function AuthProviderButton({ provider, loading, disabled, onClick }: { provider: 'google' | 'microsoft'; loading?: boolean; disabled?: boolean; onClick: () => void }) {
  const isMicrosoft = provider === 'microsoft';
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border-4 border-slate-950 bg-white px-4 py-3 text-[11px] text-slate-950 shadow-[4px_4px_0_#0f172a] transition hover:-translate-y-0.5 hover:bg-slate-50 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-55"
    >
      {loading ? <Spinner /> : isMicrosoft ? <MicrosoftIcon /> : <GoogleIcon />}
      <span>{loading ? (isMicrosoft ? 'Connecting Microsoft...' : 'Connecting Google...') : `Continue with ${isMicrosoft ? 'Microsoft' : 'Google'}`}</span>
    </button>
  );
}
