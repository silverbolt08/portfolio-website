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

`dist/` is a static site: upload it to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, S3).
Because case studies live at `#work/<id>` (a hash, not a route), no server rewrites are needed.

## Replace the placeholders

**Everything you'd edit is in [`src/content.ts`](src/content.ts).** Components never hold copy or asset paths.

### Links

```ts
contact: {
  email: 'shivanshsingh2307@gmail.com',
  github:   { label: 'GitHub',   href: 'https://github.com/…',   external: true },
  linkedin: { label: 'LinkedIn', href: 'https://linkedin.com/in/…', external: true },
  resume:   { label: 'Resume',   href: '/media/shivansh-singh-resume.pdf', external: true },
},
```

Put the resume PDF in `public/media/`. Case-study links (`caseStudy.links`) work the same way.

### Pictures and recordings

Every visual is a `Media` entry. Today they are `kind: 'placeholder'` and the site draws a still for each (agent
graph, dashboard roles, telemetry, brain map, RNA hairpin, cell clusters…), captioned with the asset that belongs there.
To swap one in:

1. Put the file in `public/media/` (WebP or AVIF for stills, MP4/WebM for loops; keep loops short and muted).
2. Change the entry:

```ts
// still
visual: { kind: 'image', src: '/media/gravityos.webp', alt: 'GravityOS turning one brief into three platform drafts', label: '', aspect: '16/9' },
// loop (the brain map recording, for example)
visual: { kind: 'video', src: '/media/brain-map.mp4', poster: '/media/brain-map.webp', alt: 'Brain map with the most affected regions glowing', label: '', aspect: '16/9' },
```

`alt` is read by screen readers, so describe what the picture shows. Card visuals are 16:9;
the minor-works previews (`minorWorks.items[].preview`) are 4:3. Galleries inside case studies
(`caseStudy.gallery`) take any of the four aspects.

### Words to confirm before launch

Search `content.ts` for `TODO`:

- **Project years**: sample values; set the real ones.
- **Case-study prose**: a draft assembled from the brief's facts; replace with the full write-ups.
- **Brain map and scRNA-seq stacks** read "Placeholder: add stack".
- **Angry Birds and Fire Detector blurbs** are placeholders.
- **Manifesto**: rewritten so it contains the three emphasis words (agents, graphs, genes); the original draft is
  kept in a comment right above it. Wrap any word in `*asterisks*` to make it a gold italic emphasis.
- **Stat labels** are my wording.

## How it is put together

```
src/
  content.ts        all copy and asset references (typed by types.ts)
  main.ts           renders everything, runs the preloader, then builds all motion in one gsap.matchMedia()
  sections/         one module per act: render(content) → HTML, animate(conditions) → its ScrollTriggers
  ui/               persistent layer: monogram, menu, clock, section counter + progress line, cursor
  lib/              gsap setup, Lenis, shared scroll velocity, marquee loop, magnetic, a11y helpers, placeholders
  lib/motifs/       the drawn placeholder stills (SVG)
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
Accessibility 100, Best Practices 100, SEO 100; mobile 97–98 / 100 / 100 / 100 across runs. CLS 0 (the three
first-screen fonts are preloaded by a small plugin in `vite.config.ts`).
