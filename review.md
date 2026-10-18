# Code review: Ahmad Aghazadeh portfolio website

Reviewed: October 18, 2026, covering the working tree (the last commit `25d1633 Add website` plus all uncommitted changes).

## Summary

This is a small, tidy Next.js 16 (App Router) + React 19 portfolio site. It has a single page, a mobile navigation header, a generated Open Graph image, a custom local launcher (`scripts/serve.mjs`), and a newer, uncommitted "Digital Twin" AI career chat backed by OpenRouter (`/api/career-chat`).

The code is in good shape for a **local** site. The typecheck passes, the production build succeeds, all 8 unit tests pass, and `npm audit` reports 0 vulnerabilities. The chat endpoint is more defensive than most hobby endpoints: it validates input, limits body size, has a timeout, never leaks upstream errors or the key, uses structured output, and pins pricing to zero.

The main risks show up **once the site is deployed** and in **repository hygiene**:

1. Production metadata points at `http://127.0.0.1:3001`, so social previews break on a real domain.
2. The launcher binds only to `127.0.0.1`, so `npm start` can't be reached inside a container or on a VM.
3. The chat's origin check and global in-memory rate limiter don't hold up behind a proxy or on serverless hosting. One visitor can also use up the chat for everyone.
4. The chat UI deletes older messages from the screen once a conversation passes five turns.
5. A large amount of work (the chat feature, tests, docs) is uncommitted, and the README is now inaccurate.
6. `Profile.pdf`, which is committed to a public profile repository, contains a personal mobile number and home city. The site copy deliberately leaves both out.

### Verification performed

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Pass, no errors |
| `npm run build` (Next.js 16.4.2, Turbopack) | Pass. `/`, `/icon.svg`, and `/opengraph-image` are static; `/api/career-chat` is dynamic |
| `node --test tests/career-chat.test.mjs` | 8/8 pass |
| `npm audit --omit=dev` | 0 vulnerabilities |
| `.env` tracking | Ignored, and never committed in history (it holds only `OPENROUTER_API_KEY`) |
| Linting | **Not configured** (no ESLint config and no `lint` script) |

Severity scale: **High** means it breaks something or exposes data once deployed or published. **Medium** is a real bug or meaningful risk. **Low** covers quality, maintainability, and polish.

---

## 1. Security and privacy

### 1.1 High: personal phone number and home location are committed in `Profile.pdf`

`Profile.pdf` (the LinkedIn export, tracked since commit `25d1633`) contains a mobile number (`+90…`) and "Tabriz, East Azerbaijan Province, Iran", repeated several times. `tutorial.md` says personal-location references were deliberately removed from the website. The repository is the GitHub profile repo (`ahmadaghazadeh/ahmadaghazadeh`), which is normally public, so the PDF undoes that decision. `Ahmad-Aghazadeh-Resume.pdf` is committed as well and should be checked for the same details.

**Remedial actions**
- Decide whether these PDFs need to be in a public repository at all. The site reads `src/content/profile.ts` and never reads the PDFs at runtime.
- If they shouldn't be public, remove them from the tree and add them to `.gitignore`. Because they are already in history, rewriting history (`git filter-repo`) and force-pushing is the only way to fully remove them. That is a remote write, so do it deliberately.
- If they stay, export a redacted version without the phone number.

### 1.2 Medium: the chat's origin check breaks behind a proxy and doesn't stop scripted abuse

`src/lib/career-chat.ts:57-68` compares the `Origin` header with the `Host` header.

- **It fails closed behind a reverse proxy or CDN.** Many hosts rewrite `Host` to an internal name and put the public host in `X-Forwarded-Host`. When that happens, every real browser request gets a 403 ("Please open the chat from this website.").
- **It only runs when an `Origin` header exists** (`if (origin)`). Any non-browser client (curl, scripts) skips it by leaving the header out, and can set `Host` to anything anyway. That's acceptable for a CSRF-style check, but it means the check offers no protection against abuse. Only the rate limiter does.

