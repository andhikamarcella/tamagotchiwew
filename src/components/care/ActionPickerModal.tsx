'use client';

import type { ReactNode } from 'react';
import PixelModal from '@/src/components/PixelModal';
import type { CareOption } from '@/src/types/care';

export default function ActionPickerModal({ open, title, description, options, onClose, renderOption }: { open: boolean; title: string; description?: string; options: CareOption[]; onClose: () => void; renderOption: (option: CareOption) => ReactNode }) {
  if (!open) return null;
  return (
    <PixelModal title={title} description={description} onClose={onClose} maxWidth="sm:max-w-3xl">
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">{options.map((option) => renderOption(option))}</div>
    </PixelModal>
  );
}
