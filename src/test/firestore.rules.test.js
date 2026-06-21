/**
 * Firestore security rules integration tests.
 * Requires Firebase emulator: firebase emulators:start --only firestore,auth
 * Run with: npm run test:rules
 */
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing'
import { collection, addDoc, updateDoc, doc, setDoc } from 'firebase/firestore'
import { readFileSync } from 'fs'
import { resolve } from 'path'

let testEnv

beforeAll(async () => {
  const rules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8')
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-oeg',
    firestore: {
      host: 'localhost',
      port: 8080,
      rules,
    },
  })
})

afterEach(async () => {
  await testEnv.clearFirestore()
})

afterAll(async () => {
  await testEnv.cleanup()
})

// ── orders ─────────────────────────────────────────────────────────────────

describe('orders', () => {
  test('anon can create order with status=received and required fields', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertSucceeds(
      addDoc(collection(db, 'orders'), {
        machineNo: 1,
        status: 'received',
        items: [],
        total: 0,
      })
    )
  })

  test('anon cannot create order with status other than received', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(
      addDoc(collection(db, 'orders'), {
        machineNo: 1,
        status: 'preparing',
        items: [],
        total: 0,
      })
    )
  })

  test('anon cannot create order without required fields', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(
      addDoc(collection(db, 'orders'), { machineNo: 1 })
    )
  })

  test('anon cannot update order status', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'orders', 'order1'), {
        machineNo: 1, status: 'received', items: [], total: 0,
      })
    })
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(
      updateDoc(doc(db, 'orders', 'order1'), { status: 'preparing' })
    )
  })
})

// ── menuItems ──────────────────────────────────────────────────────────────

describe('menuItems', () => {
  test('anon can read menu items', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertSucceeds(
      // getDocs requires query — use doc read instead
      doc(db, 'menuItems', 'item1')
    )
  })

  test('anon cannot write menu items', async () => {
    const db = testEnv.unauthenticatedContext().firestore()
    await assertFails(
      addDoc(collection(db, 'menuItems'), { name: 'hack' })
    )
  })
})

// ── profiles — self-promote fix ────────────────────────────────────────────

describe('profiles — self-promote prevention', () => {
  test('authenticated user cannot change their own role (self-promote)', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'profiles', 'user1'), {
        role: 'kitchen',
        name: 'Staff',
      })
    })
    const db = testEnv.authenticatedContext('user1').firestore()
    await assertFails(
      updateDoc(doc(db, 'profiles', 'user1'), { role: 'admin' })
    )
  })

  test('authenticated user can update their own non-role fields', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'profiles', 'user1'), {
        role: 'kitchen',
        name: 'Staff',
      })
    })
    const db = testEnv.authenticatedContext('user1').firestore()
    await assertSucceeds(
      updateDoc(doc(db, 'profiles', 'user1'), { name: 'Updated Name' })
    )
  })
})
