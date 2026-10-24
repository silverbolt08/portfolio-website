import './experience.css';
import type { ExperienceEntry, SiteContent } from '../types';
import type { Section } from './section';
import type { Conditions } from '../lib/media';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { esc } from '../lib/html';
import { setUiTheme } from '../lib/theme';

const panel = (e: ExperienceEntry) => `
  <article class="exp__panel" aria-labelledby="exp-${esc(e.id)}">
    <p class="exp__year" aria-hidden="true">${esc(e.year)}</p>
    <div class="exp__info">
      <p class="exp__period">${esc(e.period)}${e.place ? `, ${esc(e.place)}` : ''}</p>
      <h3 class="exp__org" id="exp-${esc(e.id)}">${esc(e.org)}</h3>
      <p class="exp__role">${esc(e.role)}${e.supervisor ? `, with ${esc(e.supervisor)}` : ''}</p>
      <p class="exp__summary">${esc(e.summary)}</p>
      <ul class="exp__metrics">${e.metrics
        .map((m) => `<li class="exp__metric"><span class="exp__figure">${esc(m.figure)}</span><span class="exp__text">${esc(m.text)}</span></li>`)
        .join('')}</ul>
    </div>
  </article>`;

export const experience: Section = {
  id: 'experience',

  render: (c: SiteContent) => `
    <section id="experience" class="exp" tabindex="-1" aria-labelledby="exp-title">
      <div class="exp__wipe" aria-hidden="true"></div>
      <h2 id="exp-title" class="exp__title">${esc(c.experience.heading)}</h2>
      <div class="exp__track">
        ${c.experience.entries.map(panel).join('')}
        <article class="exp__panel exp__panel--awards" aria-labelledby="exp-awards">
          <h3 class="exp__awards-title" id="exp-awards">${esc(c.experience.achievementsHeading)}</h3>
          <ul class="exp__awards">${c.experience.achievements
            .map(
              (a) => `<li class="exp__award"><span class="exp__award-title">${esc(a.title)}</span><span class="exp__award-detail">${esc(
                [a.detail, a.year].filter(Boolean).join(', '),
              )}</span></li>`,
            )
            .join('')}</ul>
        </article>
      </div>
    </section>`,

  animate(cond: Conditions) {
    const section = document.getElementById('experience')!;
    const wipe = section.querySelector<HTMLElement>('.exp__wipe')!;
    const track = section.querySelector<HTMLElement>('.exp__track')!;
    const panels = gsap.utils.toArray<HTMLElement>('.exp__panel', section);

    // U9: the UI turns ink-on-bone once the bone field covers the screen
    ScrollTrigger.create({
      id: 'exp-theme',
      trigger: section,
      start: 'top top+=1', // 1px early, so landing exactly on the pin start counts as entered
      onEnter: () => setUiTheme('bone'),
      onLeaveBack: () => setUiTheme('ink'),
    });

    if (cond.reduceMotion) {
      section.classList.add('is-static');
      gsap.from(panels, { autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: section, start: 'top 75%', once: true } });
      return () => section.classList.remove('is-static');
    }

    // E1: a circle of bone opens from the middle as the section arrives; ink text appears where it passes
    // On a phone the section is many screens tall, so the circle opens from its top edge instead of its middle.
    const origin = cond.isMobile ? '50% 0%' : '50% 50%';
    gsap.fromTo(
      wipe,
      { clipPath: `circle(0% at ${origin})` },
      {
        clipPath: `circle(${cond.isMobile ? 150 : 72}% at ${origin})`,
        ease: 'none',
        scrollTrigger: { id: 'exp-wipe', trigger: section, start: 'top 75%', end: 'top top', scrub: 0.8, invalidateOnRefresh: true },
      },
    );

    if (cond.isMobile) {
      // Mobile: panels stack vertically; each rises in once
      ScrollTrigger.batch(panels, {
        start: 'top 80%',
        once: true,
        onEnter: (els) =>
          gsap.from(
            els.flatMap((el) => [...el.querySelectorAll('.exp__year, .exp__info > *, .exp__award')]),
            { y: 28, autoAlpha: 0, duration: 1, stagger: 0.06 },
          ),
      });
      return;
    }

    // E2: one pinned timeline moves the track sideways (ease none, so scroll and position stay 1:1)
    const distance = () => track.scrollWidth - window.innerWidth;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'experience',
        trigger: section,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    tl.to(track, { x: () => -distance(), duration: 1 }, 0);

    // E3: each later panel's year draws in and its lines rise as it arrives (positions from its place in the track)
    const d = distance();
    panels.forEach((p, i) => {
      if (i === 0) return;
      const at = gsap.utils.clamp(0, 0.95, (p.offsetLeft - window.innerWidth * 0.75) / d);
      const year = p.querySelector('.exp__year');
      if (year) tl.fromTo(year, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.18, ease: 'power2.out' }, at);
      tl.fromTo(
        p.querySelectorAll('.exp__info > *, .exp__awards-title, .exp__award'),
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.12, stagger: 0.015, ease: 'power3.out' },
        at + 0.04,
      );
    });
  },
};
