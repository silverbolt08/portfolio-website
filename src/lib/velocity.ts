import { gsap } from './gsap';

type Listener = (velocity: number) => void;

const listeners = new Set<Listener>();
let last = 0;
let smoothed = 0;

function tick(_time: number, deltaTime: number) {
  const y = window.scrollY;
  const raw = deltaTime > 0 ? ((y - last) / deltaTime) * 1000 : 0;
  last = y;
  smoothed += (raw - smoothed) * 0.2;
  if (Math.abs(smoothed) < 0.5) smoothed = 0;
  listeners.forEach((fn) => fn(smoothed));
}

/**
 * One smoothed scroll velocity (px/s, positive = down), shared by every skew effect.
 * Runs on gsap.ticker only while someone is listening.
 */
export function onVelocity(fn: Listener): () => void {
  if (!listeners.size) {
    last = window.scrollY;
    smoothed = 0;
    gsap.ticker.add(tick);
  }
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
    if (!listeners.size) gsap.ticker.remove(tick);
  };
}

/** Maps velocity to a skew angle, clamped to ±max degrees. */
export const skewFor = (velocity: number, max = 10, per = 300): number => gsap.utils.clamp(-max, max, -velocity / per);
