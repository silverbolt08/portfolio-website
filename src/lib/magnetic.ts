import { gsap } from './gsap';

/**
 * Pulls [data-magnetic] elements toward the pointer; a [data-magnetic-inner] child moves half as much again.
 * Returns a cleanup function.
 */
export function magnetic(root: ParentNode = document, strength = 0.35): () => void {
  const offs: (() => void)[] = [];
  for (const el of root.querySelectorAll<HTMLElement>('[data-magnetic]')) {
    const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]');
    const vars = { duration: 0.8, ease: 'expo.out' };
    const x = gsap.quickTo(el, 'x', vars);
    const y = gsap.quickTo(el, 'y', vars);
    const ix = inner ? gsap.quickTo(inner, 'x', vars) : null;
    const iy = inner ? gsap.quickTo(inner, 'y', vars) : null;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      x(dx * strength);
      y(dy * strength);
      ix?.(dx * strength * 0.5);
      iy?.(dy * strength * 0.5);
    };
    const leave = () => {
      x(0);
      y(0);
      ix?.(0);
      iy?.(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    offs.push(() => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      gsap.set(inner ? [el, inner] : el, { clearProps: 'transform' });
    });
  }
  return () => offs.forEach((off) => off());
}
