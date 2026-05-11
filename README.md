# Pixel Paws: 8-Bit Animal Tamagotchi

Pixel Paws adalah game virtual pet bergaya 8-bit dengan single-player LocalStorage dan Couple Mode online memakai Firebase Auth + Firestore. Login online sengaja dibuat sederhana dan stabil: **Google**, **Microsoft**, **Email/Password**, dan **Guest Mode/Anonymous** saja. Single player tetap bisa dimainkan secara lokal; fitur online menampilkan setup notice jika env Firebase belum diisi.

## Cara jalan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Cara build

```bash
npm run build
npm run start
```

## Deploy ke Vercel

1. Push project ke GitHub.
2. Buka Vercel.
3. Import project.
4. Framework Preset: **Next.js**.
5. Build command: `npm run build`.
6. Output directory: default Next.js.
7. Deploy.
8. Tambahkan domain Vercel ke **Firebase Authentication > Settings > Authorized domains**.
9. Tambahkan custom domain juga jika kamu memakai domain sendiri.

Tidak perlu backend custom, API route, Firebase Hosting, Firebase Admin SDK, service account, Supabase, atau secret key di client.

## Firebase Auth + Couple Mode Setup

1. Buka Firebase Console.
2. Create project.
3. Add Web App.
4. Copy Firebase config.
5. Buka **Authentication > Sign-in method** dan enable hanya provider berikut:
   - **Google** — aktifkan Google provider.
   - **Microsoft** — aktifkan Microsoft provider, lalu isi **Application ID** dan **Application Secret** dari Microsoft Entra. Redirect URI Firebase yang perlu dipasang di Microsoft Entra: `https://pixel-paws-tamagotchi.firebaseapp.com/__/auth/handler` (sesuaikan project auth domain jika berbeda). Jika muncul `AADSTS50020`, ubah Microsoft App Registration account type agar mengizinkan personal Microsoft accounts.
   - **Email/Password** — aktifkan Email/Password provider.
   - **Anonymous** — aktifkan Anonymous provider untuk tombol **Continue as Guest**.
6. Jangan enable provider lain; app ini hanya mendukung metode login di atas.
7. Buka **Authentication > Settings > Authorized domains**:
   - Tambahkan domain Vercel tanpa `https://`, misalnya `tamagotchiwow-xxxxx.vercel.app`.
   - Tambahkan custom domain jika ada.
   - Untuk lokal, pastikan `localhost` tetap ada.
8. Enable Firestore Database.
9. Paste isi `firebase/firestore.rules` ke tab Firestore Rules lalu publish.
10. Buka **Vercel Project Settings > Environment Variables**.
11. Isi env berikut:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_APP_URL=https://pxlpaws.vercel.app
```

Opsional:

```bash
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_AUTH_ACTION_URL=https://pxlpaws.vercel.app/auth/action
```

12. Redeploy project setelah env diisi atau diubah.

> Password reset / verifikasi email / change email memakai `/auth/action`. Isi `NEXT_PUBLIC_APP_URL=https://pxlpaws.vercel.app` dan opsional `NEXT_PUBLIC_AUTH_ACTION_URL=https://pxlpaws.vercel.app/auth/action` di Vercel Project Settings, lalu redeploy. Pastikan `pxlpaws.vercel.app` ada di **Firebase Authentication > Settings > Authorized domains**. Jangan pakai random Vercel preview domain untuk action URL atau OAuth testing kecuali domain preview itu juga sudah authorized.
13. Login memakai Google, Microsoft, Email/Password, atau Continue as Guest.
14. Buka menu **Couple**.
15. Create Invite Code.
16. Share code ke teman/pacar.
17. Teman join pakai code.

File `.env.example` sudah disediakan sebagai template. Jangan commit `.env.local`; env asli Firebase cukup diisi di Vercel.

## Cara kerja data

- Single player memakai LocalStorage browser.
- Login online memakai Firebase Web SDK Auth: Google, Microsoft, Email/Password, dan Anonymous saja.
- Couple Mode memakai Firestore realtime untuk rooms, shared pet, events, quests, gifts, inventory, album, dan presence.
- App tetap bisa dibuka tanpa env Firebase; login online dan Couple Mode disabled dengan setup notice yang ramah.
- Data Couple Mode tersimpan di Firestore dan ditujukan untuk casual multiplayer game.
- Jangan simpan data sensitif.

## File penting