**Remedial actions**
- Compare against a configured allowlist (for example a server-only `SITE_ORIGIN` environment variable) instead of the `Host` header. If you must derive it, respect `X-Forwarded-Host` only when it comes from a trusted proxy.
- Document that this check is a browser cross-site guard, not access control.

### 1.3 Medium: the rate limiter is global, per process, and lets one visitor block everyone

`src/lib/career-chat.ts:51-54, 86-89` allows 10 requests per minute **in total**, shared across all visitors.

- A single client looping requests uses all 10 slots, and every real visitor then gets "Chat is busy" (an easy denial of service).
- On serverless or multi-instance hosting (Vercel, for example), each instance keeps its own counter. The limit then neither caps total upstream usage nor resets predictably.
- A request counts against the limit even if the client aborts it straight away.

The code comment (lines 51-52) and `docs/digital-twin.md` already acknowledge the multi-instance problem, which is good.

**Remedial actions**
- Add a per-client limit (keyed by IP from a trusted forwarded header) alongside the global cap.
- If deployed, move the counters into a shared store (Upstash/Redis, Cloudflare KV or Durable Objects, Vercel KV), or use the host's edge rate-limiting rules.
- Consider a bot challenge (for example Cloudflare Turnstile) before the first chat message.

### 1.4 Low: the client controls the assistant turns in the history

The server accepts whatever `assistant` messages the client sends (`validMessages`, lines 41-48). Someone can invent earlier "assistant" turns to steer the model, for example a made-up assistant reply claiming Ahmad has a skill he doesn't. The system prompt says to treat history as untrusted, and the context is public profile data, so the impact is limited to embarrassing answers that a user deliberately fabricated (and could screenshot).

**Remedial actions (optional)**
- Accept this risk and say so in the docs, **or** sign or HMAC each assistant answer on the server and reject history entries whose signature doesn't verify.

### 1.5 Low: the server-side URL uses a `NEXT_PUBLIC_` variable

`src/app/layout.tsx:7` reads `NEXT_PUBLIC_SITE_URL`. It isn't secret, but the `NEXT_PUBLIC_` prefix gets the value inlined into client bundles, and this value is only needed on the server for metadata. A plain `SITE_URL` makes the intent clearer. See also section 2.1.

---

## 2. Deployment and configuration

### 2.1 High: `metadataBase` falls back to `http://127.0.0.1:3001`

`src/app/layout.tsx:7`:

```7:7:f:\Projects\ahmadaghazadeh\src\app\layout.tsx
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3001"),
```

- `npm run build` doesn't go through `scripts/serve.mjs`, so a normal build bakes the localhost fallback into the absolute `og:image` and `twitter:image` URLs. When the link is shared, LinkedIn and X will try to fetch an image from `127.0.0.1`, so the preview has no image.
- The page is statically prerendered, so metadata is fixed at build time. `serve.mjs start` sets `NEXT_PUBLIC_SITE_URL` at runtime, which has **no effect** on the already-built HTML. The README warns about this, but the setup is still easy to get wrong.

**Remedial actions**
- Require the site URL for production builds. Fail the build, or at least log a warning, when it's missing and `NODE_ENV === "production"`.
- Fall back to the hosting platform's URL variable (for example `VERCEL_PROJECT_PRODUCTION_URL`) before localhost.
- Add `alternates: { canonical: "/" }` once a real domain exists.

### 2.2 Medium: `npm start` binds only to `127.0.0.1`

`scripts/serve.mjs:18, 28` always passes `--hostname 127.0.0.1`. That's a sensible default for local development, but in Docker, on a VM, or behind a reverse proxy on a separate host, the production server can't be reached.

**Remedial actions**
- Read the bind address from `HOSTNAME` or `HOST` (defaulting to `127.0.0.1`), or have `start` call `next start` directly and keep the port-probing helper only for `dev`.

### 2.3 Medium: the launcher overwrites a user-supplied `NEXT_PUBLIC_SITE_URL`

`scripts/serve.mjs:30` always replaces `NEXT_PUBLIC_SITE_URL` with `http://127.0.0.1:<port>`, even when the user has set it. For `dev` this is harmless. For `start` it's misleading, because the value can't affect the static page anyway (see 2.1).

