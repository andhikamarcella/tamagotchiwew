export const GAME_VERSION = '2.0.0';
export const GAME_VERSION_LABEL = 'Major Update';
export const RELEASE_CHANNEL = 'stable';
export const GAME_BUILD_DATE = '2026-06-08';
export const GAME_NAME = 'Pixel Paws';

export const CHANGELOG = [
  {
    version: 'v2.0.0 - Major Update',
    date: '2026-06-08',
    title: 'Pixel Paws v2.0',
    changes: [
      'Pet Personality gameplay effects', 'Egg & Breeding System', 'Pet Variants / Shiny', 'Revive System',
      'Event Calendar & Login Streak', 'Expanded Errands / Pet Jobs', 'Crafting Expansion', 'Skill Tree',
      'Weekly Tournament', 'Emotional Pet Diary', 'Save Backup Guard', 'Save Migration', 'Error Recovery',
      'Cloud Sync and Conflict Resolver foundations', 'Smart Warnings', 'Inventory Filter', 'Couple Daily Check-in safety',
      'QA/Debug Tools', 'Firebase Remote Event Guide'
    ],
  },
  {
    version: 'v1.0.0 - Beta Launch',
    date: '2026-05-21',
    title: 'Life, Events, and Habitat Update',
    changes: [
      'Added pet death game over popup.',
      'Added reset progress and sign-in-again flow after pet death.',
      'Added memorial creation before reset.',
      'Added new journey flow after reset.',
      'Added Cozy, Normal, and Challenge gameplay modes.',
      'Added automatic seasonal events based on date.',
      'Added Remote Config event override support.',
      'Added event shop items for Night Festival, Summer Beach, Ramadan, Eid, Halloween, Anniversary, Christmas, New Year, and Cozy Winter.',
      'Added event calendar.',
      'Added event banners and seasonal news.',
      'Improved habitat backgrounds with real 8-bit visual scenes.',
      'Improved mini games to match their actual titles.',
      'Improved offline sync permission handling.',
      'Improved save reset safety.',
      'Improved mobile UI and 8-bit polish.',
      'Fixed invisible loading/checking login text.',
      'Fixed offline sync error messaging.',
      'Fixed notification token sync rules.',
      'Fixed mini game reward duplication issues.',
      'Fixed habitat equip state persistence.',
    ],
  },
  {
    version: '0.5.0',
    date: '2026-05-11',
    title: 'Real Mini Games & PWA Update',
    changes: [
      'Rebuilt active mini games so each one matches its title instead of random tapping.',
      'Added real card matching, food catching, runner jumping, bubble popping, treasure digging, fishing, fruit sorting, rhythm timing, maze movement, bug whacking, pattern memory, cleaning, snack stacking, and star catching loops.',
      'Disabled unfinished mini games with clear Coming Soon reasons instead of fake play buttons.',
      'Tutorial highlight now starts after the user taps Mulai Adopt/adopts a first pet.',
      'Added Android/iPhone PWA manifest metadata for installable standalone play.',
      'Expanded trait options with Lazy and Clingy and kept migration compatibility.',
    ],
  },
  {
    version: '0.4.0',
    date: '2026-05-11',
    title: 'Major Gameplay, Quests, Offline & Global Updates',
    changes: [
      'Added interactive onboarding tutorial with saved progress and completion reward.',
      'Added Help / Guidebook, Quest Board, Mailbox, Notification Center, and Room Decoration pages.',
      'Expanded daily goals and weekly quests with safe one-time claim buttons.',
      'Added save schema defaults for profile showcase, mail, notifications, room decor, album, and player rank.',
      'Fixed offline fallback buttons so Retry and Offline Help work while Wi-Fi is disconnected.',
      'Allowed notification setup to create a local device token for guests and sync it when signed in.',
      'Synced shop inventory items into Feed, Snack, Medicine, and Play action pickers.',
      'Fixed global shop discounts from remote tuning so discounts apply even outside weekly events.',
    ],
  },
  { version: '0.3.0', date: '2026-05-10', title: 'Couple Mode & Guest Trial', changes: ['Added invite code rooms.', 'Added guest trial.', 'Improved pet care actions.', 'Improved mobile layout.'] },
  { version: '0.2.0', date: '2026-05-01', title: 'Care Update', changes: ['Added detailed care options.', 'Expanded shop items.', 'Improved save import/export.'] },
] as const;
export const ANNOUNCEMENTS = [
  {
    id: 'pixel-paws-v2-major-update', title: 'Pixel Paws v2.0 Major Update!',
    message: 'Safer saves, backups, personality effects, eggs, variants, revival, jobs, events, news, and friendly cloud fallbacks have arrived.',
    type: 'info', active: true, version: '2.0.0', badge: 'New v2.0'
  },
  {
    id: 'beta-launch-life-events-1-0-0',
    title: 'Pixel Paws v1.0.0 Beta is Here!',
    message: 'Life events, seasonal celebrations, better habitats, safer offline sync, and improved mini games are now part of Pixel Paws Beta Launch.',
    type: 'info',
    active: true,
    version: '1.0.0',
    badge: 'Beta Launch',
  },
  {
    id: 'automatic-seasonal-events-1-0-0',
    title: 'Seasonal Events Are Now Automatic!',
    message: 'Pixel Paws now changes events based on real celebration dates, including Halloween, Christmas, Summer Beach, Night Festival, Anniversary, Ramadan, and Eid.',
    type: 'info',
    active: true,
    version: '1.0.0',
    badge: 'Events',
  },
  {
    id: 'life-system-added-1-0-0',
    title: 'New Life System Added',
    message: 'Pets now have critical warnings, memorials, reset journeys, and gameplay modes so every care decision matters.',
    type: 'warning',
    active: true,
    version: '1.0.0',
    badge: 'Life System',
  },
  { id: 'real-mini-games-pwa-0-5-0', title: 'Today: v0.5.0 real mini games + PWA', message: 'Mini games now use title-matching gameplay, unfinished games are disabled instead of fake, tutorial highlight starts after adoption, and Pixel Paws has Android/iPhone PWA metadata.', type: 'info', active: true, version: '0.5.0' },
  { id: 'major-gameplay-0-4-0', title: 'Today: Major gameplay expansion', message: 'Tutorial, Guidebook, Quest Board, Mailbox, Notification Center, Room Decor, expanded daily goals, and weekly quests are now available.', type: 'info', active: true, version: '0.4.0' },
  { id: 'offline-help-fcm-0-4-0', title: 'Today: Offline help and notification fixes', message: 'Offline Retry and Help now work from the cached fallback page, and notification setup can create a local token before cloud sync.', type: 'info', active: true, version: '0.4.0' },
  { id: 'shop-action-sync-0-4-0', title: 'Today: Shop items now match actions', message: 'Food, snacks, medicine, and toys bought in Shop now show up in the matching care action pickers and Inventory use flow.', type: 'info', active: true, version: '0.4.0' },
  { id: 'welcome-0-3-0', title: 'Welcome to Pixel Paws!', message: 'Invite a friend and care for your pet together.', type: 'info', active: true, version: '0.3.0' },
] as const;
