export type RoomStatus = 'waiting' | 'active' | 'closed';
export type QuestType = 'daily' | 'weekly';
export type RewardType = 'coins' | 'xp' | 'item';
export type SharedActionKey = 'feed' | 'play' | 'clean' | 'walk' | 'hug' | 'sleep' | 'wake' | 'gift' | 'cheer' | 'dance' | 'photo' | 'favoriteFood' | 'brush' | 'train' | 'study' | 'explore';

export interface CoupleRoom {
  id: string;
  inviteCode: string;
  roomName: string;
  ownerName: string;
  ownerUid: string;
  guestName: string | null;
  guestUid: string | null;
  status: RoomStatus;
  activeSharedPetId: string;
  coupleBond: number;
  coupleXp: number;
  coupleLevel: number;
  coupleStreak: number;
  sharedCoins: number;
  updatedAtMs: number | null;
  lastActivityAtMs: number | null;
}

export interface SharedPet {
  id: string;
  species: string;
  name: string;
  level: number;
  xp: number;
  hunger: number;
  happiness: number;
  energy: number;
  cleanliness: number;
  health: number;
  affection: number;
  social: number;
  trust: number;
  mood: string;
  activeHabitat: string;
  activeAccessory: string | null;
  lastCaredBy: string | null;
}

export interface RoomEvent {
  id: string;
  actorName: string;
  actorUid: string;
  eventType: string;
  message: string;
  createdAtMs: number | null;
}

export interface PresenceEntry {
  id: string;
  nickname: string;
  uid: string;
  lastSeenAtMs: number | null;
}

export interface CoupleQuest {
  id: string;
  questKey: string;
  questType: QuestType;
  progress: number;
  goal: number;
  completed: boolean;
  claimed: boolean;
  rewardType: RewardType;
  rewardAmount: number;
  resetDate: string;
}

export interface SharedInventoryItem {
  id: string;
  itemId: string;
  itemType: string;
  quantity: number;
  equipped: boolean;
}


export type ChatMessageType = 'text' | 'emoji' | 'system' | 'coin_transfer' | 'gift' | 'pet_action';

export interface ChatReaction {
  uid: string;
  emoji: string;
  createdAtMs: number | null;
}

export interface ChatMessage {
  id: string;
  senderUid: string;
  senderName: string;
  senderPhotoURL: string | null;
  type: ChatMessageType;
  text: string | null;
  emoji: string | null;
  metadata: Record<string, unknown>;
  reactionCounts: Record<string, number>;
  createdAtMs: number | null;
  editedAtMs: number | null;
  deletedAtMs: number | null;
}

export interface CoinTransfer {
  id: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  amount: number;
  message: string;
  status: 'completed';
  actionId: string;
  createdAtMs: number | null;
}

export interface EmojiCategory {
  id: string;
  label: string;
  emojis: string[];
}

export interface QuickMessage {
  id: string;
  text: string;
}

export interface TransferLimit {
  min: number;
  maxPerTransfer: number;
  maxPerDay: number;
}

export interface CoupleMemory {
  id: string;
  petName: string;
  petMood: string;
  actorName: string;
  actorUid: string;
  caption: string;
  habitat: string;
  createdAtMs: number | null;
}
