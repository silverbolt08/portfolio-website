# PLAN: Shivansh Singh Portfolio ("Kinetic Typography")

## Context

`C:\Portfolio_Website` is empty apart from `.claude/skills` (8 skills, all read). The goal is a one-page portfolio for Shivansh Singh with giant kinetic typography and scroll animation built on GSAP, in vanilla Vite + TypeScript. Every real asset is a placeholder for now, and all copy lives in `src/content.ts`.

**On approval:** (1) write this document to `C:\Portfolio_Website\PLAN.md` without changes, (2) run `git init` (the folder is not a repo yet), (3) build Phase 1, then post its report and **stop**. Every later phase also ends with a report and a stop, waiting for "continue".

Environment checked: Node 22.17, npm 10.9, git 2.52, Chrome and Edge installed (so the taste-skill inspector can run). Latest versions on npm: `gsap 3.15.0`, `lenis 1.3.27`, `vite 8.3.5`.

---

## 1. File tree (final)

```
PLAN.md
README.md                     (Phase 7)
index.html                    static shell: <noscript>, skip link, preloader markup, #ui, <main>, overlay roots
package.json
tsconfig.json
vite.config.ts
public/
  favicon.svg                 "SS" monogram
  media/                      empty; where real screenshots, recordings and photo go later
src/
  main.ts                     bootstrap: fonts → render → preloader → gate → animate()
  content.ts                  ALL copy + asset references (typed)
  types.ts                    content types (the data shape in §4)
  styles/
    tokens.css                colour, type, space, z-index tokens
    base.css                  reset, type scale, focus ring, .sr-only, grain overlay
    ui.css                    persistent layer, cursor, menu
  lib/
    gsap.ts                   registerPlugin(ScrollTrigger, SplitText, Flip, ScrambleTextPlugin, CustomEase); CustomEase "wipe"; defaults
    scroll.ts                 Lenis instance, ticker sync, stop()/start(), scrollTo()
    media.ts                  matchMedia conditions object (isDesktop / isMobile / reduceMotion / canHover)
    velocity.ts               one smoothed, clamped scroll velocity, shared by all skew consumers
    split.ts                  SplitText wrapper with the a11y strategy (§6)
    loop.ts                   ticker-driven infinite marquee row (skills + footer)
    magnetic.ts               quickTo magnetic behaviour
    a11y.ts                   focus trap, inert toggling, aria-live announcer
    html.ts                   escaped template-string helper
    fonts.ts                  document.fonts.load() for the 3 faces → Promise
    placeholder.ts            Placeholder component (§4) + motif registry
    motifs/                   agents.ts, layout.ts, telemetry.ts, brain.ts, aptamer.ts, cells.ts, network.ts, flame.ts
  ui/
    monogram.ts  menu.ts  clock.ts  counter.ts (counter + progress line)  cursor.ts
  sections/                   each exports render(content): string and animate(conditions): void
    preloader.ts  hero.ts  manifesto.ts  stats.ts  skills.ts  work.ts  case-study.ts
    experience.ts  minor-works.ts  slingshot.ts  contact.ts
    *.css                     one stylesheet next to each module, imported by it
```

**Architecture in one paragraph.** `main.ts` renders every section's HTML from `content.ts` into `<main>`, then runs the preloader. When the preloader resolves, `main.ts` creates **one** `gsap.matchMedia()` and calls each section's `animate(conditions)` **in page order** inside it. Every ScrollTrigger is therefore created top to bottom and reverted together when a breakpoint or the reduced-motion setting changes. After that it calls `ScrollTrigger.refresh()` once (fonts are already loaded, because the preloader waits for them).

## 2. Tech and dependencies

| Package | Use |
|---|---|
| `vite` (latest, scaffolded with `create-vite` vanilla-ts) | dev server, build |
| `typescript` (version pinned by the template) | `tsc --noEmit` typecheck |
| `gsap@^3.15` | core, ScrollTrigger, SplitText, Flip, ScrambleTextPlugin, CustomEase (all in the public package) |
| `lenis@^1.3` | smooth scroll, `autoRaf: false`, driven by `gsap.ticker` |
| `@fontsource/instrument-serif` | display, regular and italic (400 latin only) |
| `@fontsource-variable/inter-tight` | body |
| `@fontsource-variable/geist-mono` | labels, numbers, HUD |

