import { collection, doc, getDocs, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { Pet, SaveData } from '@/lib/types';
import { createKeepsake, createMemorial } from '@/lib/gameLogic';

const RESET_SUBCOLLECTIONS = [
  'pets',
  'inventory',
  'achievements',
  'activityLogs',
  'dailyGoals',
  'weeklyQuests',
  'collection',
  'mailbox',
  'roomDecor',
  'petRequests',
  'miniGameResults',
  'badges',
  'album',
  'settings',
  'saveState',
  'offlineSync',
  'singlePlayerState',
  'careCalendar',
  'moodTimeline',
  'skillTree',
  'training',
  'clinicVisits',
  'illnessHistory',
  'petJournal',
] as const;

type ResetResult = { ok: true; memorialCreated: boolean } | { ok: false; message: string };

async function deleteCollectionInChunks(db: Firestore, uid: string, name: string): Promise<void> {
  const snap = await getDocs(collection(db, 'users', uid, name));
  if (snap.empty) return;
  let batch = writeBatch(db);
  let count = 0;
  for (const item of snap.docs) {
    batch.delete(item.ref);
    count += 1;
    if (count >= 450) {
      await batch.commit();
      batch = writeBatch(db);
      count = 0;
    }
  }
  if (count > 0) await batch.commit();
}

export async function resetGameProgressAfterPetDeath({ uid, db, pet, save }: { uid: string; db: Firestore | null; pet: Pet; save: SaveData }): Promise<ResetResult> {
  if (!db) return { ok:false, message:'Firestore is not available. Please try again when Firebase is ready.' };
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { ok:false, message:'You are offline. Reconnect before resetting this journey.' };

  const userRef = doc(db, 'users', uid);
  const memorialRef = doc(db, 'users', uid, 'petMemorials', pet.id);
  const keepsakeRef = doc(db, 'users', uid, 'keepsakes', `keepsake-${pet.id}`);
  const memorial = createMemorial(pet, save.achievements, save.leaderboards);
  const keepsake = createKeepsake(pet);

  try {
    await setDoc(memorialRef, { ...memorial, createdFromDeathReset:true, updatedAt:serverTimestamp() }, { merge:true });
    await setDoc(keepsakeRef, { ...keepsake, updatedAt:serverTimestamp() }, { merge:true });
    await Promise.all(RESET_SUBCOLLECTIONS.map((name) => deleteCollectionInChunks(db, uid, name)));
    await setDoc(userRef, {
      activePetId:null,
      coins:null,
      userCoins:null,
      gameStarted:false,
      needsNewJourney:true,
      lastResetAt:serverTimestamp(),
      resetReason:'pet_death',
      updatedAt:serverTimestamp(),
    }, { merge:true });
    return { ok:true, memorialCreated:true };
  } catch (error) {
    console.error('resetGameProgressAfterPetDeath failed:', error);
    return { ok:false, message:error instanceof Error ? error.message : 'Could not reset your progress. Please try again.' };
  }
}
