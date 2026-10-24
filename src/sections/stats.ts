import './stats.css';
import type { SiteContent, Stat } from '../types';
import type { Section } from './section';
import type { Conditions } from '../lib/media';
import { gsap } from '../lib/gsap';
import { esc } from '../lib/html';

const format = (s: Stat, v: number) => v.toFixed(s.decimals);

let items: Stat[] = [];

export const stats: Section = {
  id: 'stats',

  render: (c: SiteContent) => {
    items = c.stats.items;
    return `
    <section id="stats" class="stats" tabindex="-1" aria-labelledby="stats-title">
      <h2 id="stats-title" class="sr-only">${esc(c.stats.heading)}</h2>
      <ul class="stats__list">${items
        .map(
          (s) => `<li class="stat">
            <span class="sr-only">${esc(`${s.prefix ?? ''}${format(s, s.value)}${s.suffix} ${s.label}`)}</span>
            <div class="stat__visual" aria-hidden="true">
              <div class="stat__mask">
                <p class="stat__num">
                  <span class="stat__digits">${esc(format(s, s.value))}</span><span class="stat__suffix">${esc(s.suffix)}</span>
                  <span class="stat__flash"><span class="stat__digits">${esc(format(s, s.value))}</span><span class="stat__suffix">${esc(s.suffix)}</span></span>
                </p>
              </div>
              <div class="stat__mask stat__mask--label"><p class="stat__label">${esc(s.label)}</p></div>
            </div>
          </li>`,
        )
        .join('')}</ul>
      <ol class="stats__ticks" aria-hidden="true">${items.map(() => '<li><span></span></li>').join('')}</ol>
    </section>`;
  },

  animate(cond: Conditions) {
    const section = document.getElementById('stats')!;
    const stats = gsap.utils.toArray<HTMLElement>('.stat', section);
    const ticks = gsap.utils.toArray<HTMLElement>('.stats__ticks span', section);

    if (cond.reduceMotion) {
      gsap.from(stats, {
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      });
      return;
    }

    section.classList.add('is-staged');
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'stats',
        trigger: section,
        start: 'top top',
        end: cond.isMobile ? '+=200%' : '+=320%',
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    stats.forEach((el, i) => {
      const s = items[i];
      const num = el.querySelector<HTMLElement>('.stat__num')!;
      const digits = el.querySelectorAll<HTMLElement>('.stat__digits');
      const flash = el.querySelector<HTMLElement>('.stat__flash')!;
      const label = el.querySelector<HTMLElement>('.stat__label')!;
      const proxy = { v: 0 };
      const write = () => digits.forEach((d) => (d.textContent = format(s, proxy.v)));
      const at = `beat${i + 1}`;
      tl.addLabel(at, i);

      // S1: the previous stat leaves as this one arrives
      if (i > 0) {
        const prev = stats[i - 1];
        tl.to(prev.querySelectorAll('.stat__num, .stat__label'), { yPercent: -125, duration: 0.25, ease: 'power2.in' }, at);
      }
      // The first stat is already on stage (at zero) when the section arrives; the others rise in.
      if (i > 0) tl.fromTo(num, { yPercent: 125 }, { yPercent: 0, duration: 0.3, ease: 'power3.out' }, `${at}+=0.15`);
      // S2: count up
      tl.fromTo(proxy, { v: 0 }, { v: s.value, duration: 0.4, ease: 'power2.out', onUpdate: write }, i > 0 ? '<' : at)
        // S3 + S4: land with a small overshoot and a gold flash
        .fromTo(num, { scale: 1 }, { keyframes: [{ scale: 1.07, duration: 0.05 }, { scale: 1, duration: 0.15, ease: 'power3.out' }] }, '>-0.05')
        .fromTo(flash, { opacity: 0 }, { keyframes: [{ opacity: 1, duration: 0.04 }, { opacity: 0, duration: 0.2 }] }, '<')
        .fromTo(ticks[i], { scaleX: 0 }, { scaleX: 1, duration: 1 }, at);
      // S5: the label rises
      if (i > 0) tl.fromTo(label, { yPercent: 125 }, { yPercent: 0, duration: 0.25, ease: 'power3.out' }, `${at}+=0.3`);
      write();
    });
    // hold the last stat for a beat before the pin releases
    tl.to({}, { duration: 0.35 });

    return () => section.classList.remove('is-staged');
  },
};
