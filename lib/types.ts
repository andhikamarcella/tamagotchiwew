export type Mood = 'Senang' | 'Lapar' | 'Ngantuk' | 'Kotor' | 'Sakit' | 'Bosan' | 'Sedih' | 'Tidur' | 'Manja' | 'Very Sick';
export type Evolution = 'Baby' | 'Kid' | 'Teen' | 'Adult' | 'Legendary';
export type Weather = 'Sunny' | 'Rainy' | 'Cloudy' | 'Snowy' | 'Windy' | 'Starry';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export type ThemeName = 'Green Retro' | 'Pink Candy' | 'Blue Ocean' | 'Yellow Pixel' | 'Dark Arcade' | 'Cream Cozy' | 'Purple Night' | 'Mint Pixel' | 'Sunset Pet' | 'Forest Buddy' | 'Snow Day' | 'Retro Gray' | 'Neon Lime' | 'Classic LCD' | 'Night Festival' | 'Summer Beach' | 'Halloween' | 'Christmas' | 'Cozy Room' | 'Arcade Purple' | 'Sakura Pink' | 'Ocean Blue';
export type ItemCategory = 'Food' | 'Snacks' | 'Toys' | 'Medicine' | 'Accessories' | 'Decorations' | 'Habitats' | 'Badges' | 'Special';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'Event';
export type EventTag = 'new_year' | 'valentine_love' | 'ramadan' | 'eid' | 'summer_beach' | 'night_festival' | 'halloween' | 'anniversary' | 'christmas' | 'cozy_winter';
export type PetPersonality = 'Playful' | 'Sleepy' | 'Lazy' | 'Foodie' | 'Shy' | 'Clingy' | 'Brave' | 'Curious' | 'Gentle' | 'Naughty' | 'Loyal' | 'Moody';
export type PetTrait = PetPersonality;
export type BondRank = 'Stranger' | 'Buddy' | 'Best Friend' | 'Family' | 'Soul Pet';
export type CareGrade = 'S' | 'A' | 'B' | 'C' | 'D';
export type MiniGameDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Event';
export type MiniGameCategory = 'Quick Games' | 'Brain Games' | 'Action Games' | 'Cozy Games' | 'Event Games' | 'Locked / Coming Soon';
export type LifeState = 'healthy' | 'warning' | 'critical' | 'emergency' | 'dead';
export type GameplayDifficulty = 'cozy' | 'normal' | 'challenge';
export type IllnessSeverity = 'mild' | 'medium' | 'severe';
export type IllnessType = 'Cold' | 'Fever' | 'Tummy Ache' | 'Tiredness' | 'Sadness' | 'Dirty Fur' | 'Weakness';

export interface Stats { hunger: number; happiness: number; energy: number; cleanliness: number; health: number; affection: number; xp: number; }
export interface Animal { id: string; species: string; displayName?: string; emoji: string; color: string; personality: string; rarity?: Rarity; favoriteFood: string; favoriteFoods?: string[]; dislikedFoods?: string[]; favoriteToy: string; favoriteToys?: string[]; favoriteHabitat: string; habitatPreference?: string; unlockCost: number; baseStats?: Partial<Stats>; sounds?: Partial<Record<Mood, string>>; pixelSprite?: string[]; expressions: Record<string, string>; }
export interface PetIllness { id: string; type: IllnessType; name: string; severity: IllnessSeverity; cause: string; effects: string[]; treatment: string; durationHours: number; startedAt: number; untreatedSince: number; warningText: string; }
export interface Pet { id: string; animalId: string; customName: string; level: number; birthDate: number; stats: Stats; isSleeping: boolean; equippedAccessory?: string; equippedHabitat?: string; equippedDecorations: string[]; actionCounts: Record<string, number>; snackCountToday: number; lastSnackDate: string; sickMinutes: number; trait?: PetTrait; personality: PetPersonality; evolutionStage: Evolution; lastEvolutionStage: Evolution; bondRank: BondRank; bondXp: number; equippedPetBadge?: string | null; isAlive: boolean; lifeState: LifeState; diedAt: number | null; deathReason: string | null; criticalSince: number | null; emergencySince: number | null; deathEventId?: string | null; lastFedAt: number; lastSleptAt: number; lastCleanedAt: number; lastMedicineAt: number; lastHealthCheckAt: number; lastVetVisitAt: number | null; neglectScore: number; activeIllnesses: PetIllness[]; vaccinationUntil?: number | null; freeFirstAidDate?: string | null; moodHistory?: Mood[]; diary?: DiaryEntry[]; careHistory?: DiaryEntry[]; nearDeathRecords?: DiaryEntry[]; }
export interface ShopItem { id: string; category: ItemCategory; name: string; price: number; description: string; effect: string; emoji: string; rarity?: Rarity; statEffects?: Partial<Stats>; compatibleSpecies?: string[]; eventTag?: EventTag; available?: boolean; owned?: number; useBehavior?: 'consume' | 'equip' | 'collect' | 'display'; disabledReason?: string; locked?: boolean; }
export interface InventoryItem { itemId: string; quantity: number; equipped?: boolean; favorite?: boolean; }

