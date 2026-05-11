'use client';
export default function UpgradeAccountModal({ onClose }: { onClose?: () => void }) {
  return <div className="pixel-border bg-white p-4 text-[10px]"><h2 className="mb-2 text-sm">Upgrade account</h2><p>Login with Google, Microsoft, or Email to keep playing.</p>{onClose && <button className="mt-3 underline" type="button" onClick={onClose}>Close</button>}</div>;
}
