export function coinReward(min: number, max: number): number {
  const low = Math.max(0, Math.floor(min));
  const high = Math.max(low, Math.floor(max));
  return low + Math.floor(Math.random() * (high - low + 1));
}
