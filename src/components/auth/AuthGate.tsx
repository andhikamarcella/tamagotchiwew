'use client';
import type { ReactNode } from 'react';
import LoginRequiredScreen from './LoginRequiredScreen';
import { useAuth } from '@/src/hooks/useAuth';
import { isFirebaseConfigured } from '@/src/lib/firebase';
import { useAudioUnlock } from '@/src/hooks/useAudioUnlock';
import AppBootScreen from '@/src/components/system/AppBootScreen';
import AuthErrorScreen from '@/src/components/system/AuthErrorScreen';

export default function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  useAudioUnlock();

  const goToSignIn = () => {
    auth.showSignInScreen();
  };

  const continueAsGuest = () => {
    void auth.signInAsGuest();
  };

  if (!isFirebaseConfigured()) {
    return (
      <AuthErrorScreen
        message="Firebase setup needed"
        detail="Add Firebase environment variables to enable login and online play."
        onRetry={auth.retryAuthCheck}
        onSignIn={goToSignIn}
        onContinueGuest={continueAsGuest}
        canContinueGuest={false}
      />
    );
  }

  if (auth.bootState === 'error') {
    return (
      <AppBootScreen
        state="error"
        error={auth.bootError ?? auth.error}
        onRetry={auth.retryAuthCheck}
        onSignIn={goToSignIn}
        onContinueGuest={continueAsGuest}
        canContinueGuest={!auth.hasGuestTrialExpired}
      />
    );
  }

  if (!auth.authReady || ['idle', 'initializing', 'checking-auth', 'loading-profile'].includes(auth.bootState)) {
    return <AppBootScreen state={auth.bootState} timedOut={false} onRetry={auth.retryAuthCheck} onSignIn={goToSignIn} onContinueGuest={continueAsGuest} canContinueGuest={!auth.hasGuestTrialExpired} />;
  }

  if (!auth.isAuthenticated || auth.bootState === 'signed-out') return <LoginRequiredScreen />;
  return <>{children}</>;
}
