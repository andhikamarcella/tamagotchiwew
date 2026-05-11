'use client';

import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/src/hooks/useAuth';

export function useEmailVerification(onToast?: (message: string) => void) {
  const auth = useAuth();
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
  const shouldShow = Boolean(auth.isAuthenticated && auth.email && !auth.emailVerified && !dismissed);

  const resend = useCallback(async () => {
    if (cooldownUntil > Date.now()) {
      onToast?.(`Please wait ${Math.ceil((cooldownUntil - Date.now()) / 1000)}s before resending.`);
      return false;
    }
    const result = await auth.sendVerificationEmail();
    if (result.ok) {
      setCooldownUntil(Date.now() + 60_000);
      onToast?.('Verification email sent.');
      return true;
    }
    onToast?.(result.message ?? 'Could not send verification email. Please try again.');
    return false;
  }, [auth, cooldownUntil, onToast]);

  const refresh = useCallback(async () => {
    const result = await auth.refreshEmailVerification();
    onToast?.(result.ok ? 'Email verified!' : result.message ?? 'Email not verified yet. Please open the link in your email.');
    return result.ok;
  }, [auth, onToast]);

  return useMemo(() => ({ auth, shouldShow, cooldownSeconds, resend, refresh, dismissed, dismiss: () => setDismissed(true) }), [auth, cooldownSeconds, dismissed, refresh, resend, shouldShow]);
}
