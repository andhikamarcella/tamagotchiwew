export const GAME_VERSION = '0.3.0';
export const GAME_BUILD_DATE = '2026-05-10';
export const GAME_NAME = 'Pixel Paws';

export const CHANGELOG = [
  { version: '0.3.0', date: '2026-05-10', title: 'Couple Mode & Guest Trial', changes: ['Added invite code rooms.', 'Added guest trial.', 'Improved pet care actions.', 'Improved mobile layout.'] },
  { version: '0.2.0', date: '2026-05-01', title: 'Care Update', changes: ['Added detailed care options.', 'Expanded shop items.', 'Improved save import/export.'] },
] as const;

export const ANNOUNCEMENTS = [
  { id: 'welcome-0-3-0', title: 'Welcome to Pixel Paws!', message: 'Invite a friend and care for your pet together.', type: 'info', active: true, version: '0.3.0' },
  { id: 'guest-trial-0-3-0', title: 'Guest Trial', message: 'Guest mode now gives five minutes to try the game before upgrading.', type: 'warning', active: true, version: '0.3.0' },
] as const;