No other runtime dependencies. Scripts: `dev`, `build` (`tsc --noEmit && vite build`), `preview`, `typecheck`.

Lenis sync, as the brief specifies:
```ts
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```
Lenis is not created at all under reduced motion.

## 3. Design tokens

```css
--ink: #0A0A0A;  --bone: #EDE8DC;  --gold: #D9B45A;
--ink-2: #151513;   /* card fill, one step up from ink */
--grey: #8E8A80;    /* secondary text on ink, 5.9:1 */
--grey-dim: #3A3934;/* outlines, dimmed states */
--gold-deep: #7A5C14;/* gold text on bone; --gold on bone is ~1.6:1, which fails WCAG */
--ease-wipe: cubic-bezier(.76,0,.24,1);
--font-display: "Instrument Serif"; --font-body: "Inter Tight Variable"; --font-mono: "Geist Mono Variable";
--fs-hero: clamp(6rem, 20vw, 26rem);  --fs-display: clamp(3.5rem, 11vw, 14rem);
--fs-statement: clamp(1.75rem, 3.4vw, 3.25rem); --fs-body: clamp(1rem, 1.1vw, 1.1875rem); --fs-mono: 0.8125rem;
--gutter: clamp(16px, 2.2vw, 32px);
```
Display type: `line-height: .82–.9`, `letter-spacing: -0.04em`, `font-kerning: none` on split elements (as the SplitText docs advise). Grain: one fixed `::after` with an inline SVG `feTurbulence` data-URI at 6–8% opacity, `pointer-events: none`, jittered by a `steps(6)` CSS translate, turned off under reduced motion.

## 4. `src/content.ts` data shape

```ts
type SectionId = 'hero'|'manifesto'|'stats'|'skills'|'work'|'experience'|'minor-works'|'contact';
interface Link   { label: string; href: string; external?: boolean }
interface Media  {                     // the single swap point for every asset
  kind: 'placeholder' | 'image' | 'video';
  src?: string; poster?: string;       // set src + kind to swap in a real asset
  alt: string;
  label: string;                       // what the real asset should be ("GravityOS run, 1920×1080 loop")
  aspect: '16/9' | '4/3' | '1/1' | '3/4';
  motif?: 'agents'|'layout'|'telemetry'|'brain'|'aptamer'|'cells'|'network'|'flame'|'slingshot';
}
interface Project {
  id: string; index: string; title: string; year: string; tags: string[];
  outcome: string; facts: string[];    // 3–5
  visual: Media;
  caseStudy: { overview: string; approach: string[]; stack: string[]; outcome: string[]; links: Link[]; gallery: Media[] };
}
interface Stat { value: number; decimals: number; prefix?: string; suffix: string; label: string }
interface ExperienceEntry {
  id: string; year: string; period: string; org: string; place?: string; role: string;
  supervisor?: string; summary: string; metrics: { figure: string; text: string }[];
}
interface Achievement { title: string; detail: string; year?: string }
interface MinorWork { id: string; title: string; year?: string; blurb: string; tags: string[]; preview: Media; easterEgg?: 'slingshot' }

export interface SiteContent {
  meta: { title: string; description: string };
  person: { first: 'SHIVANSH'; last: 'SINGH'; monogram: 'SS'; role: string; city: 'New Delhi'; timeZone: 'Asia/Kolkata'; education: string };
  contact: { email: string; github: Link; linkedin: Link; resume: Link };
  nav: { id: SectionId; label: string }[];          // drives the menu and the section counter
  manifesto: { text: string };                      // emphasis marked inline as *word*
  stats: Stat[];                                    // 3.95M, 11, 0.95, 50K+
  skills: { group: string; items: string[] }[];
  marqueeRows: [string[], string[]];                // row 1 outlined, row 2 filled
  projects: Project[];                              // 6, in brief order
  experience: ExperienceEntry[];                    // IIIT Delhi 2023, Ahuja Lab 2025, Caudate AI 2026
  achievements: Achievement[];
  minorWorks: MinorWork[];                          // FDI, Angry Birds (slingshot), Fire Detector
  contactSection: { headline: string[]; footerMarquee: string[] };
}
```
All section-5 content goes in word for word. Case-study bodies are clearly marked placeholder prose built from the brief's facts, and links are `#`.

