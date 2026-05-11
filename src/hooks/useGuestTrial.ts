'use client';

import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { formatGuestTrialTime } from '@/src/lib/guestTrial';

export function useGuestTrial(onBlocked?: (message: string) => void) {
  const auth = useAuth();
  const [gateOpen, setGateOpen] = useState(false);
  const expired = auth.isGuestTrialExpired;
  const remainingMs = auth.guestTrialRemainingMs;
  const formattedTime = useMemo(() => formatGuestTrialTime(remainingMs), [remainingMs]);

  const requireFullAccount = useCallback((actionName?: string) => {
    if (!auth.isGuest) return true;
    if (!expired) return true;
    const message = actionName?.toLowerCase().includes('together') || actionName?.toLowerCase().includes('couple') || actionName?.toLowerCase().includes('invite')
      ? 'Guest trial ended. Login to play together.'
      : 'Login to continue playing.';
    setGateOpen(true);
    onBlocked?.(message);
    return false;
  }, [auth.isGuest, expired, onBlocked]);

  return {
    auth,
    isGuest: auth.isGuest,
    remainingMs,
    expired,
    formattedTime,
    gateOpen,
    setGateOpen,
    requireFullAccount,
  };
}
