'use client';
import AnnouncementCenter from './AnnouncementCenter';
export default function AnnouncementModal({ onClose }: { onClose: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 p-0 sm:place-items-center sm:p-4"><div className="w-full sm:max-w-md"><AnnouncementCenter /><button type="button" onClick={onClose} className="pixel-border-sm mt-3 w-full bg-white px-3 py-2 text-[10px]">Close</button></div></div>; }