export interface DiaryEntry { id: string; date: string; text: string; favorite?: boolean; }
export interface DailyGoal { id: string; label: string; target: number; progress: number; rewardCoins: number; rewardXp: number; claimed: boolean; }
export interface DailyGoalsState { date: string; goals: DailyGoal[]; }
export interface WeeklyQuest { id: string; label: string; target: number; progress: number; rewardCoins: number; rewardItemId?: string; claimed: boolean; }
export interface WeeklyQuestsState { weekKey: string; quests: WeeklyQuest[]; }
export interface CollectionState { foodsTried: string[]; toysUsed: string[]; badgesCollected: string[]; habitatsUnlocked: string[]; eventItems: string[]; miniGameTrophies: string[]; discoveredPets: string[]; claimedMilestones: string[]; }
export interface EquippedBadges { profile?: string | null; pet?: string | null; couple?: string | null; }
export interface CraftingState { materials: Record<string, number>; craftedRecipes: string[]; }
export interface LocalLeaderboardEntry { bestScore: number; bestTime: number | null; totalWins: number; totalCoinsEarned: number; lastPlayed: number | null; }
export interface TutorialState { skipped: boolean; completed: boolean; step: number; claimed: boolean; }
export interface PetRequest { id: string; text: string; action: string; itemName?: string; expiresAt: number; rewardCoins: number; rewardXp: number; completed?: boolean; failed?: boolean; }
export interface ActiveErrand { id: string; type: string; startedAt: number; endsAt: number; claimed: boolean; rewardCoins: number; rewardItemId?: string; }

export interface Achievement { id: string; title: string; description: string; reward: number; badge: string; }
export interface DailyReward { lastClaimDate: string | null; streak: number; }
export interface Settings { sound: boolean; reducedMotion: boolean; theme: ThemeName; confirmExpensivePurchases?: boolean; quickActionButtons?: boolean; showTutorialTips?: boolean; showMoodWarnings?: boolean; gameplayDifficulty?: GameplayDifficulty; deathModeConfirmed?: boolean; }

export interface ProfileShowcase { displayBadge: string | null; favoritePetId: string | null; favoriteHabitat: string | null; playerTitle: string; profileFrame: string; favoriteMiniGame: string | null; statusMessage: string; }
export interface MailItem { id: string; title: string; message: string; rewardCoins?: number; rewardItemId?: string; createdAt: number; expiresAt?: number; claimedAt?: number | null; type: 'system' | 'event' | 'daily' | 'partner' | 'announcement' | 'mini-game'; }
export interface AppNotification { id: string; title: string; message: string; type: 'pet' | 'daily' | 'quest' | 'achievement' | 'partner' | 'coins' | 'shop' | 'remote' | 'emergency'; createdAt: number; readAt?: number | null; }
export type RoomDecorSlot = 'floor' | 'wall' | 'bed' | 'toy' | 'lamp' | 'window' | 'special';
export interface RoomDecorState { slots: Record<RoomDecorSlot, string | null>; comfortScore: number; }
export interface AlbumMoment { id: string; title: string; date: string; petId?: string; petEmoji?: string; caption: string; favorite?: boolean; }
export interface PlayerRankState { name: 'New Keeper' | 'Bronze Keeper' | 'Silver Keeper' | 'Gold Keeper' | 'Platinum Keeper' | 'Pixel Master'; points: number; claimedRewards: string[]; }

