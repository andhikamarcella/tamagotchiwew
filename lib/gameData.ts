import type { Achievement, Animal, Mood, ShopItem } from './types';

export const animals: Animal[] = [
  ['cat','Kucing','🐱','#f59e0b','Manja dan penasaran','Pixel Fish','Yarn Ball','Cozy Room',0],
  ['dog','Anjing','🐶','#a16207','Setia dan energik','Bone Snack','Pixel Ball','Forest',0],
  ['rabbit','Kelinci','🐰','#f9a8d4','Lembut dan cepat','Carrot Cube','Bubble Wand','Forest',0],
  ['hamster','Hamster','🐹','#fbbf24','Imut dan rajin ngemil','Seed Pack','Tiny Skateboard','Cozy Room',120],
  ['chicken','Ayam','🐔','#fde047','Riang pagi hari','Seed Pack','Rubber Duck','Forest',160],
  ['duck','Bebek','🦆','#facc15','Santai dan suka air','Seaweed Chip','Rubber Duck','Beach',180],
  ['panda','Panda','🐼','#e5e7eb','Kalem dan pelukable','Berry Bit','Bubble Wand','Bamboo Garden',260],
  ['fox','Rubah','🦊','#fb923c','Cerdik dan lincah','Berry Bit','Pixel Ball','Forest',280],
  ['koala','Koala','🐨','#94a3b8','Ngantuk dan cozy','Berry Bit','Snowball','Bamboo Garden',320],
  ['penguin','Penguin','🐧','#60a5fa','Dingin tapi ceria','Seaweed Chip','Snowball','Snow Land',360],
  ['turtle','Kura-kura','🐢','#22c55e','Sabar dan bijak','Seaweed Chip','Bubble Wand','Beach',420],
  ['axolotl','Axolotl','🦎','#f9a8d4','Ajaib dan ramah','Seaweed Chip','Bubble Wand','Aquarium',500],
].map(([id, species, emoji, color, personality, favoriteFood, favoriteToy, favoriteHabitat, unlockCost]) => ({
  id: String(id), species: String(species), emoji: String(emoji), color: String(color), personality: String(personality), favoriteFood: String(favoriteFood), favoriteToy: String(favoriteToy), favoriteHabitat: String(favoriteHabitat), unlockCost: Number(unlockCost),
  expressions: { Senang:'^_^', Lapar:'o_o', Ngantuk:'-_-', Kotor:'x_x', Sakit:'@_@', Bosan:'._.', Sedih:'T_T', Tidur:'zzz', Manja:'♥_♥', 'Very Sick':'!!!' },
}));

