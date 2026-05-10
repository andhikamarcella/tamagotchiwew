export function hasText(value: string): boolean {
  return value.trim().length > 0;
}
export function isInviteCode(value: string): boolean {
  return /^[A-HJ-NP-Z2-9]{6}$/.test(value);
}
