'use client';
export default function GuestProgressMigrationModal({ onKeep, onImport, onMerge }: { onKeep: () => void; onImport: () => void; onMerge: () => void }) {
  return <div className="pixel-border bg-white p-4 text-[10px]"><h2 className="mb-2 text-sm">You already have saved progress. What do you want to do?</h2><div className="grid gap-2"><button type="button" onClick={onKeep}>Keep existing account save</button><button type="button" onClick={onImport}>Import guest trial progress</button><button type="button" onClick={onMerge}>Merge if possible</button></div></div>;
}
