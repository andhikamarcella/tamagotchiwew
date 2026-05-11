'use client';
import { useEffect, useState } from 'react';
import { defaultSave } from '@/lib/gameLogic';
import type { SaveData } from '@/lib/types';
import { loadSave, storeSave } from '@/src/lib/storage';

export function useLocalSave() {
  const [save, setSave] = useState<SaveData>(defaultSave());
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setSave(loadSave());
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) storeSave(save);
  }, [loaded, save]);
  return { save, setSave, loaded };
}