**Remedial actions**
- Only set it when it isn't already set (`process.env.NEXT_PUBLIC_SITE_URL ?? ...`), and only for `dev`.

### 2.4 Medium: the chat timeout may exceed serverless function limits

`createCareerChatHandler` defaults to a 60-second upstream timeout (`src/lib/career-chat.ts:50`). Many serverless plans cut functions off sooner, and the user then gets a platform error page (non-JSON). Section 3.3 explains why the client handles that badly.

**Remedial actions**
- Export `maxDuration` from `src/app/api/career-chat/route.ts` to match the plan, and set `timeoutMs` a few seconds below it.

### 2.5 Low: missing `engines`, `.env.example`, and `.gitattributes`

- `AbortSignal.any` (`career-chat.ts:95`) needs Node 20.3 or later, and the README says 20.9 or later, but `package.json` has no `"engines": { "node": ">=20.9" }`.
- `.gitignore` whitelists `.env.example`, but the file doesn't exist. New contributors have to read `docs/digital-twin.md` to learn about `OPENROUTER_API_KEY`.
- Git warns "LF will be replaced by CRLF" on several source files. Add a `.gitattributes` (`* text=auto eol=lf`) to stop line-ending churn between Windows and other tools.

---

## 3. Correctness bugs

### 3.1 Medium: older chat messages disappear from the screen

`src/components/career-chat.tsx:37-50`:

```37:38:f:\Projects\ahmadaghazadeh\src\components\career-chat.tsx
    const history = [...messages.slice(-10), { role: "user" as const, content }];
    setMessages(history);
```

The same array is used both as the **request history** (which the server limits to 12 messages) and as the **rendered conversation**. Starting with the sixth question, the earliest turns silently vanish from the UI. `docs/digital-twin.md` describes keeping five turns as context, but users don't expect their visible transcript to be cut. Because keys are based on index (line 79), every remaining message also changes its key, and React re-mounts them.

**Remedial actions**
- Keep the full transcript in state and limit it only when building the request body (`body: JSON.stringify({ messages: transcript.slice(-11) })`, making sure the slice still starts with a user turn).
- Give each message a stable id (for example `crypto.randomUUID()`) and use that as the key.

### 3.2 Medium: a long conversation can exceed the 24 KB body limit, especially in Persian

The server caps the body at 24,000 **bytes** (`career-chat.ts:4`) but allows up to 12 messages, with questions up to 2,000 characters each and answers up to 6,000 characters each. The system prompt also says "Match the visitor's language". Persian text takes about 2 bytes per character in UTF-8, so a handful of long Persian answers in the history can exceed the limit. The visitor then gets a 413 ("This conversation is too long. Please start a new chat."). The client never checks the size.

**Remedial actions**
- On the client, drop the oldest turn pairs until the encoded body fits (with a margin), instead of relying on the server's 413.
- Or limit the assistant content sent back as history (for example to 1,500 characters) on both sides.

### 3.3 Medium: the client may show raw parser and browser error text

`src/components/career-chat.tsx:48-53`:

- When the response isn't JSON (a proxy, CDN, or serverless timeout page), `await response.json()` throws a `SyntaxError`. The UI then shows something like *"Unexpected token '<', "<!DOCTYPE"... is not valid JSON"*.
- The network-failure check only matches Chrome's `"Failed to fetch"`. Firefox (`"NetworkError when attempting to fetch resource."`) and Safari (`"Load failed"`) leak their raw messages instead.

**Remedial actions**
- Treat any non-JSON response or `TypeError` from `fetch` as a generic "Could not connect" error. Show only the server-provided `data.error` string, and only when the body parsed successfully.

### 3.4 Low: a non-JSON 200 response from upstream is reported as "Could not reach"

In `career-chat.ts:120`, if OpenRouter returns a 200 whose body isn't JSON, `response.json()` throws. The outer `catch` then returns 503 "Could not reach the free AI model". That's misleading, and the 502 path a few lines later was written for exactly this case. Wrap the parse and return 502.

