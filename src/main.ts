import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource-variable/inter-tight/wght.css';
import '@fontsource-variable/geist-mono/wght.css';
import 'lenis/dist/lenis.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/ui.css';
import './sections/stub.css';

import { content } from './content';
import { gsap, ScrollTrigger } from './lib/gsap';
import { conditions, type Cleanup, type Conditions } from './lib/media';
import { startSmoothScroll } from './lib/scroll';
import { loadFonts } from './lib/fonts';
import { magnetic } from './lib/magnetic';
import { placeholder } from './lib/placeholder';
import { renderMonogram, initMonogram } from './ui/monogram';
import { renderMenuButton, renderMenu, initMenu, animateMenu } from './ui/menu';
import { renderClock, initClock } from './ui/clock';
import { renderCounter, renderProgress, animateCounter } from './ui/counter';
import { renderCursor, animateCursor } from './ui/cursor';
import type { Section } from './sections/section';
import { stub } from './sections/stub';
import { runPreloader } from './sections/preloader';
import { hero, prepareHero, heroIntro } from './sections/hero';

const c = content;

if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });

const sections: Section[] = [
  hero,
  stub('manifesto', c.manifesto.heading),
  stub('stats', c.stats.heading),
  stub('skills', c.skills.heading),
  stub('work', c.work.heading, `<div class="stub__media" data-cursor="VIEW">${placeholder(c.work.projects[0].visual)}</div>`),
  stub('experience', c.experience.heading),
  stub('minor-works', c.minorWorks.heading, `<button class="stub__btn" type="button" data-cursor="DRAG">Drag target</button>`),
  stub(
    'contact',
    c.contactSection.heading,
    `<button class="stub__btn" type="button" data-cursor="COPY" data-magnetic><span data-magnetic-inner>${c.contact.email}</span></button>`,
  ),
];

function render() {
  document.title = c.meta.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', c.meta.description);
  document.getElementById('ui')!.innerHTML = `
    ${renderMonogram(c)}
    ${renderMenuButton()}
    <div class="hud-row">${renderClock(c)}${renderProgress()}${renderCounter(c.nav.length)}</div>`;
  document.getElementById('overlays')!.innerHTML = renderMenu(c) + renderCursor();
  document.getElementById('main')!.innerHTML = sections.map((s) => s.render(c)).join('');
}

/** P5: everything scroll-driven is built only after the preloader has finished, in page order. */
function animate() {
  const mm = gsap.matchMedia();
  mm.add(conditions, (ctx) => {
    const cond = ctx.conditions as Conditions;
    const cleanups: (Cleanup | void)[] = [];
    if (!cond.reduceMotion) cleanups.push(startSmoothScroll());
    for (const s of sections) cleanups.push(s.animate?.(cond));
    cleanups.push(animateMenu(cond));
    cleanups.push(animateCounter(c.nav.map((n) => n.id), cond));
    if (cond.canHover && !cond.reduceMotion) {
      cleanups.push(animateCursor());
      cleanups.push(magnetic());
    }
    ScrollTrigger.refresh();
    return () => cleanups.forEach((fn) => fn?.());
  });
}

const pageLoaded = () =>
  new Promise<void>((resolve) => (document.readyState === 'complete' ? resolve() : addEventListener('load', () => resolve(), { once: true })));

async function boot() {
  // The intro always starts at the top; a restored mid-page position would sit under the curtain.
  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  render();
  initMonogram();
  initMenu();
  initClock(c.person.timeZone);
  for (const s of sections) s.init?.(c);

  const reduceMotion = matchMedia(conditions.reduceMotion).matches;
  const fonts = loadFonts();
  const ready = Promise.all([fonts, pageLoaded()]).then(() => prepareHero());

  await runPreloader(ready, heroIntro, reduceMotion);
  if (reduceMotion) gsap.set('#ui', { autoAlpha: 1 });
  document.documentElement.classList.remove('is-loading');
  document.documentElement.classList.add('is-ready');
  animate();
}

boot();
