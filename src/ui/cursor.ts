import { gsap } from '../lib/gsap';
import type { Cleanup } from '../lib/media';

export const renderCursor = (): string =>
  `<div class="cursor" aria-hidden="true"><span class="cursor__dot"></span><span class="cursor__label"></span></div>`;

const TARGETS = '[data-cursor], a, button';

/** Custom cursor (U6). Only runs on fine pointers without reduced motion. */
export function animateCursor(): Cleanup {
  const root = document.documentElement;
  const cursor = document.querySelector<HTMLElement>('.cursor')!;
  const dot = cursor.querySelector<HTMLElement>('.cursor__dot')!;
  const label = cursor.querySelector<HTMLElement>('.cursor__label')!;
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
  let current: Element | null = null;
  let visible = false;

  root.classList.add('has-cursor');
  gsap.set(cursor, { autoAlpha: 0 });
  gsap.set(label, { autoAlpha: 0 });

  const setTarget = (target: Element | null) => {
    if (target === current) return;
    current = target;
    const text = target?.getAttribute('data-cursor') ?? '';
    label.textContent = text;
    gsap.to(dot, { scale: target ? (text ? 5.5 : 2.6) : 1, duration: 0.5, ease: 'expo.out', overwrite: 'auto' });
    gsap.to(label, { autoAlpha: text ? 1 : 0, duration: 0.25, overwrite: 'auto' });
  };

  const move = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (!visible) {
      gsap.set(cursor, { x: e.clientX, y: e.clientY });
      gsap.to(cursor, { autoAlpha: 1, duration: 0.3 });
      visible = true;
    }
    xTo(e.clientX);
    yTo(e.clientY);
  };
  const over = (e: PointerEvent) => setTarget((e.target as Element).closest?.(TARGETS) ?? null);
  const leave = () => {
    visible = false;
    gsap.to(cursor, { autoAlpha: 0, duration: 0.3 });
  };
  const down = () => gsap.to(dot, { scale: '*=0.8', duration: 0.2, ease: 'power2.out' });
  const up = () => {
    current = null;
    setTarget(document.elementFromPoint(gsap.getProperty(cursor, 'x') as number, gsap.getProperty(cursor, 'y') as number)?.closest(TARGETS) ?? null);
  };

  window.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerover', over);
  document.documentElement.addEventListener('pointerleave', leave);
  window.addEventListener('pointerdown', down);
  window.addEventListener('pointerup', up);

  return () => {
    root.classList.remove('has-cursor');
    window.removeEventListener('pointermove', move);
    document.removeEventListener('pointerover', over);
    document.documentElement.removeEventListener('pointerleave', leave);
    window.removeEventListener('pointerdown', down);
    window.removeEventListener('pointerup', up);
    gsap.set(cursor, { autoAlpha: 0 });
  };
}
