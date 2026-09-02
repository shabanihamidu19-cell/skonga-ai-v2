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
- [x] Icons + splash pipeline (SVG masters + generate-icons.py + app.json paths)

## Next — backend (blocks real money and real AI)

- [ ] `POST /v1/chat` with streaming + soft rate limits
- [ ] TIE library RAG injection for Forms 1–6
- [ ] `POST /v1/pay/stk` + callback (M-Pesa / Tigo / Airtel / Halo)
- [ ] `GET /v1/entitlement` source of truth (never trust client alone)
- [ ] Auth: email/phone OTP or Firebase, secure tokens

## Next — mobile polish

- [ ] Upload scanned images to backend (multipart), not URI-only text
- [ ] Final brand PNGs (replace placeholders from design)
- [ ] Theme remaining screens (Notes / Pay / Profile) to match Chat
- [ ] Push notifications when AI reply finishes
- [ ] EN + SW strings
- [ ] Crash reporting (Sentry) + analytics (privacy-respecting)

## Next — release

- [ ] EAS projectId + signed Android AAB
- [ ] Apple Developer + TestFlight
- [ ] Play Console listing (EN/SW), content rating, privacy URL
- [ ] Legal pages live on HTTPS domain

## Rule

No LLM keys, no STK secrets, no payment private keys inside the mobile app. Proxy everything.
