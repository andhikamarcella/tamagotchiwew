'use client';

function MicrosoftIcon() {
  return <span className="grid h-4 w-4 shrink-0 grid-cols-2 gap-0.5" aria-hidden="true"><span className="bg-[#f25022]" /><span className="bg-[#7fba00]" /><span className="bg-[#00a4ef]" /><span className="bg-[#ffb900]" /></span>;
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function Spinner() {
  return <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" aria-hidden="true" />;
}

export default function AuthProviderButton({ provider, loading, disabled, onClick }: { provider: 'google' | 'microsoft'; loading?: boolean; disabled?: boolean; onClick: () => void }) {
  const isMicrosoft = provider === 'microsoft';
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={() => { void import('@/src/lib/audioEngine').then((engine) => engine.playSfx(disabled ? 'buttonDisabled' : 'buttonPress')).catch(() => undefined); onClick(); }}
      className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border-4 border-slate-950 bg-white px-4 py-3 font-pixel text-[11px] text-slate-950 shadow-[4px_4px_0_#0f172a] transition hover:-translate-y-0.5 hover:bg-slate-50 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-55"
    >
      {loading ? <Spinner /> : isMicrosoft ? <MicrosoftIcon /> : <GoogleIcon />}
      <span>{loading ? (isMicrosoft ? 'Connecting Microsoft...' : 'Connecting Google...') : `Continue with ${isMicrosoft ? 'Microsoft' : 'Google'}`}</span>
    </button>
  );
}
