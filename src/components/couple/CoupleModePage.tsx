'use client';

import { useCallback, useEffect, useState } from 'react';
import LoginPage from '@/src/components/LoginPage';
import { useAuth } from '@/src/hooks/useAuth';
import { useBodyScrollLock } from '@/src/hooks/useBodyScrollLock';
import { getCoupleTitle, getStoredRoomId, sharedGifts, sharedShopItems, useClientNickname, useCoupleAlbum, useCoupleQuests, useCreateRoom, useFirebaseReady, useGiftAction, useJoinRoom, usePresence, useRoomExit, useRoomRealtime, useSharedInventory, useSharedPetActions } from '@/src/hooks/useCoupleMode';
import type { CoupleMemory, CoupleQuest, CoupleRoom, PresenceEntry, RoomEvent, SharedActionKey, SharedInventoryItem, SharedPet } from '@/src/lib/coupleTypes';

type CreatedInvite = { roomId: string; inviteCode: string } | null;

function Button({ children, onClick, disabled, tone = 'bg-pink-300', className = '' }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; tone?: string; className?: string }) {
  return <button type="button" onClick={onClick} disabled={disabled} className={`pixel-border-sm ${tone} w-full px-3 py-2 text-[10px] leading-relaxed text-slate-950 active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${className}`}>{children}</button>;
}
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`pixel-border min-w-0 max-w-full overflow-hidden break-words bg-[var(--panel)] p-3 sm:p-4 ${className}`}>{children}</section>;
}
function Bar({ label, value, color = 'bg-pink-400' }: { label: string; value: number; color?: string }) {
  const safe = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  const width = `${safe}%`;
  return <div className="min-w-0"><div className="mb-1 flex justify-between gap-2 text-[9px]"><span>{label}</span><span>{Math.round(safe)}/100</span></div><div className="h-4 border-2 border-slate-950 bg-white"><div className={`h-full ${color}`} style={{ width }} /></div></div>;
}
function TinyToast({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="fixed right-3 top-3 z-50 max-w-[calc(100vw-1.5rem)] pixel-border-sm animate-pop bg-white p-3 text-[10px] leading-relaxed">{message}</div>;
}

export default function CoupleModePage() {
  const { configured } = useFirebaseReady();
  const auth = useAuth();
  const { nickname, setNickname } = useClientNickname();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [createdInvite, setCreatedInvite] = useState<CreatedInvite>(null);
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => setRoomId(getStoredRoomId()), []);
  useEffect(() => {
    if (!toast) return undefined;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);
  const showToast = useCallback((message: string) => setToast(message), []);
  const updateRoomId = useCallback((id: string | null) => {
    setRoomId(id);
    if (!id) setCreatedInvite(null);
  }, []);

  if (!configured) return <><TinyToast message={toast} /><FirebaseSetupNotice /></>;
  if (!auth.authReady) return <Card><p className="text-[10px]">Checking login...</p></Card>;
  if (!auth.isAuthenticated) return <LoginPage />;
  if (auth.isGuestTrialExpired) return <><TinyToast message={toast} /><Card className="bg-yellow-100"><h2 className="mb-2 text-sm">Your guest trial has ended</h2><p className="mb-3 text-[10px] leading-relaxed">Guest trial ended. Login to play together.</p><Button onClick={() => showToast('Guest trial ended. Login to play together.')}>Login to play together</Button></Card></>;
  if (!roomId) return <><TinyToast message={toast} /><CreateJoinScreen nickname={nickname} setNickname={setNickname} setRoomId={updateRoomId} setCreatedInvite={setCreatedInvite} showToast={showToast} /></>;
  return <><TinyToast message={toast} /><CoupleRoomDashboard roomId={roomId} initialInvite={createdInvite?.roomId === roomId ? createdInvite.inviteCode : null} nickname={nickname || 'Pixel Friend'} setRoomId={updateRoomId} showToast={showToast} /></>;
}

export function FirebaseSetupNotice() {
  return <Card className="mx-auto w-full max-w-3xl text-center"><div className="text-4xl sm:text-5xl">💗🐾🐾</div><h1 className="mt-4 text-base leading-relaxed sm:text-lg">Play Together</h1><p className="mt-4 text-[11px] leading-relaxed">Online Couple Mode needs Firebase setup.</p><p className="mt-3 text-[10px] leading-relaxed">Single player tetap berjalan dengan LocalStorage. Tambahkan env Firebase di Vercel untuk mengaktifkan invite code, shared pet realtime, activity feed, quests, gifts, dan presence.</p></Card>;
}
function CreateJoinScreen({ nickname, setNickname, setRoomId, setCreatedInvite, showToast }: { nickname: string; setNickname: (v: string) => void; setRoomId: (id: string) => void; setCreatedInvite: (invite: CreatedInvite) => void; showToast: (m: string) => void }) {
  return <div className="grid w-full max-w-full grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2"><Card className="text-center lg:col-span-2"><div className="text-4xl sm:text-6xl">💗🐾🐾</div><h1 className="mt-4 text-base leading-relaxed sm:text-lg">Play Together</h1><p className="mt-3 text-[10px] leading-relaxed">Create a room, share the code, and care for one shared pet together.</p><label className="mt-4 block text-left text-[10px]">Nickname<input value={nickname} onChange={(event) => setNickname(event.target.value)} className="mt-2 w-full min-w-0 border-4 border-slate-950 p-3 text-xs" maxLength={24} placeholder="Nama kamu" /></label></Card><CreateRoomCard nickname={nickname} setRoomId={setRoomId} setCreatedInvite={setCreatedInvite} showToast={showToast} /><JoinRoomCard nickname={nickname} setRoomId={setRoomId} showToast={showToast} /></div>;
}
export function CreateRoomCard({ nickname, setRoomId, setCreatedInvite, showToast }: { nickname: string; setRoomId: (id: string) => void; setCreatedInvite: (invite: CreatedInvite) => void; showToast: (m: string) => void }) {
  const { createRoom, loading, error, createStep, inviteCode } = useCreateRoom();
  const [roomName, setRoomName] = useState('');
  useEffect(() => { if (error) showToast(error); }, [error, showToast]);
  const handleCreate = async () => {
    const result = await createRoom(nickname, roomName);
    if (result) {
      setCreatedInvite(result);
      setRoomId(result.roomId);
      showToast('Invite code created!');
    }
  };
  return <Card><h2 className="text-sm">Create Invite Code</h2><p className="my-3 text-[10px] leading-relaxed">Buat room Firestore realtime untuk 2 orang.</p><input value={roomName} onChange={(event) => setRoomName(event.target.value)} className="mb-3 w-full min-w-0 border-4 border-slate-950 p-3 text-xs" placeholder="Room name optional" maxLength={36} /><div className="mb-3 text-[9px] uppercase tracking-wider text-slate-700">Step: {createStep}</div>{error && <div className="mb-3 border-2 border-red-700 bg-red-50 p-2 text-[10px] leading-relaxed text-red-800">{error}</div>}{inviteCode && <div className="mb-3 border-4 border-slate-950 bg-white p-3 text-center text-2xl tracking-[0.18em] sm:text-3xl">{inviteCode}</div>}<Button className="sm:w-full" disabled={loading || !nickname.trim()} onClick={handleCreate}>{loading ? 'Creating...' : error ? 'Retry Create Invite' : 'Create Invite Code'}</Button></Card>;
}
export function JoinRoomCard({ nickname, setRoomId, showToast }: { nickname: string; setRoomId: (id: string) => void; showToast: (m: string) => void }) {
  const { joinRoom, loading, error } = useJoinRoom();
  const [code, setCode] = useState('');
  useEffect(() => { if (error) showToast(error); }, [error, showToast]);
  return <Card><h2 className="text-sm">Join with Code</h2><p className="my-3 text-[10px] leading-relaxed">Masukkan 6 karakter invite code dari teman/pacar.</p><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[O0I1]/g, '').replace(/[^A-Z2-9]/g, '').slice(0, 6))} className="mb-3 w-full min-w-0 border-4 border-slate-950 p-3 text-center text-base tracking-[0.18em] sm:text-lg sm:tracking-[0.35em]" placeholder="PAWS7K" maxLength={6} />{error && <div className="mb-3 border-2 border-red-700 bg-red-50 p-2 text-[10px] leading-relaxed text-red-800">{error}</div>}<Button className="sm:w-full" disabled={loading || !nickname.trim() || code.length !== 6} onClick={async () => { const id = await joinRoom(nickname, code); if (id) { setRoomId(id); showToast('Connected!'); } }}>{loading ? 'Joining...' : error ? 'Retry Join' : 'Join Room'}</Button></Card>;
}
function InviteCodeDisplay({ code, connected, showToast }: { code: string; connected?: boolean; showToast: (m: string) => void }) {
  return <Card><h2 className="text-sm">Invite Code</h2><div className="my-3 w-full overflow-hidden border-4 border-slate-950 bg-white p-3 text-center text-2xl tracking-[0.16em] sm:p-4 sm:text-4xl sm:tracking-[0.28em]">{code}</div><p className="mb-3 text-[10px]">{connected ? 'Connected!' : 'Waiting for your friend...'}</p><div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap"><CopyCodeButton code={code} showToast={showToast} /><Button tone="bg-white" onClick={async () => { const text = `Join my Pixel Paws couple room: ${code}`; if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); showToast('Share text copied!'); } }}>Share Text</Button></div></Card>;
}
export function InviteCodeCard({ room, showToast }: { room: CoupleRoom; showToast: (m: string) => void }) {
  return <InviteCodeDisplay code={room.inviteCode} connected={Boolean(room.guestUid)} showToast={showToast} />;
}
export function CopyCodeButton({ code, showToast }: { code: string; showToast: (m: string) => void }) {
  return <Button onClick={async () => { await navigator.clipboard.writeText(code); showToast('Invite code copied!'); }}>Copy Code</Button>;
}
export function CoupleRoomDashboard({ roomId, initialInvite, nickname, setRoomId, showToast }: { roomId: string; initialInvite?: string | null; nickname: string; setRoomId: (id: string | null) => void; showToast: (m: string) => void }) {
  const realtime = useRoomRealtime(roomId);
  usePresence(roomId, nickname);
  const [confirm, setConfirm] = useState<'leave' | 'close' | 'kick' | null>(null);
  useEffect(() => { if (realtime.error) showToast(realtime.error); }, [realtime.error, showToast]);
  if (!realtime.room) return <div className="grid w-full max-w-full grid-cols-1 gap-3">{initialInvite && <InviteCodeDisplay code={initialInvite} showToast={showToast} />}<Card><p className="text-[10px]">Syncing couple room...</p><Button tone="mt-3 bg-white" onClick={() => setRoomId(null)}>Back</Button></Card></div>;
  const isOwner = realtime.room.ownerName === nickname || realtime.room.ownerUid === realtime.presence.find((p) => p.nickname === nickname)?.uid;
  return <div className="grid w-full max-w-full grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-4"><div className="grid min-w-0 gap-3 lg:gap-4"><InviteCodeCard room={realtime.room} showToast={showToast} /><SharedPetPanel pet={realtime.pet} room={realtime.room} /><SharedActionPanel room={realtime.room} pet={realtime.pet} nickname={nickname} showToast={showToast} /><GiftPanel room={realtime.room} pet={realtime.pet} nickname={nickname} showToast={showToast} /><SharedRoomCustomizer inventory={realtime.inventory} /></div><div className="grid min-w-0 gap-3 lg:gap-4"><CoupleBondCard room={realtime.room} presence={realtime.presence} /><RoomPeople room={realtime.room} presence={realtime.presence} /><CoupleQuestBoard roomId={roomId} quests={realtime.quests} showToast={showToast} /><SharedShop roomId={roomId} coins={realtime.room.sharedCoins} inventory={realtime.inventory} showToast={showToast} /><CoupleAlbum roomId={roomId} pet={realtime.pet} nickname={nickname} memories={realtime.album} isOwner={isOwner} showToast={showToast} /><RoomActivityFeed events={realtime.events} /><div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"><Button tone="bg-orange-200" onClick={() => setConfirm('leave')}>Leave Room</Button>{isOwner && <Button tone="bg-red-300" onClick={() => setConfirm('close')}>Close Room</Button>}{isOwner && realtime.room.guestUid && <Button tone="bg-yellow-200" onClick={() => setConfirm('kick')}>Kick Guest</Button>}</div></div>{confirm === 'leave' && <LeaveRoomModal roomId={roomId} nickname={nickname} close={() => setConfirm(null)} done={() => { setConfirm(null); setRoomId(null); }} />}{confirm === 'close' && <CloseRoomModal roomId={roomId} nickname={nickname} close={() => setConfirm(null)} done={() => { setConfirm(null); setRoomId(null); }} />}{confirm === 'kick' && <KickGuestModal roomId={roomId} nickname={nickname} close={() => setConfirm(null)} done={() => { setConfirm(null); showToast('Guest slot cleared.'); }} />}</div>;
}
export function SharedPetPanel({ pet, room }: { pet: SharedPet | null; room: CoupleRoom }) {
  if (!pet) return <Card>Shared pet loading...</Card>;
  const emoji = pet.species === 'Penguin' ? '🐧' : pet.species === 'Anjing' ? '🐶' : '🐱';
  return <Card className="text-center"><div className="rounded bg-pink-100 p-4"><div className="animate-idle text-6xl sm:text-8xl">{emoji}</div><div className="text-xs">{pet.mood}</div></div><h2 className="mt-4 text-sm">{pet.name}</h2><p className="mt-2 text-[10px]">{pet.species} · Lv {pet.level} · {pet.activeHabitat} · Coins 🪙{room.sharedCoins}</p><div className="mt-4 grid grid-cols-1 gap-2 text-left sm:grid-cols-2"><Bar label="Hunger" value={pet.hunger} color="bg-orange-400" /><Bar label="Happiness" value={pet.happiness} color="bg-pink-400" /><Bar label="Energy" value={pet.energy} color="bg-blue-400" /><Bar label="Clean" value={pet.cleanliness} color="bg-cyan-300" /><Bar label="Health" value={pet.health} color="bg-green-400" /><Bar label="Affection" value={pet.affection} color="bg-red-300" /><Bar label="Social" value={pet.social} color="bg-purple-300" /><Bar label="Trust" value={pet.trust} color="bg-yellow-300" /></div></Card>;
}
export function SharedActionPanel({ room, pet, nickname, showToast }: { room: CoupleRoom; pet: SharedPet | null; nickname: string; showToast: (m: string) => void }) {
  const { actions, runAction, loadingAction, error } = useSharedPetActions(room.id, pet?.id ?? null, nickname);
  useEffect(() => { if (error) showToast(error); }, [error, showToast]);
  return <Card><h2 className="mb-3 text-sm">Shared Actions</h2><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">{(Object.keys(actions) as SharedActionKey[]).map((key) => <Button key={key} className="sm:w-full" disabled={!pet || loadingAction !== null} onClick={async () => { const ok = await runAction(key); if (ok) showToast(`${actions[key].label} synced!`); }}>{loadingAction === key ? '...' : actions[key].label}</Button>)}</div></Card>;
}
export function CoupleBondCard({ room, presence }: { room: CoupleRoom; presence: PresenceEntry[] }) {
  return <Card><h2 className="text-sm">Couple Bond</h2><p className="my-2 text-[10px]">Lv {room.coupleLevel} · {getCoupleTitle(room.coupleLevel)} · XP {room.coupleXp}</p><Bar label="Bond" value={room.coupleBond} /><p className="mt-3 text-[10px]">Online: {presence.length || 1}</p></Card>;
}
function RoomPeople({ room, presence }: { room: CoupleRoom; presence: PresenceEntry[] }) {
  return <Card><h2 className="mb-3 text-sm">Room People</h2><div className="grid grid-cols-1 gap-2 text-[10px]"><div className="border-2 border-slate-950 bg-white p-2">Owner: {room.ownerName}</div><div className="border-2 border-slate-950 bg-white p-2">Guest: {room.guestName || 'Waiting...'}</div>{presence.map((p) => <div key={p.uid} className="border-2 border-slate-950 bg-green-100 p-2">● {p.nickname}</div>)}</div></Card>;
}
export function CoupleQuestBoard({ roomId, quests, showToast }: { roomId: string; quests: CoupleQuest[]; showToast: (m: string) => void }) {
  const { claimQuest, loadingQuest, error } = useCoupleQuests(roomId, quests);
  useEffect(() => { if (error) showToast(error); }, [error, showToast]);
  return <Card><h2 className="mb-3 text-sm">Couple Quests</h2><div className="grid gap-2">{quests.slice(0, 5).map((quest) => <div key={quest.id} className="border-2 border-slate-950 bg-white p-2 text-[9px]"><div>{quest.questKey} · {quest.progress}/{quest.goal}</div><Button className="mt-2 sm:w-full" disabled={quest.progress < quest.goal || quest.claimed || loadingQuest !== null} onClick={async () => { const ok = await claimQuest(quest.id); if (ok) showToast('Quest claimed!'); }}>{quest.claimed ? 'Claimed' : 'Claim'}</Button></div>)}{quests.length === 0 && <p className="text-[10px]">Quest loading...</p>}</div></Card>;
}
export function GiftPanel({ room, pet, nickname, showToast }: { room: CoupleRoom; pet: SharedPet | null; nickname: string; showToast: (m: string) => void }) {
  const { giveGift, loadingGift, error } = useGiftAction(room.id, pet?.id ?? null, nickname);
  const [lastGiftAt, setLastGiftAt] = useState(0);
  useEffect(() => { if (error) showToast(error); }, [error, showToast]);
  return <Card><h2 className="mb-3 text-sm">Gift Panel</h2><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{sharedGifts.map((gift) => <Button className="sm:w-full" key={gift.id} disabled={!pet || room.sharedCoins < gift.cost || Date.now() - lastGiftAt < 2500 || loadingGift !== null} onClick={async () => { setLastGiftAt(Date.now()); window.setTimeout(() => setLastGiftAt(0), 2500); const ok = await giveGift(gift.id); showToast(ok ? `${gift.emoji} ${gift.name} sent!` : 'Action failed. Please try again.'); }}>{gift.emoji} {gift.name} 🪙{gift.cost}</Button>)}</div></Card>;
}
export function SharedShop({ roomId, coins, inventory, showToast }: { roomId: string; coins: number; inventory: SharedInventoryItem[]; showToast: (m: string) => void }) {
  const { buyItem, equipItem, loadingItem, error } = useSharedInventory(roomId);
  useEffect(() => { if (error) showToast(error); }, [error, showToast]);
  return <Card><h2 className="mb-3 text-sm">Couple Shop</h2><p className="mb-3 text-[10px]">Shared coins: 🪙{coins}</p><div className="grid gap-2">{sharedShopItems.map((item) => { const owned = inventory.find((entry) => entry.itemId === item.id); return <div key={item.id} className="grid gap-2 border-2 border-slate-950 bg-white p-2 text-[9px] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><span className="min-w-0 break-words">{item.emoji} {item.name} 🪙{item.cost}</span>{owned ? <Button tone={owned.equipped ? 'bg-yellow-200' : 'bg-white'} onClick={async () => { await equipItem(owned.id, !owned.equipped); showToast('Shared item updated!'); }}>{owned.equipped ? 'Unequip' : 'Equip'}</Button> : <Button disabled={coins < item.cost || loadingItem !== null} onClick={async () => { const ok = await buyItem(item.id); if (ok) showToast('Shared item purchased!'); }}>Buy</Button>}</div>; })}</div></Card>;
}
export function SharedRoomCustomizer({ inventory }: { inventory: SharedInventoryItem[] }) {
  const equipped = inventory.filter((item) => item.equipped);
  return <Card><h2 className="mb-3 text-sm">Shared Room Preview</h2><div className="min-h-24 max-w-full overflow-hidden border-4 border-slate-950 bg-white p-4 text-center text-2xl sm:text-3xl">🏠 {equipped.map((item) => sharedShopItems.find((shop) => shop.id === item.itemId)?.emoji ?? '◆').join(' ') || '♡'}</div></Card>;
}
export function CoupleAlbum({ roomId, pet, nickname, memories, isOwner, showToast }: { roomId: string; pet: SharedPet | null; nickname: string; memories: CoupleMemory[]; isOwner: boolean; showToast: (m: string) => void }) {
  const { takePhoto, deleteMemory, error } = useCoupleAlbum(roomId, pet, nickname, memories);
  const [caption, setCaption] = useState('');
  useEffect(() => { if (error) showToast(error); }, [error, showToast]);
  return <Card><h2 className="mb-3 text-sm">Couple Album</h2><div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"><input value={caption} onChange={(event) => setCaption(event.target.value)} className="min-w-0 border-4 border-slate-950 p-2 text-[10px]" placeholder="Caption" maxLength={100} /><Button disabled={!pet} onClick={async () => { const ok = await takePhoto(caption || 'A cozy pixel memory'); if (ok) { setCaption(''); showToast('Photo saved!'); } }}>Take Couple Photo</Button></div><div className="mt-3 grid gap-2">{memories.slice(0, 4).map((memory) => <div key={memory.id} className="border-2 border-slate-950 bg-white p-2 text-[9px] leading-relaxed"><div>📸 {memory.petName} · {memory.petMood}</div><div>{memory.caption}</div><div className="mt-1 flex flex-wrap justify-between gap-2"><span>by {memory.actorName}</span>{isOwner && <button type="button" onClick={() => void deleteMemory(memory.id)}>delete</button>}</div></div>)}{memories.length === 0 && <p className="text-[10px]">Belum ada memory.</p>}</div></Card>;
}
export function RoomActivityFeed({ events }: { events: RoomEvent[] }) {
  return <Card><h2 className="mb-3 text-sm">Activity Feed</h2><div className="max-h-72 space-y-2 overflow-y-auto overflow-x-hidden">{events.map((event) => <div key={event.id} className="break-words border-2 border-slate-950 bg-white p-2 text-[9px] leading-relaxed">{event.message}</div>)}{events.length === 0 && <p className="text-[10px]">No activity yet.</p>}</div></Card>;
}
function DangerModal({ title, body, action, close, done }: { title: string; body: string; action: () => Promise<boolean>; close: () => void; done: () => void }) {
  useBodyScrollLock(true);
  return <div className="fixed inset-0 z-[100] grid place-items-end overflow-hidden bg-black/50 p-0 sm:place-items-center sm:p-4"><Card className="modal-scroll-area max-h-[88dvh] w-full overflow-y-auto overscroll-contain rounded-t-2xl sm:w-[calc(100vw-24px)] sm:max-w-md sm:rounded-none"><h2 className="mb-3 text-sm">{title}</h2><p className="mb-4 text-[10px] leading-relaxed">{body}</p><div className="flex flex-col gap-2 sm:flex-row"><Button tone="bg-red-300" onClick={async () => { const ok = await action(); if (ok) done(); }}>Confirm</Button><Button tone="bg-white" onClick={close}>Cancel</Button></div></Card></div>;
}
export function LeaveRoomModal({ roomId, nickname, close, done }: { roomId: string; nickname: string; close: () => void; done: () => void }) {
  const { leaveRoom } = useRoomExit(roomId, nickname);
  return <DangerModal title="Leave Room?" body="Guest will leave, owner will close the room." action={leaveRoom} close={close} done={done} />;
}
export function CloseRoomModal({ roomId, nickname, close, done }: { roomId: string; nickname: string; close: () => void; done: () => void }) {
  const { leaveRoom } = useRoomExit(roomId, nickname);
  return <DangerModal title="Close Room?" body="This closes the online room for both players." action={leaveRoom} close={close} done={done} />;
}
export function KickGuestModal({ roomId, nickname, close, done }: { roomId: string; nickname: string; close: () => void; done: () => void }) {
  const { kickGuest } = useRoomExit(roomId, nickname);
  return <DangerModal title="Kick Guest?" body="Guest slot will become empty and status returns to waiting." action={kickGuest} close={close} done={done} />;
}
