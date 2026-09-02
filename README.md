# SKONGA AI v2 — React Native (Android / iOS)

Professional mobile track for the Tanzanian student assistant.

**Stack:** Expo 52 + TypeScript + React Navigation + AsyncStorage + EAS Build  
**v1 Capacitor (unchanged):** https://github.com/shabanihamidu19-cell/skonga-ai-v1

## Features in this build

- Chat with free-message limit and Pro sheet
- Drawer: New Chat, history, Notes, Profile, Settings, Pro
- Notes (local CRUD)
- Scan / Gallery (image path attached; vision API later)
- Offline banner, sending spinner, persisted state
- API stubs ready for real backend

See [ROADMAP.md](./ROADMAP.md) for the path to store release.

## Run

```bash
git clone https://github.com/shabanihamidu19-cell/skonga-ai-v2.git
cd skonga-ai-v2
npm install
cp apps/mobile/.env.example apps/mobile/.env
npm run mobile
```

## Build

```bash
cd apps/mobile
npx eas login && npx eas build:configure
npx eas build --platform android --profile preview
npx eas build --platform ios --profile preview
```

Set `EXPO_PUBLIC_API_URL` when the backend is live. Never put payment or LLM secrets in the client.
