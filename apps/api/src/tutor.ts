import { mockAssistantReply, type ResponseStyle } from "@skonga/shared";
import { chatWithProviders } from "./providers.js";

const STYLES: ResponseStyle[] = ["balanced", "concise", "detailed"];

export function normalizeStyle(style: unknown): ResponseStyle {
  return STYLES.includes(style as ResponseStyle) ? (style as ResponseStyle) : "balanced";
}

export async function generateReply(
  message: string,
  style: ResponseStyle
): Promise<{ reply: string; provider: string }> {
  const live = await chatWithProviders(message);
  if (live) return { reply: live.text, provider: live.provider };

  // Local tutor only if no provider keys work — not the happy path
  const local = mockAssistantReply(message, style).replace(
    "This client build uses a local mock until the chat backend is connected.",
    "No chat provider responded. Set GROQ_API_KEY (default), GEMINI_API_KEY (default2), or OPENAI / OPENROUTER on the server."
  );
  return { reply: local, provider: "local-fallback" };
}
