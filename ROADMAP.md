# SKONGA AI — Professional roadmap

Owner track for turning the Expo app into a store-ready product for Tanzanian students.

## Done on client (v2)

- [x] React Native + TypeScript + Expo monorepo
- [x] Drawer navigation (Chat, Notes, Profile, Settings, Pro)
- [x] Local persistence (chats, settings, entitlement, notes)
- [x] Offline banner + free message limit
- [x] Scan / Gallery hooks (image URI attached to message)
- [x] Sending / loading state
- [x] API client stubs (`/v1/chat`, `/v1/pay/stk`, `/v1/entitlement`, `/v1/auth/login`)
- [x] EAS build profiles (Android APK + iOS)
- [x] Theme system-wide (dark / light / auto from Settings)
- [x] All screens use ThemeContext (Chat, Notes, Pay, Profile, Settings, drawer)
- [x] Brand PNGs uploaded (`icon.png`, `adaptive-icon.png`, `splash.png`)

## Done on backend skeleton

- [x] `apps/api` Express + TypeScript
- [x] `POST /v1/chat` (LLM optional, tutor fallback)
- [x] `POST /v1/pay/stk` + `POST /v1/pay/callback` (mock provider)
- [x] `GET /v1/entitlement`
- [x] `POST /v1/auth/login` (token in-memory)

## Next — backend production

- [ ] Persistent DB (not in-memory)
- [ ] Real LLM key on server + streaming
- [ ] TIE library RAG for Forms 1–6
- [ ] Real STK aggregator (keys stay on server)
- [ ] Auth OTP / hashed passwords

## Next — mobile polish

- [ ] Upload scanned images (multipart)
- [ ] Push notifications
- [ ] EN + SW strings
- [ ] Crash reporting (Sentry)

## Next — release

- [ ] EAS projectId + signed Android AAB
- [ ] Apple Developer + TestFlight
- [ ] Play Console listing (EN/SW)
- [ ] Legal pages on HTTPS

## Rule

No LLM keys, no STK secrets, no payment private keys inside the mobile app. Proxy everything.