**Placeholder component:** `placeholder(media)` returns `<img>` or `<video muted loop playsinline poster>` when `src` is set. Otherwise it returns a drawn still in the palette plus a small mono caption giving `media.label`. Proposed improvement: instead of grey boxes, each motif is a subject-specific SVG/canvas-2D drawing (see §8, item 2).

---

## 5. Animation inventory

Conventions: **ST** = ScrollTrigger, ids are given in `code`. Every pin has `anticipatePin: 1` and `invalidateOnRefresh: true`. Each ScrollTrigger sits on the timeline or the top-level tween, never on a child tween. Entrances use `expo.out`, wipes use the `wipe` CustomEase, and scrubbed horizontal or linear motion uses `ease: "none"`. Sizes and lengths shown as D / M are desktop / mobile.

### Persistent UI (Phase 1)
| # | Animation | Trigger | Start → End | Scrub | GSAP features |
|---|---|---|---|---|---|
| U1 | Smooth scroll | always (not under reduced motion) | n/a | n/a | Lenis + `gsap.ticker`, `lagSmoothing(0)` |
| U2 | Gold progress line `scaleX 0→1` | `document.documentElement` (`progress`) | `0` → `"max"` | `true` (locked to scrollbar) | ST, `transformOrigin: left` |
| U3 | Section counter `0N / 08`, digit roll `yPercent 100→0` in a mask, 0.5s | one ST per section (`counter-<id>`), `"top center"` → `"bottom center"` | onToggle | no | ST callbacks, tween |
| U4 | Clock "New Delhi, HH:MM:SS IST" | 1s interval (not animation) | n/a | n/a | `Intl.DateTimeFormat` with `Asia/Kolkata` |
| U5 | Menu open: panel `clip-path inset(0 0 100% 0)→inset(0)` 0.9s wipe, links rise from line masks with 0.06 stagger; close = `reverse()` at `timeScale(1.4)` | MENU click / Enter / Esc | n/a | no | timeline, SplitText (lines, mask), CustomEase |
| U6 | Cursor dot follows pointer; over `[data-cursor]` it grows (scale 1→5.5) and shows its label (`VIEW` / `COPY` / `DRAG`, `autoAlpha`) | pointermove / pointerenter | n/a | no | `gsap.quickTo` x/y (0.35s, power3) |
| U7 | Magnetic buttons: element and its label (half strength) pulled toward the pointer; release `expo.out` 0.8s, no elastic | pointermove within the bounds | n/a | no | `gsap.quickTo` |
| U8 | Grain jitter | CSS keyframes | n/a | n/a | CSS only |
| U9 | UI theme swap ink↔bone (`html[data-ui="bone"]`), no tween | E1 progress ≥ 1 / N1 progress ≥ 1 | n/a | n/a | ST `onUpdate` |

### Act 0: Preloader (Phase 2)
| # | Animation | Trigger | Detail | GSAP |
|---|---|---|---|---|
| P1 | Counter `000→100` (Geist Mono, `--fs-hero`, tabular) | page load | proxy tween 1.6s `power2.inOut`; it holds at 90 until `fonts.ready` and `window.load` resolve (5s cap). Repeat visits in the same session get a 0.5s version | tween `onUpdate`, `padStart(3)` |
| P2 | Number slides out `yPercent 0→-110` inside its mask | after P1 | 0.8s wipe | timeline |
| P3 | Curtain lifts `clip-path inset(0)→inset(0 0 100% 0)` | `"-=0.3"` | 1.2s wipe | timeline |
| P4 | Hero letters rise from masked lines `yPercent 110→0`, 0.04 stagger; subtitle words follow with 0.03 stagger | `"-=0.7"` | 1.3s `expo.out` | SplitText (chars + lines, `mask: "lines"`) |
| P5 | **Gate**: the timeline's `onComplete` resolves a promise; only then does `main.ts` build matchMedia and every ScrollTrigger, and call `refresh()` | n/a | Lenis is stopped until then | n/a |

