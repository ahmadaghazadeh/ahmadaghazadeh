# Digital Twin career chat

The inline Digital Twin section above Contact answers questions using the same curated
profile and work highlights as the website. It identifies itself as an AI guide,
uses conversational context, and is instructed to acknowledge missing information.
Profile answers are AI-generated and are not guaranteed to be correct.

## Configuration

Set `OPENROUTER_API_KEY` in the root `.env` or in the hosting provider's server
environment, then run `npm run dev`. Never use a `NEXT_PUBLIC_` prefix for this key.
The existing environment file is not changed by this feature.

The server endpoint `POST /api/career-chat` accepts:

```json
{"messages":[{"role":"user","content":"What is Ahmad's backend experience?"}]}
```

Success returns `{"answer":"..."}`; errors return `{"error":"..."}` with a
corresponding HTTP status. History must alternate user/assistant, begin and end
with a user question, and contain at most 12 messages. Questions are limited to
2,000 characters; the entire request is limited to 24,000 bytes. The widget keeps
the most recent five completed turns, supports Enter to send and Shift+Enter for
a new line, preserves failed questions for retry, and offers New chat.

## Free-model policy

- The route is fixed on the server to `openrouter/free`. OpenRouter chooses an
  available free model for each request. This replaces the unavailable
  `openai/gpt-oss-120b:free` endpoint.
- Requests require zero-priced input, output, and per-request provider pricing.
- Structured answers are required to filter for compatible conversational models;
  the server validates the answer instead of displaying unrelated classifier output.
- There is no paid-model fallback, upgrade, tool use, web search, or automatic retry.
- Rate limits, missing configuration, network errors, and a 60-second provider
  timeout produce readable errors. Free-provider availability is outside the app.
- A process-local throttle allows up to 10 calls per minute, shared across visitors.
  This complements the OpenRouter account's free quota; it is not a distributed
  production abuse-control system.

## Privacy and hosting

The API key stays on the server. Chat history lives only in the current browser
component and is cleared on reload or New chat; this website does not persist it.
The submitted conversation and public profile context are sent to OpenRouter and
the selected model provider. Their data handling policies still apply.

This feature needs a running Next.js server (local, Vercel, or another compatible
host). GitHub Pages alone cannot run the chat endpoint. If publishing a static
export later, host the API separately rather than placing the key in browser code.

## Checks

```powershell
node --test tests/career-chat.test.mjs
npm.cmd run typecheck
npm.cmd run build
```

Tests mock OpenRouter and verify fixed free routing, request validation, history,
secret-safe provider errors, empty replies, timeouts, and throttling. A real local
chat smoke test is separate and consumes free-account requests.
