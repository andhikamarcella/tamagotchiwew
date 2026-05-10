'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { auth, db, ensureAnonymousUser, isFirebaseConfigured } from '@/src/lib/firebase';
import type { CoupleMemory, CoupleQuest, CoupleRoom, PresenceEntry, RoomEvent, SharedActionKey, SharedInventoryItem, SharedPet } from '@/src/lib/coupleTypes';

const NICKNAME_KEY = 'pixel-pals-couple-nickname';
const LAST_ROOM_KEY = 'pixel-pals-couple-room-id';
const INVITE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAIN_PET_ID = 'main-pet';

const dailyQuests = [
  ['feed-once', 'daily', 0, 1, 'coins', 25],
  ['play-twice', 'daily', 0, 2, 'xp', 18],
  ['health-80', 'daily', 0, 1, 'coins', 30],
  ['send-gift', 'daily', 0, 1, 'coins', 35],
  ['take-photo', 'daily', 0, 1, 'xp', 20],
] as const;
const weeklyQuests = [
  ['streak-7', 'weekly', 0, 7, 'coins', 150],
  ['level-shared-pet', 'weekly', 0, 1, 'xp', 120],
  ['shared-actions-15', 'weekly', 0, 15, 'coins', 120],
  ['happy-3-days', 'weekly', 0, 3, 'coins', 90],
  ['unlock-decoration', 'weekly', 0, 1, 'item', 1],
] as const;

const actionEffects: Record<SharedActionKey, { label: string; message: string; coins: number; bond: number; xp: number; stats: Partial<SharedPet>; questKeys: string[] }> = {
  feed: { label: 'Feed Together', message: 'fed the shared pet.', coins: 4, bond: 2, xp: 8, stats: { hunger: 22, happiness: 3, energy: -2, affection: 2 }, questKeys: ['feed-once', 'shared-actions-15'] },
  play: { label: 'Play Together', message: 'played a pixel game with the pet.', coins: 5, bond: 3, xp: 12, stats: { happiness: 20, energy: -12, hunger: -6, social: 8 }, questKeys: ['play-twice', 'shared-actions-15'] },
  clean: { label: 'Clean Together', message: 'cleaned the pet until shiny.', coins: 4, bond: 2, xp: 8, stats: { cleanliness: 30, health: 5, trust: 3 }, questKeys: ['shared-actions-15'] },
  walk: { label: 'Walk Together', message: 'went on a tiny walk.', coins: 12, bond: 3, xp: 10, stats: { happiness: 15, energy: -10, hunger: -7, cleanliness: -4, social: 6 }, questKeys: ['shared-actions-15'] },
  hug: { label: 'Hug Together', message: 'gave a cozy hug.', coins: 3, bond: 5, xp: 6, stats: { affection: 16, happiness: 8, trust: 5 }, questKeys: ['shared-actions-15'] },
  sleep: { label: 'Sleep', message: 'tucked the pet into bed.', coins: 2, bond: 1, xp: 4, stats: { energy: 18, hunger: -4, happiness: 2 }, questKeys: ['shared-actions-15'] },
  wake: { label: 'Wake Up', message: 'woke the pet gently.', coins: 2, bond: 1, xp: 4, stats: { energy: -2, happiness: 3 }, questKeys: ['shared-actions-15'] },
  gift: { label: 'Give Gift', message: 'gave a small gift.', coins: 0, bond: 8, xp: 10, stats: { happiness: 14, affection: 10, trust: 5 }, questKeys: ['send-gift', 'shared-actions-15'] },
  cheer: { label: 'Cheer Up', message: 'cheered the pet up.', coins: 3, bond: 4, xp: 8, stats: { happiness: 18, social: 5 }, questKeys: ['shared-actions-15'] },
  dance: { label: 'Couple Dance', message: 'did a couple dance.', coins: 8, bond: 6, xp: 14, stats: { happiness: 22, energy: -12, social: 10 }, questKeys: ['shared-actions-15'] },
  photo: { label: 'Take Couple Photo', message: 'saved a couple memory.', coins: 5, bond: 7, xp: 10, stats: { happiness: 8, affection: 8 }, questKeys: ['take-photo', 'shared-actions-15'] },
  favoriteFood: { label: 'Give Favorite Food', message: 'served the favorite food.', coins: 3, bond: 4, xp: 9, stats: { hunger: 28, happiness: 8, health: 3 }, questKeys: ['feed-once', 'shared-actions-15'] },
  brush: { label: 'Brush', message: 'brushed the fur pixel by pixel.', coins: 4, bond: 3, xp: 7, stats: { cleanliness: 20, affection: 6, health: 3 }, questKeys: ['shared-actions-15'] },
  train: { label: 'Train Together', message: 'trained together.', coins: 10, bond: 3, xp: 24, stats: { energy: -18, hunger: -10, happiness: 6, trust: 4 }, questKeys: ['shared-actions-15'] },
  study: { label: 'Study Together', message: 'studied pet tricks.', coins: 6, bond: 3, xp: 18, stats: { energy: -8, trust: 8, social: 3 }, questKeys: ['shared-actions-15'] },
  explore: { label: 'Explore Together', message: 'explored a pixel path.', coins: 14, bond: 4, xp: 16, stats: { happiness: 18, energy: -16, hunger: -10, social: 7 }, questKeys: ['shared-actions-15'] },
};

