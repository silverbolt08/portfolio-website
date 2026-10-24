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
      <h3 class="exp__org" id="exp-${esc(e.id)}">${esc(e.org)}</h3>
      <p class="exp__period">${esc(e.period)}${e.place ? `, ${esc(e.place)}` : ''}</p>
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

    // U9: the UI is ink-on-bone while the bone field covers the screen (from the pin start until the exit wipe is
    // more than half closed). 1px early, so landing exactly on the pin start counts as inside.
    const theme = (end: ScrollTrigger.Vars['end']) =>
      ScrollTrigger.create({
        id: 'exp-theme',
        trigger: section,
        start: 'top top+=1',
        end,
        onToggle: (self) => setUiTheme(self.isActive ? 'bone' : 'ink'),
      });

    if (cond.reduceMotion) {
      section.classList.add('is-static');
      theme('bottom 40%');
      gsap.from(panels, { autoAlpha: 0, duration: 0.6, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: section, start: 'top 75%', once: true } });
      return () => section.classList.remove('is-static');
    }

    // E1: a circle of bone opens as the section arrives. At rest the section is its finished self (bone field, ink
    // text), so it reads correctly without scrolling; the closed starting state is set only once the section's top
    // comes up from below the fold, out of sight.
    const origin = cond.isMobile ? '50% 0%' : '50% 50%';
    const closed = `circle(0% at ${origin})`;
    const entry = gsap.fromTo(
      wipe,
      { clipPath: closed },
      {
        clipPath: `circle(${cond.isMobile ? 150 : 72}% at ${origin})`,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { id: 'exp-wipe', trigger: section, start: 'top 75%', end: 'top top', scrub: 0.8, invalidateOnRefresh: true },
      },
    );
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      onEnter: () => {
        if (entry.progress() === 0) gsap.set(wipe, { clipPath: closed });
      },
    });

    // N1: the wipe back to ink. As the act leaves, its bone circle closes and the ink page shows through.
    const exitWipe = (scrollTrigger: ScrollTrigger.Vars, at: string, from: () => string) =>
      gsap.fromTo(
        wipe,
        { clipPath: () => `circle(${from()} at ${at})` },
        { clipPath: `circle(0px at ${at})`, ease: 'none', immediateRender: false, scrollTrigger: { id: 'exp-exit', scrub: 0.8, invalidateOnRefresh: true, ...scrollTrigger } },
      );

    if (cond.isMobile) {
      // Mobile: panels stack vertically; each rises in once. The exit circle closes on the section's bottom edge.
      ScrollTrigger.batch(panels, {
        start: 'top 80%',
        once: true,
        onEnter: (els) =>
          gsap.from(
            els.flatMap((el) => [...el.querySelectorAll('.exp__year, .exp__info > *, .exp__award')]),
            { y: 28, autoAlpha: 0, duration: 1, stagger: 0.06 },
          ),
      });
      exitWipe({ trigger: section, start: 'bottom bottom', end: 'bottom top' }, '50% 100%', () => `${Math.hypot(window.innerWidth / 2, window.innerHeight) * 1.05}px`);
      theme('bottom 40%');
      return;
    }

    // E2: one pinned timeline moves the track sideways (ease none, so scroll and position stay 1:1).
    // Every panel is sized in vw, so the travel is a constant share of the track: an xPercent that never needs
    // re-measuring (no invalidateOnRefresh, which would drop the staggered reveals' starting states). The pin
    // length is a function, so it is re-measured on every refresh.
    const distance = () => track.scrollWidth - window.innerWidth;
    const travel = -(1 - window.innerWidth / track.scrollWidth) * 100;
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
      },
    });
    tl.to(track, { xPercent: travel, duration: 1 }, 0);

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

    const pin = tl.scrollTrigger!;
    exitWipe({ trigger: section, start: () => pin.end, end: () => pin.end + window.innerHeight }, '50% 50%', () => '72%');
    theme(() => pin.end + window.innerHeight * 0.6);
  },
};
