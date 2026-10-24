import './preloader.css';
import { gsap } from '../lib/gsap';

const SEEN = 'ss-intro-seen';
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const seen = (): boolean => {
  try {
    return sessionStorage.getItem(SEEN) === '1';
  } catch {
    return false;
  }
};

/**
 * Act 0. Counts 000 → 100 (holding at 90 until `ready` resolves, 5s cap), slides the number out,
 * lifts the curtain and plays the hero intro over it. Resolves when everything has landed (P5 gate).
 */
export async function runPreloader(ready: Promise<void>, intro: () => gsap.core.Timeline, reduceMotion: boolean): Promise<void> {
  const root = document.getElementById('preloader');
  const count = root?.querySelector<HTMLElement>('.preloader__count');
  if (!root || !count) {
    await ready;
    return;
  }
  const proxy = { v: 0 };
  const write = () => {
    count.textContent = String(Math.round(proxy.v)).padStart(3, '0');
  };

  if (reduceMotion) {
    await Promise.race([ready, wait(5000)]);
    proxy.v = 100;
    write();
    await gsap.to(root, { autoAlpha: 0, duration: 0.3, ease: 'none' });
    root.remove();
    return;
  }

  const fast = seen();
  await gsap.to(proxy, { v: 90, duration: fast ? 0.35 : 1.2, ease: 'power2.inOut', onUpdate: write });
  await Promise.race([ready, wait(5000)]);
  await gsap.to(proxy, { v: 100, duration: fast ? 0.15 : 0.25, ease: 'power2.out', onUpdate: write });

  const tl = gsap.timeline();
  tl.to(count, { yPercent: -110, duration: fast ? 0.5 : 0.7, ease: 'wipe' })
    .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: fast ? 0.8 : 1.1, ease: 'wipe' }, '-=0.35')
    .add(intro().timeScale(fast ? 1.5 : 1), fast ? '-=0.5' : '-=0.75');
  await tl;
  root.remove();
  try {
    sessionStorage.setItem(SEEN, '1');
  } catch {
    /* private mode: the full intro plays again next time */
  }
}
