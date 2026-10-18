export const CAREER_CHAT_MODEL = "openrouter/free";
export const MAX_QUESTION_LENGTH = 2000;
export const MAX_HISTORY_MESSAGES = 12;
const MAX_BODY_BYTES = 24_000;

export type CareerMessage = { role: "user" | "assistant"; content: string };
export type CareerExchange = { conversationId: string; question: string; answer?: string; error?: string };
type Reply = { answer: string } | { error: string; status: number };
type Dependencies = {
  apiKey: () => string | undefined;
  context: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
  onExchange?: (exchange: CareerExchange) => void | Promise<void>;
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

function conversationIdFrom(body: unknown) {
  const id = body && typeof body === "object" && "conversationId" in body ? body.conversationId : undefined;
  return typeof id === "string" && /^[A-Za-z0-9-]{8,64}$/.test(id) ? id : crypto.randomUUID();
}

export function createCareerChatHandler({ apiKey, context, fetcher = fetch, timeoutMs = 60_000, onExchange }: Dependencies) {
  // Small, process-local throttle for this local site, shared across all visitors.
  // A distributed rate limiter is needed if deployed across multiple instances.
  let windowStart = 0;
  let requestCount = 0;

  async function reply(messages: CareerMessage[], signal: AbortSignal): Promise<Reply> {
    const key = apiKey()?.trim();
    if (!key) return { error: "Chat is not configured yet. You can contact Ahmad by email instead.", status: 503 };
    const now = Date.now();
    if (now - windowStart >= 60_000) { windowStart = now; requestCount = 0; }
    if (requestCount >= 10) return { error: "Chat is busy. Please try again in a minute.", status: 429 };
    requestCount++;

    try {
      const response = await fetcher("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        signal: AbortSignal.any([AbortSignal.timeout(timeoutMs), signal]),
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
        if (response.status === 429) return { error: "The free AI model has reached its request limit. Please try again later.", status: 429 };
        if ([401, 402, 403].includes(response.status)) return { error: "The free AI connection is unavailable. Please contact Ahmad directly.", status: 503 };
        return { error: "The free AI model is temporarily unavailable. Please try again later.", status: 503 };
      }
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      // Only the final answer is returned; never expose upstream errors or reasoning.
      if (data.error || typeof content !== "string" || !content.trim()) {
        return { error: "The AI did not return an answer. Please try again.", status: 502 };
      }
      let answer: unknown;
      try { answer = JSON.parse(content)?.answer; }
      catch { return { error: "The AI did not return a valid career answer. Please try again.", status: 502 }; }
      if (typeof answer !== "string" || !answer.trim()) return { error: "The AI did not return a valid career answer. Please try again.", status: 502 };
      return { answer: answer.trim().slice(0, 6000) };
    } catch (error) {
      const timedOut = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
      return timedOut
        ? { error: "The free model took too long to respond. Please try again.", status: 504 }
        : { error: "Could not reach the free AI model. Please try again later.", status: 503 };
    }
  }

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

    const result = await reply(messages, request.signal);
    try {
      await onExchange?.({
        conversationId: conversationIdFrom(body),
        question: messages[messages.length - 1].content.trim(),
        ...("answer" in result ? { answer: result.answer } : { error: result.error }),
      });
    } catch { /* Recording must never break the visitor's chat. */ }
    return "answer" in result ? json({ answer: result.answer }) : json({ error: result.error }, result.status);
  };
}
