import './skills.css';
import type { SiteContent } from '../types';
import type { Section } from './section';
import type { Conditions } from '../lib/media';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { esc } from '../lib/html';
import { createLoop } from '../lib/loop';

const row = (items: string[], modifier: string) => `
  <div class="loop skills__row skills__row--${modifier}">
    <div class="loop__track">
      <div class="loop__group">${items
        .map((item) => `<span class="loop__item">${esc(item)}</span><span class="loop__sep">×</span>`)
        .join('')}</div>
    </div>
  </div>`;

export const skills: Section = {
  id: 'skills',

  render: (c: SiteContent) => `
    <section id="skills" class="skills" tabindex="-1" aria-labelledby="skills-title">
      <div class="skills__marquee" aria-hidden="true">
        ${row(c.skills.marqueeRows[0], 'outline')}
        ${row(c.skills.marqueeRows[1], 'fill')}
      </div>
      <div class="skills__index">
        <h2 id="skills-title" class="skills__title">${esc(c.skills.heading)}</h2>
        <dl class="skills__groups">${c.skills.groups
          .map(
            (g) => `<div class="skills__group">
              <dt>${esc(g.group)}</dt>
              <dd><ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></dd>
            </div>`,
          )
          .join('')}</dl>
      </div>
    </section>`,

  animate(cond: Conditions) {
    const section = document.getElementById('skills')!;
    const groups = gsap.utils.toArray<HTMLElement>('.skills__title, .skills__group', section);

    if (cond.reduceMotion) {
      gsap.from(groups, { autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: '.skills__index', start: 'top 85%', once: true } });
      return;
    }

    // K1 + K2: the two rows loop in opposite directions; scroll speed, direction and skew drive them
    const loop = createLoop(
      gsap.utils.toArray<HTMLElement>('.skills__row', section).map((el, i) => ({ el, dir: i === 0 ? 1 : -1 })),
      { speed: cond.isMobile ? 35 : 70, boost: 0.35, skew: 8 },
    );
    ScrollTrigger.create({
      id: 'skills',
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => loop.setActive(self.isActive),
    });

    gsap.from(groups, {
      y: 28,
      autoAlpha: 0,
      duration: 1,
      stagger: 0.07,
      scrollTrigger: { trigger: '.skills__index', start: 'top 85%', once: true },
    });

    return () => loop.destroy();
  },
};
