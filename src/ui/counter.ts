import { gsap, ScrollTrigger } from '../lib/gsap';
import type { Cleanup, Conditions } from '../lib/media';

const pad = (n: number) => String(n).padStart(2, '0');

export const renderCounter = (total: number): string =>
  `<p class="hud hud--counter" aria-hidden="true"><span class="counter__mask"><span class="counter__cur" data-counter>01</span></span> / ${pad(total)}</p>`;

export const renderProgress = (): string =>
  `<div class="progress" aria-hidden="true"><span class="progress__bar" data-progress></span></div>`;

/**
 * Section counter (U3) and gold progress line (U2).
 * Created after every section's own ScrollTriggers so pin spacing is already in place.
 */
export function animateCounter(ids: string[], c: Conditions): Cleanup {
  const cur = document.querySelector<HTMLElement>('[data-counter]')!;
  const bar = document.querySelector<HTMLElement>('[data-progress]')!;
  let index = 0;
  let roll: gsap.core.Timeline | null = null;

  const show = (i: number, dir: number) => {
    if (i === index) return;
    index = i;
    roll?.kill();
    if (c.reduceMotion) {
      cur.textContent = pad(i + 1);
      return;
    }
    roll = gsap
      .timeline()
      .to(cur, { yPercent: -100 * dir, duration: 0.2, ease: 'power2.in' })
      .add(() => {
        cur.textContent = pad(i + 1);
      })
      .fromTo(cur, { yPercent: 100 * dir }, { yPercent: 0, duration: 0.5, ease: 'expo.out' });
  };

  // Only starts: they are pin-aware, while endTrigger positions ignore earlier pins' spacing.
  // Each callback recounts from the scroll position, so a menu jump across many sections lands right.
  const triggers: ScrollTrigger[] = [];
  const sync = (dir: number) => {
    const y = window.scrollY;
    show(triggers.filter((t) => y >= t.start).length, dir);
  };
  ids.slice(1).forEach((id) => {
    triggers.push(
      ScrollTrigger.create({
        id: `counter-${id}`,
        trigger: `#${id}`,
        start: 'top center',
        onEnter: () => sync(1),
        onLeaveBack: () => sync(-1),
      }),
    );
  });

  gsap.fromTo(
    bar,
    { scaleX: 0 },
    { scaleX: 1, ease: 'none', scrollTrigger: { id: 'progress', start: 0, end: 'max', scrub: true } },
  );

  return () => {
    roll?.kill();
    gsap.set(cur, { clearProps: 'transform' });
  };
}
