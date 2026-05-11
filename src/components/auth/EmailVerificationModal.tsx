'use client';
import PixelModal from '@/src/components/PixelModal';
import EmailVerificationBanner from './EmailVerificationBanner';
export default function EmailVerificationModal({ onClose, onToast }: { onClose: () => void; onToast: (message: string) => void }) { return <PixelModal title="Verify your email" onClose={onClose} maxWidth="sm:max-w-lg" panelClassName="bg-white"><EmailVerificationBanner onToast={onToast} /></PixelModal>; }
