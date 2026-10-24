import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';

let lenis: Lenis | null = null;
let locks = 0;
const raf = (time: number) => lenis?.raf(time * 1000);

/** Smooth scroll, driven by gsap.ticker. Not started under reduced motion. */
export function startSmoothScroll(): () => void {
  lenis = new Lenis({ autoRaf: false, lerp: 0.1, anchors: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  if (locks > 0) lenis.stop();
  return () => {
    gsap.ticker.remove(raf);
    gsap.ticker.lagSmoothing(500, 33);
    lenis?.destroy();
    lenis = null;
  };
}

interface ScrollToOptions {
  immediate?: boolean;
  duration?: number;
  onComplete?: () => void;
}

export const scroll = {
  /** Stops page scroll while an overlay is open. Calls nest. */
  lock() {
    locks++;
    lenis?.stop();
    document.documentElement.classList.add('is-scroll-locked');
  },
  unlock() {
    locks = Math.max(0, locks - 1);
    if (locks > 0) return;
    document.documentElement.classList.remove('is-scroll-locked');
    lenis?.start();
  },
  to(target: number | HTMLElement, opts: ScrollToOptions = {}) {
    if (lenis) {
      lenis.scrollTo(target, {
        immediate: opts.immediate,
        duration: opts.duration,
        force: true,
        onComplete: () => opts.onComplete?.(),
      });
      return;
    }
    const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y, behavior: 'instant' });
    opts.onComplete?.();
  },
  get smooth() {
    return lenis !== null;
  },
};
