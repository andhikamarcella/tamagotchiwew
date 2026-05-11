'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
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
import { auth, db, getFirebaseAuth, getFirebaseDb, isFirebaseConfigured } from '@/src/lib/firebase';
import { getFriendlyFirebaseError } from '@/src/lib/firebaseErrors';
import { generateInviteCode, isValidInviteCode, normalizeInviteCode } from '@/src/lib/inviteCode';
import type { ChatMessage, CoinTransfer, CoupleMemory, CoupleQuest, CoupleRoom, PresenceEntry, RoomEvent, SharedActionKey, SharedInventoryItem, SharedPet } from '@/src/lib/coupleTypes';

const NICKNAME_KEY = 'pixel-pals-couple-nickname';
const LAST_ROOM_KEY = 'pixel-pals-couple-room-id';
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function mapChatMessage(id: string, data: Record<string, unknown>): ChatMessage {
  const type = asString(data.type, 'text');
  return {
    id,
    senderUid: asString(data.senderUid),
    senderName: asString(data.senderName, 'Someone'),
    senderPhotoURL: data.senderPhotoURL === null ? null : asString(data.senderPhotoURL, ''),
    type: ['text','emoji','system','coin_transfer','gift','pet_action'].includes(type) ? type as ChatMessage['type'] : 'text',
    text: data.text === null ? null : asString(data.text, ''),
    emoji: data.emoji === null ? null : asString(data.emoji, ''),
    metadata: asRecord(data.metadata),
    reactionCounts: Object.fromEntries(Object.entries(asRecord(data.reactionCounts)).map(([key, value]) => [key, Math.max(0, asNumber(value))])),
    createdAtMs: stampToMillis(data.createdAt),
    editedAtMs: stampToMillis(data.editedAt),
    deletedAtMs: stampToMillis(data.deletedAt),
  };
}
function mapCoinTransfer(id: string, data: Record<string, unknown>): CoinTransfer {
  return { id, fromUid: asString(data.fromUid), fromName: asString(data.fromName, 'Someone'), toUid: asString(data.toUid), toName: asString(data.toName, 'Partner'), amount: Math.max(0, asNumber(data.amount)), message: asString(data.message), status: 'completed', actionId: asString(data.actionId, id), createdAtMs: stampToMillis(data.createdAt) };
}
function sanitizeChatText(text: string): { ok: true; text: string } | { ok: false; error: string } {
  const clean = text.trim().replace(/\s+/g, ' ');
  if (!clean) return { ok:false, error:'Empty message blocked.' };
  if (clean.length > 280) return { ok:false, error:'Message is too long.' };
  if (/(.)\1{40,}/u.test(clean)) return { ok:false, error:'Please avoid repeated spam characters.' };
  return { ok:true, text: clean };
}
function friendlySocialError(err: unknown): string {
  const message = err instanceof Error ? err.message : '';
  if (['Not enough coins.','Enter a valid amount.','You can’t send coins to yourself.','Partner not found.','Daily transfer limit reached.','Please slow down.','Empty message blocked.','Message is too long.','Please avoid repeated spam characters.'].includes(message)) return message;
  if (message.toLowerCase().includes('permission')) return 'Permission denied. Check Firestore rules.';
  return 'Connection issue. Please try again.';
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
  return useMemo(() => ({ configured: isFirebaseConfigured(), db: getFirebaseDb(), auth: getFirebaseAuth() }), []);
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
      const firebaseAuth = getFirebaseAuth();
      const user = firebaseAuth?.currentUser ?? null;
      if (!user) throw { code: 'unauthenticated' };
      setUid(user.uid);
      return user;
    } catch (err) {
      setError(getFriendlyFirebaseError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) return undefined;
    return onAuthStateChanged(firebaseAuth, (user) => setUid(user?.uid ?? null));
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

async function createDefaultRoomDocs(inviteCode: string, nickname: string, roomName: string, user: { uid: string; photoURL: string | null }) {
  const firebaseDb = getFirebaseDb();
  if (!firebaseDb) throw new Error('Firebase is not configured.');
  const roomRef = doc(collection(firebaseDb, 'rooms'));
  const petRef = doc(collection(roomRef, 'sharedPets'));
  const eventRef = doc(collection(roomRef, 'events'));
  const batch = writeBatch(firebaseDb);
  const trimmedRoomName = roomName.trim();

  batch.set(roomRef, {
    inviteCode,
    roomName: trimmedRoomName || `${nickname}'s Pixel Room`,
    ownerName: nickname,
    ownerUid: user.uid,
    ownerPhotoURL: user.photoURL,
    guestName: null,
    guestUid: null,
    guestPhotoURL: null,
    status: 'waiting',
    activeSharedPetId: petRef.id,
    coupleBond: 0,
    coupleXp: 0,
    coupleLevel: 1,
    coupleStreak: 0,
    sharedCoins: 100,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActivityAt: serverTimestamp(),
  });
  batch.set(petRef, {
    species: 'cat',
    name: 'Pixel',
    level: 1,
    xp: 0,
    hunger: 80,
    happiness: 80,
    energy: 80,
    cleanliness: 80,
    health: 100,
    affection: 50,
    social: 50,
    trust: 50,
    mood: 'Happy',
    activeHabitat: 'cozy-room',
    activeAccessory: null,
    lastCaredBy: null,
    lastActionAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(eventRef, {
    actorName: nickname,
    actorUid: user.uid,
    eventType: 'room_created',
    message: `${nickname} created the room.`,
    metadata: {},
    createdAt: serverTimestamp(),
  });
  await batch.commit();
  return roomRef.id;
}

export type CreateRoomStep = 'idle' | 'checking-auth' | 'generating-code' | 'checking-code' | 'creating-room' | 'done' | 'timeout';
export type CreateRoomResult = { roomId: string; inviteCode: string };

export function useCreateRoom() {
  const { signIn } = useAnonymousAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createStep, setCreateStep] = useState<CreateRoomStep>('idle');
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const createRoom = useCallback(async (nickname: string, roomName: string): Promise<CreateRoomResult | null> => {
    if (loading) return null;

    setLoading(true);
    setCreateStep('checking-auth');
    setInviteCode(null);
    setError(null);

    let timedOut = false;
    let timeout: number | undefined;

    try {
      timeout = window.setTimeout(() => {
        timedOut = true;
        setLoading(false);
        setCreateStep('timeout');
        setError('Connection timeout. Please try again.');
      }, 15000);

      if (!isFirebaseConfigured()) throw new Error('Firebase is not configured.');
      const firebaseDb = getFirebaseDb();
      if (!firebaseDb) throw new Error('Firebase is not configured.');
      const cleanName = nickname.trim();
      if (!cleanName) throw new Error('Nickname is required.');

      const user = await signIn();
      if (!user) throw { code: 'unauthenticated' };
      if (timedOut) return null;

      setCreateStep('generating-code');
      let nextCode: string | null = null;
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const candidate = generateInviteCode();
        setCreateStep('checking-code');
        const existing = await getDocs(query(collection(firebaseDb, 'rooms'), where('inviteCode', '==', candidate), limit(1)));
        if (existing.empty) {
          nextCode = candidate;
          break;
        }
      }
      if (!nextCode) throw new Error('Could not generate a unique invite code. Please try again.');
      if (timedOut) return null;

      setCreateStep('creating-room');
      const roomId = await createDefaultRoomDocs(nextCode, cleanName, roomName, { uid: user.uid, photoURL: user.photoURL ?? null });
      if (timedOut) return null;

      window.localStorage.setItem(LAST_ROOM_KEY, roomId);
      setInviteCode(nextCode);
      setCreateStep('done');
      return { roomId, inviteCode: nextCode };
    } catch (err) {
      console.error('Create room failed:', err);
      setError(getFriendlyFirebaseError(err));
      return null;
    } finally {
      if (timeout) window.clearTimeout(timeout);
      setLoading(false);
      setCreateStep((current) => (current === 'done' || current === 'timeout' ? current : 'idle'));
    }
  }, [loading, signIn]);

  return { createRoom, loading, error, createStep, inviteCode };
}

export function useJoinRoom() {
  const { signIn } = useAnonymousAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const joinRoom = useCallback(async (nickname: string, inviteCode: string) => {
    if (loading) return null;

    setLoading(true);
    setError(null);
    let timedOut = false;
    let timeout: number | undefined;

    try {
      timeout = window.setTimeout(() => {
        timedOut = true;
        setLoading(false);
        setError('Connection timeout. Please try again.');
      }, 15000);

      if (!isFirebaseConfigured()) throw new Error('Firebase is not configured.');
      const firebaseDb = getFirebaseDb();
      if (!firebaseDb) throw new Error('Firebase is not configured.');
      const cleanName = nickname.trim();
      const code = normalizeInviteCode(inviteCode);
      if (!cleanName) throw new Error('Nickname is required.');
      if (!isValidInviteCode(code)) throw new Error('Please enter a valid 6-character invite code.');

      const user = await signIn();
      if (!user) throw { code: 'unauthenticated' };
      if (timedOut) return null;

      const rooms = await getDocs(query(collection(firebaseDb, 'rooms'), where('inviteCode', '==', code), limit(1)));
      if (rooms.empty) throw new Error('Invite code not found.');
      const roomDoc = rooms.docs[0];
      if (!roomDoc) throw new Error('Invite code not found.');
      const roomRef = doc(firebaseDb, 'rooms', roomDoc.id);
      const room = await runTransaction(firebaseDb, async (transaction) => {
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
          guestPhotoURL: ownerUid === user.uid ? data.guestPhotoURL ?? user.photoURL : user.photoURL,
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
      if (timedOut) return null;
      window.localStorage.setItem(LAST_ROOM_KEY, room);
      return room;
    } catch (err) {
      console.error('Join room failed:', err);
      const friendly = err instanceof Error && ['Invite code not found.', 'This room is closed.', 'This room is already full.', 'Nickname is required.', 'Please enter a valid 6-character invite code.'].includes(err.message) ? err.message : getFriendlyFirebaseError(err);
      setError(friendly);
      return null;
    } finally {
      if (timeout) window.clearTimeout(timeout);
      setLoading(false);
    }
  }, [loading, signIn]);
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
      if (!user) throw { code: 'unauthenticated' };
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
      if (!user) throw { code: 'unauthenticated' };
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
      if (!user) throw { code: 'unauthenticated' };
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


export function useUserCoinBalance() {
  const { signIn } = useAnonymousAuth();
  const [coins, setCoins] = useState(0);
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => {
    const firebaseAuth = getFirebaseAuth();
    if (!firebaseAuth) return undefined;
    return onAuthStateChanged(firebaseAuth, (user) => {
      setUid(user?.uid ?? null);
      if (!user) setCoins(0);
    });
  }, []);
  useEffect(() => {
    if (!db || !uid) return undefined;
    return onSnapshot(doc(db, 'users', uid), (snap) => setCoins(Math.max(0, asNumber(snap.data()?.coins, 160))), () => setCoins(0));
  }, [uid]);
  const ensureUserDoc = useCallback(async () => {
    const user = await signIn();
    if (!user || !db) return null;
    await setDoc(doc(db, 'users', user.uid), { displayName: user.displayName ?? '', coins, updatedAt: serverTimestamp() }, { merge: true });
    return user;
  }, [coins, signIn]);
  return { uid, coins, ensureUserDoc };
}

export function useRoomMessages(roomId: string | null, nickname: string, showToast?: (message: string) => void) {
  const { signIn } = useAnonymousAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSentAtRef = useRef(0);
  const sentWindowRef = useRef<number[]>([]);
  const lastNotifyRef = useRef(0);

  useEffect(() => {
    if (!db || !roomId) return undefined;
    const q = query(collection(db, 'rooms', roomId, 'messages'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snap) => {
      const next = snap.docs.map((messageDoc) => mapChatMessage(messageDoc.id, messageDoc.data())).reverse();
      setMessages(next);
      const latest = next[next.length - 1];
      const user = getFirebaseAuth()?.currentUser;
      if (latest && user && latest.senderUid !== user.uid && latest.createdAtMs && Date.now() - latest.createdAtMs < 5000 && Date.now() - lastNotifyRef.current > 2000) {
        lastNotifyRef.current = Date.now();
        showToast?.(`${latest.senderName}: ${latest.deletedAtMs ? 'Message deleted' : latest.text ?? latest.emoji ?? 'New message'}`);
      }
    }, (err) => { console.error('Chat snapshot failed:', err); setError('Connection issue. Please try again.'); });
  }, [roomId, showToast]);

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    sentWindowRef.current = sentWindowRef.current.filter((ts) => now - ts < 60000);
    if (now - lastSentAtRef.current < 1500 || sentWindowRef.current.length >= 20) return false;
    lastSentAtRef.current = now;
    sentWindowRef.current.push(now);
    return true;
  }, []);

  const sendMessage = useCallback(async (rawText: string, type: ChatMessage['type'] = 'text', emoji?: string) => {
    if (!db || !roomId) return false;
    setError(null);
    if (!checkRateLimit()) { setError('Please slow down.'); return false; }
    const clean = type === 'emoji' ? { ok:true as const, text: emoji ?? rawText.trim() } : sanitizeChatText(rawText);
    if (!clean.ok) { setError(clean.error); return false; }
    setLoading(true);
    try {
      const user = await signIn();
      if (!user) throw new Error('Permission denied.');
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) throw new Error('Connection issue. Please try again.');
      const room = mapRoom({ id: roomSnap.id, data: () => roomSnap.data() });
      if (room.ownerUid !== user.uid && room.guestUid !== user.uid) throw new Error('Permission denied.');
      await addDoc(collection(roomRef, 'messages'), { senderUid:user.uid, senderName:nickname, senderPhotoURL:user.photoURL ?? null, type, text:type === 'emoji' ? null : clean.text, emoji:type === 'emoji' ? clean.text : null, metadata:{}, reactionCounts:{}, createdAt:serverTimestamp(), editedAt:null, deletedAt:null });
      return true;
    } catch (err) {
      console.error('Send chat failed:', err);
      setError(friendlySocialError(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [checkRateLimit, nickname, roomId, signIn]);

  const deleteMessage = useCallback(async (message: ChatMessage) => {
    if (!db || !roomId) return false;
    try {
      const user = await signIn();
      if (!user) throw new Error('Permission denied.');
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      if (!roomSnap.exists()) throw new Error('Connection issue. Please try again.');
      const room = mapRoom({ id: roomSnap.id, data: () => roomSnap.data() });
      if (message.senderUid !== user.uid && room.ownerUid !== user.uid) throw new Error('Permission denied.');
      await updateDoc(doc(roomRef, 'messages', message.id), { text:null, emoji:null, deletedAt:serverTimestamp(), editedAt:serverTimestamp() });
      return true;
    } catch (err) {
      console.error('Delete message failed:', err);
      setError(friendlySocialError(err));
      return false;
    }
  }, [roomId, signIn]);

  const reactToMessage = useCallback(async (messageId: string, emoji: string) => {
    if (!db || !roomId || !emoji) return false;
    try {
      const user = await signIn();
      if (!user) throw new Error('Permission denied.');
      const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
      const reactionRef = doc(messageRef, 'reactions', user.uid);
      await runTransaction(db, async (transaction) => {
        const reactionSnap = await transaction.get(reactionRef);
        const previous = reactionSnap.exists() ? asString(reactionSnap.data().emoji) : '';
        if (previous === emoji) {
          transaction.delete(reactionRef);
          transaction.update(messageRef, { [`reactionCounts.${emoji}`]: increment(-1), updatedAt: serverTimestamp() });
          return;
        }
        if (previous) transaction.update(messageRef, { [`reactionCounts.${previous}`]: increment(-1) });
        transaction.set(reactionRef, { uid:user.uid, emoji, createdAt:serverTimestamp() });
        transaction.update(messageRef, { [`reactionCounts.${emoji}`]: increment(1), updatedAt: serverTimestamp() });
      });
      return true;
    } catch (err) {
      console.error('React failed:', err);
      setError(friendlySocialError(err));
      return false;
    }
  }, [roomId, signIn]);

  return { messages, loading, error, sendMessage, deleteMessage, reactToMessage };
}

const transferLimit = { min: 1, maxPerTransfer: 500, maxPerDay: 2000 };
export function useCoinTransfer(roomId: string | null, nickname: string) {
  const { signIn } = useAnonymousAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transfers, setTransfers] = useState<CoinTransfer[]>([]);
  useEffect(() => {
    if (!db || !roomId) return undefined;
    return onSnapshot(query(collection(db, 'rooms', roomId, 'coinTransfers'), orderBy('createdAt', 'desc'), limit(20)), (snap) => setTransfers(snap.docs.map((docSnap) => mapCoinTransfer(docSnap.id, docSnap.data()))), () => setError('Connection issue. Please try again.'));
  }, [roomId]);

  const sendCoins = useCallback(async (amountInput: number, messageInput: string) => {
    const firestore = db;
    if (!firestore || !roomId || loading) return false;
    const amount = Math.floor(Number(amountInput));
    if (!Number.isFinite(amount) || amount < transferLimit.min || amount > transferLimit.maxPerTransfer) { setError('Enter a valid amount.'); return false; }
    const message = messageInput.trim().replace(/\s+/g, ' ').slice(0, 80);
    const actionId = crypto.randomUUID();
    setLoading(true);
    setError(null);
    try {
      const user = await signIn();
      if (!user) throw new Error('Permission denied.');
      const roomRef = doc(firestore, 'rooms', roomId);
      await runTransaction(firestore, async (transaction) => {
        const roomSnap = await transaction.get(roomRef);
        if (!roomSnap.exists()) throw new Error('Connection issue. Please try again.');
        const room = mapRoom({ id: roomSnap.id, data: () => roomSnap.data() });
        if (room.ownerUid !== user.uid && room.guestUid !== user.uid) throw new Error('Permission denied.');
        const toUid = room.ownerUid === user.uid ? room.guestUid : room.ownerUid;
        const toName = room.ownerUid === user.uid ? room.guestName : room.ownerName;
        if (!toUid || !toName) throw new Error('Partner not found.');
        if (toUid === user.uid) throw new Error('You can’t send coins to yourself.');
        const senderRef = doc(firestore, 'users', user.uid);
        const receiverRef = doc(firestore, 'users', toUid);
        const dailyRef = doc(firestore, 'users', user.uid, 'dailyLimits', todayKey());
        const transferRef = doc(roomRef, 'coinTransfers', actionId);
        const [senderSnap, receiverSnap, dailySnap, transferSnap] = await Promise.all([transaction.get(senderRef), transaction.get(receiverRef), transaction.get(dailyRef), transaction.get(transferRef)]);
        if (transferSnap.exists()) throw new Error('Connection issue. Please try again.');
        const sentToday = Math.max(0, asNumber(dailySnap.data()?.coinsSentToday, 0));
        if (sentToday + amount > transferLimit.maxPerDay) throw new Error('Daily transfer limit reached.');
        const senderCoins = Math.max(0, asNumber(senderSnap.data()?.coins, 160));
        const receiverCoins = Math.max(0, asNumber(receiverSnap.data()?.coins, 0));
        if (senderCoins < amount) throw new Error('Not enough coins.');
        transaction.set(senderRef, { coins: senderCoins - amount, updatedAt: serverTimestamp() }, { merge: true });
        transaction.set(receiverRef, { coins: receiverCoins + amount, updatedAt: serverTimestamp() }, { merge: true });
        transaction.set(dailyRef, { coinsSentToday: sentToday + amount, updatedAt: serverTimestamp() }, { merge: true });
        transaction.set(transferRef, { fromUid:user.uid, fromName:nickname, toUid, toName, amount, message, status:'completed', createdAt:serverTimestamp(), actionId });
        transaction.set(doc(roomRef, 'events', crypto.randomUUID()), { eventType:'coin_transfer', actorUid:user.uid, actorName:nickname, message:`${nickname} sent ${amount} coins to ${toName}.`, metadata:{ amount, toUid, toName }, createdAt:serverTimestamp() });
        transaction.set(doc(roomRef, 'messages', crypto.randomUUID()), { senderUid:user.uid, senderName:nickname, senderPhotoURL:user.photoURL ?? null, type:'coin_transfer', text:`Sent ${amount} coins to ${toName}${message ? ` — ${message}` : ''}`, emoji:'🪙', metadata:{ amount, toUid, toName, actionId }, reactionCounts:{}, createdAt:serverTimestamp(), editedAt:null, deletedAt:null });
      });
      return true;
    } catch (err) {
      console.error('Coin transfer failed:', err);
      setError(friendlySocialError(err));
      return false;
    } finally {
      setLoading(false);
    }
  }, [loading, nickname, roomId, signIn]);
  return { sendCoins, transfers, loading, error, limit: transferLimit };
}

export function getStoredRoomId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(LAST_ROOM_KEY);
}
