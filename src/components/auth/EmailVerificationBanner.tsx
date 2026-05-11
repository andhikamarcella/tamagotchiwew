'use client';

import { useEmailVerification } from '@/src/hooks/useEmailVerification';

export default function EmailVerificationBanner({ onToast }: { onToast: (message: string) => void }) {
  const verification = useEmailVerification(onToast);
  if (!verification.shouldShow) return null;
  return (
    <section className="pixel-border-sm bg-yellow-100 p-3 text-[10px] leading-relaxed">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xs">Verify your email</h2><p className="mt-1">We sent a verification link to your inbox.</p></div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="button" disabled={verification.cooldownSeconds > 0 || verification.auth.providerLoading.verifyEmail} onClick={() => void verification.resend()} className="pixel-border-sm bg-white px-3 py-2 disabled:opacity-50">{verification.cooldownSeconds > 0 ? `Resend in ${verification.cooldownSeconds}s` : 'Resend email'}</button>
          <button type="button" disabled={verification.auth.providerLoading.verifyEmail} onClick={() => void verification.refresh()} className="pixel-border-sm bg-lime-100 px-3 py-2 disabled:opacity-50">I verified, refresh</button>
          <button type="button" onClick={verification.dismiss} className="pixel-border-sm bg-white px-3 py-2">Dismiss</button>
        </div>
      </div>
    </section>
  );
}
