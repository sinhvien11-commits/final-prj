/**
 * One-time seed script. Run with: node scripts/seed.js
 * Requires FIREBASE_PROJECT_ID env var or edit the projectId below.
 * Uses Firebase Admin SDK — run: npm install -D firebase-admin
 */
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Point to emulator when seeding locally
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID ?? 'demo-oeg' })

const db  = getFirestore()
const au  = getAuth()

const MENU_ITEMS = [
  { name: 'Cyber Energy Drink', category: 'drinks', price: 35000, prepMin: 10, inStock: true,  isFeatured: true  },
  { name: 'Neon Burger Combo',  category: 'food',   price: 85000, prepMin: 15, inStock: true,  isFeatured: true  },
  { name: 'Crispy Wings',       category: 'food',   price: 65000, prepMin: 15, inStock: true,  isFeatured: false },
  { name: 'Gaming Combo',       category: 'combo',  price: 110000,prepMin: 20, inStock: true,  isFeatured: false },
  { name: 'Matcha Latte',       category: 'drinks', price: 40000, prepMin: 8,  inStock: true,  isFeatured: false },
  { name: 'Fries Bucket',       category: 'food',   price: 45000, prepMin: 10, inStock: true,  isFeatured: false },
]

async function seedMenu() {
  console.log('Seeding menu items...')
  for (const item of MENU_ITEMS) {
    await db.collection('menuItems').add({ ...item, imageUrl: '', createdAt: Timestamp.now() })
    console.log('  +', item.name)
  }
}

async function createAdmin() {
  const email    = 'manager@oeg.vn'
  const password = 'OEG@2024!'
  console.log('\nCreating admin account:', email)
  try {
    const user = await au.createUser({ email, password })
    await db.collection('profiles').doc(user.uid).set({
      role: 'admin',
      name: 'Manager',
      createdAt: Timestamp.now(),
    })
    console.log('  Admin UID:', user.uid)
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      console.log('  Admin already exists, skipping.')
    } else {
      throw err
    }
  }
}

await seedMenu()
await createAdmin()
console.log('\nSeed complete.')
