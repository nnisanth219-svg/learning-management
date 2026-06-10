# Base template

Minimal Next.js + TypeScript + Tailwind shell. Swap the Firebase service account to connect your own project.

## Run (no Firebase required)

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you should see **App is running**.

## Firebase setup

1. Firebase Console → Project settings → Service accounts → **Generate new private key**
2. Save the JSON as `src/config/ServiceAccountKey.json` (see `src/config/README.md`)
3. Copy `.env.example` to `.env` and set:

```env
FIREBASE_CREDENTIALS=src/config/ServiceAccountKey.json
```

4. Restart the dev server
5. Check http://localhost:3000/api/health — expect `"firebase": "connected"`

To use another project, replace the JSON file (or change the path in `.env`). No code changes needed.

## Build guide

See **[docs/guide.md](docs/guide.md)** — plan → UI → APIs → Firebase → test → login (+ frontend/backend and Firebase example).
