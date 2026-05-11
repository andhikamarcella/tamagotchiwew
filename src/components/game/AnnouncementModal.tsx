'use client';
import PixelModal from '@/src/components/PixelModal';
import AnnouncementCenter from './AnnouncementCenter';
import type { GameRemoteConfig, RemoteConfigStatus } from '@/src/config/defaultRemoteConfig';
export default function AnnouncementModal({ onClose, remoteConfig, remoteStatus }: { onClose: () => void; remoteConfig?: GameRemoteConfig; remoteStatus?: RemoteConfigStatus }) { return <PixelModal title="News" onClose={onClose} maxWidth="sm:max-w-md" panelClassName="bg-white" footer={<button type="button" onClick={onClose} className="pixel-border-sm w-full bg-white px-3 py-2 text-[10px]">Close</button>}><AnnouncementCenter remoteConfig={remoteConfig} remoteStatus={remoteStatus} /></PixelModal>; }
