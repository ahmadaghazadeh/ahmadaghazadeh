export const CAREER_CHAT_MODEL = "openrouter/free";
export const MAX_QUESTION_LENGTH = 2000;
export const MAX_HISTORY_MESSAGES = 12;
const MAX_BODY_BYTES = 24_000;

export type CareerMessage = { role: "user" | "assistant"; content: string };
type Dependencies = {
  apiKey: () => string | undefined;
  context: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("invalid-body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error("body-too-large");
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

function validMessages(value: unknown): value is CareerMessage[] {
  return Array.isArray(value) && value.length > 0 && value.length <= MAX_HISTORY_MESSAGES
    && value.every((message, index) => message && typeof message === "object"
      && message.role === (index % 2 === 0 ? "user" : "assistant")
      && typeof message.content === "string" && message.content.trim().length > 0
      && message.content.length <= (message.role === "user" ? MAX_QUESTION_LENGTH : 6000))
    && value[value.length - 1].role === "user";
}

export function createCareerChatHandler({ apiKey, context, fetcher = fetch, timeoutMs = 60_000 }: Dependencies) {
  // Small, process-local throttle for this local site, shared across all visitors.
  // A distributed rate limiter is needed if deployed across multiple instances.
  let windowStart = 0;
  let requestCount = 0;

  return async function POST(request: Request) {
    const origin = request.headers.get("origin");
    if (origin) {
      // Next.js can normalize request.url to localhost even when the browser
      // opens 127.0.0.1. Host retains the actual address (including its port).
      const requestHost = request.headers.get("host") || new URL(request.url).host;
      try {
        const source = new URL(origin);
        if (!["http:", "https:"].includes(source.protocol) || source.host !== requestHost) {
          return json({ error: "Please open the chat from this website." }, 403);
        }
      } catch { return json({ error: "Please open the chat from this website." }, 403); }
    }
    if (!request.headers.get("content-type")?.includes("application/json")) {
      return json({ error: "Send a JSON chat request." }, 415);
    }

    let body: unknown;
    try { body = await readBody(request); }
    catch (error) {
      return json({ error: error instanceof Error && error.message === "body-too-large"
        ? "This conversation is too long. Please start a new chat." : "The chat request is invalid." },
      error instanceof Error && error.message === "body-too-large" ? 413 : 400);
    }
    const messages = body && typeof body === "object" && "messages" in body ? body.messages : undefined;
    if (!validMessages(messages)) {
      return json({ error: "Please send a question of 1–2,000 characters in a valid conversation." }, 400);
    }
    const key = apiKey()?.trim();
    if (!key) return json({ error: "Chat is not configured yet. You can contact Ahmad by email instead." }, 503);
    const now = Date.now();
    if (now - windowStart >= 60_000) { windowStart = now; requestCount = 0; }
    if (requestCount >= 10) return json({ error: "Chat is busy. Please try again in a minute." }, 429);
    requestCount++;

    try {
      const response = await fetcher("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        signal: AbortSignal.any([AbortSignal.timeout(timeoutMs), request.signal]),
        cache: "no-store",
        body: JSON.stringify({
          model: CAREER_CHAT_MODEL,
          provider: { max_price: { prompt: 0, completion: 0, request: 0 }, require_parameters: true },
          messages: [{ role: "system", content: context }, ...messages.map(({ role, content }) => ({ role, content: content.trim() }))],
          stream: false,
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "career_answer",
              strict: true,
              schema: { type: "object", properties: { answer: { type: "string" } }, required: ["answer"], additionalProperties: false },
            },
          },
          temperature: 0.3,
          max_tokens: 900,
          reasoning: { enabled: false, exclude: true },
        }),
      });
      if (!response.ok) {
        if (response.status === 429) return json({ error: "The free AI model has reached its request limit. Please try again later." }, 429);
        if ([401, 402, 403].includes(response.status)) return json({ error: "The free AI connection is unavailable. Please contact Ahmad directly." }, 503);
        return json({ error: "The free AI model is temporarily unavailable. Please try again later." }, 503);
      }
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      // Only the final answer is returned; never expose upstream errors or reasoning.
      if (data.error || typeof content !== "string" || !content.trim()) {
        return json({ error: "The AI did not return an answer. Please try again." }, 502);
      }
      let answer: unknown;
      try { answer = JSON.parse(content)?.answer; }
      catch { return json({ error: "The AI did not return a valid career answer. Please try again." }, 502); }
      if (typeof answer !== "string" || !answer.trim()) return json({ error: "The AI did not return a valid career answer. Please try again." }, 502);
      return json({ answer: answer.trim().slice(0, 6000) });
    } catch (error) {
      const timedOut = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
      return json({ error: timedOut ? "The free model took too long to respond. Please try again." : "Could not reach the free AI model. Please try again later." }, timedOut ? 504 : 503);
    }
  };
}
