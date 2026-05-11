import type { ThemeName } from '@/lib/types';

export type ThemeDefinition = { id: ThemeName; name: ThemeName; description: string; background: string; panel: string; screen: string; accent: string; border: string; text: string; preview: string[] };
export const themes: ThemeDefinition[] = [
  ['Green Retro', 'Classic LCD greens.'], ['Blue Ocean', 'Soft sea blues.'], ['Pink Candy', 'Cute candy colors.'], ['Dark Arcade', 'High-contrast arcade mode.'], ['Cream Cozy', 'Warm cozy room.'], ['Purple Night', 'Nighttime purple glow.'], ['Mint Pixel', 'Fresh mint pixels.'], ['Sunset Pet', 'Orange-pink sunset.'], ['Forest Buddy', 'Outdoor forest feel.'], ['Snow Day', 'Bright snowy day.'], ['Retro Gray', 'Neutral retro handheld.'], ['Neon Lime', 'Loud neon LCD.'],
].map(([name, description]) => ({ id: name as ThemeName, name: name as ThemeName, description, background: 'var(--bg)', panel: 'var(--panel)', screen: 'var(--soft)', accent: 'var(--accent)', border: '#171717', text: '#0f172a', preview: ['var(--bg)', 'var(--panel)', 'var(--accent)'] }));
