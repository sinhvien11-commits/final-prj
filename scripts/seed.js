/**
 * Seed script cho OEG Cyber Hub F&B Queue App.
 *
 * Cách chạy:
 *   Cloud (Firebase thật):     node scripts/seed.js
 *   Emulator (dev ở máy):      SEED_TARGET=emulator node scripts/seed.js
 *   Xoá sạch rồi seed lại:     node scripts/seed.js --reset
 *
 * Yêu cầu:
 *   - Node 18+
 *   - npm install -D firebase-admin
 *   - Chế độ cloud: có scripts/serviceAccountKey.json (tải từ Firebase Console →
 *     Project settings → Service accounts → Generate new private key).
 *
 * Lưu ý: file dùng ESM (import/export) — package.json cần "type": "module".
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

import { accounts, menuSeed } from './seedData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RESET  = process.argv.includes('--reset')
const TARGET = process.env.SEED_TARGET ?? 'cloud' // 'cloud' | 'emulator'

// ───────────────────────────────────────────────────────────────────────────
// KHỞI TẠO
// ───────────────────────────────────────────────────────────────────────────
if (TARGET === 'emulator') {
  // Ghi vào emulator local — KHÔNG đụng tới dữ liệu thật.
  process.env.FIRESTORE_EMULATOR_HOST     = process.env.FIRESTORE_EMULATOR_HOST     ?? 'localhost:8080'
  process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? 'localhost:9099'
  initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? 'demo-oeg' })
  console.log('🧪 Target: EMULATOR — dữ liệu chỉ ở máy local, không lên app thật.')
} else {
  // Ghi vào Firebase thật (project trên cloud).
  const keyPath = path.join(__dirname, 'serviceAccountKey.json')
  if (!existsSync(keyPath)) {
    console.error('❌ Thiếu scripts/serviceAccountKey.json.')
    console.error('   Tải từ Firebase Console → Project settings → Service accounts → Generate new private key.')
    process.exit(1)
  }
  const serviceAccount = JSON.parse(await readFile(keyPath, 'utf8'))
  initializeApp({ credential: cert(serviceAccount) })
  console.log(`☁️  Target: CLOUD — project "${serviceAccount.project_id}".`)
}

const db = getFirestore()
const au = getAuth()

// Tiện ích nhỏ
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const sample  = (arr) => arr[randInt(0, arr.length - 1)]
const minutesAgo = (m) => new Date(Date.now() - m * 60000)
function dayAgoAtRandomTime(maxDaysBack) {
  const d = new Date()
  d.setDate(d.getDate() - randInt(0, maxDaysBack))
  d.setHours(randInt(9, 22), randInt(0, 59), 0, 0) // giờ mở cửa 9h–22h
  return d
}

// ───────────────────────────────────────────────────────────────────────────
// RESET (chỉ menuItems + orders, KHÔNG xoá Auth/profiles)
// ───────────────────────────────────────────────────────────────────────────
async function clearCollection(name) {
  const snap = await db.collection(name).get()
  if (snap.empty) return 0
  let batch = db.batch()
  let n = 0, total = 0
  for (const doc of snap.docs) {
    batch.delete(doc.ref)
    n++; total++
    if (n === 400) { await batch.commit(); batch = db.batch(); n = 0 }
  }
  if (n > 0) await batch.commit()
  return total
}

// ───────────────────────────────────────────────────────────────────────────
// ẢNH — dùng thẳng URL nguồn (không upload Storage vì Spark plan không hỗ trợ)
// ───────────────────────────────────────────────────────────────────────────
async function resolveImage(slug, imageSource) {
  return imageSource
}

// ───────────────────────────────────────────────────────────────────────────
// SEED MENU
// ───────────────────────────────────────────────────────────────────────────
async function seedMenu() {
  console.log('\n📋 Seeding menu...')
  const created = [] // để build orders sau (cần id thật)
  let imgOk = 0

  for (const item of menuSeed) {
    const { slug, imageSource, ...fields } = item
    const imageUrl = await resolveImage(slug, imageSource)
    if (imageUrl) imgOk++

    const ref = await db.collection('menuItems').add({
      ...fields,             // name, category, price, prepMin, inStock, isFeatured
      imageUrl,
      createdAt: Timestamp.now(),
    })
    created.push({ id: ref.id, name: item.name, price: item.price, inStock: item.inStock })
    console.log(`   + ${item.name}${imageUrl ? '' : ' (no image)'}`)
  }

  console.log(`   → ${created.length} món, ${imgOk} ảnh OK.`)
  return created
}

// ───────────────────────────────────────────────────────────────────────────
// SEED TÀI KHOẢN (Auth + profiles)
// ───────────────────────────────────────────────────────────────────────────
async function seedAccounts() {
  console.log('\n👤 Seeding tài khoản...')
  let n = 0
  for (const acc of accounts) {
    try {
      const user = await au.createUser({ email: acc.email, password: acc.password })
      await db.collection('profiles').doc(user.uid).set({
        role: acc.role,
        name: acc.name,
        createdAt: Timestamp.now(),
      })
      console.log(`   + ${acc.email} (${acc.role})`)
      n++
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        console.log(`   = ${acc.email} đã tồn tại, bỏ qua.`)
      } else {
        throw err
      }
    }
  }
  return n
}

// ───────────────────────────────────────────────────────────────────────────
// SEED ĐƠN HÀNG GIẢ
// ───────────────────────────────────────────────────────────────────────────
// Phân bố để bảng bếp (live), reports (revenue) và queue widget đều có dữ liệu.
function buildOrderItems(menuDocs) {
  const count = randInt(1, 3)
  const chosen = []
  const used = new Set()
  while (chosen.length < count) {
    const m = sample(menuDocs)
    if (used.has(m.id)) continue
    used.add(m.id)
    chosen.push({ id: m.id, name: m.name, qty: randInt(1, 3), price: m.price })
  }
  return chosen
}

async function seedOrders(menuDocs) {
  console.log('\n🧾 Seeding đơn hàng giả...')

  // status → cách đặt thời gian tạo
  const plan = [
    ...Array(3).fill({ status: 'received',   when: () => minutesAgo(randInt(1, 8))   }),
    ...Array(2).fill({ status: 'preparing',  when: () => minutesAgo(randInt(8, 20))  }),
    ...Array(1).fill({ status: 'delivering', when: () => minutesAgo(randInt(15, 30)) }),
    // done: nhiều trong HÔM NAY (cho revenue chart) + rải 6 ngày trước
    ...Array(10).fill({ status: 'done', when: () => { const d = new Date(); d.setHours(randInt(9, 22), randInt(0, 59), 0, 0); return d } }),
    ...Array(8).fill({  status: 'done', when: () => dayAgoAtRandomTime(6) }),
    ...Array(4).fill({  status: 'cancelled', when: () => dayAgoAtRandomTime(6) }),
  ]

  let n = 0
  for (const p of plan) {
    const items = buildOrderItems(menuDocs)
    const total = items.reduce((s, it) => s + it.price * it.qty, 0)
    const createdAt = p.when()

    await db.collection('orders').add({
      machineNo: randInt(1, 50),
      items,
      total,
      status: p.status,
      waitMin: randInt(5, 25),
      note: Math.random() < 0.25 ? sample(['Ít cay', 'Không hành', 'Giao nhanh giúp em', 'Thêm tương']) : '',
      createdAt: Timestamp.fromDate(createdAt),
      updatedAt: Timestamp.fromDate(createdAt),
    })
    n++
  }
  console.log(`   → ${n} đơn (6 active, 18 done, 4 cancelled).`)
  return n
}

// ───────────────────────────────────────────────────────────────────────────
// MAIN
// ───────────────────────────────────────────────────────────────────────────
async function main() {
  if (RESET) {
    console.log('\n🗑️  --reset: xoá menuItems + orders cũ...')
    const m = await clearCollection('menuItems')
    const o = await clearCollection('orders')
    console.log(`   → xoá ${m} menu, ${o} đơn.`)
  }

  const menuDocs = await seedMenu()
  const accCount = await seedAccounts()
  const ordCount = await seedOrders(menuDocs)

  console.log('\n✅ Seed xong.')
  console.log(`   Tài khoản: ${accCount} mới | Menu: ${menuDocs.length} | Đơn: ${ordCount}`)
  if (TARGET === 'cloud') {
    console.log('   Đăng nhập admin: ' + accounts[0].email + ' / ' + accounts[0].password)
  }
}

main().catch((err) => {
  console.error('\n❌ Seed lỗi:', err)
  process.exit(1)
})