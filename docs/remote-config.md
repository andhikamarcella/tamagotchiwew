# Firebase Remote Events — Pixel Paws v2.0

Pixel Paws must remain playable when Firebase is absent. Remote readers should validate every field and fall back to bundled seasonal events/news when a document is missing, expired, malformed, or permission-denied.

## Recommended paths

- `remoteConfig/global` — global flags and active event ID
- `events/{eventId}` — one validated event document
- `news/{newsId}` — global update announcement
- `users/{uid}/singlePlayerSave/main` — optional single-player cloud save
- `coupleRooms/{roomId}` — realtime couple room

## Eid Celebration

```json
{
  "id": "eid_celebration_2026", "title": "Eid Celebration", "tag": "eid", "enabled": true,
  "startsAt": "2026-03-20T00:00:00+07:00", "endsAt": "2026-04-05T23:59:59+07:00", "bannerEmoji": "🌙",
  "description": "Celebrate Eid with limited gifts, cozy furniture, and special pet rewards.",
  "currency": { "id": "eid_tokens", "name": "Eid Tokens", "emoji": "🌙" },
  "loginRewards": [{ "day": 1, "coins": 250, "eventCurrency": 10 }, { "day": 7, "itemId": "eid_lantern", "eventCurrency": 50 }, { "day": 14, "itemId": "eid_badge", "eventCurrency": 100 }, { "day": 30, "variantId": "golden_cat", "eventCurrency": 300 }],
  "limitedShop": [{ "itemId": "eid_lantern", "price": 120, "currency": "eid_tokens" }, { "itemId": "eid_carpet", "price": 180, "currency": "eid_tokens" }],
  "limitedEggs": [{ "eggId": "eid_moon_egg", "price": 300, "currency": "eid_tokens" }],
  "updatedAt": "2026-01-01T00:00:00+07:00"
}
```

## Ramadan Cozy Night

```json
{
  "id": "ramadan_cozy_night_2026", "title": "Ramadan Cozy Night", "tag": "ramadan", "enabled": true,
  "startsAt": "2026-02-15T00:00:00+07:00", "endsAt": "2026-03-19T23:59:59+07:00", "bannerEmoji": "🕌",
  "description": "Enjoy calm nights, special care quests, cozy decor, and Ramadan rewards.",
  "currency": { "id": "ramadan_stars", "name": "Ramadan Stars", "emoji": "⭐" },
  "dailyQuest": { "id": "ramadan_daily_care", "title": "Cozy Night Care", "tasks": [{ "type": "feed", "count": 1 }, { "type": "clean", "count": 1 }, { "type": "sleep", "count": 1 }], "reward": { "coins": 300, "eventCurrency": 15 } },
  "limitedShop": [{ "itemId": "ramadan_lantern", "price": 100, "currency": "ramadan_stars" }, { "itemId": "cozy_prayer_rug", "price": 160, "currency": "ramadan_stars" }],
  "updatedAt": "2026-01-01T00:00:00+07:00"
}
```

## Validation and publishing

Require a non-empty `id`, `title`, supported `tag`, boolean `enabled`, parseable ISO timestamps where `endsAt > startsAt`, non-negative prices/rewards, and arrays for reward/shop lists. Ignore unknown optional fields. Never render remote HTML. Firestore rules version expected by v2.0 is **5**; publish updates with `firebase deploy --only firestore:rules`.
