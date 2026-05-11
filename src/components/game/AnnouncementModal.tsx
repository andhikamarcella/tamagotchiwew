'use client';
import PixelModal from '@/src/components/PixelModal';
import AnnouncementCenter from './AnnouncementCenter';
export default function AnnouncementModal({ onClose }: { onClose: () => void }) { return <PixelModal title="News" onClose={onClose} maxWidth="sm:max-w-md" panelClassName="bg-white" footer={<button type="button" onClick={onClose} className="pixel-border-sm w-full bg-white px-3 py-2 text-[10px]">Close</button>}><AnnouncementCenter /></PixelModal>; }
