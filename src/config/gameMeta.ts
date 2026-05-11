export const GAME_VERSION = '0.4.0';
export const GAME_BUILD_DATE = '2026-05-11';
export const GAME_NAME = 'Pixel Paws';

export const CHANGELOG = [
  { version: '0.4.0', date: '2026-05-11', title: 'Shop, Actions, Offline & Global Updates', changes: ['Added custom offline fallback page for refreshes without internet.', 'Synced shop inventory items into Feed, Snack, Medicine, and Play action pickers.', 'Fixed global shop discounts from remote tuning so discounts apply even outside weekly events.', 'Improved mini-game controls so each title has matching targets and instructions.', 'Renamed Firebase-facing labels to Global Updates and Global Game Tuning.'] },
  { version: '0.3.0', date: '2026-05-10', title: 'Couple Mode & Guest Trial', changes: ['Added invite code rooms.', 'Added guest trial.', 'Improved pet care actions.', 'Improved mobile layout.'] },
  { version: '0.2.0', date: '2026-05-01', title: 'Care Update', changes: ['Added detailed care options.', 'Expanded shop items.', 'Improved save import/export.'] },
] as const;

export const ANNOUNCEMENTS = [
  { id: 'shop-action-sync-0-4-0', title: 'Today: Shop items now match actions', message: 'Food, snacks, medicine, and toys bought in Shop now show up in the matching care action pickers and Inventory use flow.', type: 'info', active: true, version: '0.4.0' },
  { id: 'offline-global-tuning-0-4-0', title: 'Today: Offline fallback and global tuning', message: 'Refreshes while offline can show the Pixel Paws offline page after one online visit, and global shop discounts now apply from tuning config.', type: 'info', active: true, version: '0.4.0' },
  { id: 'welcome-0-3-0', title: 'Welcome to Pixel Paws!', message: 'Invite a friend and care for your pet together.', type: 'info', active: true, version: '0.3.0' },
  { id: 'guest-trial-0-3-0', title: 'Guest Trial', message: 'Guest mode now gives five minutes to try the game before upgrading.', type: 'warning', active: true, version: '0.3.0' },
] as const;
