export const GUEST_TRIAL_START_KEY = 'pixel-paws-guest-trial-start';
export const GUEST_TRIAL_EXPIRED_KEY = 'pixel-paws-guest-trial-expired';
export const GUEST_SAVE_CACHE_KEY = 'pixel-paws-guest-save-cache';
export const GUEST_TRIAL_DURATION_MS = 5 * 60 * 1000;

export function formatGuestTrialTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function readGuestTrialStart(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(GUEST_TRIAL_START_KEY);
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function readGuestTrialExpired(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(GUEST_TRIAL_EXPIRED_KEY) === 'yes';
}

export function computeGuestTrial(startAt: number | null, now = Date.now()) {
  const endsAt = startAt ? startAt + GUEST_TRIAL_DURATION_MS : null;
  const remainingMs = endsAt ? Math.max(0, endsAt - now) : GUEST_TRIAL_DURATION_MS;
  return { endsAt, remainingMs, expired: Boolean(startAt && remainingMs <= 0) };
}
