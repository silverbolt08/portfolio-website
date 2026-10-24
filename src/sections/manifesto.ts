import './manifesto.css';
import type { SiteContent } from '../types';
import type { Section } from './section';
import type { Conditions } from '../lib/media';
import { gsap, ScrollTrigger, SplitText } from '../lib/gsap';
import { esc, srPair } from '../lib/html';

/** *word* → gold serif italic emphasis. */
const emphasize = (text: string) => esc(text).replace(/\*([^*]+)\*/g, '<em class="manifesto__em">$1</em>');
const plain = (text: string) => text.replace(/\*/g, '');

export const manifesto: Section = {
  id: 'manifesto',

  render: (c: SiteContent) => `
    <section id="manifesto" class="manifesto" tabindex="-1" aria-labelledby="manifesto-title">
      <h2 id="manifesto-title" class="sr-only">${esc(c.manifesto.heading)}</h2>
      <p class="manifesto__text">${srPair(plain(c.manifesto.text), emphasize(c.manifesto.text), 'manifesto__words')}</p>
    </section>`,

  animate(cond: Conditions) {
    const section = document.getElementById('manifesto')!;
    const text = section.querySelector<HTMLElement>('.manifesto__words')!;
    const split = SplitText.create(text, { type: 'words', aria: 'none' });

    if (cond.reduceMotion) {
      gsap.from(text, { autoAlpha: 0, duration: 0.6, ease: 'none', scrollTrigger: { trigger: section, start: 'top 80%', once: true } });
      return () => split.revert();
    }

    // M1: the section pins for its run; the words light up in reading order from the moment it arrives
    // until the pin releases, so the screen it enters on already holds the opening words.
    const pin = ScrollTrigger.create({
      id: 'manifesto',
      trigger: section,
      start: 'top top',
      end: cond.isMobile ? '+=90%' : '+=160%',
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });
    // An explicit starting state and a plain .to (no invalidateOnRefresh: a refresh would otherwise re-apply a
    // staggered fromTo's start to the first word only). The end is a function, so it is re-measured anyway.
    gsap.set(split.words, { opacity: 0.15 });
    gsap
      .timeline({
        scrollTrigger: {
          id: 'manifesto-words',
          trigger: section,
          start: 'top 55%',
          end: () => pin.end - window.innerHeight * 0.15,
          scrub: 0.6,
        },
      })
      .to(split.words, { opacity: 1, ease: 'none', duration: 0.3, stagger: 0.1 });

    return () => split.revert();
  },
};
