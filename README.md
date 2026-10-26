# Shivansh Singh — portfolio

One-page portfolio built on giant kinetic typography and scroll-driven motion.
Vite + TypeScript (no framework), GSAP 3.15 (ScrollTrigger, SplitText, Flip, ScrambleText, CustomEase) and Lenis.

## Run and build

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ at http://localhost:4173
```

`dist/` is a static site with relative paths, so it works from a domain root or a sub-folder.
Case studies live at `#work/<id>` (a hash, not a route), so no server rewrites are needed.

## Deploy

**GitHub Pages:** push to `main`, then set repository Settings → Pages → Source to "GitHub Actions".
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and publishes on every push.

**Anywhere else** (Netlify, Vercel, Cloudflare Pages, S3): build command `npm run build`, output folder `dist`.
Set the environment variable `SITE_URL` to the final address (e.g. `https://shivansh.dev/`) so the canonical link
and the link-preview image are absolute. LinkedIn, X and WhatsApp previews need that.

## Editing content

**Everything you'd edit is in [`src/content.ts`](src/content.ts).** Components never hold copy or asset paths.
The page title, description, link-preview tags, structured data and the no-JavaScript fallback are written
from the same file at build time ([`vite.config.ts`](vite.config.ts)).

### Pictures and drawings

Cards and minor-works previews are **drawings** in the site's palette (`drawing('agents', alt)`, see
[`src/lib/motifs/`](src/lib/motifs/)). Each project's real picture is its `caseStudy.cover`, shown whole when the
case study opens:

```ts
cover: image('media/Picasso.webp', 'What the picture shows', 1280, 853),
```

Put files in `public/media/`, reference them **without** a leading slash, and pass the pixel size so the space is
reserved before the file loads. Prefer WebP (`assets/originals/` keeps the full-size sources, which are not
shipped). `alt` is read by screen readers, so describe what the picture shows. `kind: 'video'` with `src` and
`poster` works the same way for loops (keep them short and muted).

Wrap any manifesto word in `*asterisks*` to make it a gold italic emphasis.

### Worth a final read

These were filled from context, not from Shivansh directly:

- Years for Electricity Bill Spike Diagnosis (2026), Brain Gene-Expression Map (2025) and scRNA-seq (2025).
- scRNA-seq stack (`R`, `MAST`).
- Angry Birds Clone and CV-Based Fire Detector blurbs (they only say what the titles say).
- Picasso's stack reads Python, FastAPI, React, LLMs (from the CV); its architecture picture lists React,
  TypeScript, Recharts, Tailwind, LangChain and Gemini.
- The CV in `public/media/` is public once deployed, including the phone number on it.

## How it is put together

```
src/
  content.ts        all copy and asset references (typed by types.ts)
  main.ts           renders everything, runs the preloader, then builds all motion in one gsap.matchMedia()
  sections/         one module per act: render(content) → HTML, animate(conditions) → its ScrollTriggers
  ui/               persistent layer: monogram, menu, clock, section counter + progress line, cursor
  lib/              gsap setup, Lenis, shared scroll velocity, marquee loop, magnetic, a11y helpers, media rendering
  lib/motifs/       the drawings on cards, previews and beside the numbers (SVG)
  styles/           tokens (colours, type, spacing), base, UI
```

- **Motion is gated.** Nothing scroll-driven exists until the preloader finishes. `main.ts` then creates one
  `gsap.matchMedia()` with desktop / mobile / reduced-motion / fine-pointer conditions and calls every section's
  `animate()` in page order, so ScrollTriggers are created top to bottom and are all reverted and rebuilt together
  when a breakpoint or the reduced-motion setting changes.
- **Lenis** drives smooth scroll from `gsap.ticker` (`lenis.on('scroll', ScrollTrigger.update)`, `lagSmoothing(0)`).
  It is not created under reduced motion.
- **Mobile (< 768px)**: the experience act stacks vertically instead of pinning sideways, pins are shorter, the custom
  cursor is off, marquees run slower, minor works show inline thumbnails instead of the trailing preview.
- **Reduced motion**: no smooth scroll, pins, wipes, skew, scrub or marquee travel; sections fade in once; counters
  show final values; overlays fade.

## Accessibility

- One `h1` (the name), an `h2` per section, `h3` per card, panel and row. Skip link to the content.
- Text split for animation keeps a readable copy: headings use SplitText's `aria-label`; paragraphs use an
  `.sr-only` copy plus an `aria-hidden` split copy (see `srPair` in `lib/html.ts`), because `aria-label` is not
  allowed on `<p>`.
- The menu, case studies and the slingshot are modal dialogs: focus moves in and is trapped, Esc closes, focus
  returns to what opened them, and the page behind is `inert`. Menu links jump straight to a section, so keyboard
  users never sit through the scroll sequences.
- The email button copies the address and announces it through an `aria-live` region; there is a `mailto:` link
  beside it. The slingshot plays with the keyboard (arrows aim, Space launches).

## Checks run before release

Lighthouse 12 on the production build (`npm run build && npm run preview`): desktop Performance 100,
Accessibility 100, Best Practices 100, SEO 100; mobile 95–98 / 100 / 100 / 100 across runs. CLS 0 (the three
first-screen fonts are preloaded by a small plugin in `vite.config.ts`).
