# SKONGA AI v2

Tanzanian student AI assistant — **React + React Native + TypeScript** monorepo.

Rewritten from the Capacitor `www/` app in [skonga-ai-v1](https://github.com/shabanihamidu19-cell/skonga-ai-v1).

| App | Stack | Path |
| --- | --- | --- |
| Web | React 18 + Vite + TypeScript | `apps/web` |
| Mobile | React Native (Expo 52) + TypeScript | `apps/mobile` |
| Shared | types, plans, limits, mock chat | `packages/shared` |

**Owner:** KCL Platform TZ · Package: `tz.co.kclplatform.skonga`

## Features

- Chat UI + New Chat + local history
- Soft free-message limit (8) then Pro sheet
- Pro plans: 1 Day TSh 620 · 1 Week 3,500 · 1 Month 5,000 · 1 Year 45,000
- Phone + network detect (M-Pesa / Tigo / Airtel / HaloPesa)
- Settings: preferred name, theme (web), response style
- Profile placeholder

Chat and STK Push are **client mocks** until the backend exists. Do not put API secrets in the apps.

## Setup

```bash
git clone https://github.com/shabanihamidu19-cell/skonga-ai-v2.git
cd skonga-ai-v2
npm install
npm run web       # http://localhost:5173
npm run mobile    # Expo
```