- `app/layout.tsx`, `app/page.tsx`, `app/globals.css` — Next.js App Router dan style global pixel.
- `src/components/PixelPalsApp.tsx` — aplikasi utama single player + navigasi Couple + auth gate.
- `src/components/LoginPage.tsx` — Login bersih untuk Google, Microsoft, Email/Password, Forgot Password, dan Guest Mode.
- Guest Mode memakai trial 5 menit yang disimpan di LocalStorage (`pixel-paws-guest-trial-start`, `pixel-paws-guest-trial-expired`, `pixel-paws-guest-save-cache`), menampilkan countdown, mengunci gameplay/Couple Mode saat habis, dan mencoba menyimpan backup progress guest saat user upgrade ke akun login.
- `src/components/couple/CoupleModePage.tsx` — UI Couple Mode realtime.
- `src/hooks/useAuth.ts` — hook Firebase Auth sederhana tanpa provider lama.
- `src/hooks/useCoupleMode.ts` — hooks Firebase untuk create/join room, realtime, presence, actions, gifts, quests, album, shared shop, leave/close/kick.
- `src/lib/firebase.ts` — Firebase client SDK yang aman saat env kosong.
- `src/lib/firebaseErrors.ts` — mapping error Firebase ke pesan ramah.
- `src/lib/inviteCode.ts` — helper generate/normalize/validasi invite code.
- `lib/gameData.ts`, `lib/gameLogic.ts`, `lib/types.ts` — data dan logic single-player.
- `firebase/firestore.rules` — Firestore rules untuk Google, Microsoft, Email/Password, dan Anonymous Guest.
- `.env.example` — template env Vercel.


## Troubleshooting Password Reset

- Pastikan **Authentication > Sign-in method > Email/Password** sudah enabled.
- Pastikan domain production/custom domain sudah masuk **Authentication > Settings > Authorized domains**.
- Isi `NEXT_PUBLIC_APP_URL` dengan domain authorized tersebut lalu redeploy.
- Jika pakai preview Vercel yang domainnya berubah-ubah, jangan jadikan preview URL sebagai action URL permanen; pakai production/custom domain yang authorized.
- OAuth Google/Microsoft juga butuh authorized domain yang sama agar setelah sign-in user kembali ke Pixel Paws, bukan berhenti di callback/blank page.
- Setelah klik reset, cek Inbox, Spam, Promotions, dan batas rate-limit Firebase. Firebase juga bisa tetap menampilkan sukses untuk mencegah email enumeration, jadi pastikan email benar-benar terdaftar.

## Troubleshooting Create Invite Code

- `Permission denied. Please check Firestore rules.` berarti rules di `firebase/firestore.rules` belum dipaste/publish ulang di Firebase Console.
- `Please login first.` berarti user belum berhasil login Google, Microsoft, Email, atau Guest sebelum membuka Couple Mode.
- `Firebase is not configured` berarti env Firebase di Vercel belum lengkap atau project belum redeploy setelah env diubah.
- Jika tombol sempat menampilkan `Creating...`, flow create room punya timeout 15 detik dan tombol akan aktif lagi dengan error yang bisa dicoba ulang.

## Checklist manual Auth

- [ ] Google login jalan.
- [ ] Microsoft login jalan.
- [ ] Email login jalan.
- [ ] Email register jalan.
- [ ] Forgot Password mengirim email reset.
- [ ] Continue as Guest jalan jika Anonymous enabled.
- [ ] Jika Anonymous belum enabled, muncul pesan “Guest mode is not enabled. Please use Google, Microsoft, or Email login.” dan app tidak stuck.
- [ ] Logout jalan dari Firebase Auth.
- [ ] `users/{uid}` dibuat/update setelah login.
- [ ] Tidak ada tombol/provider lain di luar Google, Microsoft, Email/Password, dan Guest Mode.

## Checklist manual single player

- [ ] User baru bisa pilih hewan.
- [ ] Data tersimpan setelah refresh.
- [ ] Tombol feed/play/clean/sleep berfungsi.
- [ ] Stat tidak lebih dari 100 atau kurang dari 0.
- [ ] Coin bertambah/berkurang benar.
- [ ] Shop tidak bisa beli jika coin kurang.
- [ ] Inventory bisa pakai item.
- [ ] Achievement tidak double claim.
- [ ] Daily reward hanya bisa 1 kali per hari.
- [ ] Mini game memberi reward.
- [ ] Import/export save data berfungsi.
- [ ] Reset data berfungsi.
- [ ] Mobile layout rapi.
- [ ] Tidak ada error console besar.
- [ ] Build berhasil.

## Checklist manual Couple Mode

- [ ] Tanpa env Firebase, `npm run build` sukses dan Couple Mode menampilkan setup notice.
- [ ] User sudah login Google/Microsoft/Email/Guest sebelum create/join room.
- [ ] User bisa create invite code 6 karakter otomatis.
- [ ] Invite code unik, uppercase, dan tidak memakai O/0/I/1.
- [ ] Invite code bisa dicopy dan dishare.
- [ ] Room, shared pet, first event, dan quest docs dibuat dengan batch.
- [ ] Create Invite Code tidak stuck di “Creating...” dan tombol aktif lagi setelah error.
- [ ] User lain bisa join pakai code.
- [ ] Invite code invalid, room closed, dan room penuh ditangani dengan toast ramah.
- [ ] Shared pet stat berubah lewat action dan sync realtime di browser lain.
- [ ] Activity feed muncul realtime.
- [ ] Presence update setiap 30 detik dan interval dibersihkan saat unmount.
- [ ] Couple bond naik setelah action.
- [ ] Leave room dan close room berjalan.