### Act 1: Hero (Phase 2)
One pinned, scrubbed timeline `hero`: trigger `#hero`, `"top top"` → `"+=130%"` D / `"+=70%"` M, `pin: true`, `scrub: 0.8`.
| # | Segment (timeline position) | What moves | GSAP |
|---|---|---|---|
| H1 | 0 → 0.5 "split" | `SHIVANSH` `xPercent 0→-38`, `SINGH` `0→+38` (ease none); the subtitle `autoAlpha→0, y -40` | timeline, xPercent |
| H2 | 0.1 → 0.5 | every letter except the first S of each word drops out (`yPercent ±110` alternating, `autoAlpha 0`, `stagger: {from: "edges", each: 0.02}`), leaving **S … S** | stagger |
| H3 | 0.5 → 1 "flip" | the two S's fly into the corner monogram's two letter slots | `Flip.fit(s, slot, {scale: true, getVars: true})` as **function-based values**, evaluated lazily when this segment first renders (after H1 has finished) and re-evaluated by `invalidateOnRefresh` |
| H4 | at 1 | hero S's `autoAlpha 0`, persistent monogram `autoAlpha 1` in the same frame. Both are inline-block with `line-height: 1` in the same face, so their boxes match exactly and there is no jump | `tl.set` |
| H5 | continuous | velocity skew `skewX` (±10°, clamped) on the **non-S letters only**, so Flip never measures a skewed box | `velocity.ts` → `gsap.quickTo(chars, "skewX", 0.4s)` |
The monogram link stays hidden while the hero is at the top (the name *is* the monogram) and is revealed by H4. Under reduced motion the monogram is simply shown.

### Act 2: Manifesto (Phase 3)
| M1 | Words go from opacity 0.15 to 1 in reading order (ease none, stagger 0.1 across the timeline); emphasis words are gold Instrument Serif italic | ST `manifesto`: `"top top"` → `"+=160%"` D / `"+=90%"` M, pin, `scrub: 0.6` | SplitText words, `aria: "none"` + sr-only copy |

### Act 3: Stats slam (Phase 3)
One pinned timeline `stats`: `"top top"` → `"+=320%"` D (80% per beat) / `"+=200%"` M, `scrub: 0.5`. Labels `beat1`–`beat4`.
| # | Per beat | GSAP |
|---|---|---|
| S1 | the previous stat exits `yPercent 0→-100, autoAlpha 0`; the next enters `yPercent 100→0` | timeline, labels |
| S2 | count-up: proxy `{v}` 0→value, `onUpdate` writes the formatted number (`3.95M`, `11`, `0.95`, `50K+`) | function onUpdate, `gsap.utils.snap` for decimals |
| S3 | landing: `scale 1.08→1` overshoot (keyframes, power3.out) | keyframes |
| S4 | gold flash: a gold duplicate of the number goes `opacity 0→1→0` (a colour tween would break the transform/opacity rule) | keyframes |
| S5 | label line rises from its mask | SplitText lines |

### Act 4: Skills marquee (Phase 3)
| K1 | Two rows (outlined `-webkit-text-stroke` / filled) loop in opposite directions; `x += base·dir·dt + velocity·k`, wrapped with `gsap.utils.wrap(-w, 0)`; scrolling up flips both directions | `gsap.ticker` loop (`loop.ts`), ST `skills` onToggle pauses it off-screen; base speed ×0.5 on mobile |
| K2 | Row skew from velocity, ±8° | `gsap.quickTo(row, "skewX")` |
A real `<ul>` of every skill grouped by category sits beside the marquee for readers and screen readers, and the moving rows are `aria-hidden`.

### Act 5: Selected work (Phase 4)
| # | Animation | Trigger | Scrub | GSAP |
|---|---|---|---|---|
| W1 | Card stack: cards are `position: sticky; top: 0; height: 100svh`. As card *i+1* covers card *i*, card *i*'s inner goes `scale 1→0.92` and its dim layer `opacity 0→0.65` | ST `work-<i>`: trigger card *i+1*, `"top bottom"` → `"top top"` | 0.6 | timeline per card |
| W2 | Card content: giant index and title rise from masked lines, tags and outcome follow (stagger 0.08) | ST `work-in-<i>`: `"top 60%"`, `toggleActions: "play none none reverse"` | no | SplitText |
| W3 | Hover: the visual scales to 1.03 and the cursor shows `VIEW` | pointerenter | no | tween |
| W4 | **Open case study**: a fixed overlay goes from `clip-path: inset(<card rect>)` → `inset(0)`, 1.1s wipe; its sections rise with 0.08 stagger; Lenis stops, `<main>` becomes `inert`, focus is trapped | click / Enter | no | timeline, CustomEase |
| W5 | **Close**: reverse to the card's rect (re-measured), then Lenis starts and focus returns to the card. The page never scrolled, so the scroll position is exactly where it was | close button / Esc | no | `tl.reverse()` |
The overlay scrolls natively (`data-lenis-prevent`).

