type AudioState = { unlocked: boolean; muted: boolean; masterVolume: number; reducedAudio: boolean; supported: boolean };
export type SfxName = 'buttonPress' | 'buttonDisabled' | 'tabSwitch' | 'toastSuccess' | 'toastError' | 'coinGain' | 'itemBuy' | 'itemEquip' | 'levelUp' | 'feed' | 'snack' | 'play' | 'clean' | 'sleep' | 'wake' | 'medicine' | 'walk' | 'train' | 'gameScore' | 'gameMiss' | 'joinRoom' | 'copyCode' | 'inviteCodeCreated' | 'gift' | 'coupleAction';

type AudioContextLike = AudioContext;
let ctx: AudioContextLike | null = null;
let state: AudioState = { unlocked: false, muted: false, masterVolume: 0.28, reducedAudio: false, supported: true };

function canUseAudio() { return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window); }

export function initAudio() {
  if (!canUseAudio()) { state = { ...state, supported: false }; return null; }
  if (ctx) return ctx;
  try {
    const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AudioCtor();
    state = { ...state, supported: true };
    return ctx;
  } catch {
    state = { ...state, supported: false };
    return null;
  }
}

export async function unlockAudio() {
  try {
    const audio = initAudio();
    if (!audio) return false;
    if (audio.state === 'suspended') await audio.resume();
    state = { ...state, unlocked: audio.state === 'running' };
    return state.unlocked;
  } catch {
    state = { ...state, supported: false, unlocked: false };
    return false;
  }
}

export function setMasterVolume(value: number) { state = { ...state, masterVolume: Math.max(0, Math.min(1, value)) }; }
export function setMuted(muted: boolean) { state = { ...state, muted }; }
export function setReducedAudio(reducedAudio: boolean) { state = { ...state, reducedAudio }; }
export function getAudioState() { return { ...state }; }

export function playTone(freq = 440, duration = 0.12, type: OscillatorType = 'square', volume = 0.18, delay = 0) {
  try {
    if (state.muted || !state.unlocked) return;
    const audio = initAudio();
    if (!audio) return;
    const start = audio.currentTime + delay;
    const end = start + (state.reducedAudio ? duration * 0.55 : duration);
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * state.masterVolume), start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(gain).connect(audio.destination);
    osc.start(start);
    osc.stop(end + 0.02);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  } catch { /* silent fallback */ }
}

export function playNoise(duration = 0.12, volume = 0.08) {
  try {
    if (state.muted || !state.unlocked) return;
    const audio = initAudio();
    if (!audio) return;
    const length = Math.max(1, Math.floor(audio.sampleRate * duration));
    const buffer = audio.createBuffer(1, length, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    source.buffer = buffer;
    gain.gain.value = volume * state.masterVolume;
    source.connect(gain).connect(audio.destination);
    source.start();
    source.stop(audio.currentTime + duration + 0.02);
    source.onended = () => { source.disconnect(); gain.disconnect(); };
  } catch { /* silent fallback */ }
}

export function playSequence(notes: Array<[number, number]>, type: OscillatorType = 'square') {
  let delay = 0;
  notes.slice(0, state.reducedAudio ? 3 : 8).forEach(([freq, duration]) => { playTone(freq, duration, type, 0.16, delay); delay += duration * 0.8; });
}

const sfx: Record<string, Array<[number, number]>> = {
  buttonPress: [[520, 0.04], [760, 0.05]], buttonDisabled: [[160, 0.08]], tabSwitch: [[420, 0.04], [640, 0.04]], toastSuccess: [[660, 0.06], [880, 0.08]], toastError: [[220, 0.08], [160, 0.12]],
  coinGain: [[880, 0.05], [1320, 0.08]], itemBuy: [[520, 0.05], [700, 0.05], [1040, 0.08]], itemEquip: [[500, 0.06], [900, 0.07]], levelUp: [[523, 0.08], [659, 0.08], [784, 0.08], [1046, 0.14]],
  feed: [[330, 0.05], [392, 0.05], [494, 0.08]], snack: [[660, 0.04], [990, 0.08]], play: [[440, 0.05], [660, 0.05], [880, 0.08]], clean: [[700, 0.04], [900, 0.04], [1100, 0.05]], sleep: [[330, 0.12], [247, 0.16]], wake: [[523, 0.06], [784, 0.08]], medicine: [[260, 0.06], [520, 0.08]], walk: [[330, 0.05], [392, 0.05]], train: [[220, 0.04], [440, 0.04], [660, 0.08]],
  gameScore: [[740, 0.04], [980, 0.05]], gameMiss: [[180, 0.1]], joinRoom: [[392, 0.08], [784, 0.1]], copyCode: [[880, 0.06]], inviteCodeCreated: [[523, 0.08], [659, 0.08], [880, 0.1]], gift: [[660, 0.05], [880, 0.05], [1175, 0.1]], coupleAction: [[440, 0.06], [660, 0.06], [880, 0.08]],
};

export function playSfx(name: SfxName | string) {
  const notes = sfx[name] ?? sfx.buttonPress;
  playSequence(notes, name === 'sleep' ? 'triangle' : 'square');
  if (name === 'clean') playNoise(0.08, 0.04);
}

const animalBase: Record<string, number> = { cat: 740, dog: 260, rabbit: 880, hamster: 980, chicken: 620, duck: 380, panda: 220, fox: 700, koala: 240, penguin: 560, turtle: 180, axolotl: 820, owl: 300, hedgehog: 920, raccoon: 680, capybara: 260, beaver: 320, sheep: 440, cow: 190, pony: 520, frog: 300, goldfish: 760, squirrel: 960, tigerCub: 230 };
export function playAnimalSound(species: string, mood?: string) {
  const base = animalBase[species] ?? 520;
  const mod = mood?.toLowerCase().includes('sick') ? 0.72 : mood?.toLowerCase().includes('sleep') ? 0.65 : mood?.toLowerCase().includes('happy') || mood?.toLowerCase().includes('senang') ? 1.18 : 1;
  playSequence([[base * mod, 0.06], [base * 1.25 * mod, 0.07], [base * 0.9 * mod, 0.05]], 'square');
}
