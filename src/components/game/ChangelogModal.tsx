'use client';
import PixelModal from '@/src/components/PixelModal';
import { CHANGELOG, GAME_VERSION } from '@/src/config/gameMeta';
export const LAST_SEEN_VERSION_KEY = 'pixel-paws-last-seen-version';
export default function ChangelogModal({ onClose }: { onClose: () => void }) { return <PixelModal title={`What's new in v${GAME_VERSION}`} onClose={onClose} maxWidth="sm:max-w-lg" panelClassName="bg-white" footer={<button type="button" onClick={onClose} className="pixel-border-sm w-full bg-pink-200 px-3 py-2 text-[10px]">Got it</button>}><div className="grid gap-3">{CHANGELOG.map((item) => <article key={item.version} className="border-2 border-slate-950 bg-lime-50 p-3"><h3 className="text-[11px]">{item.title} · {item.version}</h3><p className="mt-1 text-[9px] text-slate-600">{item.date}</p><ul className="mt-2 list-disc pl-5 text-[10px] leading-relaxed">{item.changes.map((change) => <li key={change}>{change}</li>)}</ul></article>)}</div></PixelModal>; }
