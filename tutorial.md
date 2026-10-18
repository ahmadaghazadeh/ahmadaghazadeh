# A beginner's guide to Ahmad's professional website

This tutorial explains the website in this repository, from opening it on your computer to understanding its components and making your first changes. You do not need previous frontend experience.

The examples reflect the blue/teal version of the website. They show real code or explicitly identified teaching examples. Some excerpts are reformatted across multiple lines to make them easier to read; they are not instructions to replace entire files.

**A note about the current project:** our work in this conversation created the portfolio and refreshed its visual design. The current working folder also contains a newer **Digital Twin career-chat feature**. This tutorial describes that feature separately so you can understand the code that is actually present. Its presence changes the hosting requirements: the portfolio presentation can be adapted to static hosting, but the chat endpoint needs a server.

## Contents

1. [What was built](#1-what-was-built)
2. [The basic ideas behind a website](#2-the-basic-ideas-behind-a-website)
3. [Run the project on Windows](#3-run-the-project-on-windows)
4. [The technology stack](#4-the-technology-stack)
5. [Find your way around the files](#5-find-your-way-around-the-files)
6. [A high-level walkthrough](#6-a-high-level-walkthrough)
7. [Review the content and TypeScript types](#7-review-the-content-and-typescript-types)
8. [Review the layout and page](#8-review-the-layout-and-page)
9. [Review the Current Focus component](#9-review-the-current-focus-component)
10. [Review the interactive navigation](#10-review-the-interactive-navigation)
11. [Review the styling and responsive design](#11-review-the-styling-and-responsive-design)
12. [Review accessibility](#12-review-accessibility)
13. [Review fonts, icons, and sharing previews](#13-review-fonts-icons-and-sharing-previews)
14. [Review the local server launcher](#14-review-the-local-server-launcher)
15. [Understand the newer career-chat feature](#15-understand-the-newer-career-chat-feature)
16. [Try some small changes](#16-try-some-small-changes)
17. [Check your changes and solve common problems](#17-check-your-changes-and-solve-common-problems)
18. [Understand publishing](#18-understand-publishing)
19. [Further reading](#19-further-reading)
20. [Self-review: five improvements](#20-self-review-five-improvements)

## 1. What was built

This is a professional introduction to Ahmad Aghazadeh for hiring teams and potential collaborators.

The page contains:

| Part | What the visitor learns |
| --- | --- |
| Header | Ahmad's name, navigation, and a contact action |
| Hero | His role, introduction, and links to work and contact |
| Current Focus | Backend systems and exploration of agentic engineering |
| About | His engineering approach and professional interests |
| Work | Four documented engineering highlights |
| Journey | Career history in reverse chronological order |
| Expertise | Groups of technologies and engineering practices |
| Digital Twin | An AI-assisted conversation about the supplied career facts |
| Contact and footer | Email, professional profiles, and navigation back to the top |

The first design used charcoal and lime, compact text, and a custom systems illustration. The refresh replaced that illustration with Current Focus, changed the palette to navy/teal with mint accents, enlarged the text, and introduced rounded translucent cards.

The refresh also removed the requested personal-location references from the website. Employer locations remain where appropriate, and the original PDF documents were preserved. The website reads curated TypeScript content; it does not parse those PDFs whenever someone visits.

The site has no user accounts or database. The career chat introduces an external AI request, but its conversation is held in browser component memory rather than saved by this application.

## 2. The basic ideas behind a website

A frontend is the part of an application that people see and interact with in a browser. A backend runs on a server and handles work such as talking to another service.

Three basic technologies work together:

- **HTML** describes the structure: headings, paragraphs, links, buttons, and sections.
- **CSS** controls the appearance: colors, sizes, spacing, columns, and responsive behavior.
- **JavaScript** controls behavior: opening a menu, submitting a question, and updating the screen.

This project adds React and TypeScript on top of those foundations.

### Components are reusable pieces of the page

A React component is a function that describes a piece of the interface:

~~~tsx
function Greeting() {
  return <p>Hello, Ahmad.</p>;
}
~~~

This is a teaching example. The HTML-like part is **JSX**. A component name begins with a capital letter, so React recognizes `<Greeting />` as a component rather than a standard HTML element.

In this project, the JSX is written in `.tsx` files: TypeScript files that can contain JSX.

### JSX can display data

~~~tsx
<p>{profile.role}</p>
~~~

The curly braces tell React to evaluate a JavaScript expression. Here, React reads the `role` property from the `profile` object and displays it.

A **property** is a named value inside an object. An **array** is an ordered collection of values. The career history is an array of job objects.

### Classes connect markup to CSS

~~~tsx
<p className="hero-description">{profile.intro}</p>
~~~

React uses `className` where ordinary HTML uses `class`. The corresponding CSS selector begins with a dot:

~~~css
.hero-description {
  font-size: 22px;
  line-height: 1.75;
}
~~~

The JSX gives the paragraph a class. CSS finds that class and styles it.

### The browser creates a DOM

The **DOM**, or Document Object Model, is the browser's representation of the page. React helps describe and update that structure. You usually work with components rather than manually creating HTML elements.

You do not have to learn every term immediately. Start by recognizing which file holds the content, which file describes the page, and which file styles it.

## 3. Run the project on Windows

Use a code editor such as Visual Studio Code and open the repository folder.

Open PowerShell in that folder, or enter:

~~~powershell
Set-Location 'F:\Projects\ahmadaghazadeh'
node --version
npm.cmd --version
~~~

Node.js runs the development tools. npm installs packages and runs commands defined by the project. The installed Next.js version requires Node.js 20.9 or newer.

### Install dependencies

~~~powershell
npm.cmd ci
~~~

Run this on a fresh checkout with the supplied lockfile. It installs the dependency versions recorded in `package-lock.json`. It requires network access to download packages and replaces an existing `node_modules` installation.

You do not need to reinstall packages after every text or CSS edit.

Use `npm.cmd install` when deliberately changing dependencies. That command can update the lockfile; `npm.cmd ci` expects the manifest and lockfile to agree.

The `.cmd` form is useful on Windows because PowerShell policies sometimes prevent execution of the similarly named `npm.ps1` script.

### Start development mode

~~~powershell
npm.cmd run dev
~~~

Leave this terminal running. Open the address printed after **Local**, which has been `http://127.0.0.1:3001` on this machine.

- `127.0.0.1` means your own computer.
- The number after the colon is the **port**, the local connection point used by the server.
- Our launcher tries port 3000 and skips unavailable or Windows-reserved ports.
- The printed address is authoritative; do not assume it will always be 3001.

When you save source changes in development mode, Next.js normally updates the page automatically.

Press **Ctrl+C** in the terminal to stop the server. If a production server is already running, stop it before starting development mode unless you intentionally want a second server on another port.

### Check and run a production build

~~~powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
~~~

Run these one at a time and check the result of each.

A **build** transforms the source into optimized application files inside `.next`. Production mode serves that build. It does not automatically incorporate later source edits: rebuild and restart after changing the application.

These commands correspond to the following `package.json` scripts:

~~~json
{
  "dev": "node scripts/serve.mjs dev",
  "build": "next build",
  "start": "node scripts/serve.mjs start",
  "typecheck": "tsc --noEmit"
}
~~~

`tsc --noEmit` checks TypeScript without writing compiled application JavaScript.

## 4. The technology stack

The installed versions inspected while writing this tutorial were Next.js **16.4.2**, React and React DOM **19.3.1**, TypeScript **5.9.3**, and Tailwind CSS **4.3.3**. These are a local snapshot, not a claim about the newest releases.

| Technology | What it does here |
| --- | --- |
| Next.js App Router | Organizes pages, layouts, metadata, builds, and the career-chat endpoint |
| React | Composes the interface and handles interactive component state |
| TypeScript | Checks the expected shapes of values and component inputs |
| CSS | Implements most of the custom visual design |
| Tailwind CSS and PostCSS | Supply Tailwind's CSS processing and base styling |
| Node.js | Runs development/build tools and server-side JavaScript |
| npm | Installs dependencies and runs project scripts |
| Fontsource packages | Bundle fonts locally with the application |
| SVG | Describes the small browser icon using vector shapes |
| OpenRouter integration | Connects the newer career-chat endpoint to a model provider |

### Tailwind is installed, but most styles are custom CSS

You may see Tailwind tutorials using utility classes such as `flex`, `p-4`, and `text-xl`.

This site's main design instead uses descriptive classes such as `hero-layout`, `work-card`, and `focus-panel`, defined in `globals.css`. It would be misleading to describe the page as entirely built from Tailwind utility classes.

Tailwind is connected through:

~~~js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
~~~

And the stylesheet begins with:

~~~css
@import "tailwindcss";
~~~

PostCSS processes the CSS during development and builds. Tailwind's base styles can affect defaults, so the project explicitly defines headings, spacing, and other visual rules.

### Dependencies and development dependencies

In `package.json`, `dependencies` lists packages used by the application, while `devDependencies` lists tools and types needed for development and builds. Hosting build environments need the build tools available too.

A version such as `^16.0.0` allows a range of compatible package versions. The lockfile records the exact resolved versions. Keep the lockfile with the project so other machines can reproduce the installation.

## 5. Find your way around the files

Here is the relevant structure, simplified to omit generated files and package contents:

~~~text
ahmadaghazadeh/
├── package.json
├── package-lock.json
├── tsconfig.json
├── postcss.config.mjs
├── .gitignore
├── README.md
├── tutorial.md
├── Profile.pdf
├── Ahmad-Aghazadeh-Resume.pdf
├── scripts/
│   └── serve.mjs
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── icon.svg
│   │   ├── opengraph-image.tsx
│   │   └── api/career-chat/route.ts
│   ├── components/
│   │   ├── header.tsx
│   │   ├── current-focus.tsx
│   │   ├── career-chat.tsx
│   │   └── career-chat.module.css
│   ├── content/
│   │   └── profile.ts
│   └── lib/
│       └── career-chat.ts
├── docs/
│   └── digital-twin.md
└── tests/
    └── career-chat.test.mjs
~~~

The job of each main folder:

- `app` contains Next.js route files and the root layout.
- `components` contains identifiable pieces of the interface.
- `content` contains editable professional information.
- `lib` contains reusable logic, including the chat request handler.
- `scripts` contains tooling that runs outside the browser.
- `tests` contains automated checks.

Do not manually edit `node_modules` or `.next`. The first contains installed packages; the second contains generated build output.

The `.env` file, if present, contains local configuration and may hold secrets. It is ignored by Git. You do not need to open or share it to edit the site's appearance.

## 6. A high-level walkthrough

Follow one visit to the homepage:

1. You start the local server.
2. The browser requests the homepage at `/`.
3. Next.js uses `layout.tsx` for the outer document.
4. `page.tsx` describes the homepage sections.
5. Components read curated information from `profile.ts`.
6. The browser receives the page, styles, fonts, and the JavaScript needed for interactive parts.
7. CSS lays out the page according to the browser's available width.
8. React makes the navigation and career-chat controls interactive.

The main relationships look like this:

~~~text
profile.ts ──────> page.tsx ─────────────> visible homepage
     │                 │
     ├──> CurrentFocus │
     │                 ├──> Header: interactive navigation
     │                 └──> CareerChat: interactive conversation
     │
     └──> server chat context ──> OpenRouter request

layout.tsx ──────> document, fonts, global CSS, metadata
globals.css ────> shared appearance and responsive layout
~~~

### Server Components and Client Components

Next.js App Router components are Server Components by default. Our page, root layout, and Current Focus component do not require browser state.

The header and career chat begin with:

~~~tsx
"use client";
~~~

That directive establishes a client boundary so those components can use state, event handlers, and browser APIs.

It does **not** mean Client Components are excluded from the initial HTML. Next.js can prerender their initial appearance too. The browser later attaches interactive behavior, a process called **hydration**.

Much of the portfolio can be generated ahead of time during a production build. A server-rendered component does not necessarily run again for every visitor. The chat POST request is separate: it runs when someone sends a question.

## 7. Review the content and TypeScript types

Open `src/content/profile.ts` first when you want to change professional information.

A shortened excerpt is:

~~~ts
export const profile = {
  name: "Ahmad Aghazadeh",
  role: "Senior Software Engineer",
  email: "ahmad.aghazadeh.a@gmail.com",
  intro: "I build scalable backend systems and full-stack applications. Turning complex requirements into software that stays clear, reliable, and ready to grow.",
  // More properties follow in the real file.
};
~~~

- `const` declares a variable whose binding cannot be reassigned.
- `profile` is the variable's name.
- `{ ... }` creates an object.
- `role: "..."` gives that object a property and value.
- `export` allows another file to import the value.

`const` does not automatically make every nested object or array immutable.

### Importing the data

~~~tsx
import { profile, workHighlights } from "@/content/profile";
~~~

The braces select named exports. The `@/` prefix is a shortcut to `src/`, configured by `tsconfig.json`:

~~~json
"paths": {
  "@/*": ["./src/*"]
}
~~~

This keeps imports readable when files are nested in different folders.

### Types document the expected shape

The work highlights have an explicit type:

~~~ts
export type WorkHighlight = {
  number: string;
  title: string;
  company: string;
  category: string;
  challenge: string;
  contribution: string;
  technologies: string[];
  caseStudyUrl?: string;
};
~~~

A `string` is text. `string[]` means an array of text values. The question mark in `caseStudyUrl?` makes that property optional.

The declaration:

~~~ts
export const workHighlights: WorkHighlight[] = [
  // Work highlight objects.
];
~~~

asks TypeScript to check every entry against that shape.

This helps detect a missing `title` or a number accidentally assigned to `company`. It does not prove that a URL exists or a career claim is true. Type checking and factual verification are different jobs.

### The Current Focus data uses satisfies

~~~ts
export type FocusArea = {
  title: string;
  description: string;
};
~~~

The real array ends with `satisfies FocusArea[]`. This checks that its entries have the expected fields while preserving TypeScript's inferred information about the expression.

The full `profile` object currently relies largely on inference rather than a single explicit `Profile` type. That works, but it is one of the maintainability points discussed in the final self-review.

### One data source can feed several features

Career facts appear both on the page and in the chat's server-side context. Editing the shared content keeps those uses aligned after the application rebuilds.

However, not every visible phrase comes from this module. The large name in the hero, some section headings, and metadata strings are still written directly in their respective files. Changing `profile.name` alone does not update all of them.

## 8. Review the layout and page

### The root layout provides the outer document

From `src/app/layout.tsx`, reformatted:

~~~tsx
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
~~~

A component can receive inputs called **props**. Here, `children` is the content that Next.js places inside the layout, including our homepage.

`React.ReactNode` describes content React can render. `Readonly` expresses that the props object should not be reassigned through its properties in TypeScript.

`lang="en"` identifies the document's language for browsers and assistive technology.

The special filename `page.tsx` defines the page for its route. Since ours is directly inside `app`, it defines the homepage.

### The page composes components

The real page imports `Header`, `CurrentFocus`, `CareerChat`, and the content module. A simplified outline is:

~~~tsx
<>
  <Header />
  <main id="main">
    {/* Hero, About, Work, Journey, Expertise */}
    <CareerChat />
    {/* Contact */}
  </main>
  {/* Footer */}
</>
~~~

The empty opening and closing tags form a **Fragment**. It groups elements without adding an extra HTML wrapper. Text inside `{/* ... */}` is a JSX comment.

The actual page also provides a skip link before the header.

### Links can navigate within the same page

~~~tsx
<a href="#work">Explore my work</a>
~~~

This points to the element with `id="work"`. The `#work` part is a **fragment identifier**. It does not load a separate Work page or require a backend request.

The page uses ordinary anchor links because the main navigation moves between sections of one page.

### map turns an array into interface elements

The About section contains:

~~~tsx
{profile.about.map(p => <p key={p}>{p}</p>)}
~~~

Read this as: for each paragraph string in `profile.about`, return a paragraph element displaying that string.

The arrow function `p => ...` receives one array item at a time. React's `key` identifies list entries across updates. Keys should be stable and unique among siblings.

For work cards, the page uses `work.number` as the key, so each work item should have a distinct number.

### Conditional rendering avoids empty content

For an optional location, the current page uses:

~~~tsx
{job.location && <p className="job-location">{job.location}</p>}
~~~

If a location string exists, React renders the paragraph. Otherwise it renders no paragraph.

This is how removing a location avoids leaving an empty row.

Portfolio links use the same pattern:

~~~tsx
{work.caseStudyUrl && (
  <a
    className="text-link case-link"
    href={work.caseStudyUrl}
    target="_blank"
    rel="noopener noreferrer"
  >
    Read case study <Arrow />
  </a>
)}
~~~

A card without a case-study URL has no fake link. `target="_blank"` opens another tab. `rel="noopener noreferrer"` protects the relationship with the new page and suppresses the referrer.

### Small helper components reduce repetition

The page defines an `Arrow` helper, reformatted here:

~~~tsx
function Arrow({ diagonal = true }: { diagonal?: boolean }) {
  return <span aria-hidden="true">{diagonal ? "↗" : "→"}</span>;
}
~~~

`boolean` means true or false. The default is `true`. A **ternary expression**, `condition ? first : second`, chooses which arrow to display.

`<Arrow diagonal={false} />` requests a horizontal arrow.

The `SectionLabel` helper accepts a number and `children`, making it possible to reuse the same numbered-label structure across sections.

**Review observation:** component reuse is present, but several whole sections remain on very long lines in `page.tsx`. The browser handles them, but they are harder for a beginner or reviewer to edit.

## 9. Review the Current Focus component

The hero's right-hand panel is in `src/components/current-focus.tsx`.

A real excerpt is:

~~~tsx
<aside className="focus-panel" aria-labelledby="focus-title">
  <h2 id="focus-title" className="focus-label">Current focus</h2>
  <p className="focus-intro">{profile.focusIntro}</p>
  <div className="focus-areas">
    {profile.focusAreas.map(area => (
      <div className="focus-card" key={area.title}>
        <h3>{area.title}</h3>
        <p>{area.description}</p>
      </div>
    ))}
  </div>
</aside>
~~~

The real component also includes the short note below the cards.

`aside` identifies supporting content. `aria-labelledby` connects the panel's accessible name to its heading.

This component does not need `useState` or `"use client"`. It simply describes content from the shared profile object. A component does not need JavaScript interactions to be useful.

Separating the panel makes the page easier to scan and gives it a clear place for future design changes.

## 10. Review the interactive navigation

Open `src/components/header.tsx`.

### State remembers whether the menu is open

~~~tsx
const [open, setOpen] = useState(false);
~~~

`useState` is a React **Hook**. It returns the current value and a function to update it.

- Initially, `open` is false.
- `setOpen(true)` requests an open menu.
- React renders the component again with the new value.

The menu button includes:

~~~tsx
<button
  ref={button}
  className="menu-button"
  aria-expanded={open}
  aria-controls="main-navigation"
  onClick={() => setOpen(!open)}
>
  {open ? "Close −" : "Menu +"}
</button>
~~~

The exclamation mark in `!open` reverses the boolean value. The button text and `aria-expanded` both reflect the same state.

`aria-controls` identifies the navigation element controlled by the button.

### State selects a CSS class

~~~tsx
<nav
  id="main-navigation"
  aria-label="Main navigation"
  className={open ? "navigation is-open" : "navigation"}
>
~~~

The CSS normally hides mobile navigation. Adding `is-open` makes it visible at the mobile/tablet breakpoint. On larger screens the navigation is displayed normally.

### A ref lets the code return keyboard focus

~~~tsx
const button = useRef<HTMLButtonElement>(null);
~~~

A **ref** holds a reference to an element without making that reference part of the visible state. After the element is mounted, `button.current` refers to the button.

The code can call `button.current?.focus()` to return the keyboard focus there. The `?.` checks that a value exists before calling the method.

### An effect handles Escape and cleans up afterward

~~~tsx
useEffect(() => {
  if (!open) return;

  const close = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setOpen(false);
      button.current?.focus();
    }
  };

  window.addEventListener("keydown", close);
  return () => window.removeEventListener("keydown", close);
}, [open]);
~~~

`useEffect` runs side-effect logic in the browser. Here it installs a keyboard listener while the menu is open.

The returned function removes that listener when the effect is cleaned up. Without cleanup, repeated opens could leave unnecessary listeners behind.

The dependency list `[open]` tells React that the effect depends on the open state. Navigation links also close the menu after they are selected.

## 11. Review the styling and responsive design

Most shared styling is in `src/app/globals.css`.

### CSS variables keep common values together

~~~css
:root {
  --fg: #f3f6fc;
  --accent: #a8e9e2;
  --muted: #c2cee0;
  --line: #c2d7f02b;
}
~~~

A CSS custom property begins with `--`. Use it with `var(--accent)`.

The colors use hexadecimal notation. Eight-digit values include transparency: the final two digits are an alpha value. For example, the line color is deliberately translucent.

Some other colors are still written directly in individual rules, so these variables are not yet a complete design-token system.

### The background is code, not an image

A shortened, reformatted body rule is:

~~~css
body {
  background: linear-gradient(
    115deg,
    #24304f 0%,
    #2b4862 53%,
    #255b63 100%
  );
  background-attachment: fixed;
  font-size: 18px;
  line-height: 1.75;
}
~~~

A gradient blends colors along an angle. Percentage stops control where colors appear. Fixed attachment keeps the background anchored to the viewport as the document scrolls; browser behavior and performance can vary, especially on mobile.

The faint grid is drawn by a `body::before` **pseudo-element**: a decorative element generated by CSS. Two thin gradients create horizontal and vertical lines. A mask fades them away, and `pointer-events: none` prevents the decoration from intercepting clicks.

### The shell limits line length

~~~css
.shell {
  width: min(1360px, calc(100% - 112px));
  margin-inline: auto;
}
~~~

`min()` chooses the smaller value. The container never exceeds 1360 pixels, and it leaves horizontal space on smaller screens.

`calc()` performs a calculation. `margin-inline: auto` centers the container.

This keeps paragraphs from stretching across an extremely wide screen.

### Grid creates the hero's columns

~~~css
.hero-layout {
  display: grid;
  grid-template-columns: 1.17fr 1fr;
  gap: 64px;
  align-items: start;
}
~~~

CSS Grid divides a container into tracks. `fr` means a share of the available space after gaps. The left column gets slightly more space than the right.

Other parts use **Flexbox**, such as the navigation and action buttons. Flexbox works well for arranging items in a row or column; Grid works well for defining columns and repeated card layouts.

### clamp makes large headings fluid

~~~css
h1 {
  font-size: clamp(72px, 6vw, 88px);
  line-height: 1.07;
  letter-spacing: -3.5px;
}
~~~

`clamp(minimum, preferred, maximum)` keeps the value within bounds. `6vw` means six percent of the viewport width. The default desktop heading therefore scales between 72 and 88 pixels.

This is not the entire story: narrower-screen rules override it. At 600 pixels and below, the actual rule uses:

~~~css
h1 {
  font-size: clamp(45px, 11vw, 66px);
  letter-spacing: -2px;
  line-height: 1.12;
}
~~~

The hero introduction uses larger text than ordinary paragraphs. Most mobile body copy is 16–18 pixels; small labels are kept at least 12 pixels.

### Text can use a gradient too

~~~css
h1 span {
  color: #afe3ef;
  background: linear-gradient(
    105deg,
    #bab5ff 0%,
    #9edaff 42%,
    #a0f1d4 100%
  );
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
~~~

The background is clipped to the letters, producing the blue-to-mint name treatment.

### Rounded panels combine several simple rules

The panel's translucent background, border, rounded corners, and subtle shadow work together:

~~~css
.focus-panel {
  padding: 34px;
  background: #d7e6ff12;
  border: 1px solid #c9e0f538;
  border-radius: 28px;
  box-shadow:
    inset 0 1px 0 #ffffff0d,
    0 20px 70px #10233b12;
}
~~~

`padding` is space inside the border. `margin` is space outside an element. `gap` is space between Grid or Flexbox items. Knowing the difference makes layout editing much easier.

### Media queries change the layout at narrower widths

The stylesheet groups changes at 1150, 950, 600, and 360 pixels. For example:

~~~css
@media (max-width: 950px) {
  .hero-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}
~~~

At this breakpoint, the hero becomes one column and the desktop navigation switches to a menu button.

At 600 pixels and below, work cards and expertise groups become one column. Other rules reduce padding, change text sizes, and allow buttons to wrap.

These are width rules, not phone-model detection. Resize the browser to see them take effect.

### CSS has an order

If two matching rules have the same specificity, the later one usually wins. More specific selectors and important declarations can change that result.

Before adding another rule, look for an existing rule for the same class and its media-query overrides. A desktop font rule will not necessarily control the mobile appearance.

## 12. Review accessibility

Accessibility means making the site usable with different devices, abilities, and interaction methods.

The implementation includes:

- A **skip link** that lets keyboard users move directly to the main content.
- A document language and semantic headings.
- Named sections connected to their headings.
- Native links for navigation and native buttons for actions.
- Visible keyboard focus.
- Escape-to-close mobile navigation and focus restoration.
- Text labels for interactive controls.
- Reduced-motion rules.

The skip link points to `#main`, matching the main element's ID.

The focus styling is:

~~~css
a:focus-visible,
button:focus-visible {
  outline: 3px solid #b6f3e7;
  outline-offset: 6px;
  border-radius: 5px;
}
~~~

Try pressing **Tab** instead of using the mouse. The outline shows where Enter will activate a control.

Decorative arrows use `aria-hidden="true"` so screen readers do not repeatedly announce them.

Motion preferences are respected through:

~~~css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
~~~

These features are useful foundations, not proof that every accessibility requirement has been met. Full keyboard, screen-reader, contrast, and zoom testing remains worthwhile.

## 13. Review fonts, icons, and sharing previews

### Fonts are bundled locally

The layout imports:

~~~tsx
import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
~~~

Manrope supplies the main typography. Space Grotesk is still used in a few decorative elements.

These imports bring font CSS and font files into the application's build. Visitors do not need to request the fonts from Google Fonts. The first dependency installation still downloads the packages through npm.

### The favicon is SVG

`src/app/icon.svg` is the browser-tab icon. SVG describes shapes with markup rather than storing a fixed grid of pixels, so it scales cleanly for small icons.

Next.js recognizes the special filename and adds the appropriate icon reference. The browser can cache favicons, so a changed icon may require a hard refresh or a new tab before appearing.

### Metadata describes the page to other systems

From the layout, an actual excerpt is:

~~~tsx
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3001"
  ),
  title: "Ahmad Aghazadeh — Senior Software Engineer",
  // Description, Open Graph, and Twitter settings follow.
};
~~~

`import type { Metadata } from "next"` gives this object a Next.js TypeScript shape.

The page title appears in the browser tab. The description and sharing fields help search and social systems understand the page, although those systems decide what they actually display.

`metadataBase` supplies a base URL for metadata links. It is not a command that starts the server.

### The social image is generated by code

`src/app/opengraph-image.tsx` exports its image dimensions and uses `ImageResponse` from `next/og`:

~~~tsx
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
~~~

Its function returns an `ImageResponse` built from JSX with inline styles. The result is a PNG sharing image, not an interactive page. It repeats the navy/teal colors, the role, the name, and the engineering themes.

This image-generation API supports a subset of browser styling. Do not assume you can paste arbitrary global CSS into it.

## 14. Review the local server launcher

`scripts/serve.mjs` runs in Node.js, not in a visitor's browser. The `.mjs` extension identifies it as an ECMAScript module.

It exists because Windows can reserve a port even when no visible application is listening on it.

### Read and validate the starting port

~~~js
const firstPort = Number(process.env.PORT || 3000);

if (
  !Number.isInteger(firstPort) ||
  firstPort < 1 ||
  firstPort > 65535
) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}
~~~

`process.env` contains environment variables supplied to the process. Environment values are strings, so `Number()` converts the port before validation.

### Test whether a port can be used

The `available()` function temporarily opens a small TCP server on the loopback address. If opening succeeds, it closes the probe and reports success.

For `EADDRINUSE` or `EACCES`, it reports that the port is unavailable. Other errors are propagated rather than silently ignored.

The script checks at most 100 ports, stopping before values outside the valid port range.

The probe is not a reservation. Another process could take the port between the check and the actual launch; this is a small race that the current implementation does not retry.

### Start Next.js as a child process

A **child process** is another program started by the current program. The launcher uses Node's `spawn` to start the installed Next.js CLI with the selected mode, hostname, and port.

It binds to `127.0.0.1`, so it is intended for access from this computer. It also provides `NEXT_PUBLIC_SITE_URL` to the child environment.

On development runs, that value can describe the selected preview address. On production runs, setting it at startup does not rewrite metadata already generated during the build.

To request another starting port in PowerShell:

~~~powershell
$env:PORT = '4000'
npm.cmd run dev
~~~

To remove that override from the current terminal later:

~~~powershell
Remove-Item Env:PORT
~~~

This changes the current shell's environment, not a repository file.

## 15. Understand the newer career-chat feature

This section covers code present in the current working folder beyond the original portfolio and visual-refresh implementation.

You can skip it on a first read if your immediate goal is changing text, colors, or layout.

### There are three distinct pieces

| File | Responsibility |
| --- | --- |
| `src/components/career-chat.tsx` | Browser interface, question input, messages, pending and error states |
| `src/app/api/career-chat/route.ts` | Next.js POST endpoint and career-context assembly |
| `src/lib/career-chat.ts` | Validation, provider request, limits, and response handling |

`career-chat.module.css` styles only this widget. A **CSS Module** scopes class names to avoid collisions with unrelated styles. The component imports it as `styles` and uses expressions such as `className={styles.panel}`.

### The browser submits a question

A real excerpt from the component is:

~~~tsx
const response = await fetch("/api/career-chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  signal: abort.signal,
  body: JSON.stringify({ messages: history }),
});
~~~

- `fetch` makes an HTTP request.
- `POST` sends data to a server endpoint.
- `Content-Type` describes the data format.
- JSON is a text format for objects and arrays.
- `JSON.stringify` turns the message object into JSON text.
- `await` pauses this asynchronous function until the operation completes.
- The abort signal permits cancellation.

The request goes to the same website origin because the URL starts with `/`.

The API accepts a body shaped like this:

~~~json
{
  "messages": [
    {
      "role": "user",
      "content": "What is Ahmad's backend experience?"
    }
  ]
}
~~~

A successful application response has an `answer` string. An unsuccessful response has an `error` string and an appropriate HTTP status.

### State represents the conversation

The widget uses state for messages, the draft question, whether a request is pending, and any error message.

The textarea is a **controlled input**: its displayed value comes from React state, and `onChange` updates that state.

The widget prevents duplicate sends while busy, disables relevant controls while waiting, and displays a pending message. On failure, it restores the question so the visitor can retry.

It supports Enter to send and Shift+Enter for a new line. The composition check avoids treating Enter as a send action while someone is composing text with an input method.

### The endpoint keeps the key on the server

The route exports:

~~~ts
export const POST = createCareerChatHandler({
  apiKey: () => process.env.OPENROUTER_API_KEY,
  context,
});
~~~

The server assembles `context` from the shared profile and work data. The prompt asks the model to stay within those facts, acknowledge missing information, and identify itself as an AI guide.

Those instructions aim to improve grounding; they do not guarantee factual answers.

The API key is a server environment variable. It must not be moved into a browser component or renamed with a `NEXT_PUBLIC_` prefix. Variables intended for browser exposure are not a place for secrets.

If no key is configured, the endpoint returns a useful unavailable message. This tutorial does not require a real API key or a live model request.

### The handler validates requests and provider responses

The current code:

- Requires JSON and checks an Origin header when supplied.
- Limits the request body to 24,000 bytes.
- Requires alternating user/assistant messages beginning and ending with a user question.
- Accepts at most 12 messages, with user questions limited to 2,000 characters.
- Uses a process-local limit of 10 provider calls per minute, shared across visitors.
- Cancels provider work after the configured timeout, normally 60 seconds.
- Checks that the returned structured content contains a non-empty answer.
- Converts provider failures into readable errors without returning raw provider details.

The model identifier in the source is `openrouter/free`, with zero-price provider constraints and no paid fallback in this implementation. That describes what the code requests; it does not promise that a compatible free provider will always be available.

The throttle is not a distributed production rate limiter. It resets with the process and is not shared across multiple server instances.

### The frontend avoids rendering arbitrary model HTML

The `AnswerText` helper supports simple double-asterisk emphasis. Other output remains React text, which is escaped.

The code does not use `dangerouslySetInnerHTML` to display model output. This is a useful boundary because text returned by a model should not become executable markup.

### Understand the privacy boundary

Chat messages remain in component memory in this application and clear on reload or New chat. When a question is sent, the submitted history and career context are transmitted to OpenRouter and its selected provider.

"No local database storage" is not the same as "nothing leaves the computer" or "the provider stores nothing." Provider data handling is separate.

See `docs/digital-twin.md` for the feature's own documentation.

## 16. Try some small changes

Use development mode while learning. Make one change, save, and check the result before moving on.

### Exercise A: change the introduction

Edit `profile.intro` in `src/content/profile.ts`. Keep the quotation marks, comma, and object braces intact.

The page already renders `{profile.intro}`, so you do not need to change the component.

Remember that some other text is hardcoded. For example, changing the profile's name does not currently update the name written directly in the hero.

### Exercise B: edit a Current Focus card

Find an object in `profile.focusAreas`:

~~~ts
{
  title: "Agentic engineering",
  description: "Exploring how AI agents can support the way we design, build, and maintain software."
}
~~~

Edit its description while preserving the title and description property names. Use factual information rather than implying experience or results that have not been supplied.

### Exercise C: add a real portfolio link

A work highlight can include:

~~~ts
caseStudyUrl: "https://example.com/your-case-study"
~~~

This URL is an illustrative placeholder, not an existing case study. Replace it with your real URL before using it.

Add the property inside the relevant work object, separating properties with commas. The existing conditional JSX will then display the case-study link.

TypeScript only checks that this is a string. Open the actual destination yourself to verify it.

### Exercise D: adjust reading size

Find the relevant paragraph rule in `globals.css`, such as:

~~~css
.about-copy p {
  font-size: 18px;
  line-height: 1.85;
}
~~~

This is a shortened excerpt; the actual rule includes other properties.

Try a different font size and check both desktop and mobile. A more specific or later media-query rule may override the desktop value.

Avoid increasing every font blindly. Headings, paragraphs, labels, and buttons serve different roles.

### Exercise E: add a navigation item for an existing section

The header's `items` array contains pairs of link labels and target IDs. For example, adding:

~~~ts
["Digital Twin", "digital-twin"]
~~~

inside that array would point to the existing chat section.

This is an optional learning exercise, not a change already made by the tutorial. After adding an item, check both the desktop header width and the mobile menu.

### A useful editing rule

Change data in the content module, structure in components, and appearance in CSS. Keeping those responsibilities separate makes it easier to diagnose mistakes.

Do not copy entire shortened tutorial excerpts over a complete application file; you could accidentally remove the parts omitted for teaching.

## 17. Check your changes and solve common problems

### Automated checks

~~~powershell
npm.cmd run typecheck
npm.cmd run build
node --test tests/career-chat.test.mjs
~~~

The first checks types. The second checks that Next.js can create a production build. The third runs the existing chat-handler tests.

The chat tests use mocked provider responses. They check the handler's request validation, response handling, throttling, and related behavior without making real model requests.

All eight existing chat tests passed while this tutorial was written. That does not demonstrate live provider availability or full browser behavior.

The prior visual refresh was checked at desktop, tablet, and narrow mobile widths. This documentation task did not repeat that full browser review.

### A manual checklist

After a meaningful visual or interaction change:

- Review widths of 320px, 390px, 820px, and a desktop size.
- Look for clipped names, sideways scrolling, cramped cards, and unreadable labels.
- Check the menu using Tab, Enter, and Escape.
- Follow the section links and confirm they reach the correct headings.
- Check email and external link destinations.
- Try browser zoom and the operating system's reduced-motion setting.
- If changing chat, check pending, error, retry, and New chat states.

A build passing is useful, but it cannot tell you that a paragraph looks good on a phone.

### Common problems

| Symptom | What to check |
| --- | --- |
| PowerShell refuses `npm` | Use `npm.cmd` as shown in this guide |
| `node` is not recognized | Confirm Node.js is installed and its executable is on PATH; reopen the terminal after installation |
| Browser cannot connect | Check that the server is running and use its printed Local address |
| Port 3000 cannot start | The launcher skips occupied and reserved ports; do not assume a missing listener means the port is usable |
| Changes do not appear | Confirm which server and port you opened; use dev mode or rebuild/restart production |
| TypeScript reports an error | Read the named file and line; check missing properties, quotation marks, brackets, and commas |
| Mobile text differs from desktop | Inspect the later media-query rules for that class |
| Chat says it is not configured | Server-side configuration is missing; the portfolio itself can still render |
| Chat is rate limited or times out | Read the displayed error; mocked tests cannot prove the external provider is available |
| Social preview still shows localhost | Set the public URL before building, not just when starting the server |
| Favicon looks unchanged | Browser icon caching may require a hard refresh or new tab |

Use the browser's developer tools to inspect the page and read console errors. Do not paste API keys or environment-file contents into debugging screenshots or public issue reports.

## 18. Understand publishing

The site is currently designed to run locally. A running local preview is not a public deployment.

There are two related but different hosting needs:

1. The portfolio content and CSS can be adapted to a **static export**, producing files that a static host serves.
2. The career-chat POST endpoint needs a compatible **server runtime**.

GitHub Pages cannot execute this Next.js API endpoint. A future GitHub Pages version would need a separate backend for chat or would need to omit the chat integration. Simply adding `output: "export"` to the current application is not a complete deployment change.

Before public deployment, replace the localhost metadata base. For example, in PowerShell:

~~~powershell
$env:NEXT_PUBLIC_SITE_URL = 'https://your-real-domain.example'
npm.cmd run build
~~~

The domain above is a placeholder. Use the real public HTTPS address.

This variable is intentionally public. The API key is different and belongs only in the hosting provider's server environment.

The local `npm start` launcher intentionally binds to loopback and selects ports for local use. Production platforms may require their own hostname, port, and start-command configuration rather than this launcher.

No hosting account setup, static-export configuration, or public deployment is performed by this tutorial.

## 19. Further reading

These official guides are useful next steps. The project's installed Next.js documentation is also available under `node_modules/next/dist/docs/`, which helps when version-specific conventions differ from an older tutorial.

- [MDN: Learn web development](https://developer.mozilla.org/en-US/docs/Learn_web_development) for HTML, CSS, and JavaScript foundations.
- [React: Describing the UI](https://react.dev/learn/describing-the-ui) for components, JSX, and rendering.
- [React: State, a component's memory](https://react.dev/learn/state-a-components-memory) for interactive state.
- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) for the rendering boundary used by this project.
- [Next.js: Metadata and Open Graph images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) for page descriptions and sharing previews.
- [TypeScript: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html) for objects, arrays, and optional properties.
- [Tailwind: Using PostCSS](https://tailwindcss.com/docs/installation/using-postcss) for the CSS integration.
- [Node.js: Test runner](https://nodejs.org/api/test.html) for the existing mocked handler tests.

## 20. Self-review: five improvements

The following suggestions come from reviewing the current source. They are proposed next steps, not changes implemented by writing this document.

1. **Break up and format the large homepage.** Several sections in `page.tsx` occupy very long lines. Extract meaningful components such as `WorkCard`, `CareerTimeline`, and `ContactSection`, and format JSX across readable lines. Keep page composition in the page and data in the content module. Verify that markup, navigation IDs, and optional links still behave identically.

2. **Make the profile contract and shared identity more consistent.** Define explicit types for the whole profile and its career entries, including optional locations. Reuse the profile name and role in the hero and metadata instead of repeating strings, and locate the GitHub link by a stable identifier rather than `profile.links[0]`. Validate future public URLs at build time. This reduces accidental mismatches as the content grows.

3. **Add browser regression tests around the existing handler tests.** The current chat tests cover server behavior with mocks; they do not cover the rendered menu, responsive wrapping, focus restoration, chat pending/error/retry interactions, or optional portfolio links. Add browser tests and an accessibility scan at the agreed viewport sizes, mocking the chat endpoint to avoid external calls. Put those checks, type checking, and builds into continuous integration.

4. **Prepare an explicit production configuration before publishing.** The current metadata falls back to a localhost address, the launcher is deliberately local, and the chat throttle is process-local. Require the intended public site URL for production builds, document the chosen hosting runtime, and use shared rate limiting for a public multi-instance chat deployment. If choosing static hosting, explicitly separate or remove the server endpoint rather than assuming the current application can be exported unchanged.

5. **Consolidate styles and measure the font and visual costs.** The stylesheet mixes reusable variables with many hardcoded colors, while both font families are imported globally and the full-page background is fixed. Create a small set of typography, spacing, surface, and color tokens; measure font files and mobile scrolling; and consider narrowing font imports or removing the secondary family if the benefit is small. Preserve contrast, reduced-motion behavior, and the approved design while making those changes.