### Act 6: Experience (Phase 5)
Desktop: **one** pinned timeline `experience`: trigger `#experience`, `"top top"` → `() => "+=" + (0.8·vh + track overflow)`, `pin: true`, `scrub: 1`, `invalidateOnRefresh`.
| # | Segment | What moves | GSAP |
|---|---|---|---|
| E1 | "wipe" (1 unit) | a bone layer goes `clip-path: circle(0% at 50% 50%)` → `circle(75% ...)`, about 142% of the half-diagonal so it covers the corners; ink text fades in | clip-path, CustomEase |
| E2 | "track" (3 units) | the track of 4 panels (2023 IIIT Delhi, 2025 Ahuja Lab, 2026 Caudate AI, Achievements) goes `x: () => -(track.scrollWidth - innerWidth)`, **ease none** | function values |
| E3 | per panel, placed in the same timeline at that panel's arrival time | outlined giant year reveals `clip-path inset(0 100% 0 0)→inset(0)`, metric lines rise from masks | positions computed from panel index; no `containerAnimation` needed |
| E4 | at the end of the wipe | UI theme → bone (U9) | onUpdate |
Mobile: no horizontal pin. The panels stack vertically, the wipe is scrubbed on entry (`"top bottom"` → `"top top"`) without a pin, and the panel reveals use `ScrollTrigger.batch`.

### Act 7: Minor works (Phase 6)
| # | Animation | Trigger | GSAP |
|---|---|---|---|
| N1 | Wipe back to ink: an ink layer goes `circle(0% at 50% 0%)→circle(150% at 50% 0%)`; UI theme → ink | ST `minor-wipe` `"top bottom"` → `"top top"`, scrub 0.8 | clip-path |
| N2 | Rows rise from masked lines once | ST batch `"top 85%"` | SplitText lines |
| N3 | Hover / focus: the title scrambles into place (`chars: "upperCase"`, 0.8s, `revealDelay 0.1`) | pointerenter, focus | ScrambleTextPlugin |
| N4 | Trailing preview follows the pointer with lag; rotation follows horizontal velocity (±8°); enters with `scale .8→1, autoAlpha` | pointermove (desktop only; on mobile each row shows an inline thumbnail) | `quickTo` x/y/rotation |
| N5 | Slingshot easter egg: the Angry Birds row has a "Play" button (cursor `DRAG`). It opens a fixed stage with a clip-path reveal and a canvas-2D game: drag the bird back, release, gravity arc, hit the blocks (they get velocity and spin away). Keyboard: arrows to aim and set power, Space to launch, Esc to close | click | `gsap.ticker` (runs only while open), DPR capped at 2, Lenis stopped |

### Act 8: Contact (Phase 6)
| # | Animation | Trigger | GSAP |
|---|---|---|---|
| C1 | "LET'S BUILD SOMETHING" reveals line by line (`yPercent 110→0`, 0.12 stagger, 1.2s) | ST `contact` `"top 70%"`, play / reverse | SplitText lines + mask |
| C2 | Magnetic email button; on click it copies the address, the label scrambles to "COPIED" and back, an `aria-live` region announces it. Fallback: `mailto:` | click | `quickTo`, ScrambleText, Clipboard API |
| C3 | Footer marquee (reuses `loop.ts`) | always, paused off-screen | ticker |
| C4 | "Back to top": `lenis.scrollTo(0, {duration: 1.4})`; as it runs the hero timeline scrubs back and the S's fly out of the corner into the name. Velocity blur (see §7, risk 4) | click | Lenis, `velocity.ts` |

### Reduced motion (Phase 7; the conditions are wired from Phase 1)
No Lenis, pins, wipes, skew, scrub or marquee travel. Each section's parts fade in once (`autoAlpha`, 0.6s, `ScrollTrigger.batch`). Counters show their final values. The hero shows the full name and the monogram shows from the start. The experience section is statically bone. The preloader shows `100` and fades in 0.3s. The case study and menu open with a fade.

---