## Gameplay polish terbaru

- Semua care action utama sekarang membuka picker pilihan: Feed, Snack, Play, Clean, Medicine, Pet, Walk, Train, Sleep, dan Wake.
- Setiap pilihan menampilkan icon, deskripsi, efek stat, level unlock, biaya/quantity, badge favorite, dan disabled reason.
- Dashboard punya scene pixel ringan, efek cuaca/habitat, animasi pet per action, dialog, daily mini goal, dan activity log.
- Shop punya `ShopStickyWallet` sehingga coin, active pet, dan daily reward status tetap terlihat saat scroll.
- Item shop bisa dibeli lewat detail modal, quick buy, buy 5 untuk consumable, buy & use untuk item yang bisa langsung dipakai, dan inventory mendukung use/equip/unequip.

## Optional Firebase Advanced Features

Pixel Paws can use optional Firebase services without making the app crash when they are not configured. Leave the flags empty/`false` to keep the related cards disabled with an explanation.

### FCM Web Push

1. Open **Firebase Console > Project settings > Cloud Messaging**.
2. Generate a Web Push certificate / VAPID key.
3. Add `NEXT_PUBLIC_FIREBASE_VAPID_KEY` in Vercel.
4. Set `NEXT_PUBLIC_ENABLE_FCM=true` and redeploy.
5. Users must click **Enable notifications** in Settings before the browser permission prompt appears.
6. When granted, the web token is saved under `users/{uid}/notificationTokens/{tokenId}` in Firestore.
7. Scheduled push reminders such as hungry pet, sleepy pet, daily reward, weekly event, or room updates require a backend/Cloud Functions later. The frontend only requests permission, stores the token, and can show foreground in-app messages when a server sends FCM.

### Remote Config

1. Open **Firebase Console > Remote Config**.
2. Add these parameters as needed:
   - `maintenance_mode`
   - `maintenance_message`
   - `announcement_title`
   - `announcement_message`
   - `weekly_event_enabled`
   - `weekly_event_title`
   - `shop_discount_percent`
   - `daily_reward_multiplier`
   - `care_xp_multiplier`
   - `coin_reward_multiplier`
   - `couple_mode_enabled`
   - `guest_trial_minutes`
   - `latest_version`
   - `min_supported_version`
3. Set `NEXT_PUBLIC_ENABLE_REMOTE_CONFIG=true` and redeploy.
4. If Firebase or Remote Config is unavailable, the app falls back to safe local defaults from `src/config/defaultRemoteConfig.ts`.
5. Values are clamped in the client: multipliers stay between `0.1` and `5`, discounts between `0` and `80`, and guest trial minutes between `1` and `60`.

### Analytics and performance audits

- Vercel Analytics remains the app-level analytics option via `@vercel/analytics`.
- No Firebase Performance Monitoring panel or in-game performance dashboard is included.
- Use PageSpeed Insights or Vercel Analytics externally for performance audits.

## Offline Mode & Sync

Pixel Paws is designed to keep single-player safe when the network drops.

- The app listens to browser `online` / `offline` events and shows a connection banner when offline or reconnecting.
- Single-player progress continues locally while offline. The active save is still written to LocalStorage.
- Offline save updates are queued in `pixel-paws-offline-queue-v1` and compacted so the queue does not grow without limit.
- When a signed-in user comes back online, Pixel Paws debounces sync and writes queued single-player state to Firestore under that user.
- Queue items are only removed after a successful Firestore write. Firestore permission/network errors keep the queue available for retry.
- Couple Mode is online-only. When offline, room create/join/shared actions are paused with a clear message instead of leaving loading states stuck.
- Settings includes **Offline & Sync** with network status, pending changes, last sync time, Sync now, and Clear offline queue. Clearing the queue does not delete the active LocalStorage save.

## Troubleshooting FCM token-subscribe-failed

If enabling notifications still fails with `messaging/token-subscribe-failed` or “missing required authentication credential”:

- Confirm Vercel has the same Firebase web app config shown in Settings > Push Notifications diagnostics:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID=pixel-paws-tamagotchi`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=330948794614`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
- Click **Reset notification service worker** in Settings > Push Notifications, then refresh and try Enable notifications again.
- In Google Cloud Console > APIs & Services > Credentials, open the API key used by the Firebase web app.
- For testing, temporarily set Application restrictions to **None**, or ensure HTTP referrers include:
  - `https://pxlpaws.vercel.app/*`
  - `https://*.vercel.app/*`
- Ensure API restrictions allow Firebase Cloud Messaging API and Firebase Installations API, or leave the key unrestricted during testing.
- Redeploy after changing env vars and clear old site/service-worker data if the browser keeps stale workers.
- Never put service account JSON, server keys, or Firebase Admin credentials in the frontend.