### 3.5 Low: the copyright year is fixed at build time

`src/app/page.tsx:48` uses `new Date().getFullYear()` in a statically prerendered page, so the year only changes on a rebuild. That's acceptable if the site is rebuilt regularly. Otherwise, hard-code the year range or render it on the client.

### 3.6 Low: the GitHub link depends on array order

`src/app/page.tsx:37` uses `profile.links[0].url` for "Explore my GitHub". Reordering `links` would silently point the button somewhere else. Look the link up by label, or add a `profile.github` field.

---

## 4. Accessibility

The basics are done well: a skip link, `aria-labelledby` on every section, `aria-expanded` and `aria-controls` on the menu, Escape closing the menu and returning focus, visible `:focus-visible` outlines, `prefers-reduced-motion` support, and a real `<label>` on the chat textarea. Remaining items:

- **Low: chat live regions announce twice.** The conversation is `role="log"` with `aria-live="polite"` and `aria-relevant="additions text"`, and it *also* contains a `role="status"` "Thinking…" line and a `role="alert"` error (`career-chat.tsx:77-81`). Errors can be announced twice. Move the status and alert elements outside the log container.
- **Low: the whole transcript may be re-announced.** Because of the re-mounting described in 3.1, screen readers may read the entire log again after each answer.
- **Low: the mobile menu has no outside-click close and no focus management.** When the menu opens, focus stays on the button and Tab can move past the menu into the page behind. That's acceptable for a non-modal disclosure, but closing on outside click or on scroll would feel more natural.
- **Low: the "Digital Twin" section isn't in the navigation.** `header.tsx:5` lists About, Work, Journey, and Expertise only, so keyboard and screen-reader users can't jump to section 05.
- **Low: decorative arrows in visible text.** Several links put ↗ or → inside the link text, wrapped in `aria-hidden` spans. That's correct. Some, like "Back to top ↑" (`page.tsx:48`) and the menu labels "Menu +" and "Close −", aren't wrapped, so screen readers read "up arrow" or "plus". Wrap them in `aria-hidden` spans.

---

## 5. Maintainability and code quality

### 5.1 Medium: very long single-line JSX

`src/app/page.tsx` lines 30, 36, 40, 42, 46, and 48 each contain an entire section, sometimes more than 1,000 characters on one line. They're hard to review, diff, and edit, and a one-word change produces a whole-line diff. Section 5.3 covers the related CSS formatting.

**Remedial actions**
- Add Prettier (and an ESLint config, see 5.4). Split each section into its own component (`AboutSection`, `WorkSection`, `JourneySection`, `ExpertiseSection`, `ContactSection`), as was already done for `CurrentFocus` and `CareerChat`.

### 5.2 Medium: content duplicated and hard-coded outside `profile.ts`

`profile.ts` is meant to be the single content source, but several facts are repeated elsewhere:

- "14+ years" appears in `layout.tsx:9`, `page.tsx:26`, `opengraph-image.tsx:8`, and `profile.ts:30`. The career start date is January 2011, so this is now **15+** years, and it will drift again. Calculate it from the earliest `experience` start date, or keep it in a single constant.
- Role and tagline strings are duplicated between `layout.tsx` metadata, `opengraph-image.tsx`, and `profile.ts`.
- Hero facts, section headings, and the "05 /" chat label are hard-coded, and the chat header doesn't reuse the `SectionLabel` component, so the numbering can get out of sync.
- The system prompt in `route.ts` lists `profile` fields by hand. A field added to `profile` won't reach the chat unless someone updates this list.

### 5.3 Low: Tailwind is installed but essentially unused

`globals.css` imports `tailwindcss` and defines an `@theme`, but every component uses hand-written class names and no Tailwind utilities. Tailwind effectively only adds its reset (Preflight). Either use the utilities or remove `tailwindcss` and `@tailwindcss/postcss` and keep a small reset. The README and tutorial describe the stack as "Tailwind CSS", which is misleading. Both `globals.css` and `career-chat.module.css` are also written as one rule per line with many declarations, and `career-chat.module.css` uses `!important` to win specificity fights (`.reset`, `.send`, lines 27-28, 44-45).

