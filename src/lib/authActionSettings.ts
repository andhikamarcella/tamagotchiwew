import type { ActionCodeSettings } from 'firebase/auth';

function getConfiguredActionOrigin(): string | null {
  const configuredUrl = process.env.NEXT_PUBLIC_AUTH_ACTION_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!configuredUrl) return null;
  try {
    return new URL(configuredUrl).origin;
  } catch {
    return null;
  }
}

export function getAuthActionCodeSettings(): ActionCodeSettings {
  const origin = getConfiguredActionOrigin() ?? (typeof window !== 'undefined' ? window.location.origin : 'https://pxlpaws.vercel.app');
  return {
    url: `${origin}/auth/action`,
    handleCodeInApp: false,
  };
}

export function getPasswordResetActionCodeSettings(): ActionCodeSettings | undefined {
  const origin = getConfiguredActionOrigin();
  if (!origin) return undefined;
  return {
    url: `${origin}/auth/action`,
    handleCodeInApp: false,
  };
}
