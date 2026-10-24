import type { SiteContent } from '../types';
import { gsap } from '../lib/gsap';
import { esc, linkAttrs } from '../lib/html';
import { scroll } from '../lib/scroll';
import { setPageInert, trapFocus } from '../lib/a11y';
import type { Cleanup, Conditions } from '../lib/media';

export const renderMenuButton = (): string =>
  `<button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-magnetic data-cursor="">
    <span class="menu-btn__inner" data-magnetic-inner><span class="menu-btn__label">Menu</span></span>
  </button>`;

export const renderMenu = (c: SiteContent): string => {
  const links = [c.contact.github, c.contact.linkedin, c.contact.resume];
  return `<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Site index" hidden data-lenis-prevent>
    <div class="menu__inner">
      <nav class="menu__nav" aria-label="Sections">
        <ol>${c.nav
          .map(
            (n, i) => `<li><a class="menu__link" href="#${n.id}" data-goto="${n.id}">
              <span class="menu__num">${String(i + 1).padStart(2, '0')}</span>
              <span class="menu__mask"><span class="menu__text">${esc(n.label)}</span></span>
            </a></li>`,
          )
          .join('')}</ol>
      </nav>
      <div class="menu__aside">
        <a class="menu__email" href="mailto:${esc(c.contact.email)}">${esc(c.contact.email)}</a>
        <ul class="menu__social">${links.map((l) => `<li><a ${linkAttrs(l.href, l.external)}>${esc(l.label)}</a></li>`).join('')}</ul>
        <p class="menu__note">${esc(c.person.education)}</p>
      </div>
    </div>
  </div>`;
};

let tl: gsap.core.Timeline | null = null;
let isOpen = false;
let releaseFocus: (() => void) | null = null;
let focusAfterClose: HTMLElement | null = null;

const els = () => ({
  btn: document.querySelector<HTMLButtonElement>('.menu-btn')!,
  label: document.querySelector<HTMLElement>('.menu-btn__label')!,
  menu: document.getElementById('menu')!,
});

function finishClose() {
  const { menu, btn } = els();
  menu.hidden = true;
  (focusAfterClose ?? btn).focus({ preventScroll: true });
  focusAfterClose = null;
}

function open() {
  if (isOpen || !tl) return;
  const { btn, label, menu } = els();
  isOpen = true;
  menu.hidden = false;
  btn.setAttribute('aria-expanded', 'true');
  label.textContent = 'Close';
  document.documentElement.classList.add('menu-open');
  scroll.lock();
  setPageInert(true);
  releaseFocus = trapFocus([btn, menu]);
  tl.timeScale(1).play();
  menu.querySelector<HTMLElement>('.menu__link')?.focus({ preventScroll: true });
}

function close(after?: () => HTMLElement | void) {
  if (!isOpen || !tl) return;
  const { btn, label } = els();
  isOpen = false;
  btn.setAttribute('aria-expanded', 'false');
  label.textContent = 'Menu';
  document.documentElement.classList.remove('menu-open');
  releaseFocus?.();
  releaseFocus = null;
  setPageInert(false);
  scroll.unlock();
  // Jump behind the closing panel, so the destination is already there when it lifts.
  focusAfterClose = after?.() ?? null;
  if (tl.progress() === 0) finishClose();
  else tl.timeScale(1.4).reverse();
}

/** Event wiring; runs once. */
export function initMenu(): void {
  const { btn, menu } = els();
  btn.addEventListener('click', () => (isOpen ? close() : open()));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });
  menu.addEventListener('click', (e) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>('[data-goto]');
    if (!link) return;
    e.preventDefault();
    const target = document.getElementById(link.dataset.goto!);
    if (!target) return;
    close(() => {
      scroll.to(target, { immediate: true });
      return target;
    });
  });
}

/** Builds the open/close timeline (U5) for the current media conditions. */
export function animateMenu(c: Conditions): Cleanup {
  const { menu } = els();
  const texts = menu.querySelectorAll('.menu__text');
  const rest = menu.querySelectorAll('.menu__num, .menu__aside');
  tl = gsap.timeline({ paused: true, onReverseComplete: finishClose });
  if (c.reduceMotion) {
    tl.fromTo(menu, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, ease: 'none' });
  } else {
    tl.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'wipe' })
      .fromTo(texts, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.06 }, '-=0.45')
      .fromTo(rest, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.03 }, '<0.15');
  }
  if (isOpen) tl.progress(1);
  return () => {
    tl?.kill();
    tl = null;
    gsap.set([menu, texts, rest], { clearProps: 'all' });
  };
}
