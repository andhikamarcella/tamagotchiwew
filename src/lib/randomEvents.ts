export function maybeRandomEvent(chance: number): boolean {
  return Math.random() < Math.max(0, Math.min(1, chance));
}
