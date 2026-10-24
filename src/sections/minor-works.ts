import './minor-works.css';
import type { MinorWork, SiteContent } from '../types';
import type { Section } from './section';
import type { Cleanup, Conditions } from '../lib/media';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { esc } from '../lib/html';
import { placeholder } from '../lib/placeholder';
import { setUiTheme } from '../lib/theme';
import { initSlingshot, openSlingshot, setSlingshotMotion } from './slingshot';

let items: MinorWork[] = [];

const row = (m: MinorWork) => `
  <li class="mw__row" data-id="${esc(m.id)}">
    <div class="mw__mask"><h3 class="mw__title"><span class="mw__title-text">${esc(m.title)}</span></h3></div>
    <div class="mw__meta">
      <p class="mw__blurb">${esc(m.blurb)}</p>
      <ul class="mw__tags">${m.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      ${
        m.easterEgg === 'slingshot'
          ? `<button class="mw__play" type="button" data-sling data-cursor="DRAG" data-magnetic><span data-magnetic-inner>Play the slingshot</span></button>`
          : ''
      }
    </div>
    <div class="mw__thumb">${placeholder(m.preview)}</div>
  </li>`;

/** Trailing preview (N4), outside the section so nothing transformed or filtered sits above it. */
export const renderMinorPreview = (c: SiteContent): string =>
  `<div class="mw-preview" aria-hidden="true">${c.minorWorks.items
    .map((m) => `<div class="mw-preview__item" data-id="${esc(m.id)}">${placeholder(m.preview)}</div>`)
    .join('')}</div>`;

export const minorWorks: Section = {
  id: 'minor-works',

  render: (c: SiteContent) => {
    items = c.minorWorks.items;
    return `
    <section id="minor-works" class="mw" tabindex="-1" aria-labelledby="mw-title">
      <div class="mw__wipe" aria-hidden="true"></div>
      <h2 id="mw-title" class="mw__heading">${esc(c.minorWorks.heading)}</h2>
      <ul class="mw__list">${items.map(row).join('')}</ul>
    </section>`;
  },

  init() {
    initSlingshot();
    document.querySelector('[data-sling]')?.addEventListener('click', (e) => openSlingshot(e.currentTarget as HTMLElement));
  },

  animate(cond: Conditions) {
    setSlingshotMotion(cond.reduceMotion);
    const section = document.getElementById('minor-works')!;
    const wipe = section.querySelector<HTMLElement>('.mw__wipe')!;
    const rows = gsap.utils.toArray<HTMLElement>('.mw__row', section);
    const cleanups: Cleanup[] = [];

    // U9: back to ink once the ink field covers the screen
    ScrollTrigger.create({
      id: 'mw-theme',
      trigger: section,
      start: 'top top+=1',
      onEnter: () => setUiTheme('ink'),
      onLeaveBack: () => setUiTheme('bone'),
    });

    if (cond.reduceMotion) {
      section.classList.add('is-static');
      gsap.from(rows, { autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: section, start: 'top 75%', once: true } });
      return () => section.classList.remove('is-static');
    }

    // N1: an ink circle opens from the top edge as the section arrives
    gsap.fromTo(
      wipe,
      { clipPath: 'circle(0% at 50% 0%)' },
      {
        clipPath: 'circle(150% at 50% 0%)',
        ease: 'none',
        scrollTrigger: { id: 'mw-wipe', trigger: section, start: 'top 85%', end: 'top top', scrub: 0.8, invalidateOnRefresh: true },
      },
    );

    // N2: heading and rows rise from their masks, once
    gsap.from(section.querySelector('.mw__heading'), { yPercent: 40, autoAlpha: 0, duration: 1.2, scrollTrigger: { trigger: section, start: 'top 40%', once: true } });
    ScrollTrigger.batch(rows, {
      start: 'top 85%',
      once: true,
      onEnter: (els) => {
        gsap.from(
          els.map((el) => el.querySelector('.mw__title-text')),
          { yPercent: 105, duration: 1.2, stagger: 0.08 },
        );
        gsap.from(
          els.flatMap((el) => [...el.querySelectorAll('.mw__meta > *, .mw__thumb')]),
          { y: 24, autoAlpha: 0, duration: 1, stagger: 0.04, delay: 0.15 },
        );
      },
    });

    // N3: hovering (or focusing inside) a row scrambles its title into place
    const scramble = (el: HTMLElement) => {
      const text = el.querySelector<HTMLElement>('.mw__title-text')!;
      const title = items.find((m) => m.id === el.dataset.id)?.title ?? text.textContent ?? '';
      gsap.to(text, { duration: 0.8, scrambleText: { text: title, chars: 'upperCase', speed: 0.6, revealDelay: 0.1 }, overwrite: true });
    };
    for (const el of rows) {
      const enter = () => scramble(el);
      el.addEventListener('pointerenter', enter);
      el.addEventListener('focusin', enter);
      cleanups.push(() => {
        el.removeEventListener('pointerenter', enter);
        el.removeEventListener('focusin', enter);
      });
    }

    // N4: a preview trails the pointer, leaning with its horizontal speed (fine pointers only)
    if (cond.canHover) cleanups.push(trailingPreview(section, rows));

    return () => {
      cleanups.forEach((fn) => fn());
      section.classList.remove('is-static');
    };
  },
};

function trailingPreview(section: HTMLElement, rows: HTMLElement[]): Cleanup {
  const box = document.querySelector<HTMLElement>('.mw-preview')!;
  const previews = gsap.utils.toArray<HTMLElement>('.mw-preview__item', box);
  const xTo = gsap.quickTo(box, 'x', { duration: 0.6, ease: 'power3' });
  const yTo = gsap.quickTo(box, 'y', { duration: 0.6, ease: 'power3' });
  const rTo = gsap.quickTo(box, 'rotation', { duration: 0.5, ease: 'power3' });
  const list = section.querySelector<HTMLElement>('.mw__list')!;
  let lastX = 0;
  let shown = false;
  // The lean settles back to upright once the pointer rests.
  const settle = gsap.delayedCall(0.12, () => rTo(0)).pause();

  // Sits just right of the pointer, so it never covers the title being scrambled.
  gsap.set(box, { autoAlpha: 0, scale: 0.8, xPercent: 12, yPercent: -50 });

  const move = (e: PointerEvent) => {
    if (!shown) {
      gsap.set(box, { x: e.clientX, y: e.clientY });
      lastX = e.clientX;
    }
    xTo(e.clientX);
    yTo(e.clientY);
    rTo(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.5));
    lastX = e.clientX;
    settle.restart(true);
  };
  const show = (id: string) => {
    previews.forEach((p) => gsap.set(p, { autoAlpha: p.dataset.id === id ? 1 : 0 }));
    if (!shown) gsap.to(box, { autoAlpha: 1, scale: 1, duration: 0.5, overwrite: 'auto' });
    shown = true;
  };
  const hide = () => {
    shown = false;
    rTo(0);
    gsap.to(box, { autoAlpha: 0, scale: 0.8, duration: 0.4, overwrite: 'auto' });
  };
  const enters = rows.map((el) => {
    const fn = () => show(el.dataset.id!);
    el.addEventListener('pointerenter', fn);
    return () => el.removeEventListener('pointerenter', fn);
  });
  list.addEventListener('pointermove', move);
  list.addEventListener('pointerleave', hide);

  return () => {
    enters.forEach((off) => off());
    list.removeEventListener('pointermove', move);
    list.removeEventListener('pointerleave', hide);
    settle.kill();
    gsap.set(box, { autoAlpha: 0 });
  };
}