export const sharedGifts = [
  { id: 'tiny-heart', name: 'Tiny Heart', emoji: '💗', cost: 18, happiness: 8, bond: 5 },
  { id: 'pixel-flower', name: 'Pixel Flower', emoji: '🌷', cost: 28, happiness: 12, bond: 7 },
  { id: 'sweet-cookie', name: 'Sweet Cookie', emoji: '🍪', cost: 24, happiness: 14, bond: 4 },
  { id: 'lucky-star', name: 'Lucky Star', emoji: '⭐', cost: 36, happiness: 10, bond: 10 },
  { id: 'cozy-blanket', name: 'Cozy Blanket', emoji: '🧣', cost: 42, happiness: 8, bond: 12 },
  { id: 'mini-crown', name: 'Mini Crown', emoji: '👑', cost: 58, happiness: 18, bond: 14 },
  { id: 'friendship-ribbon', name: 'Friendship Ribbon', emoji: '🎀', cost: 48, happiness: 14, bond: 16 },
  { id: 'couple-charm', name: 'Couple Charm', emoji: '💞', cost: 70, happiness: 20, bond: 20 },
];

export const sharedShopItems = [
  { id: 'couple-bed', name: 'Couple Bed', type: 'decoration', emoji: '🛏️', cost: 120 },
  { id: 'heart-rug', name: 'Heart Rug', type: 'decoration', emoji: '💟', cost: 70 },
  { id: 'double-food-bowl', name: 'Double Food Bowl', type: 'decoration', emoji: '🥣', cost: 90 },
  { id: 'pair-ribbon', name: 'Pair Ribbon', type: 'accessory', emoji: '🎀', cost: 95 },
  { id: 'love-lamp', name: 'Love Lamp', type: 'decoration', emoji: '💡', cost: 105 },
  { id: 'cozy-sofa', name: 'Cozy Sofa', type: 'decoration', emoji: '🛋️', cost: 130 },
  { id: 'picnic-set', name: 'Picnic Set', type: 'decoration', emoji: '🧺', cost: 115 },
  { id: 'starry-window', name: 'Starry Window', type: 'decoration', emoji: '🌠', cost: 145 },
  { id: 'couple-frame', name: 'Couple Frame', type: 'decoration', emoji: '🖼️', cost: 100 },
  { id: 'matching-hats', name: 'Matching Hats', type: 'accessory', emoji: '🎩', cost: 150 },
];

