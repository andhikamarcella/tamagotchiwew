'use client';
import { PixelButton } from './PixelButton';
import { PixelModal } from './PixelModal';

export function ConfirmModal({ title, body, onCancel, onConfirm }: { title: string; body: string; onCancel: () => void; onConfirm: () => void }) {
  return <PixelModal><h2 className="mb-3 text-sm">{title}</h2><p className="mb-4 text-[10px] leading-relaxed">{body}</p><div className="flex flex-col gap-2 sm:flex-row"><PixelButton onClick={onConfirm} className="bg-red-300">Confirm</PixelButton><PixelButton onClick={onCancel} className="bg-white">Cancel</PixelButton></div></PixelModal>;
}
