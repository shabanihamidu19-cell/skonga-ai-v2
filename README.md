# SKONGA AI v2 — React Native (Android / iOS)

Expo + TypeScript mobile app: drawer navigation, AsyncStorage, API stubs, EAS Build.

v1 Capacitor repo is untouched: https://github.com/shabanihamidu19-cell/skonga-ai-v1

## Run

```bash
git clone https://github.com/shabanihamidu19-cell/skonga-ai-v2.git
cd skonga-ai-v2
npm install
cp apps/mobile/.env.example apps/mobile/.env
npm run mobile
```

## Android / iOS (EAS)

```bash
cd apps/mobile
npx eas login
npx eas build:configure
npx eas build --platform android --profile preview
npx eas build --platform ios --profile preview
```

Replace `extra.eas.projectId` in `apps/mobile/app.json` after configure.

## Layout

- `apps/mobile/src/navigation` — Chat, history drawer, Profile, Settings, Pro
- `apps/mobile/src/storage` — chats, settings, entitlement
- `apps/mobile/src/api/client.ts` — POST /v1/chat, /v1/pay/stk, /v1/entitlement, /v1/auth/login

If `EXPO_PUBLIC_API_URL` is empty, chat and STK use local fallbacks. Do not put payment or LLM secrets in the app.
