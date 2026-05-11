'use client';
import PixelModal from '@/src/components/PixelModal';
export default function MfaEnrollmentModal({ onClose }: { onClose: () => void }) { return <PixelModal title="Multi-factor authentication" onClose={onClose} panelClassName="bg-white" maxWidth="sm:max-w-md"><p className="text-[10px] leading-relaxed">MFA setup is disabled until Firebase Identity Platform and SMS MFA are enabled. No fake codes are collected.</p></PixelModal>; }
