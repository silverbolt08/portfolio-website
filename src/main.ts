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

const c = content;

const sections: Section[] = [
  {
    id: 'hero',
    render: () => `<section id="hero" class="section stub" tabindex="-1" aria-labelledby="hero-title">
      <h1 id="hero-title" class="stub__hero">${c.person.first}<br>${c.person.last}</h1>
      <p class="stub__role">${c.person.role}</p>
    </section>`,
  },
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

async function boot() {
  render();
  initMonogram();
  initMenu();
  initClock(c.person.timeZone);
  for (const s of sections) s.init?.(c);
  await loadFonts();
  document.documentElement.classList.add('is-ready');
  animate();
}

boot();
