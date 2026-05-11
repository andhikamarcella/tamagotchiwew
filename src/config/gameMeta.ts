export const GAME_VERSION = '0.4.0';
export const GAME_BUILD_DATE = '2026-05-11';
export const GAME_NAME = 'Pixel Paws';

export const CHANGELOG = [
  { version: '0.4.0', date: '2026-05-11', title: 'Major Gameplay, Quests, Offline & Global Updates', changes: ['Added interactive onboarding tutorial with saved progress and completion reward.', 'Added Help / Guidebook, Quest Board, Mailbox, Notification Center, and Room Decoration pages.', 'Expanded daily goals and weekly quests with safe one-time claim buttons.', 'Added save schema defaults for profile showcase, mail, notifications, room decor, album, and player rank.', 'Fixed offline fallback buttons so Retry and Offline Help work while Wi-Fi is disconnected.', 'Allowed notification setup to create a local device token for guests and sync it when signed in.', 'Synced shop inventory items into Feed, Snack, Medicine, and Play action pickers.', 'Fixed global shop discounts from remote tuning so discounts apply even outside weekly events.'] },
  { version: '0.3.0', date: '2026-05-10', title: 'Couple Mode & Guest Trial', changes: ['Added invite code rooms.', 'Added guest trial.', 'Improved pet care actions.', 'Improved mobile layout.'] },
  { version: '0.2.0', date: '2026-05-01', title: 'Care Update', changes: ['Added detailed care options.', 'Expanded shop items.', 'Improved save import/export.'] },
] as const;

export const ANNOUNCEMENTS = [
  { id: 'major-gameplay-0-4-0', title: 'Today: Major gameplay expansion', message: 'Tutorial, Guidebook, Quest Board, Mailbox, Notification Center, Room Decor, expanded daily goals, and weekly quests are now available.', type: 'info', active: true, version: '0.4.0' },
  { id: 'offline-help-fcm-0-4-0', title: 'Today: Offline help and notification fixes', message: 'Offline Retry and Help now work from the cached fallback page, and notification setup can create a local token before cloud sync.', type: 'info', active: true, version: '0.4.0' },
  { id: 'shop-action-sync-0-4-0', title: 'Today: Shop items now match actions', message: 'Food, snacks, medicine, and toys bought in Shop now show up in the matching care action pickers and Inventory use flow.', type: 'info', active: true, version: '0.4.0' },
  { id: 'offline-global-tuning-0-4-0', title: 'Today: Offline fallback and global tuning', message: 'Refreshes while offline can show the Pixel Paws offline page after one online visit, and global shop discounts now apply from tuning config.', type: 'info', active: true, version: '0.4.0' },
  { id: 'welcome-0-3-0', title: 'Welcome to Pixel Paws!', message: 'Invite a friend and care for your pet together.', type: 'info', active: true, version: '0.3.0' },
  { id: 'guest-trial-0-3-0', title: 'Guest Trial', message: 'Guest mode now gives five minutes to try the game before upgrading.', type: 'warning', active: true, version: '0.3.0' },
] as const;
