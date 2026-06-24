// scripts/seedData.js
//
// Dữ liệu mẫu cho OEG Cyber Hub F&B Queue App.
// File này CHỈ chứa dữ liệu tĩnh — không gọi Firebase.
// seed.js sẽ import và nạp vào Firestore / Auth.
//
// Lưu ý ESM: file dùng import/export → package.json cần "type": "module".

// ───────────────────────────────────────────────────────────────────────────
// ẢNH MÓN ĂN — Unsplash (license free, nhúng trực tiếp, KHÔNG cần Storage)
// ───────────────────────────────────────────────────────────────────────────
// Mỗi giá trị là ID ảnh Unsplash thật đã kiểm chứng. URL render theo mẫu:
//   https://images.unsplash.com/photo-<ID>?w=600&h=400&fit=crop&q=70
//
// Muốn đổi ảnh 1 món: vào unsplash.com, mở ảnh, chuột phải → Copy image address,
// lấy đoạn "photo-xxxx" rồi thay vào map dưới đây.
const UNSPLASH = {
  burger:       '1556816238-6c9caf68f140', // cheese burger
  friedChicken: '1657271511865-f610b280dca4', // crispy fried chicken
  pizza:        '1458642849426-cfb724f15ef7', // pizza
  noodles:      '1633271333045-d6cd23567743', // asian noodles bowl
  fries:        '1665117861973-fffa50c1afec', // french fries
  chickenRice:  '1742936401683-3c803809b420', // fried chicken + rice
  banhMi:       '1647169953827-a7c85f324caf', // bánh mì Việt Nam
  vnCoffee:     '1664515726011-121bb3114f0f', // cà phê sữa đá Việt Nam
  icedTea:      '1606444006818-3e66c09f2724', // trà đá chanh (chụp ở Hà Nội)
  smoothie:     '1508869901315-49c557f3969d', // sinh tố berry
}

function img(key) {
  return `https://images.unsplash.com/photo-${UNSPLASH[key]}?w=600&h=400&fit=crop&q=70`
}

// ───────────────────────────────────────────────────────────────────────────
// TÀI KHOẢN STAFF (Firebase Auth + profiles/{uid})
// ───────────────────────────────────────────────────────────────────────────
// Đây là tài khoản DEMO — đổi mật khẩu trước khi dùng thật.
export const accounts = [
  { email: 'manager@oeg.vn',   password: 'Oeg@12345', role: 'admin',   name: 'Quản lý OEG' },
  { email: 'kitchen1@oeg.vn',  password: 'Oeg@12345', role: 'kitchen', name: 'Bếp 1' },
  { email: 'kitchen2@oeg.vn',  password: 'Oeg@12345', role: 'kitchen', name: 'Bếp 2' },
]

// ───────────────────────────────────────────────────────────────────────────
// MENU (collection menuItems) — 16 món (7 food, 6 drinks, 3 combo)
// ───────────────────────────────────────────────────────────────────────────
//   inStock=false : com-ga-xoi-mo, sinh-to-mana-berry, combo-night-owl
//   isFeatured=true: cyber-beef-burger, pixel-pizza, cyber-energy-drink, combo-solo-queue
export const menuSeed = [
  // ── FOOD ──────────────────────────────────────────────────────────────────
  { slug: 'cyber-beef-burger',       name: 'Cyber Beef Burger',            category: 'food',   price: 85000,  prepMin: 15, inStock: true,  isFeatured: true,  imageSource: img('burger') },
  { slug: 'crispy-gaming-wings',     name: 'Crispy Gaming Wings',          category: 'food',   price: 65000,  prepMin: 15, inStock: true,  isFeatured: false, imageSource: img('friedChicken') },
  { slug: 'pixel-pizza',             name: 'Pixel Pizza (cá nhân)',        category: 'food',   price: 75000,  prepMin: 18, inStock: true,  isFeatured: true,  imageSource: img('pizza') },
  { slug: 'mi-tron-overclock',       name: 'Mì Trộn Overclock',            category: 'food',   price: 45000,  prepMin: 10, inStock: true,  isFeatured: false, imageSource: img('noodles') },
  { slug: 'khoai-tay-chien-plasma',  name: 'Khoai Tây Chiên Plasma',       category: 'food',   price: 35000,  prepMin: 8,  inStock: true,  isFeatured: false, imageSource: img('fries') },
  { slug: 'com-ga-xoi-mo',           name: 'Cơm Gà Xối Mỡ GG',             category: 'food',   price: 55000,  prepMin: 12, inStock: false, isFeatured: false, imageSource: img('chickenRice') },
  { slug: 'banh-mi-console',         name: 'Bánh Mì Console',              category: 'food',   price: 30000,  prepMin: 7,  inStock: true,  isFeatured: false, imageSource: img('banhMi') },

  // ── DRINKS ────────────────────────────────────────────────────────────────
  { slug: 'cyber-energy-drink',      name: 'Cyber Energy Drink',           category: 'drinks', price: 35000,  prepMin: 3,  inStock: true,  isFeatured: true,  imageSource: img('icedTea') },
  { slug: 'tra-dao-respawn',         name: 'Trà Đào Cam Sả Respawn',       category: 'drinks', price: 30000,  prepMin: 5,  inStock: true,  isFeatured: false, imageSource: img('icedTea') },
  { slug: 'ca-phe-sua-da-lagfree',   name: 'Cà Phê Sữa Đá Lag-Free',       category: 'drinks', price: 25000,  prepMin: 5,  inStock: true,  isFeatured: false, imageSource: img('vnCoffee') },
  { slug: 'soda-neon-blue',          name: 'Soda Neon Blue',               category: 'drinks', price: 28000,  prepMin: 3,  inStock: true,  isFeatured: false, imageSource: img('smoothie') },
  { slug: 'sinh-to-mana-berry',      name: 'Sinh Tố Mana Berry',           category: 'drinks', price: 38000,  prepMin: 6,  inStock: false, isFeatured: false, imageSource: img('smoothie') },
  { slug: 'nuoc-suoi',               name: 'Nước Suối',                    category: 'drinks', price: 10000,  prepMin: 1,  inStock: true,  isFeatured: false, imageSource: img('icedTea') },

  // ── COMBO ─────────────────────────────────────────────────────────────────
  { slug: 'combo-solo-queue',        name: 'Combo Solo Queue',             category: 'combo',  price: 110000, prepMin: 20, inStock: true,  isFeatured: true,  imageSource: img('burger') },
  { slug: 'combo-team-ranked',       name: 'Combo Team Ranked (2 người)',  category: 'combo',  price: 195000, prepMin: 25, inStock: true,  isFeatured: false, imageSource: img('chickenRice') },
  { slug: 'combo-night-owl',         name: 'Combo Night Owl (đồ ăn khuya)',category: 'combo',  price: 89000,  prepMin: 18, inStock: false, isFeatured: false, imageSource: img('noodles') },
]

// Tiện cho seed.js nếu muốn build orders combo "thật" hơn (không bắt buộc).
export const comboContents = {
  'combo-solo-queue':  ['cyber-beef-burger', 'khoai-tay-chien-plasma', 'cyber-energy-drink'],
  'combo-team-ranked': ['pixel-pizza', 'crispy-gaming-wings', 'soda-neon-blue', 'soda-neon-blue'],
  'combo-night-owl':   ['mi-tron-overclock', 'banh-mi-console'],
}