# Pixel Paws v2.0 Architecture and Operations

## Save lifecycle

`saveVersion` is currently 6. Loading follows: read raw LocalStorage → preserve a pre-migration backup → apply idempotent migrations → normalize legacy fields → validate/repair bounded numeric and relational values → apply offline progress → debounce validated writes. Repair details are retained in `metadata.repairLog`; suspicious but non-blocking conditions belong in `metadata.antiCheatFlags`.

Backups use `pixel-paws-backups-v2`, retain five records, and include ID, timestamp, reason, save version, pet name, level, coins, app version, and raw JSON. Reasons are `auto`, `before-reset`, `before-import`, `before-migration`, `corrupt-save`, and `manual`.

## Cloud sync and conflict policy

Cloud sync is opt-in and requires authenticated Firebase. Store `{ save, saveVersion, appVersion, updatedAt, deviceName, checksum, syncSource }` at `users/{uid}/singlePlayerSave/main`. Before replacing either side, create a local backup. A conflict resolver should offer local, cloud, or safe merge: union achievements/collections/variants, take maximum (not sum) coins and inventory quantities, and explicitly choose one active pet. Debounce writes and never silently overwrite a newer document.

## Firebase fallback

Without Firebase configuration, single-player, local tournaments, local events, local news, migration, backups, breeding, revival, and skills continue working. Couple Mode, cloud sync, and remote content show disabled/setup messaging. Invalid remote documents are ignored in favor of local data.

## Testing

Use `/debug` in development for coins, low stats, death, revival token, ready egg, completed errand, backups, and corrupt-save recovery. Use `/qa` for the manual release checklist. Run `npm run lint`, `npm run build`, and `npm run check`.
