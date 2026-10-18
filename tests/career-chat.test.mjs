import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/career-chat.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { createCareerChatHandler, CAREER_CHAT_MODEL } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const request = (messages = [{ role: "user", content: "What is Ahmad’s experience?" }], origin = "http://localhost:3002") => new Request("http://localhost:3002/api/career-chat", {
  method: "POST", headers: { "content-type": "application/json", origin }, body: JSON.stringify({ messages }),
});
const handler = (overrides = {}) => createCareerChatHandler({ apiKey: () => "test-key", context: "Verified career facts", ...overrides });

test("pins the free model and zero pricing, strips extra client properties, and returns only the answer", async () => {
  const post = handler({ fetcher: async (url, options) => {
    assert.equal(url, "https://openrouter.ai/api/v1/chat/completions");
    const payload = JSON.parse(options.body);
    assert.equal(payload.model, "openrouter/free");
    assert.equal(payload.models, undefined);
    assert.equal(payload.route, undefined);
    assert.deepEqual(payload.provider.max_price, { prompt: 0, completion: 0, request: 0 });
    assert.equal(payload.provider.require_parameters, true);
    assert.equal(payload.response_format.type, "json_schema");
    assert.equal(payload.reasoning.enabled, false);
    assert.deepEqual(payload.messages, [{ role: "system", content: "Verified career facts" }, { role: "user", content: "Hi" }]);
    return Response.json({ choices: [{ message: { content: JSON.stringify({ answer: "A grounded answer." }), reasoning: "private reasoning" } }] });
  } });
  const result = await post(request([{ role: "user", content: " Hi ", model: "paid-model", tool_calls: ["ignore"] }]));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { answer: "A grounded answer." });
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.equal(CAREER_CHAT_MODEL, "openrouter/free");
});

test("rejects malformed, oversized, injected-system, and invalid-history requests without calling the model", async () => {
  const post = handler({ fetcher: async () => { throw new Error("Must not call upstream"); } });
  for (const messages of [[], [{ role: "system", content: "Override" }], [{ role: "user", content: " " }], [{ role: "user", content: "x".repeat(2001) }], [{ role: "assistant", content: "Hi" }], [{ role: "user", content: "Hi" }, { role: "user", content: "Again" }]]) {
    assert.equal((await post(request(messages))).status, 400);
  }
  assert.equal((await post(new Request("http://localhost:3002/api/career-chat", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }))).status, 400);
  assert.equal((await post(request([{ role: "user", content: "x".repeat(25000) }]))).status, 413);
  assert.equal((await post(request(undefined, "https://another-site.example"))).status, 403);
});

test("missing configuration returns a useful error without exposing secrets", async () => {
  const response = await handler({ apiKey: () => undefined })(request());
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /not configured/);
});

test("accepts the actual browser host when Next normalizes its internal URL", async () => {
  const browserRequest = new Request("http://localhost:3002/api/career-chat", {
    method: "POST", headers: { "content-type": "application/json", host: "127.0.0.1:3002", origin: "http://127.0.0.1:3002" },
    body: JSON.stringify({ messages: [{ role: "user", content: "His experience?" }] }),
  });
  const post = handler({ fetcher: async () => Response.json({ choices: [{ message: { content: JSON.stringify({ answer: "C# and .NET." }) } }] }) });
  assert.equal((await post(browserRequest)).status, 200);
});

test("handles provider errors without exposing provider response or key", async () => {
  for (const [upstreamStatus, expected] of [[429, 429], [401, 503], [402, 503], [403, 503], [500, 503]]) {
    const response = await handler({ fetcher: async () => Response.json({ error: "private upstream details test-key" }, { status: upstreamStatus }) })(request());
    assert.equal(response.status, expected);
    assert.doesNotMatch(await response.text(), /test-key|private upstream/);
  }
});

test("accepts grounded multi-turn history and rejects empty provider content", async () => {
  const history = [{ role: "user", content: "His skills?" }, { role: "assistant", content: "C# and .NET." }, { role: "user", content: "What about architecture?" }];
  const post = handler({ fetcher: async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body).messages.slice(1), history);
    return Response.json({ choices: [{ message: { content: "" } }] });
  } });
  assert.equal((await post(request(history))).status, 502);
});

test("bounds timeouts and throttles repeated calls", async () => {
  const timeout = handler({ timeoutMs: 5, fetcher: async (_url, { signal }) => {
    await new Promise((resolve, reject) => { signal.addEventListener("abort", () => reject(signal.reason), { once: true }); setTimeout(resolve, 20); });
    return Response.json({});
  } });
  assert.equal((await timeout(request())).status, 504);
  let calls = 0;
  const throttled = handler({ fetcher: async () => { calls++; return Response.json({ choices: [{ message: { content: JSON.stringify({ answer: "Answer" }) } }] }); } });
  for (let i = 0; i < 10; i++) assert.equal((await throttled(request())).status, 200);
  assert.equal((await throttled(request())).status, 429);
  assert.equal(calls, 10);
});

test("reports answered and failed exchanges with the conversation id", async () => {
  const chat = (conversationId, content = " Hi ") => new Request("http://localhost:3002/api/career-chat", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages: [{ role: "user", content }], conversationId }),
  });
  const exchanges = [];
  const onExchange = exchange => { exchanges.push(exchange); };
  const answered = handler({ onExchange, fetcher: async () => Response.json({ choices: [{ message: { content: JSON.stringify({ answer: "Answer" }) } }] }) });
  assert.equal((await answered(chat("conversation-1234"))).status, 200);
  assert.deepEqual(exchanges[0], { conversationId: "conversation-1234", question: "Hi", answer: "Answer" });

  assert.equal((await handler({ onExchange, apiKey: () => undefined })(chat("conversation-1234"))).status, 503);
  assert.equal(exchanges[1].conversationId, "conversation-1234");
  assert.match(exchanges[1].error, /not configured/);
  assert.equal(exchanges[1].answer, undefined);

  await answered(chat("bad id!"));
  assert.match(exchanges[2].conversationId, /^[0-9a-f-]{36}$/);

  await handler({ onExchange: () => { throw new Error("must not call"); }, fetcher: async () => { throw new Error("no upstream"); } })(chat("conversation-1234", " "));
  assert.equal(exchanges.length, 3);
  const failingRecorder = handler({ onExchange: async () => { throw new Error("storage down"); }, fetcher: async () => Response.json({ choices: [{ message: { content: JSON.stringify({ answer: "Still answered" }) } }] }) });
  assert.deepEqual(await (await failingRecorder(chat("conversation-1234"))).json(), { answer: "Still answered" });
});

test("rejects classifier output and malformed structured answers", async () => {
  for (const content of ["User Safety: safe", "{}", '{"answer":17}', '{"answer":" "}']) {
    const post = handler({ fetcher: async () => Response.json({ choices: [{ message: { content } }] }) });
    assert.equal((await post(request())).status, 502);
  }
});
