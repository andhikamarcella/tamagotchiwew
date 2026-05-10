# Pixel Paws: 8-Bit Animal Tamagotchi

Pixel Paws adalah game virtual pet bergaya 8-bit dengan single-player LocalStorage dan Couple Mode online memakai Firebase Anonymous Auth + Firestore. Single player tetap berjalan tanpa Firebase; Couple Mode otomatis menampilkan setup notice jika env Firebase belum diisi.

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

Tidak perlu backend custom, API route, Firebase Hosting, Firebase Admin SDK, service account, Supabase, atau secret key di client.

## Firebase Couple Mode Setup

1. Buka Firebase Console.
2. Create project.
3. Add Web App.
4. Copy Firebase config.
5. Enable Authentication.
6. Enable Anonymous Sign-In.
7. Enable Firestore Database.
8. Paste isi `firebase/firestore.rules` ke tab Firestore Rules.
9. Buka **Vercel Project Settings > Environment Variables**.
10. Isi env berikut:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

11. Redeploy project setelah env diisi atau diubah.
12. Buka menu **Couple**.
13. Create Invite Code.
14. Share code ke teman/pacar.
15. Teman join pakai code.

File `.env.example` sudah disediakan sebagai template. Jangan commit `.env.local`; env asli Firebase cukup diisi di Vercel.

## Cara kerja data

- Single player memakai LocalStorage browser.
- Couple Mode memakai Firebase Web SDK, Anonymous Auth, dan Firestore.
- App tetap bisa dibuka tanpa env Firebase; Couple Mode disabled dengan pesan “Online Couple Mode needs Firebase setup.”
- Data Couple Mode tersimpan di Firestore dan ditujukan untuk casual multiplayer game.
- Jangan simpan data sensitif.

## File penting

- `app/layout.tsx`, `app/page.tsx`, `app/globals.css` — Next.js App Router dan style global pixel.
- `src/components/PixelPalsApp.tsx` — aplikasi utama single player + navigasi Couple.
- `src/components/couple/CoupleModePage.tsx` — UI Couple Mode realtime.
- `src/hooks/useCoupleMode.ts` — hooks Firebase untuk auth, create/join room, realtime, presence, actions, gifts, quests, album, shared shop, leave/close/kick.
- `src/lib/firebase.ts` — Firebase client SDK yang aman saat env kosong.
- `lib/gameData.ts`, `lib/gameLogic.ts`, `lib/types.ts` — data dan logic single-player.
- `firebase/firestore.rules` — Firestore rules casual anonymous Couple Mode.
- `.env.example` — template env Vercel.

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
- [ ] Anonymous Auth aktif setelah env diisi.
- [ ] User bisa create invite code 6 karakter.
- [ ] Invite code bisa dicopy dan dishare.
- [ ] User lain bisa join pakai code.
- [ ] Invite code invalid, room closed, dan room penuh ditangani dengan toast ramah.
- [ ] Shared pet dibuat otomatis saat create room.
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