## 6. Accessibility approach
- Landmarks: `header` (UI layer), `nav` (menu), `main`, `footer`. One `h1` (the name), an `h2` per section (visually hidden where the design has no visible heading, such as the manifesto), and `h3` per card or panel.
- **SplitText:** `aria: "auto"` on headings, where `aria-label` is valid. On the manifesto `<p>` and the other non-heading text, `aria-label` is prohibited on generic and paragraph roles and Lighthouse flags it, so those use `aria: "none"`, put the split copy in an `aria-hidden` element and keep an `.sr-only` original.
- Skip link "Skip to content". The MENU is a real `<button aria-expanded>`, the overlay is `role="dialog" aria-modal="true"` with a focus trap and Esc to close, and menu links jump with `lenis.scrollTo(target, {immediate: true})` so keyboard users never sit through the scroll sequences. The resume link is in the menu as well as in contact.
- Visible `:focus-visible` ring (2px gold on ink, `--gold-deep` on bone), custom cursor only under `(hover: hover) and (pointer: fine)`, and every hover reveal also fires on focus.

## 7. Risks
1. **The taste skill conflicts with the brief** (the brief wins, as instructed). The skill's house rules ban monospace labels, index numbers (`03 / 08`, card indices), styled accent words (gold italic), three typefaces, a preloader, tiny uppercase labels (MENU, VIEW) and placeholder pictures. The brief requires all of these. I'll keep the rest of the skill (scale, margins, no gradients, shadows or glass, contrast, two-line headlines, the screenshot critique loop) and run the inspector with `--allow mono,numbering,micro-label,font-count,mixed-font-headline,late-title,few-pictures,no-real-pictures,no-footage,placeholder-data`. I'm skipping `draw.mjs` because the brief already fixes palette, type and composition (the skill's own "existing design system" special case).
2. **Gold on bone fails contrast** (~1.6:1). Gold text on the bone act uses `--gold-deep`; gold stays as a fill or line there.
3. **Manifesto dimmed words at 15% opacity** may trip Lighthouse's contrast audit and put the 95+ Accessibility target at risk. Mitigation: the dimmed copy is `aria-hidden` with an sr-only original. I'll measure in Phase 7, and if the audit still counts it I'll report it rather than raise the 15% floor on my own.
4. **"Velocity blur" on back-to-top needs `filter: blur()`**, which breaks the transform/opacity/clip-path rule. Applied to an ancestor it would also break `position: fixed` pins. Proposal: blur only the inner content wrappers of sections (never pinned elements or their ancestors), driven by velocity, only during the rewind, desktop only. Fallback if it drops frames: a velocity-driven `scaleY` stretch plus `opacity 0.7`. **This is the one flagged exception.**
5. **Flip under scrub**: Flip normally measures once. The plan uses lazy function values plus `invalidateOnRefresh` (H3) and keeps skew off the measured letters (H5). I'll test resize mid-pin in Phase 2.
6. **Pin plus sticky ordering**: the hero, manifesto, stats and experience pins sit around a CSS-sticky stack. All ScrollTriggers are created in page order inside one matchMedia; I'll check pin-spacer heights at 1440, 768 and 390 after `refresh()`.
7. **Preloader vs LCP / Performance 90+**: the counter is static HTML, so it paints on the first frame, and the gate is capped at 5s. The inspector's `late-title` rule is allowed per the brief.
8. **SplitText and fonts**: splitting happens only after `document.fonts.load()` resolves for all three faces, so no re-split jump.
9. **Lenis inside overlays**: the case study, menu and slingshot call `lenis.stop()` and use `data-lenis-prevent`.

## 8. Proposed improvements (brief: "make any improvement"; each is opt-in, reject any at approval)
1. **Hero to monogram, literally (H1–H4):** the name sheds every letter but the two initials, S … S, which then Flip into the corner "SS". It fulfils "slide apart" and "shrink via Flip into the monogram" in one continuous gesture, and the back-to-top rewind plays it in reverse.
2. **Subject-drawn placeholders instead of grey boxes:** GravityOS = 11 agent nodes in 3 pipelines with a critic loop; Picasso = 4 layout roles assembling; Electricity = a 15-minute interval trace with a variance waterfall; Brain = a flat 2D sagittal outline with glowing regions (canvas-2D, no 3D); Aptamer = an RNA hairpin secondary structure; scRNA-seq = UMAP-style clusters (seeded, deterministic). Each carries a caption naming the real asset to drop in, and swapping is still just setting `src` in `content.ts`.
3. **Manifesto copy that contains the emphasis words.** The draft copy has no "genes" and no "agents" (it says "agentic"). Proposed: *"I build agents that ship to production and mine biological data for meaning, from knowledge graphs of Ayurvedic medicine to the genes that set one cell apart from the next."* (emphasis: agents, graphs, genes). The draft is kept in `content.ts` as a comment so it can be swapped back.
4. **Case-study deep links:** opening a card sets `#work/<id>` (still an in-page overlay, not a route), so a case study can be shared and the browser Back button closes it.
5. **Preloader respects repeat visits:** the full 1.6s sequence once per session, 0.5s afterwards.
6. **Keyboard-playable slingshot** and a real skills `<ul>` beside the marquee (both above).