function stampToMillis(value: unknown): number | null {
  return value instanceof Timestamp ? value.toMillis() : null;
}
function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}
function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}
function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
function levelFromXp(level: number, xp: number): { level: number; xp: number } {
  let nextLevel = Math.min(50, Math.max(1, Math.floor(level)));
  let nextXp = Math.max(0, Math.floor(xp));
  while (nextLevel < 50 && nextXp >= 100) {
    nextLevel += 1;
    nextXp -= 100;
  }
  return { level: nextLevel, xp: nextXp };
}
function coupleTitle(level: number): string {
  if (level >= 50) return 'Forever Paws';
  if (level >= 40) return 'Legendary Keepers';
  if (level >= 30) return 'Cozy Couple';
  if (level >= 20) return 'Pixel Soulmates';
  if (level >= 10) return 'Pet Parents';
  if (level >= 5) return 'Cute Duo';
  return 'New Keepers';
}
export function getCoupleTitle(level: number): string {
  return coupleTitle(level);
}
function sharedMood(pet: Pick<SharedPet, 'health' | 'hunger' | 'energy' | 'cleanliness' | 'happiness' | 'affection' | 'social'>): string {
  if (pet.health < 35) return 'Sick';
  if (pet.hunger < 25) return 'Hungry';
  if (pet.energy < 25) return 'Sleepy';
  if (pet.cleanliness < 25) return 'Dirty';
  if (pet.happiness < 30) return 'Sad';
  if (pet.affection > 75 && pet.social > 65) return 'Loved';
  return 'Happy';
}
function generateInviteCode(): string {
  return Array.from({ length: 6 }, () => INVITE_ALPHABET[Math.floor(Math.random() * INVITE_ALPHABET.length)] ?? 'P').join('');
}
function todayKey(): string {
  return new Date().toLocaleDateString('en-CA');
}
function nextWeekKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString('en-CA');
}
function mapRoom(docSnap: QueryDocumentSnapshot | { id: string; data: () => Record<string, unknown> }): CoupleRoom {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    inviteCode: asString(data.inviteCode),
    roomName: asString(data.roomName, 'Pixel Couple Room'),
    ownerName: asString(data.ownerName, 'Owner'),
    ownerUid: asString(data.ownerUid),
    guestName: data.guestName === null ? null : asString(data.guestName, ''),
    guestUid: data.guestUid === null ? null : asString(data.guestUid, ''),
    status: ['waiting', 'active', 'closed'].includes(asString(data.status)) ? (asString(data.status) as CoupleRoom['status']) : 'waiting',
    activeSharedPetId: asString(data.activeSharedPetId, MAIN_PET_ID),
    coupleBond: clamp(asNumber(data.coupleBond, 10)),
    coupleXp: Math.max(0, asNumber(data.coupleXp, 0)),
    coupleLevel: Math.min(50, Math.max(1, asNumber(data.coupleLevel, 1))),
    coupleStreak: Math.max(0, asNumber(data.coupleStreak, 1)),
    sharedCoins: Math.max(0, asNumber(data.sharedCoins, 120)),
    updatedAtMs: stampToMillis(data.updatedAt),
    lastActivityAtMs: stampToMillis(data.lastActivityAt),
  };
}
function mapPet(id: string, data: Record<string, unknown>): SharedPet {
  return {
    id,
    species: asString(data.species, 'Kucing'),
    name: asString(data.name, 'Mochi'),
    level: Math.min(50, Math.max(1, asNumber(data.level, 1))),
    xp: clamp(asNumber(data.xp, 0)),
    hunger: clamp(asNumber(data.hunger, 80)),
    happiness: clamp(asNumber(data.happiness, 80)),
    energy: clamp(asNumber(data.energy, 80)),
    cleanliness: clamp(asNumber(data.cleanliness, 80)),
    health: clamp(asNumber(data.health, 90)),
    affection: clamp(asNumber(data.affection, 30)),
    social: clamp(asNumber(data.social, 25)),
    trust: clamp(asNumber(data.trust, 25)),
    mood: asString(data.mood, 'Happy'),
    activeHabitat: asString(data.activeHabitat, 'Cozy Room'),
    activeAccessory: data.activeAccessory === null ? null : asString(data.activeAccessory, ''),
    lastCaredBy: data.lastCaredBy === null ? null : asString(data.lastCaredBy, ''),
  };
}

export function useFirebaseReady() {
  return useMemo(() => ({ configured: isFirebaseConfigured(), db, auth }), []);
}

export function useAnonymousAuth() {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signIn = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setError('Online Couple Mode needs Firebase setup.');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await ensureAnonymousUser();
      setUid(user.uid);
      return user;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anonymous auth failed.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, (user) => setUid(user?.uid ?? null));
  }, []);
  return { uid, loading, error, signIn };
}

export function useClientNickname() {
  const [nickname, setNicknameState] = useState('');
  useEffect(() => {
    setNicknameState(window.localStorage.getItem(NICKNAME_KEY) ?? '');
  }, []);
  const setNickname = useCallback((value: string) => {
    setNicknameState(value);
    window.localStorage.setItem(NICKNAME_KEY, value);
  }, []);
  return { nickname, setNickname };
}

