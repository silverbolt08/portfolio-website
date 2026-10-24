import { gsap, ScrollTrigger } from './gsap';
import { onVelocity, skewFor } from './velocity';

export interface LoopRow {
  /** Element containing one `.loop__track`, whose first child is the group to repeat. */
  el: HTMLElement;
  /** 1 = moves left while scrolling down, -1 = moves right. */
  dir: 1 | -1;
}

export interface LoopOptions {
  /** Base speed in px/s. */
  speed: number;
  /** Extra px/s per px/s of scroll velocity. */
  boost?: number;
  /** Max skew in degrees from scroll velocity; 0 for none. */
  skew?: number;
}

export interface Loop {
  setActive(on: boolean): void;
  destroy(): void;
}

/**
 * Infinite marquee rows on gsap.ticker (K1/K2, C3). Scroll velocity speeds them up and skews them,
 * and scrolling up reverses their direction.
 */
export function createLoop(rows: LoopRow[], { speed, boost = 0.3, skew = 0 }: LoopOptions): Loop {
  const state = rows.map(({ el, dir }) => {
    const track = el.querySelector<HTMLElement>('.loop__track')!;
    const group = track.firstElementChild as HTMLElement;
    return {
      dir,
      track,
      group,
      width: 0,
      x: 0,
      setX: gsap.quickSetter(track, 'x', 'px') as (v: number) => void,
      skewTo: skew ? gsap.quickTo(track, 'skewX', { duration: 0.5, ease: 'power3' }) : null,
    };
  });

  const measure = () => {
    for (const s of state) {
      s.width = s.group.getBoundingClientRect().width;
      // Enough copies to cover the screen twice over while one group scrolls out.
      const need = Math.ceil((window.innerWidth * 2) / Math.max(1, s.width)) + 1;
      while (s.track.children.length < need) {
        const clone = s.group.cloneNode(true) as HTMLElement;
        clone.setAttribute('aria-hidden', 'true');
        s.track.appendChild(clone);
      }
    }
  };
  measure();
  ScrollTrigger.addEventListener('refresh', measure);

  let velocity = 0;
  let scrollDir = 1;
  const offVelocity = onVelocity((v) => {
    velocity = v;
    if (Math.abs(v) > 20) scrollDir = Math.sign(v);
  });

  const tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs, 64) / 1000;
    const pxs = speed + Math.abs(velocity) * boost;
    for (const s of state) {
      if (!s.width) continue;
      s.x = gsap.utils.wrap(-s.width, 0, s.x - s.dir * scrollDir * pxs * dt);
      s.setX(s.x);
      s.skewTo?.(skewFor(velocity, skew));
    }
  };

  let active = false;
  const setActive = (on: boolean) => {
    if (on === active) return;
    active = on;
    if (on) gsap.ticker.add(tick);
    else gsap.ticker.remove(tick);
  };

  return {
    setActive,
    destroy() {
      setActive(false);
      offVelocity();
      ScrollTrigger.removeEventListener('refresh', measure);
      for (const s of state) gsap.set(s.track, { clearProps: 'transform' });
    },
  };
}