### 5.4 Low: no linting, no test script, no CI

- Next.js 16 no longer ships `next lint`. Add `eslint` with `eslint-config-next` and a `"lint"` script.
- Add `"test": "node --test tests/"` to `package.json`. Right now the test command is only documented in `docs/digital-twin.md`.
- Add a minimal CI workflow (typecheck, lint, test, build) so the checks run on every push. This is local file work and needs no remote changes.

### 5.5 Low: the test harness is fragile

`tests/career-chat.test.mjs:6-8` transpiles the TypeScript source and imports it through a `data:` URL. It works only because `career-chat.ts` has no imports. Adding a single `import` (for example of `@/content/profile`) will break it. Consider running TypeScript tests directly (Node's `--experimental-strip-types`, `tsx`, or Vitest).

Test coverage gaps worth closing:
- Rate-limit window reset after 60 seconds (use an injectable clock).
- Origin missing versus present, and the proxy `X-Forwarded-Host` case once 1.2 is addressed.
- Wrong `content-type` (415).
- A non-JSON 200 from upstream (see 3.4).
- No tests exist for the React components (header toggle, chat history limiting, error rendering).

### 5.6 Low: smaller items

- `header.tsx:5`: `items` is inferred as `string[][]`. Use `as const`, or an array of `{ label, id }` objects, for type safety.
- `career-chat.ts:7`: the `Dependencies` type could also allow injecting `now()`, the rate limit, and the window, to make testing easier.
- `career-chat.ts:14`: `json(body: object)` is loosely typed. Prefer `{ answer: string } | { error: string }`.
- `opengraph-image.tsx` uses a generic `sans-serif` instead of the site's Manrope font, so the social card doesn't match the brand. You can load the font file in the image route.
- `globals.css:6`: `background-attachment: fixed` is ignored on iOS and can cause scroll jank on low-end Android devices.
- `globals.css:163`: the mobile menu's `top: 87px` (and `79px` at line 189) is coupled by hand to the header heights. Use `top: 100%` on a relatively positioned header instead.

---

## 6. Repository hygiene and documentation

### 6.1 Medium: much of the work is uncommitted

`git status` shows the whole chat feature (`src/app/api/`, `src/lib/`, `src/components/career-chat.*`, `src/components/current-focus.tsx`), `tests/`, `docs/`, and `tutorial.md` as untracked. It also shows modifications to most tracked source files and the deletion of `system-graphic.tsx`. The committed `HEAD` builds a different site (the older charcoal design with the system graphic). This work is one disk failure away from being lost.

**Remedial actions**
- Commit locally in logical pieces (for example: visual refresh and Current Focus, then the career-chat API with tests, then docs).

### 6.2 Medium: the README is out of date

The website section of `README.md` now contradicts the code:

- It says "There are no runtime analytics, external font requests, database, or contact-form services". The chat now sends visitor messages to OpenRouter.
- It mentions "the system illustration", which has been removed.
- It doesn't mention `OPENROUTER_API_KEY`, `docs/digital-twin.md`, or the test command.
- It says production metadata "defaults to `http://127.0.0.1:3001`" as though that were acceptable (see 2.1).

The original profile section also has problems:
- A broken image: `<img src="(https://visitor-badge.laobi.icu/badge?page_id=AhmadAghazadeh)" />` (line 80) has stray parentheses, and it duplicates the badge on line 77.
- `<a href="#" alt="...">` (line 104): `alt` isn't valid on `<a>`, and the link goes nowhere.
- An empty Stack Overflow anchor (lines 110-111) with no content.
- `</br>` (line 102) isn't valid HTML. Use `<br>`.

**Remedial actions**
- Update the website section. Consider moving the developer setup into `docs/` so the profile README stays visitor-facing, since this README is what appears on the GitHub profile page.

### 6.3 Low: `next-env.d.ts` is tracked

The bundled Next.js 16 docs (`node_modules/next/dist/docs/01-app/03-api-reference/05-config/02-typescript.md`) say: "`next-env.d.ts` is managed by Next.js… Add it to `.gitignore`. If your project already tracks the file, remove it from Git." The file now imports `./.next/types/routes.d.ts`, which only exists after a build or typegen.

**Remedial actions**
- Add `next-env.d.ts` to `.gitignore` and run `git rm --cached next-env.d.ts`.

### 6.4 Low: `tutorial.md` and `review.md` in the root

`tutorial.md` (about 1,250 lines) is useful, but it describes "our work in this conversation", which won't make sense to a future reader. Consider moving it into `docs/` and rewording it as standing documentation. Decide the same for this `review.md`.

---

## 7. What's done well

- **Secret handling:** the key is server-only, never prefixed `NEXT_PUBLIC_`, never echoed in errors, and tests assert that it doesn't leak.
- **Defensive endpoint:** a streaming body-size limit, strict alternating-role validation, extra client fields stripped, `Cache-Control: no-store`, structured JSON output validated before returning, a timeout combined with client-abort propagation (`AbortSignal.any`), and zero-price provider pinning.
- **Safe rendering:** model output is rendered as React text with only `**bold**` turned into `<strong>`. There's no `dangerouslySetInnerHTML`, so model output can't inject HTML.
- **Dependency injection** (`fetcher`, `apiKey`, `timeoutMs`) keeps the handler unit-testable without network access.
- **Accessibility fundamentals** and **reduced-motion** support are in place, and external links use `rel="noopener noreferrer"`.
- **Content honesty:** the claims in `profile.ts` match `Profile.pdf` (for example "3 million monthly requests", "5-app restaurant suite", "team of 3"), and `caseStudyUrl` is only rendered when a URL is provided, so there are no placeholder links.
- **No runtime third-party requests** for fonts or analytics; fonts are bundled through `@fontsource-variable`.

---

## 8. Prioritized remedial action plan

| # | Action | Severity | Effort |
| --- | --- | --- | --- |
| 1 | Decide on `Profile.pdf` and the resume PDF in a public repo; redact or remove them, and rewrite history if needed (1.1) | High | S to M |
| 2 | Commit the uncommitted work locally in logical commits (6.1) | Medium | S |
| 3 | Make the production site URL required or derived from the platform, and stop the localhost fallback in production builds (2.1) | High | S |
| 4 | Keep the full chat transcript in the UI and limit only the request history; use stable message ids (3.1) | Medium | S |
| 5 | Harden client error handling for non-JSON and cross-browser network errors (3.3) | Medium | S |
| 6 | Size-limit the history on the client by UTF-8 bytes (3.2) | Medium | S |
| 7 | Replace the Host-based origin check with a configured allowlist (1.2) | Medium | S |
| 8 | Add per-IP limiting and a shared store before any public deployment (1.3) | Medium | M |
| 9 | Make the bind host configurable, and stop overriding `NEXT_PUBLIC_SITE_URL` in `serve.mjs` (2.2, 2.3) | Medium | S |
| 10 | Export `maxDuration` and match `timeoutMs` to the host (2.4) | Medium | S |
| 11 | Update the README; fix the broken badge and anchors (6.2) | Medium | S |
| 12 | Add ESLint, Prettier, `lint` and `test` scripts, and CI; split `page.tsx` into section components (5.1, 5.4) | Medium | M |
| 13 | Centralize duplicated content ("14+ years" is now 15+; metadata and OG strings) (5.2) | Medium | S |
| 14 | Untrack `next-env.d.ts`; add `engines`, `.env.example`, `.gitattributes` (6.3, 2.5) | Low | S |
| 15 | Accessibility polish: live regions, nav link to the chat, `aria-hidden` arrows (section 4) | Low | S |
| 16 | Decide whether to keep Tailwind or remove it (5.3) | Low | S |
| 17 | Broaden tests (rate-limit reset, 415, proxy origin, UI) and move away from the `data:` URL harness (5.5) | Low | M |
| 18 | Remaining low-severity items (3.4, 3.5, 3.6, 5.6, 6.4) | Low | S |

Effort: S is under an hour; M is a few hours.