async function createDefaultRoomDocs(roomId: string, inviteCode: string, nickname: string, roomName: string, uid: string) {
  if (!db) throw new Error('Firebase is not configured.');
  const roomRef = doc(db, 'rooms', roomId);
  const batch = writeBatch(db);
  batch.set(roomRef, {
    inviteCode,
    roomName: roomName.trim() || `${nickname}'s Pixel Room`,
    ownerName: nickname,
    ownerUid: uid,
    guestName: null,
    guestUid: null,
    status: 'waiting',
    activeSharedPetId: MAIN_PET_ID,
    coupleBond: 10,
    coupleXp: 0,
    coupleLevel: 1,
    coupleStreak: 1,
    sharedCoins: 160,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp(),
  });
  batch.set(doc(roomRef, 'sharedPets', MAIN_PET_ID), {
    species: 'Kucing',
    name: 'Pixel Mochi',
    level: 1,
    xp: 0,
    hunger: 82,
    happiness: 84,
    energy: 86,
    cleanliness: 88,
    health: 92,
    affection: 35,
    social: 25,
    trust: 30,
    mood: 'Happy',
    activeHabitat: 'Cozy Room',
    activeAccessory: null,
    lastCaredBy: null,
    lastActionAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(roomRef, 'events', crypto.randomUUID()), {
    actorName: nickname,
    actorUid: uid,
    eventType: 'create-room',
    message: `${nickname} created the couple room.`,
    metadata: { inviteCode },
    createdAt: serverTimestamp(),
  });
  [...dailyQuests, ...weeklyQuests].forEach(([questKey, questType, progress, goal, rewardType, rewardAmount]) => {
    batch.set(doc(roomRef, 'coupleQuests', questKey), {
      questKey,
      questType,
      progress,
      goal,
      completed: false,
      claimed: false,
      rewardType,
      rewardAmount,
      resetDate: questType === 'daily' ? todayKey() : nextWeekKey(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

export function useCreateRoom() {
  const { signIn } = useAnonymousAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createRoom = useCallback(async (nickname: string, roomName: string) => {
    if (!db) {
      setError('Online Couple Mode needs Firebase setup.');
      return null;
    }
    const cleanName = nickname.trim();
    if (!cleanName) {
      setError('Nickname is required.');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await signIn();
      if (!user) throw new Error('Anonymous auth failed.');
      let inviteCode = generateInviteCode();
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const existing = await getDocs(query(collection(db, 'rooms'), where('inviteCode', '==', inviteCode), limit(1)));
        if (existing.empty) break;
        inviteCode = generateInviteCode();
        if (attempt === 4) throw new Error('Could not generate invite code. Please try again.');
      }
      const roomRef = doc(collection(db, 'rooms'));
      await createDefaultRoomDocs(roomRef.id, inviteCode, cleanName, roomName, user.uid);
      window.localStorage.setItem(LAST_ROOM_KEY, roomRef.id);
      return roomRef.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create room failed.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [signIn]);
  return { createRoom, loading, error };
}

export function useJoinRoom() {
  const { signIn } = useAnonymousAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const joinRoom = useCallback(async (nickname: string, inviteCode: string) => {
    if (!db) {
      setError('Online Couple Mode needs Firebase setup.');
      return null;
    }
    const cleanName = nickname.trim();
    const code = inviteCode.trim().toUpperCase();
    if (!cleanName || code.length !== 6) {
      setError('Nickname and a 6-character invite code are required.');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await signIn();
      if (!user) throw new Error('Anonymous auth failed.');
      const rooms = await getDocs(query(collection(db, 'rooms'), where('inviteCode', '==', code), limit(1)));
      if (rooms.empty) throw new Error('Invite code not found.');
      const roomDoc = rooms.docs[0];
      if (!roomDoc) throw new Error('Invite code not found.');
      const roomRef = doc(db, 'rooms', roomDoc.id);
      const room = await runTransaction(db, async (transaction) => {
        const latest = await transaction.get(roomRef);
        if (!latest.exists()) throw new Error('Invite code not found.');
        const data = latest.data();
        if (data.status === 'closed') throw new Error('This room is closed.');
        const guestUid = asString(data.guestUid, '');
        const ownerUid = asString(data.ownerUid, '');
        if (guestUid && guestUid !== user.uid && ownerUid !== user.uid) throw new Error('This room is already full.');
        transaction.update(roomRef, {
          guestName: ownerUid === user.uid ? data.guestName ?? cleanName : cleanName,
          guestUid: ownerUid === user.uid ? data.guestUid ?? user.uid : user.uid,
          status: 'active',
          updatedAt: serverTimestamp(),
          lastActivityAt: serverTimestamp(),
        });
        transaction.set(doc(roomRef, 'events', crypto.randomUUID()), {
          actorName: cleanName,
          actorUid: user.uid,
          eventType: 'join-room',
          message: `${cleanName} joined the room.`,
          metadata: { inviteCode: code },
          createdAt: serverTimestamp(),
        });
        return latest.id;
      });
      window.localStorage.setItem(LAST_ROOM_KEY, room);
      return room;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Join room failed.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [signIn]);
  return { joinRoom, loading, error };
}

export function useRoomRealtime(roomId: string | null) {
  const [room, setRoom] = useState<CoupleRoom | null>(null);
  const [pet, setPet] = useState<SharedPet | null>(null);
  const [events, setEvents] = useState<RoomEvent[]>([]);
  const [presence, setPresence] = useState<PresenceEntry[]>([]);
  const [quests, setQuests] = useState<CoupleQuest[]>([]);
  const [inventory, setInventory] = useState<SharedInventoryItem[]>([]);
  const [album, setAlbum] = useState<CoupleMemory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !roomId) return undefined;
    const unsubs: Array<() => void> = [];
    const roomRef = doc(db, 'rooms', roomId);
    let petUnsubscribe: (() => void) | null = null;
    unsubs.push(onSnapshot(roomRef, (snap) => {
      if (!snap.exists()) {
        setRoom(null);
        setPet(null);
        return;
      }
      const nextRoom = mapRoom({ id: snap.id, data: () => snap.data() });
      setRoom(nextRoom);
      if (petUnsubscribe) petUnsubscribe();
      const petRef = doc(roomRef, 'sharedPets', nextRoom.activeSharedPetId);
      petUnsubscribe = onSnapshot(petRef, (petSnap) => {
        setPet(petSnap.exists() ? mapPet(petSnap.id, petSnap.data()) : null);
      }, () => setError('Connection issue. Please try again.'));
    }, () => setError('Connection issue. Please try again.')));
    unsubs.push(onSnapshot(query(collection(roomRef, 'events'), orderBy('createdAt', 'desc'), limit(30)), (snap) => {
      setEvents(snap.docs.map((eventDoc) => {
        const data = eventDoc.data();
        return { id: eventDoc.id, actorName: asString(data.actorName, 'Someone'), actorUid: asString(data.actorUid), eventType: asString(data.eventType), message: asString(data.message), createdAtMs: stampToMillis(data.createdAt) };
      }));
    }, () => setError('Connection issue. Please try again.')));
    unsubs.push(onSnapshot(collection(roomRef, 'presence'), (snap) => {
      setPresence(snap.docs.map((presenceDoc) => {
        const data = presenceDoc.data();
        return { id: presenceDoc.id, nickname: asString(data.nickname, 'Friend'), uid: asString(data.uid, presenceDoc.id), lastSeenAtMs: stampToMillis(data.lastSeenAt) };
      }));
    }, () => setError('Connection issue. Please try again.')));
    unsubs.push(onSnapshot(collection(roomRef, 'coupleQuests'), (snap) => {
      setQuests(snap.docs.map((questDoc) => {
        const data = questDoc.data();
        return { id: questDoc.id, questKey: asString(data.questKey, questDoc.id), questType: asString(data.questType, 'daily') === 'weekly' ? 'weekly' : 'daily', progress: asNumber(data.progress), goal: Math.max(1, asNumber(data.goal, 1)), completed: asBoolean(data.completed) || asNumber(data.progress) >= asNumber(data.goal, 1), claimed: asBoolean(data.claimed), rewardType: asString(data.rewardType, 'coins') === 'item' ? 'item' : asString(data.rewardType, 'coins') === 'xp' ? 'xp' : 'coins', rewardAmount: asNumber(data.rewardAmount), resetDate: asString(data.resetDate) };
      }));
    }, () => setError('Connection issue. Please try again.')));
    unsubs.push(onSnapshot(collection(roomRef, 'sharedInventory'), (snap) => {
      setInventory(snap.docs.map((inventoryDoc) => {
        const data = inventoryDoc.data();
        return { id: inventoryDoc.id, itemId: asString(data.itemId, inventoryDoc.id), itemType: asString(data.itemType, 'decoration'), quantity: Math.max(0, asNumber(data.quantity, 1)), equipped: asBoolean(data.equipped) };
      }));
    }, () => setError('Connection issue. Please try again.')));
    unsubs.push(onSnapshot(query(collection(roomRef, 'coupleAlbum'), orderBy('createdAt', 'desc'), limit(100)), (snap) => {
      setAlbum(snap.docs.map((memoryDoc) => {
        const data = memoryDoc.data();
        return { id: memoryDoc.id, petName: asString(data.petName), petMood: asString(data.petMood), actorName: asString(data.actorName), actorUid: asString(data.actorUid), caption: asString(data.caption), habitat: asString(data.habitat), createdAtMs: stampToMillis(data.createdAt) };
      }));
    }, () => setError('Connection issue. Please try again.')));
    return () => {
      if (petUnsubscribe) petUnsubscribe();
      unsubs.forEach((unsubscribe) => unsubscribe());
    };
  }, [roomId]);

  return { room, pet, events, presence, quests, inventory, album, error };
}

export function useCoupleRoom(roomId: string | null) {
  return useRoomRealtime(roomId);
}

export function usePresence(roomId: string | null, nickname: string) {
  const { uid, signIn } = useAnonymousAuth();
  useEffect(() => {
    if (!db || !roomId || !nickname.trim()) return undefined;
    let cancelled = false;
    let intervalId: number | null = null;
    const updatePresence = async () => {
      const user = auth?.currentUser ?? await signIn();
      if (!user || cancelled || !db) return;
      await setDoc(doc(db, 'rooms', roomId, 'presence', user.uid), { nickname, uid: user.uid, lastSeenAt: serverTimestamp() }, { merge: true });
    };
    void updatePresence();
    intervalId = window.setInterval(() => void updatePresence(), 30000);
    return () => {
      cancelled = true;
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [roomId, nickname, signIn]);
  return { uid };
}

async function progressQuests(roomId: string, questKeys: string[]) {
  if (!db) return;
  const roomRef = doc(db, 'rooms', roomId);
  await Promise.all(questKeys.map(async (questKey) => {
    const questRef = doc(roomRef, 'coupleQuests', questKey);
    const snap = await getDoc(questRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const goal = Math.max(1, asNumber(data.goal, 1));
    const progress = Math.min(goal, asNumber(data.progress) + 1);
    await updateDoc(questRef, { progress, completed: progress >= goal, updatedAt: serverTimestamp() });
  }));
}

export function useSharedPetActions(roomId: string | null, petId: string | null, nickname: string) {
  const { signIn } = useAnonymousAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const runAction = useCallback(async (key: SharedActionKey) => {
    if (!db || !roomId || !petId) return false;
    const effect = actionEffects[key];
    setLoadingAction(key);
    setError(null);
    try {
      const user = await signIn();
      if (!user) throw new Error('Anonymous auth failed.');
      const roomRef = doc(db, 'rooms', roomId);
      const petRef = doc(roomRef, 'sharedPets', petId);
      await runTransaction(db, async (transaction) => {
        const petSnap = await transaction.get(petRef);
        const roomSnap = await transaction.get(roomRef);
        if (!petSnap.exists() || !roomSnap.exists()) throw new Error('Room is not ready.');
        const currentPet = mapPet(petSnap.id, petSnap.data());
        const currentRoom = mapRoom({ id: roomSnap.id, data: () => roomSnap.data() });
        const xpLevel = levelFromXp(currentPet.level, currentPet.xp + effect.xp);
        const nextPet: Partial<SharedPet> = {
          hunger: clamp(currentPet.hunger + (effect.stats.hunger ?? 0)),
          happiness: clamp(currentPet.happiness + (effect.stats.happiness ?? 0)),
          energy: clamp(currentPet.energy + (effect.stats.energy ?? 0)),
          cleanliness: clamp(currentPet.cleanliness + (effect.stats.cleanliness ?? 0)),
          health: clamp(currentPet.health + (effect.stats.health ?? 0)),
          affection: clamp(currentPet.affection + (effect.stats.affection ?? 0)),
          social: clamp(currentPet.social + (effect.stats.social ?? 0)),
          trust: clamp(currentPet.trust + (effect.stats.trust ?? 0)),
          level: xpLevel.level,
          xp: xpLevel.xp,
          lastCaredBy: nickname,
        };
        nextPet.mood = sharedMood(nextPet as SharedPet);
        const coupleXpTotal = currentRoom.coupleXp + effect.xp;
        const coupleLevel = Math.min(50, currentRoom.coupleLevel + Math.floor(coupleXpTotal / 120));
        transaction.update(petRef, { ...nextPet, lastActionAt: serverTimestamp(), updatedAt: serverTimestamp() });
        transaction.update(roomRef, { coupleBond: clamp(currentRoom.coupleBond + effect.bond), coupleXp: coupleXpTotal % 120, coupleLevel, sharedCoins: Math.max(0, currentRoom.sharedCoins + effect.coins), updatedAt: serverTimestamp(), lastActivityAt: serverTimestamp() });
        transaction.set(doc(roomRef, 'events', crypto.randomUUID()), { actorName: nickname, actorUid: user.uid, eventType: key, message: `${nickname} ${effect.message}`, metadata: { action: key }, createdAt: serverTimestamp() });
      });
      await progressQuests(roomId, effect.questKeys);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed. Please try again.');
      return false;
    } finally {
      setLoadingAction(null);
    }
  }, [roomId, petId, nickname, signIn]);
  return { actions: actionEffects, runAction, loadingAction, error };
}

export function useCoupleQuests(roomId: string | null, quests: CoupleQuest[]) {
  const { signIn } = useAnonymousAuth();
  const [loadingQuest, setLoadingQuest] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const claimQuest = useCallback(async (questId: string) => {
    if (!db || !roomId) return false;
    setLoadingQuest(questId);
    setError(null);
    try {
      await signIn();
      const roomRef = doc(db, 'rooms', roomId);
      const questRef = doc(roomRef, 'coupleQuests', questId);
      await runTransaction(db, async (transaction) => {
        const questSnap = await transaction.get(questRef);
        const roomSnap = await transaction.get(roomRef);
        if (!questSnap.exists() || !roomSnap.exists()) throw new Error('Quest not found.');
        const questData = questSnap.data();
        const progress = asNumber(questData.progress);
        const goal = asNumber(questData.goal, 1);
        if (asBoolean(questData.claimed) || progress < goal) throw new Error('Quest is not ready.');
        const room = mapRoom({ id: roomSnap.id, data: () => roomSnap.data() });
        const rewardType = asString(questData.rewardType, 'coins');
        const rewardAmount = asNumber(questData.rewardAmount);
        transaction.update(questRef, { claimed: true, completed: true, updatedAt: serverTimestamp() });
        transaction.update(roomRef, { sharedCoins: rewardType === 'coins' ? room.sharedCoins + rewardAmount : room.sharedCoins, coupleXp: rewardType === 'xp' ? room.coupleXp + rewardAmount : room.coupleXp, coupleBond: clamp(room.coupleBond + 5), updatedAt: serverTimestamp(), lastActivityAt: serverTimestamp() });
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Quest claim failed.');
      return false;
    } finally {
      setLoadingQuest(null);
    }
  }, [roomId, signIn]);
  return { quests, claimQuest, loadingQuest, error };
}

export function useCoupleAlbum(roomId: string | null, pet: SharedPet | null, nickname: string, memories: CoupleMemory[]) {
  const { signIn } = useAnonymousAuth();
  const [error, setError] = useState<string | null>(null);
  const takePhoto = useCallback(async (caption: string) => {
    if (!db || !roomId || !pet) return false;
    try {
      const user = await signIn();
      if (!user) throw new Error('Anonymous auth failed.');
      const roomRef = doc(db, 'rooms', roomId);
      await addDoc(collection(roomRef, 'coupleAlbum'), { petName: pet.name, petMood: pet.mood, actorName: nickname, actorUid: user.uid, caption: caption.slice(0, 120), habitat: pet.activeHabitat, createdAt: serverTimestamp() });
      await addDoc(collection(roomRef, 'events'), { actorName: nickname, actorUid: user.uid, eventType: 'photo', message: `${nickname} took a couple photo.`, metadata: { caption: caption.slice(0, 80) }, createdAt: serverTimestamp() });
      await progressQuests(roomId, ['take-photo', 'shared-actions-15']);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Photo failed.');
      return false;
    }
  }, [roomId, pet, nickname, signIn]);
  const deleteMemory = useCallback(async (memoryId: string) => {
    if (!db || !roomId) return;
    await deleteDoc(doc(db, 'rooms', roomId, 'coupleAlbum', memoryId));
  }, [roomId]);
  return { memories, takePhoto, deleteMemory, error };
}


export function useGiftAction(roomId: string | null, petId: string | null, nickname: string) {
  const { signIn } = useAnonymousAuth();
  const [loadingGift, setLoadingGift] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const giveGift = useCallback(async (giftId: string) => {
    const gift = sharedGifts.find((entry) => entry.id === giftId);
    if (!db || !roomId || !petId || !gift) return false;
    setLoadingGift(giftId);
    setError(null);
    try {
      const user = await signIn();
      if (!user) throw new Error('Anonymous auth failed.');
      const roomRef = doc(db, 'rooms', roomId);
      const petRef = doc(roomRef, 'sharedPets', petId);
      await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        const petSnap = await transaction.get(petRef);
        if (!roomSnap.exists() || !petSnap.exists()) throw new Error('Room is not ready.');
        const room = mapRoom({ id: roomSnap.id, data: () => roomSnap.data() });
        const pet = mapPet(petSnap.id, petSnap.data());
        if (room.sharedCoins < gift.cost) throw new Error('Not enough shared coins.');
        const nextPet = {
          happiness: clamp(pet.happiness + gift.happiness),
          affection: clamp(pet.affection + Math.ceil(gift.bond / 2)),
          social: clamp(pet.social + 4),
          trust: clamp(pet.trust + 4),
        };
        transaction.update(roomRef, { sharedCoins: room.sharedCoins - gift.cost, coupleBond: clamp(room.coupleBond + gift.bond), coupleXp: room.coupleXp + 8, updatedAt: serverTimestamp(), lastActivityAt: serverTimestamp() });
        transaction.update(petRef, { ...nextPet, mood: sharedMood({ ...pet, ...nextPet }), lastCaredBy: nickname, lastActionAt: serverTimestamp(), updatedAt: serverTimestamp() });
        transaction.set(doc(roomRef, 'events', crypto.randomUUID()), { actorName: nickname, actorUid: user.uid, eventType: 'gift', message: `${nickname} sent ${gift.name}.`, metadata: { giftId }, createdAt: serverTimestamp() });
      });
      await progressQuests(roomId, ['send-gift', 'shared-actions-15']);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gift failed. Please try again.');
      return false;
    } finally {
      setLoadingGift(null);
    }
  }, [roomId, petId, nickname, signIn]);
  return { giveGift, loadingGift, error };
}

export function useSharedInventory(roomId: string | null) {
  const { signIn } = useAnonymousAuth();
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const buyItem = useCallback(async (itemId: string) => {
    const item = sharedShopItems.find((entry) => entry.id === itemId);
    if (!db || !roomId || !item) return false;
    setLoadingItem(itemId);
    setError(null);
    try {
      await signIn();
      const roomRef = doc(db, 'rooms', roomId);
      const itemRef = doc(roomRef, 'sharedInventory', item.id);
      await runTransaction(db, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        const itemSnap = await transaction.get(itemRef);
        if (!roomSnap.exists()) throw new Error('Room not found.');
        const room = mapRoom({ id: roomSnap.id, data: () => roomSnap.data() });
        if (itemSnap.exists()) throw new Error('Item already owned.');
        if (room.sharedCoins < item.cost) throw new Error('Not enough shared coins.');
        transaction.update(roomRef, { sharedCoins: room.sharedCoins - item.cost, updatedAt: serverTimestamp() });
        transaction.set(itemRef, { itemId: item.id, itemType: item.type, quantity: 1, equipped: false, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      });
      await progressQuests(roomId, ['unlock-decoration']);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Buy item failed.');
      return false;
    } finally {
      setLoadingItem(null);
    }
  }, [roomId, signIn]);
  const equipItem = useCallback(async (itemId: string, equipped: boolean) => {
    if (!db || !roomId) return;
    await updateDoc(doc(db, 'rooms', roomId, 'sharedInventory', itemId), { equipped, updatedAt: serverTimestamp() });
  }, [roomId]);
  return { buyItem, equipItem, loadingItem, error };
}

export function useRoomExit(roomId: string | null, nickname: string) {
  const { signIn } = useAnonymousAuth();
  const [error, setError] = useState<string | null>(null);
  const leaveRoom = useCallback(async () => {
    if (!db || !roomId) return false;
    try {
      const user = await signIn();
      if (!user) return false;
      const roomRef = doc(db, 'rooms', roomId);
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(roomRef);
        if (!snap.exists()) return;
        const data = snap.data();
        if (data.ownerUid === user.uid) {
          transaction.update(roomRef, { status: 'closed', updatedAt: serverTimestamp(), lastActivityAt: serverTimestamp() });
        } else if (data.guestUid === user.uid) {
          transaction.update(roomRef, { guestName: null, guestUid: null, status: 'waiting', updatedAt: serverTimestamp(), lastActivityAt: serverTimestamp() });
        }
        transaction.set(doc(roomRef, 'events', crypto.randomUUID()), { actorName: nickname, actorUid: user.uid, eventType: 'leave-room', message: `${nickname} left the room.`, metadata: {}, createdAt: serverTimestamp() });
      });
      window.localStorage.removeItem(LAST_ROOM_KEY);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Leave room failed.');
      return false;
    }
  }, [roomId, nickname, signIn]);
  const kickGuest = useCallback(async () => {
    if (!db || !roomId) return false;
    try {
      const user = await signIn();
      if (!user) return false;
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, { guestName: null, guestUid: null, status: 'waiting', updatedAt: serverTimestamp(), lastActivityAt: serverTimestamp() });
      await addDoc(collection(roomRef, 'events'), { actorName: nickname, actorUid: user.uid, eventType: 'kick-guest', message: `${nickname} reset the guest slot.`, metadata: {}, createdAt: serverTimestamp() });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kick guest failed.');
      return false;
    }
  }, [roomId, nickname, signIn]);
  return { leaveRoom, kickGuest, error };
}

export function getStoredRoomId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LAST_ROOM_KEY);
}
