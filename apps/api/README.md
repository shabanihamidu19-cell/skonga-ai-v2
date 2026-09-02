# SKONGA API

Express + TypeScript backend. **All LLM / payment keys stay on the server.**

## Provider routing

| Feature | Provider order |
| --- | --- |
| **Chat** | 1. **Groq** (default) → 2. **Gemini** (default2) → 3. **OpenAI** → 4. **OpenRouter** (if OpenAI missing/fails) |
| **Vision** | **OpenAI** only |
| **Image generate** | **OpenAI** only |

Local tutor text is used only if **no** chat provider returns a reply.

## Run

```bash
npm install
cp apps/api/.env.example apps/api/.env
# paste GROQ_API_KEY (and others) into apps/api/.env — never commit
npm run api
```

Health (shows which keys are configured, not the keys themselves):

```bash
curl http://localhost:8787/health
```

## Endpoints

| Method | Path | Body |
| --- | --- | --- |
| POST | `/v1/chat` | `{ threadId?, message, style? }` → `{ reply, provider }` |
| POST | `/v1/vision` | `{ imageUrl, prompt? }` → `{ reply, provider }` (OpenAI) |
| POST | `/v1/image` | `{ prompt }` → `{ url, provider }` (OpenAI) |
| POST | `/v1/pay/stk` | `{ planId, phone }` |
| POST | `/v1/pay/callback` | `{ reference, status }` |
| GET | `/v1/entitlement` | `?phone=` |
| POST | `/v1/auth/login` | `{ email, password }` |

Mobile: `EXPO_PUBLIC_API_URL=http://localhost:8787` (or LAN IP / Render HTTPS).
