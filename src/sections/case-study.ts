import './case-study.css';
import type { Project, SiteContent } from '../types';
import { gsap } from '../lib/gsap';
import { esc, linkAttrs } from '../lib/html';
import { placeholder } from '../lib/placeholder';
import { scroll } from '../lib/scroll';
import { setPageInert, trapFocus } from '../lib/a11y';

let projects: Project[] = [];
let root: HTMLElement;
let scroller: HTMLElement;
let article: HTMLElement;
let reduceMotion = false;
let openId: string | null = null;
let source: HTMLElement | null = null;
let releaseFocus: (() => void) | null = null;
let pushed = false;
let busy: gsap.core.Timeline | null = null;

const HASH = /^#work\/([\w-]+)$/;
export const hashId = (): string | null => HASH.exec(location.hash)?.[1] ?? null;

const list = (items: string[]) => `<ul class="case__list">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
const tags = (items: string[]) => `<ul class="case__tags">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
const row = (title: string, body: string) =>
  `<section class="case__row" data-reveal><h3 class="case__label">${esc(title)}</h3><div class="case__cell">${body}</div></section>`;

function renderProject(p: Project, next: Project): string {
  const cs = p.caseStudy;
  return `
    <header class="case__head" data-reveal>
      <p class="case__meta"><span>${esc(p.index)}</span><span>${esc(p.year)}</span></p>
      <h2 id="case-title" class="case__title" tabindex="-1">${esc(p.title)}</h2>
      <p class="case__outcome">${esc(p.outcome)}</p>
    </header>
    <div class="case__hero" data-reveal>${placeholder(p.visual)}</div>
    <div class="case__body">
      ${row('Overview', `<p class="case__lead">${esc(cs.overview)}</p>`)}
      ${row('Key facts', list(p.facts))}
      ${row('Approach', list(cs.approach))}
      ${row('Stack', tags(cs.stack))}
      ${row('Outcome', list(cs.outcome))}
      ${row('Links', `<ul class="case__links">${cs.links.map((l) => `<li><a ${linkAttrs(l.href, l.external)}>${esc(l.label)}</a></li>`).join('')}</ul>`)}
    </div>
    <div class="case__gallery" data-reveal>${cs.gallery.map((m) => placeholder(m)).join('')}</div>
    <footer class="case__next" data-reveal>
      <a class="case__next-link" href="#work/${esc(next.id)}" data-next="${esc(next.id)}" data-cursor="VIEW">
        <span class="case__next-label">Next project</span>
        <span class="case__next-title">${esc(next.title)}</span>
      </a>
    </footer>`;
}

const fill = (id: string) => {
  const i = projects.findIndex((p) => p.id === id);
  if (i < 0) return false;
  article.innerHTML = renderProject(projects[i], projects[(i + 1) % projects.length]);
  scroller.scrollTop = 0;
  return true;
};

/** The rect the overlay grows from and shrinks back to: the card's picture, or a small centred box if it is off screen. */
function fromClip(): string {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const r = (source?.querySelector('.card__visual') ?? source)?.getBoundingClientRect();
  const onScreen = r && r.bottom > vh * 0.2 && r.top < vh * 0.8 && r.width > 0;
  const box = onScreen ? r : { top: vh * 0.4, bottom: vh * 0.6, left: vw * 0.4, right: vw * 0.6 };
  return `inset(${box.top}px ${vw - box.right}px ${vh - box.bottom}px ${box.left}px)`;
}

/** W4: grow from the card with a clip-path, then the content rises in. */
export function openCase(id: string, from: HTMLElement | null, { push = true } = {}): void {
  if (openId === id) return;
  if (openId) {
    // Already open (next project or Back/Forward between two): swap the content in place.
    if (!fill(id)) return;
    openId = id;
    source = document.getElementById(`card-${id}`) ?? source;
    history.replaceState(null, '', `#work/${id}`);
    gsap.fromTo(article.querySelectorAll('[data-reveal]'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.06 });
    article.querySelector<HTMLElement>('#case-title')?.focus({ preventScroll: true });
    return;
  }
  if (!fill(id)) return;
  openId = id;
  source = from;
  if (push) {
    history.pushState(null, '', `#work/${id}`);
    pushed = true;
  }
  root.hidden = false;
  document.documentElement.classList.add('case-open');
  scroll.lock();
  setPageInert(true);
  releaseFocus = trapFocus([root]);

  busy?.kill();
  const parts = article.querySelectorAll('[data-reveal]');
  busy = gsap.timeline();
  if (reduceMotion) {
    gsap.set(root, { visibility: 'visible', clipPath: 'none' });
    busy.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'none' });
  } else {
    gsap.set(root, { autoAlpha: 1, clipPath: fromClip() });
    busy
      .to(root, { clipPath: 'inset(0px 0px 0px 0px)', duration: 1.1, ease: 'wipe' })
      .fromTo(parts, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, '-=0.5');
  }
  // Visible now, so focus can land.
  article.querySelector<HTMLElement>('#case-title')?.focus({ preventScroll: true });
}

/** W5: the reverse; the page never scrolled, so the position is exactly where it was. */
function closeNow(): void {
  if (!openId) return;
  openId = null;
  pushed = false;
  releaseFocus?.();
  releaseFocus = null;
  busy?.kill();
  const finish = () => {
    root.hidden = true;
    gsap.set(root, { autoAlpha: 0 });
    article.innerHTML = '';
    document.documentElement.classList.remove('case-open');
    setPageInert(false);
    scroll.unlock();
    source?.querySelector<HTMLElement>('.card__link')?.focus({ preventScroll: true });
  };
  busy = gsap.timeline({ onComplete: finish });
  if (reduceMotion) {
    busy.to(root, { opacity: 0, duration: 0.25, ease: 'none' });
  } else {
    busy
      .to(article.querySelectorAll('[data-reveal]'), { autoAlpha: 0, duration: 0.3, ease: 'power2.in' })
      .to(root, { clipPath: fromClip(), duration: 0.9, ease: 'wipe' }, '-=0.1');
  }
}

/** UI close: step back through history when the open added an entry, so Back and the button agree. */
export function requestClose(): void {
  if (!openId) return;
  if (pushed) history.back();
  else {
    history.replaceState(null, '', location.pathname + location.search);
    closeNow();
  }
}

export const renderCaseRoot = (): string =>
  `<div class="case" id="case" role="dialog" aria-modal="true" aria-labelledby="case-title" hidden>
    <div class="case__scroll" data-lenis-prevent>
      <button class="case__close" type="button" data-cursor="">Close</button>
      <article class="case__content"></article>
    </div>
  </div>`;

export function initCase(c: SiteContent): void {
  projects = c.work.projects;
  root = document.getElementById('case')!;
  scroller = root.querySelector('.case__scroll')!;
  article = root.querySelector('.case__content')!;
  root.querySelector('.case__close')!.addEventListener('click', requestClose);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openId) requestClose();
  });
  article.addEventListener('click', (e) => {
    const next = (e.target as Element).closest<HTMLAnchorElement>('[data-next]');
    if (!next) return;
    e.preventDefault();
    openCase(next.dataset.next!, null, { push: false });
  });
  window.addEventListener('popstate', () => {
    const id = hashId();
    if (id) openCase(id, document.getElementById(`card-${id}`), { push: false });
    else if (openId) closeNow();
  });
}

export function setCaseMotion(reduce: boolean): void {
  reduceMotion = reduce;
}
