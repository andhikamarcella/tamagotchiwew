import type { ReactNode } from 'react';
export type MiniGameRuntimeProps = { controls: ReactNode; onScore: (score: number) => void; onEnd: (won: boolean, score: number) => void; reducedMotion: boolean; paused?: boolean };
export function clampScore(score: number) { return Math.max(0, Math.floor(Number.isFinite(score) ? score : 0)); }
export function MiniGamePanel({ controls, title, children }: { controls: ReactNode; title: string; children: ReactNode }) { return <section className="pixel-border bg-white p-3"><div className="mb-3">{controls}</div><h2 className="mb-2 text-sm">{title}</h2>{children}</section>; }
