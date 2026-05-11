export const ALLOWED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateInviteCode(length = 6): string {
  const safeLength = Math.max(1, Math.min(12, Math.floor(length)));
  return Array.from({ length: safeLength }, () => ALLOWED_CHARS[Math.floor(Math.random() * ALLOWED_CHARS.length)] ?? 'P').join('');
}

export function normalizeInviteCode(input: string): string {
  return input.toUpperCase().replace(/[O0I1]/g, '').replace(/[^A-Z2-9]/g, '').slice(0, 6);
}

export function isValidInviteCode(code: string): boolean {
  return /^[A-HJ-NP-Z2-9]{6}$/.test(code);
}
