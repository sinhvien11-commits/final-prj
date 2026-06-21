---
description: Tech stack, CLI commands, and environment variables for the OEG F&B Queue App
alwaysApply: true
---

# Stack & Commands

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS v3 |
| Database | Firebase Firestore (NoSQL) |
| Auth | Firebase Authentication (email/password) |
| Real-time | Firestore `onSnapshot` listeners |
| File storage | Firebase Storage |
| Hosting | Firebase Hosting |
| Routing | React Router v6 |
| State | React Context (CartContext) + hooks |
| SDK | `firebase` v10 modular — never compat mode |
| Notifications | `react-hot-toast` + Browser Notification API |
| Testing | Vitest + React Testing Library + Firebase Emulator Suite |

## Commands

```bash
# First-time setup
npm create vite@latest . -- --template react
npm install firebase react-router-dom react-hot-toast
npm install -D tailwindcss postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom
npx tailwindcss init -p

# Dev
npm run dev

# Tests
npm run test        # watch
npm run test:run    # CI single run
npm run test:ui     # vitest browser UI

# Firebase CLI
npm install -g firebase-tools
firebase login
firebase init                                      # select Hosting, Firestore, Storage, Emulators
firebase emulators:start                           # local dev/test
firebase deploy
firebase deploy --only hosting
firebase deploy --only firestore:rules,storage:rules
```

## Environment Variables (`.env.local`)

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_USE_EMULATORS=false
```

Never commit `.env.local` — add it to `.gitignore`.
