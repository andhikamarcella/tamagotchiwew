'use client';
import { useState } from 'react';
import PixelModal from '@/src/components/PixelModal';
import ReauthModal from '@/src/components/auth/ReauthModal';
import { useAuth } from '@/src/hooks/useAuth';
import { isValidEmail } from '@/src/lib/validators';

export default function ChangeEmailModal({ onClose, onToast }: { onClose: () => void; onToast: (message: string) => void }) {
  const auth = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [reauthOpen, setReauthOpen] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    if (!newEmail.trim()) return 'Please enter your email.';
    if (!isValidEmail(newEmail)) return 'Please enter a valid email address.';
    if (newEmail.trim() !== confirmEmail.trim()) return 'Emails do not match.';
    if (newEmail.trim() === auth.email) return 'New email must be different from current email.';
    return null;
  };
  const submit = async () => {
    const error = validate();
    if (error) { onToast(error); return; }
    const result = await auth.requestEmailChange(newEmail.trim());
    if (result.ok) { setSent(true); onToast('Check your new email.'); return; }
    if (result.message?.includes('sign in again')) setReauthOpen(true);
    onToast(result.message ?? 'Could not send change email link.');
  };
  return <PixelModal title={sent ? 'Check your new email' : 'Change email'} description={sent ? 'We sent a confirmation link. Your email will change after you open it.' : `Current email: ${auth.email ?? 'No email'}`} onClose={onClose} maxWidth="sm:max-w-md" panelClassName="bg-white"><div className="grid gap-3">{!sent && <><input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="border-4 border-slate-950 p-3 text-xs" placeholder="New email" /><input value={confirmEmail} onChange={(e) => setConfirmEmail(e.target.value)} className="border-4 border-slate-950 p-3 text-xs" placeholder="Confirm new email" /><button type="button" disabled={auth.providerLoading.changeEmail} onClick={() => void submit()} className="pixel-border-sm bg-lime-100 px-3 py-2 text-[10px] disabled:opacity-50">{auth.providerLoading.changeEmail ? 'Sending...' : 'Send change link'}</button></>}<button type="button" onClick={onClose} className="pixel-border-sm bg-white px-3 py-2 text-[10px]">Cancel</button></div>{reauthOpen && <ReauthModal onClose={() => setReauthOpen(false)} onToast={onToast} onDone={() => { setReauthOpen(false); void submit(); }} />}</PixelModal>;
}