const foodNames = ['Pixel Fish','Bone Snack','Carrot Cube','Seed Pack','Berry Bit','Seaweed Chip','Apple Byte','Milk Bit','Honey Pixel','Mushroom Dot','Bamboo Bite','Ice Pop','Corn Kernel','Peach Chip','Cookie Cog','Rice Pixel','Lettuce Leaf','Shrimp Bit','Banana Byte','Melon Cube'];
const toyNames = ['Pixel Ball','Yarn Ball','Tiny Skateboard','Bubble Wand','Rubber Duck','Snowball','Laser Dot','Feather Wand','Mini Drum','Kite Bit','Puzzle Cube','Arcade Stick','Jump Rope','Shell Spinner','Star Yo-Yo'];
const accNames = ['Tiny Hat','Red Bow','Pixel Glasses','Star Pin','Mini Crown','Scarf','Wizard Cap','Flower Clip','Hero Cape','Rain Boots','Moon Badge','Neon Mask'];
const decNames = ['Rug','Lamp','Plant','Poster','Clock','Cushion','Pixel Sofa','Bookshelf','Fish Bowl','Window','Cloud Mobile','Gem Statue'];
const habitatNames = ['Cozy Room','Forest','Beach','Snow Land','Bamboo Garden','Aquarium'];
export const shopItems: ShopItem[] = [
  ...foodNames.map((name, i) => ({ id:`food-${i}`, category:'Food' as const, name, price:20+i*5, description:`Makanan pixel lezat: ${name}.`, effect:'+Hunger +Happiness', emoji:['🐟','🦴','🥕','🌱','🫐','🌿'][i%6] ?? '🍪', statEffects:{ hunger:18, happiness:4 } })),
  ...toyNames.map((name, i) => ({ id:`toy-${i}`, category:'Toys' as const, name, price:45+i*7, description:`Mainan retro untuk bermain: ${name}.`, effect:'+Happiness +XP', emoji:['⚽','🧶','🛹','🫧','🦆','❄️'][i%6] ?? '🎲', statEffects:{ happiness:16, xp:8 } })),
  ...accNames.map((name, i) => ({ id:`acc-${i}`, category:'Accessories' as const, name, price:80+i*10, description:`Aksesori lucu: ${name}.`, effect:'Equip kosmetik', emoji:['🎩','🎀','🕶️','⭐','👑','🧣'][i%6] ?? '💠' })),
  ...decNames.map((name, i) => ({ id:`dec-${i}`, category:'Decorations' as const, name, price:70+i*8, description:`Dekorasi habitat: ${name}.`, effect:'Equip dekorasi', emoji:['▰','💡','🪴','🖼️','🕒','🛋️'][i%6] ?? '◆' })),
  ...habitatNames.map((name, i) => ({ id:`hab-${i}`, category:'Habitats' as const, name, price:i===0?0:150+i*60, description:`Habitat ${name} dengan nuansa unik.`, effect:'Equip habitat', emoji:['🏠','🌲','🏖️','⛄','🎍','🌊'][i] ?? '🏠' })),
];
export const achievements: Achievement[] = [
  ['first-meal','First Meal','Kasih makan pertama kali',50,'🍽️'],['clean-10','Clean Buddy','Bersihkan 10 kali',90,'🧼'],['play-10','Playful Pal','Main 10 kali',90,'🎾'],['sleep-5','Sleepy Friend','Tidur 5 kali',80,'💤'],['healthy-hero','Healthy Hero','Sembuhkan pet',100,'💊'],['level-10','Level 10','Capai level 10',150,'🔟'],['level-25','Level 25','Capai level 25',300,'🌟'],['level-50','Level 50','Capai level 50',700,'🏆'],['rich-keeper','Rich Keeper','Kumpulkan 1000 coin',200,'🪙'],['collector-5','Animal Collector','Punya 5 hewan',250,'📚'],['perfect-day','Perfect Day','Semua stat di atas 90',200,'☀️'],['best-friend','Best Friend','Affection 100',180,'💖'],
].map(([id,title,description,reward,badge]) => ({ id:String(id), title:String(title), description:String(description), reward:Number(reward), badge:String(badge) }));
export const dialogs: Record<Mood, string[]> = {
  Senang:['Hari ini pixel-perfect!','Aku siap petualangan 8-bit!','Terima kasih sudah merawatku!','Bip bop, mood-ku cerah!','Ayo kumpulkan coin lagi!'],
  Lapar:['Perutku berbunyi chiptune...','Aku mau makanan favoritku!','Snack pixel terdengar enak.','Makan dulu yuk!','Energi hati mulai low.'],
  Ngantuk:['Mataku tinggal satu pixel...','Boleh tidur sebentar?','Zzz hampir datang.','Kasur retro memanggil.','Aku butuh recharge.'],
  Kotor:['Aku butuh mandi gelembung!','Debu pixel menempel.','Bersihkan aku dong.','Aku tidak kinclong lagi.','Sabun 8-bit please!'],
  Sakit:['Badanku glitchy...','Obat mungkin membantu.','Aku butuh dirawat pelan-pelan.','Pixel-ku pucat.','Tolong jangan ajak latihan dulu.'],
  Bosan:['Aku ingin main sesuatu.','Ayo cari mini game!','Bip... bosan... bop.','Mainan favoritku mana?','Aku butuh hiburan.'],
  Sedih:['Peluk aku dong.','Aku merasa sedikit abu-abu.','Elus aku biar ceria.','Aku kangen perhatianmu.','Semoga besok lebih cerah.'],
  Tidur:['Zzz... mimpi coin.','Tidur mode aktif.','Jangan berisik ya...','Recharge pixel...','Zzz bip zzz.'],
  Manja:['Aku mau dielus lagi!','Kamu keeper terbaik!','Dekat-dekat sini dong.','Hatiku penuh pixel love.','Aku sayang kamu!'],
  'Very Sick':['Aku sangat lemah...','Obat dan kebersihan please.','Health-ku nol, tapi aku aman.','Rawat aku sampai pulih.','Mode perawatan darurat.'],
};
