import './hero.css';
import type { SiteContent } from '../types';
import type { Section } from './section';
import type { Conditions } from '../lib/media';
import { gsap, ScrollTrigger, SplitText, Flip } from '../lib/gsap';
import { esc, srPair } from '../lib/html';
import { onVelocity, skewFor } from '../lib/velocity';

let words: HTMLElement[] = [];
let initials: HTMLElement[] = [];
let tails: HTMLElement[] = [];
let roleWords: HTMLElement[] = [];
let prepared = false;

/** Splits the name into letters after the fonts have loaded. Runs once, before the intro. */
export function prepareHero(): void {
  if (prepared) return;
  prepared = true;
  const hero = document.getElementById('hero')!;
  words = gsap.utils.toArray<HTMLElement>('.hero__word', hero);
  initials = [];
  tails = [];
  for (const word of words) {
    // aria: hidden — the h1 carries the readable name in its aria-label
    const split = SplitText.create(word, { type: 'chars', mask: 'chars', charsClass: 'hero__char', aria: 'hidden' });
    const chars = split.chars as HTMLElement[];
    initials.push(chars[0]);
    tails.push(...chars.slice(1));
  }
  const role = hero.querySelector<HTMLElement>('.hero__role-text')!;
  roleWords = SplitText.create(role, { type: 'words', mask: 'words', aria: 'none' }).words as HTMLElement[];
}

/** P4: letters rise out of their masks, then the role line. Added to the preloader timeline. */
export function heroIntro(): gsap.core.Timeline {
  const masks = initials.concat(tails).map((ch) => ch.parentElement!);
  return gsap
    .timeline()
    .fromTo(
      words.map((w) => w.querySelectorAll('.hero__char')),
      { yPercent: 110 },
      { yPercent: 0, duration: 1.2, stagger: 0.035, ease: 'expo.out' },
    )
    .fromTo(roleWords, { yPercent: 110 }, { yPercent: 0, duration: 1.0, stagger: 0.03 }, '-=1.0')
    .fromTo('#ui', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, '-=0.9')
    // Letters leave their masks for the scroll sequence (the initials fly to the corner).
    .add(() => masks.forEach((m) => (m.style.overflow = 'visible')));
}

export const hero: Section = {
  id: 'hero',

  render: (c: SiteContent) => `
    <section id="hero" class="hero" tabindex="-1" aria-labelledby="hero-title">
      <div class="hero__inner">
        <h1 id="hero-title" class="hero__name" aria-label="${esc(c.person.first)} ${esc(c.person.last)}">
          <span class="hero__word hero__word--first">${esc(c.person.first)}</span>
          <span class="hero__word hero__word--last">${esc(c.person.last)}</span>
        </h1>
        <p class="hero__role">${srPair(c.person.role, esc(c.person.role), 'hero__role-text')}</p>
      </div>
    </section>`,

  animate(cond: Conditions) {
    const monogram = document.querySelector<HTMLElement>('[data-monogram]')!;
    if (cond.reduceMotion) {
      gsap.set(monogram, { autoAlpha: 1 });
      return;
    }
    const hero = document.getElementById('hero')!;
    const role = hero.querySelector('.hero__role')!;
    const slots = gsap.utils.toArray<HTMLElement>('[data-monogram-slot]');
    const [first, last] = words;

    // H1 slide distance, shared by the slide tweens and the H3 measurement.
    const slide = (i: number) => (i === 0 ? 1 : -1) * window.innerWidth * 0.14;

    // H3: Flip.fit measures where each initial is now; the result is corrected by however far its word
    // still has to slide, so the landing is exact whenever GSAP first evaluates it (and after every refresh).
    const fits = new Map<HTMLElement, gsap.TweenVars>();
    const fitOf = (el: HTMLElement, i: number) => {
      if (!fits.has(el)) {
        const fit = Flip.fit(el, slots[i], { scale: true, getVars: true }) as gsap.TweenVars;
        const remaining = slide(i) - Number(gsap.getProperty(words[i], 'x'));
        fits.set(el, { ...fit, x: Number(fit.x ?? 0) - remaining });
      }
      return fits.get(el)!;
    };
    const prop = (name: string) => (i: number, el: HTMLElement) => Number(fitOf(el, i)[name] ?? 0);

    gsap.set(monogram, { autoAlpha: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'hero',
        trigger: hero,
        start: 'top top',
        end: cond.isMobile ? '+=70%' : '+=130%',
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: () => fits.clear(),
      },
    });

    // H1: the words slide in opposite directions; the role line leaves first
    tl.to(first, { x: () => slide(0), duration: 0.5 }, 0)
      .to(last, { x: () => slide(1), duration: 0.5 }, 0)
      .to(role, { autoAlpha: 0, y: -40, duration: 0.25 }, 0)
      // H2: every letter but the two initials drops away
      .to(
        tails,
        {
          yPercent: (i) => (i % 2 ? 110 : -110),
          autoAlpha: 0,
          duration: 0.3,
          stagger: { each: 0.012, from: 'edges' },
          ease: 'power2.in',
        },
        0.1,
      )
      // H3: S … S fly into the corner monogram
      .fromTo(
        initials,
        { x: 0, y: 0, scaleX: 1, scaleY: 1 },
        {
          x: prop('x'),
          y: prop('y'),
          scaleX: prop('scaleX'),
          scaleY: prop('scaleY'),
          duration: 0.5,
          ease: 'wipe',
          immediateRender: false,
        },
        0.5,
      )
      // H4: hand over to the persistent monogram in the same frame
      .set(initials, { autoAlpha: 0 }, 1)
      .set(monogram, { autoAlpha: 1 }, 1);

    // H5: velocity skew on the falling letters only, so Flip never measures a skewed box
    const skewTo = gsap.quickTo(tails, 'skewX', { duration: 0.4, ease: 'power3' });
    const st = ScrollTrigger.getById('hero')!;
    let skewing = false;
    const off = onVelocity((v) => {
      if (st.isActive) {
        skewing = true;
        skewTo(skewFor(v));
      } else if (skewing) {
        skewing = false;
        skewTo(0);
      }
    });

    return () => {
      off();
      fits.clear();
      gsap.set(monogram, { autoAlpha: 1 });
    };
  },
};
