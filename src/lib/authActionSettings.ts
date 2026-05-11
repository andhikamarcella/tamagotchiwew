import type { ActionCodeSettings } from 'firebase/auth';

export function getAuthActionCodeSettings(): ActionCodeSettings {
  const origin = typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'https://pxlpaws.vercel.app';
  return {
    url: `${origin}/auth/action`,
    handleCodeInApp: false,
  };
}
