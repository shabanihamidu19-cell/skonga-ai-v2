/**
 * SKONGA LLM routing (keys stay on the server only)
 *
 * Chat priority:
 *   1. Groq          (default)
 *   2. Gemini        (default2)
 *   3. OpenAI        (if key present)
 *   4. OpenRouter    (when OpenAI is unavailable / fails)
 *
 * Vision:  OpenAI only
 * Image:   OpenAI only
 */

export type ChatProvider = "groq" | "gemini" | "openai" | "openrouter";

const SYSTEM =
  "You are SKONGA AI, a tutor for Tanzanian secondary students (Forms 1–6). " +
  "Be accurate, kind, and bilingual-friendly (English / Kiswahili). " +
  "Do not invent syllabus citations. Explain step by step when solving questions.";

type ChatResult = { text: string; provider: ChatProvider };

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

async function openAiCompatible(opts: {
  url: string;
  key: string;
  model: string;
  messages: { role: string; content: unknown }[];
}): Promise<string | null> {
  const res = await fetch(opts.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.key}`,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function chatGroq(message: string): Promise<string | null> {
  const key = env("GROQ_API_KEY");
  if (!key) return null;
  return openAiCompatible({
    url: env("GROQ_API_URL") || "https://api.groq.com/openai/v1/chat/completions",
    key,
    model: env("GROQ_MODEL") || "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: message },
    ],
  });
}

async function chatGemini(message: string): Promise<string | null> {
  const key = env("GEMINI_API_KEY");
  if (!key) return null;
  const model = env("GEMINI_MODEL") || "gemini-2.0-flash";
  const url =
    env("GEMINI_API_URL") ||
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: message }] }],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() || null;
}

async function chatOpenAI(message: string): Promise<string | null> {
  const key = env("OPENAI_API_KEY");
  if (!key) return null;
  return openAiCompatible({
    url: env("OPENAI_API_URL") || "https://api.openai.com/v1/chat/completions",
    key,
    model: env("OPENAI_CHAT_MODEL") || "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: message },
    ],
  });
}

async function chatOpenRouter(message: string): Promise<string | null> {
  const key = env("OPENROUTER_API_KEY");
  if (!key) return null;
  return openAiCompatible({
    url: env("OPENROUTER_API_URL") || "https://openrouter.ai/api/v1/chat/completions",
    key,
    model: env("OPENROUTER_MODEL") || "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: message },
    ],
  });
}

/** Chat: Groq → Gemini → OpenAI → OpenRouter (OpenRouter only if OpenAI missing/fails) */
export async function chatWithProviders(message: string): Promise<ChatResult | null> {
  const steps: { name: ChatProvider; run: () => Promise<string | null> }[] = [
    { name: "groq", run: () => chatGroq(message) },
    { name: "gemini", run: () => chatGemini(message) },
  ];

  for (const step of steps) {
    try {
      const text = await step.run();
      if (text) return { text, provider: step.name };
    } catch {
      /* try next */
    }
  }

  // OpenAI, then OpenRouter if OpenAI not available or fails
  try {
    const openai = await chatOpenAI(message);
    if (openai) return { text: openai, provider: "openai" };
  } catch {
    /* fall through to OpenRouter */
  }

  try {
    const or = await chatOpenRouter(message);
    if (or) return { text: or, provider: "openrouter" };
  } catch {
    /* none */
  }

  return null;
}

/** Vision: OpenAI only (image URL or base64 data URL) */
export async function visionWithOpenAI(opts: {
  prompt: string;
  imageUrl: string;
}): Promise<{ text: string; provider: "openai" } | null> {
  const key = env("OPENAI_API_KEY");
  if (!key) return null;
  const model = env("OPENAI_VISION_MODEL") || "gpt-4o-mini";
  const text = await openAiCompatible({
    url: env("OPENAI_API_URL") || "https://api.openai.com/v1/chat/completions",
    key,
    model,
    messages: [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: [
          { type: "text", text: opts.prompt || "Read and solve this question for a Tanzanian student." },
          { type: "image_url", image_url: { url: opts.imageUrl } },
        ],
      },
    ],
  });
  return text ? { text, provider: "openai" } : null;
}

/** Image generator: OpenAI Images API only */
export async function generateImageOpenAI(prompt: string): Promise<{ url: string; provider: "openai" } | null> {
  const key = env("OPENAI_API_KEY");
  if (!key) return null;
  const url = env("OPENAI_IMAGE_URL") || "https://api.openai.com/v1/images/generations";
  const model = env("OPENAI_IMAGE_MODEL") || "dall-e-3";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size: env("OPENAI_IMAGE_SIZE") || "1024x1024",
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { data?: { url?: string }[] };
  const imageUrl = data.data?.[0]?.url;
  return imageUrl ? { url: imageUrl, provider: "openai" } : null;
}

export function providerStatus() {
  return {
    chat: {
      default: "groq",
      default2: "gemini",
      openaiFallback: "openrouter",
      configured: {
        groq: Boolean(env("GROQ_API_KEY")),
        gemini: Boolean(env("GEMINI_API_KEY")),
        openai: Boolean(env("OPENAI_API_KEY")),
        openrouter: Boolean(env("OPENROUTER_API_KEY")),
      },
    },
    vision: { provider: "openai", configured: Boolean(env("OPENAI_API_KEY")) },
    image: { provider: "openai", configured: Boolean(env("OPENAI_API_KEY")) },
  };
}