export interface MemorialPet { petId: string; name: string; animalId: string; species?: string; personality?: PetPersonality; level: number; birthDate: number; createdAt?: number; diedAt: number; deathReason: string; badges: string[]; daysCared: number; bondRank?: BondRank; favoriteFood?: string; favoriteToy?: string; equippedBadge?: string | null; equippedHabitat?: string | null; achievementsSnapshot?: string[]; miniGameStats?: Record<string, LocalLeaderboardEntry>; finalStats?: Stats; memoriesCount?: number; createdFromDeathReset?: boolean; deathEventId?: string | null; }
export interface KeepsakeItem { id: string; petId: string; name: string; description: string; createdAt: number; displayed?: boolean; }
export interface CareCalendarDay { dateId: string; fed: boolean; played: boolean; cleaned: boolean; slept: boolean; clinic: boolean; rewardClaimed?: boolean; }
export interface MoodTimelineEvent { id: string; petId?: string; mood: Mood | LifeState; message: string; createdAt: number; }
export interface SkillTreeState { id: string; name: string; level: number; unlocked: boolean; description: string; }
export interface TrainingCommandState { id: string; command: 'Sit' | 'Jump' | 'Dance' | 'Fetch' | 'Wave'; level: number; unlocked: boolean; lastTrainedAt?: number | null; }
export interface ClinicVisit { id: string; petId: string; treatmentId: string; treatmentName: string; cost: number; createdAt: number; result: string; }
export interface ReviveRecord { id: string; petId: string; itemId: string; itemName: string; usedAt: number; deathReason: string | null; }
export interface SafetyItemRecord { id: string; itemId: string; usedAt: number; petId: string; effect: string; }
export interface PetJournalEntry { id: string; dateId: string; petId?: string; text: string; createdAt: number; }
export interface SaveData { userCoins: number; activePetId: string | null; pets: Pet[]; inventory: InventoryItem[]; achievements: string[]; unlockedAnimals: string[]; settings: Settings; dailyReward: DailyReward; lastUpdatedAt: number; weather: Weather; weatherUpdatedAt: number; usedCheatCodes: Record<string, boolean>; petMemorials: MemorialPet[]; collection: CollectionState; dailyGoals: DailyGoalsState; weeklyQuests: WeeklyQuestsState; equippedBadges: EquippedBadges; crafting: CraftingState; leaderboards: Record<string, LocalLeaderboardEntry>; tutorial: TutorialState; activePetRequest: PetRequest | null; activeErrand: ActiveErrand | null; favoriteItems: string[]; profileShowcase: ProfileShowcase; mailbox: MailItem[]; notifications: AppNotification[]; roomDecor: RoomDecorState; album: AlbumMoment[]; playerRank: PlayerRankState; activityLogs?: string[]; gameStarted?: boolean; needsNewJourney?: boolean; lastResetAt?: number | null; legacyTitle?: string | null; keepsakes?: KeepsakeItem[]; careCalendar?: CareCalendarDay[]; moodTimeline?: MoodTimelineEvent[]; skillTree?: SkillTreeState[]; training?: TrainingCommandState[]; clinicVisits?: ClinicVisit[]; illnessHistory?: PetIllness[]; reviveHistory?: ReviveRecord[]; safetyItems?: SafetyItemRecord[]; petJournal?: PetJournalEntry[]; }
export interface Toast { id: string; message: string; type?: 'info' | 'success' | 'warning'; }
export interface EventConfig { id: EventTag; title: string; description: string; start?: string; end?: string; theme: { from: string; to: string; accent: string }; shopItems: string[]; miniGames: string[]; bonusMultiplier: number; badgeReward: string; announcement: string; }
export interface RewardResult { coins: number; xp: number; items?: Array<{ itemId: string; quantity: number }>; reason: string; actionId: string; }
export interface CheatCodeResult { ok: boolean; message: string; coins?: number; code?: string; alreadyUsed?: boolean; rateLimited?: boolean; }
export interface PetDeathState { isDead: boolean; reason: string | null; diedAt: number | null; warnings: string[]; }
export interface MiniGame { id: string; icon: string; title: string; description: string; duration: string; rewardRange: string; difficulty: MiniGameDifficulty; category: MiniGameCategory; enabled: boolean; disabledReason?: string; eventTag?: EventTag; }
