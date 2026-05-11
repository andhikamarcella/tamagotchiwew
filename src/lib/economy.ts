export function canAfford(coins: number, price: number): boolean {
  return Math.max(0, coins) >= Math.max(0, price);
}