## 9. Open questions (with the default I'll use if you don't answer)
1. **Counter denominator:** the brief shows `03 / 09`, but I count 8 scrollable sections (hero to contact; the preloader isn't one). Default: `/ 08`.
2. **Footer marquee text:** default "Shivansh Singh — AI Engineer × Computational Biologist", repeated. Nothing about availability is invented.
3. **Back-to-top blur exception** (risk 4): OK as proposed?
4. **Stat labels** (my wording): "triples in a biomedical knowledge graph", "LLM agents in one pipeline", "Hits@10 with RotatE", "documents searched in under a second".

## 10. Phases and verification

Each phase: read the listed skills' SKILL.md again → build → `npm run typecheck && npm run build` → `npm run dev` and check in the browser. For visual checks: `node .claude/skills/design-taste-frontend/scripts/inspect.mjs http://localhost:5173 --allow …` gives screenshots at 1440, 768 and 390, which I read and critique. Then commit `phase N: <name>` and post the report (built / how to check with exact scroll positions / skills consulted / deviations / open questions), then **STOP**.

| Phase | Builds | Skills | Done when (verified by) |
|---|---|---|---|
| 1 Scaffold | create-vite, deps, fonts, tokens, base/ui CSS, grain, `content.ts` (all content), Placeholder (plain version), Lenis sync, UI layer U1–U9 with dummy tall sections | frontend-design, design-taste-frontend, gsap-core, gsap-scrolltrigger, gsap-performance, gsap-utils | smooth scroll; menu opens and closes with keyboard and Esc; clock ticks in IST; counter and progress line update; cursor labels show on test targets; build passes |
| 2 Preloader + Hero | P1–P5, H1–H5, monogram hand-off | gsap-timeline, gsap-plugins (SplitText, Flip, CustomEase), gsap-scrolltrigger | intro plays once; scrubbing the hero forward and back is clean; the monogram rect matches the S's within 1px at the end (logged via `getBoundingClientRect`); no jump after the pin; resize mid-pin |
| 3 Manifesto, Stats, Marquee | M1, S1–S5, K1–K2 | gsap-scrolltrigger, gsap-timeline, gsap-utils, gsap-performance | words scrub in order; each counter lands on its exact final string at its beat; the marquee speeds up, skews and flips direction with scroll and pauses off-screen |
| 4 Selected work | W1–W5, motifs, case-study overlay from content | gsap-plugins, gsap-scrolltrigger, design-taste-frontend | 6 cards stack (prior at 0.92 and dimmed); open and close leave `window.scrollY` unchanged (logged); Esc, focus return and hash work |
| 5 Experience | E1–E4, mobile vertical variant | gsap-scrolltrigger, gsap-utils | the pin starts at the section top and releases right after the last panel; the wipe is smooth both ways; reload mid-section has no jump (`ScrollTrigger.getById('experience').start/end` checked against layout) |
| 6 Minor works + Contact | N1–N5, C1–C4 | gsap-plugins (ScrambleText), gsap-core, gsap-performance | scramble on hover and focus; the preview trails; the slingshot plays with mouse, touch and keyboard; email is copied (clipboard verified) and announced; back-to-top rewinds |
| 7 Polish | mobile variants, reduced motion, a11y pass, perf pass (bundle, unused code, CLS), Chrome + Edge + Firefox sanity, README (run, build, replace placeholders) | all | Lighthouse desktop Perf ≥ 90 and A11y ≥ 95 (run via `npx lighthouse`); inspector 0 FAIL at 3 widths with the allow-list; DevTools emulated reduced motion shows no pins or Lenis |
