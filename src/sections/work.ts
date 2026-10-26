import './work.css';
import type { Project, SiteContent } from '../types';
import type { Section } from './section';
import type { Conditions } from '../lib/media';
import { gsap, SplitText } from '../lib/gsap';
import { esc } from '../lib/html';
import { renderMedia } from '../lib/render-media';
import { scroll } from '../lib/scroll';
import { initCase, openCase, setCaseMotion, hashId } from './case-study';

const card = (p: Project) => `
  <li class="card" id="card-${esc(p.id)}">
    <article class="card__inner" aria-labelledby="card-${esc(p.id)}-title">
      <div class="card__top">
        <span class="card__mask" aria-hidden="true"><span class="card__index">${esc(p.index)}</span></span>
        <p class="card__year">${esc(p.year)}</p>
      </div>
      <div class="card__body">
        <h3 class="card__title" id="card-${esc(p.id)}-title">
          <a class="card__link" href="#work/${esc(p.id)}" data-open="${esc(p.id)}" data-cursor="VIEW">${esc(p.title)}</a>
        </h3>
        <p class="card__outcome">${esc(p.outcome)}</p>
        <ul class="card__tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>
      <div class="card__visual">${renderMedia(p.visual)}</div>
      <div class="card__dim" aria-hidden="true"></div>
    </article>
  </li>`;

export const work: Section = {
  id: 'work',

  render: (c: SiteContent) => `
    <section id="work" class="work" tabindex="-1" aria-labelledby="work-title">
      <header class="work__head">
        <h2 id="work-title" class="work__title">${esc(c.work.heading)}</h2>
        <p class="work__intro">${esc(c.work.intro)}</p>
      </header>
      <ol class="work__stack">${c.work.projects.map(card).join('')}</ol>
    </section>`,

  init(c: SiteContent) {
    initCase(c);
    document.getElementById('work')!.addEventListener('click', (e) => {
      const link = (e.target as Element).closest<HTMLAnchorElement>('[data-open]');
      if (!link) return;
      e.preventDefault();
      openCase(link.dataset.open!, link.closest('.card'));
    });
  },

  animate(cond: Conditions) {
    setCaseMotion(cond.reduceMotion);
    const section = document.getElementById('work')!;
    const stack = section.querySelector<HTMLElement>('.work__stack')!;
    const cards = gsap.utils.toArray<HTMLElement>('.card', section);
    const head = section.querySelectorAll('.work__title, .work__intro');

    if (cond.reduceMotion) {
      gsap.from([...head, ...cards], {
        autoAlpha: 0,
        duration: 0.6,
        ease: 'none',
        stagger: 0.05,
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      });
      return;
    }

    gsap.from(head, { y: 32, autoAlpha: 0, duration: 1.1, stagger: 0.08, scrollTrigger: { trigger: section, start: 'top 75%', once: true } });

    // Cards are sticky, so they're measured by their place in the stack (a stuck card's own rect moves with it).
    const h = () => cards[0].offsetHeight;
    const splits: SplitText[] = [];

    cards.forEach((el, i) => {
      const inner = el.querySelector('.card__inner')!;

      // W1: as the next card covers this one, this one recedes to 0.92 and dims
      if (i < cards.length - 1) {
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              id: `work-${i}`,
              trigger: stack,
              start: () => `top+=${(i + 1) * h()} bottom`,
              end: () => `top+=${(i + 1) * h()} top`,
              scrub: 0.6,
            },
          })
          .to(inner, { scale: 0.92 }, 0)
          .to(el.querySelector('.card__dim'), { opacity: 0.65 }, 0);
      }

      // W2: index and title rise from their masks, then the rest
      const title = el.querySelector<HTMLElement>('.card__link')!;
      const split = SplitText.create(title, { type: 'lines', mask: 'lines', aria: 'auto' });
      splits.push(split);
      gsap
        .timeline({
          scrollTrigger: {
            id: `work-in-${i}`,
            trigger: stack,
            start: () => `top+=${i * h()} 60%`,
            toggleActions: 'play none none reverse',
          },
        })
        .fromTo(el.querySelector('.card__index'), { yPercent: 105 }, { yPercent: 0, duration: 1.2 })
        .fromTo(split.lines, { yPercent: 105 }, { yPercent: 0, duration: 1.1, stagger: 0.08 }, '<0.1')
        .fromTo(el.querySelectorAll('.card__outcome, .card__tags, .card__year'), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.08 }, '<0.2')
        .fromTo(el.querySelector('.card__visual'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'wipe' }, 0.1);
    });

    return () => splits.forEach((s) => s.revert());
  },
};

/** Opens a case study named in the URL (#work/<id>) once the page is ready. */
export function openFromHash(): void {
  const id = hashId();
  if (!id) return;
  const el = document.getElementById(`card-${id}`);
  if (!el) return;
  // Land on the card first, so the overlay grows from it and closing returns to it.
  scroll.to(el, { immediate: true });
  requestAnimationFrame(() => openCase(id, el, { push: false }));
}
