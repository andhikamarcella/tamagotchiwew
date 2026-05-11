'use client';

import type { AuthBootState } from '@/src/hooks/useAuth';
import AuthCheckingScreen from './AuthCheckingScreen';
import AuthErrorScreen from './AuthErrorScreen';

export default function AppBootScreen({
  state,
  error,
  timedOut,
  onRetry,
  onSignIn,
  onContinueGuest,
  canContinueGuest,
}: {
  state: AuthBootState;
  error?: string | null;
  timedOut?: boolean;
  onRetry?: () => void;
  onSignIn?: () => void;
  onContinueGuest?: () => void;
  canContinueGuest?: boolean;
}) {
  if (state === 'error') {
    return <AuthErrorScreen message="We couldn't verify your session." detail={error ?? 'Possible network or Firebase issue.'} onRetry={onRetry} onSignIn={onSignIn} onContinueGuest={onContinueGuest} canContinueGuest={canContinueGuest} />;
  }
  return <AuthCheckingScreen state={state} timedOut={timedOut} onRetry={onRetry} onSignIn={onSignIn} />;
}
