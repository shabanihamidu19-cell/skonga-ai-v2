import { mockAssistantReply, type ResponseStyle } from "@skonga/shared";

const STYLES: ResponseStyle[] = ["balanced", "concise", "detailed"];

export function normalizeStyle(style: unknown): ResponseStyle {
  return STYLES.includes(style as ResponseStyle) ? (style as ResponseStyle) : "balanced";
}

export async function generateReply(message: string, style: ResponseStyle): Promise<string> {
  const url = process.env.LLM_API_URL;
  const key = process.env.LLM_API_KEY;
  if (url && key) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL ?? "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are SKONGA AI, a tutor for Tanzanian secondary students (Forms 1–6). Be accurate, kind, and bilingual-friendly (EN/SW). Do not invent syllabus citations.",
            },
            { role: "user", content: message },
          ],
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch {
      // fall through to local tutor
    }
  }

  const local = mockAssistantReply(message, style);
  return (
    local.replace(
      "This client build uses a local mock until the chat backend is connected.",
      "Backend is running in tutor-fallback mode. Connect LLM_API_URL + LLM_API_KEY for live answers."
    )
  );
}
