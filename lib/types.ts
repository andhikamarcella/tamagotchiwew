export type Mood = 'Senang' | 'Lapar' | 'Ngantuk' | 'Kotor' | 'Sakit' | 'Bosan' | 'Sedih' | 'Tidur' | 'Manja' | 'Very Sick';
export type Evolution = 'Baby' | 'Kid' | 'Teen' | 'Adult';
export type Weather = 'Sunny' | 'Rainy' | 'Cloudy' | 'Snowy' | 'Windy';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export type ThemeName = 'Green Retro' | 'Pink Candy' | 'Blue Ocean' | 'Yellow Pixel' | 'Dark Arcade';
export type ItemCategory = 'Food' | 'Toys' | 'Accessories' | 'Decorations' | 'Habitats';

export interface Stats { hunger: number; happiness: number; energy: number; cleanliness: number; health: number; affection: number; xp: number; }
export interface Animal { id: string; species: string; emoji: string; color: string; personality: string; favoriteFood: string; favoriteToy: string; favoriteHabitat: string; unlockCost: number; expressions: Record<string, string>; }
export interface Pet { id: string; animalId: string; customName: string; level: number; birthDate: number; stats: Stats; isSleeping: boolean; equippedAccessory?: string; equippedHabitat?: string; equippedDecorations: string[]; actionCounts: Record<string, number>; snackCountToday: number; lastSnackDate: string; sickMinutes: number; }
export interface ShopItem { id: string; category: ItemCategory; name: string; price: number; description: string; effect: string; emoji: string; statEffects?: Partial<Stats>; locked?: boolean; }
export interface InventoryItem { itemId: string; quantity: number; equipped?: boolean; }
export interface Achievement { id: string; title: string; description: string; reward: number; badge: string; }
export interface DailyReward { lastClaimDate: string | null; streak: number; }
export interface Settings { sound: boolean; reducedMotion: boolean; theme: ThemeName; }
export interface SaveData { userCoins: number; activePetId: string | null; pets: Pet[]; inventory: InventoryItem[]; achievements: string[]; unlockedAnimals: string[]; settings: Settings; dailyReward: DailyReward; lastUpdatedAt: number; weather: Weather; weatherUpdatedAt: number; }
export interface Toast { id: string; message: string; type?: 'info' | 'success' | 'warning'; }
