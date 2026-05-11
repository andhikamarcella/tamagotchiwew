import type { ActionCodeSettings } from 'firebase/auth';

function normalizeActionUrl(url: string): string | null {
  try {
    return new URL(url).toString();
  } catch {
    return null;
  }
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function getAuthActionCodeSettings(): ActionCodeSettings | undefined {
  const explicitActionUrl = process.env.NEXT_PUBLIC_AUTH_ACTION_URL?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const devOrigin = process.env.NODE_ENV === 'development' && typeof window !== 'undefined'
    ? window.location.origin
    : undefined;
  const url = explicitActionUrl || (appUrl ? `${trimTrailingSlash(appUrl)}/auth/action` : undefined) || (devOrigin ? `${devOrigin}/auth/action` : undefined);
  const normalizedUrl = url ? normalizeActionUrl(url) : null;
  if (!normalizedUrl) return undefined;
  return {
    url: normalizedUrl,
    handleCodeInApp: true,
  };
}

export const getPasswordResetActionCodeSettings = getAuthActionCodeSettings;
