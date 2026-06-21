---
description: Firestore and Firebase Storage security rules — role-based access control
globs: ["firestore.rules", "storage.rules"]
alwaysApply: false
---

# Security Rules

## Role Capability Matrix

| Action | anon | kitchen | admin |
|---|---|---|---|
| Read menu items | ✅ | ✅ | ✅ |
| Create / edit / delete menu items | ❌ | ❌ | ✅ |
| Place order (create) | ✅ | ✅ | ✅ |
| Read orders | ✅ | ✅ | ✅ |
| Update order status | ❌ | ✅ | ✅ |
| Delete order | ❌ | ❌ | ✅ |
| Read own profile | ❌ | ✅ (own) | ✅ |
| Manage all profiles | ❌ | ❌ | ✅ |
| Upload menu images | ❌ | ❌ | ✅ |

## `firestore.rules`

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function role() {
      return get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role;
    }
    function isKitchenOrAdmin() {
      return request.auth != null && role() in ['kitchen', 'admin'];
    }
    function isAdmin() {
      return request.auth != null && role() == 'admin';
    }

    match /menuItems/{itemId} {
      allow read:  if true;
      allow write: if isAdmin();
    }

    match /orders/{orderId} {
      allow read:   if true;
      allow create: if true;
      allow update: if isKitchenOrAdmin();
      allow delete: if isAdmin();
    }

    match /profiles/{uid} {
      allow read, update: if request.auth != null && request.auth.uid == uid;
      allow read, write:  if isAdmin();
    }
  }
}
```

## `storage.rules`

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /menu-images/{imageId} {
      allow read:  if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Deploying Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

Always deploy rules **before** deploying the frontend so there is no window where the frontend runs against old rules.

## Testing Rules

Use the Firebase Console → Firestore → **Rules Playground** to verify:
- Anonymous user writing to `menuItems` → **Denied**
- Anonymous user creating an `orders` document → **Allowed**
- Kitchen user updating `orders/{id}.status` → **Allowed**
- Kitchen user deleting an order → **Denied**
