# SKONGA API

Express + TypeScript backend for the mobile app.

**Does not store LLM or STK secrets in the client.**

## Run

```bash
# from repo root
npm install
cp apps/api/.env.example apps/api/.env
npm run api
```

Server: `http://localhost:8787`

Health: `GET http://localhost:8787/health`

## Endpoints matching the mobile client

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/v1/chat` | `{ threadId, message, style }` → `{ reply }` |
| POST | `/v1/pay/stk` | `{ planId, phone }` → `{ reference, status }` |
| POST | `/v1/pay/callback` | Simulate provider callback `{ reference, status: "paid" }` |
| GET | `/v1/entitlement?phone=` | Source of truth (in-memory for now) |
| POST | `/v1/auth/login` | `{ email, password }` → `{ token }` |

## Point the app at this API

`apps/mobile/.env`

```
EXPO_PUBLIC_API_URL=http://localhost:8787
```

On a physical phone use your computer LAN IP, e.g. `http://192.168.1.10:8787`.

## Live LLM (optional)

Set `LLM_API_URL` + `LLM_API_KEY` in `apps/api/.env`.
If missing, the tutor-fallback reply is returned.

## STK

`PAY_PROVIDER=mock` until real aggregator credentials exist **on the server only**.
