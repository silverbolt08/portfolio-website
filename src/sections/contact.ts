import './contact.css';
import type { SiteContent } from '../types';
import type { Section } from './section';
import type { Cleanup, Conditions } from '../lib/media';
import { gsap, ScrollTrigger, SplitText } from '../lib/gsap';
import { esc, linkAttrs } from '../lib/html';
import { announce } from '../lib/a11y';
import { scroll } from '../lib/scroll';
import { createLoop } from '../lib/loop';
import { onVelocity } from '../lib/velocity';

let email = '';
let reduceMotion = false;
let canBlur = false;

async function copyEmail(button: HTMLElement) {
  const label = button.querySelector<HTMLElement>('.contact__email-text')!;
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    // No clipboard access (insecure context or denied): fall back to the mail app.
    location.href = `mailto:${email}`;
    return;
  }
  announce(`Email address copied: ${email}`);
  gsap.killTweensOf(label);
  if (reduceMotion) {
    label.textContent = 'Copied to clipboard';
    gsap.delayedCall(1.6, () => (label.textContent = email));
    return;
  }
  gsap
    .timeline()
    .to(label, { duration: 0.5, scrambleText: { text: 'Copied to clipboard', chars: 'lowerCase', speed: 0.8 } })
    .to(label, { duration: 0.7, scrambleText: { text: email, chars: 'lowerCase', speed: 0.6 } }, '+=1.2');
}

/** C4: rewind to the top quickly; sections blur with the speed of the rewind (the one filter exception, desktop only). */
function backToTop() {
  const hero = document.getElementById('hero');
  const done = () => hero?.focus({ preventScroll: true });
  if (reduceMotion || !scroll.smooth) {
    scroll.to(0, { immediate: true });
    done();
    return;
  }
  const sections = gsap.utils.toArray<HTMLElement>('main > section, #site-footer');
  let off: (() => void) | null = null;
  if (canBlur) {
    off = onVelocity((v) => {
      const blur = gsap.utils.clamp(0, 10, Math.abs(v) / 900);
      const value = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : '';
      for (const s of sections) if (s.style.filter !== value) s.style.filter = value;
    });
  }
  scroll.to(0, {
    duration: 1.6,
    onComplete: () => {
      off?.();
      sections.forEach((s) => (s.style.filter = ''));
      done();
    },
  });
}

export const contact: Section = {
  id: 'contact',

  render: (c: SiteContent) => {
    email = c.contact.email;
    const links = [c.contact.github, c.contact.linkedin, c.contact.resume];
    return `
    <section id="contact" class="contact" tabindex="-1" aria-labelledby="contact-title">
      <h2 id="contact-title" class="contact__headline">${c.contactSection.headline.map((l) => esc(l)).join('<br>')}</h2>
      <div class="contact__body">
        <p class="contact__intro">${esc(c.contactSection.intro)}</p>
        <div class="contact__actions">
          <button class="contact__email" type="button" data-copy data-cursor="COPY" data-magnetic aria-describedby="contact-email-hint">
            <span class="contact__email-inner" data-magnetic-inner><span class="contact__email-text">${esc(email)}</span></span>
          </button>
          <p class="contact__hint" id="contact-email-hint">Copies the address. Or <a href="mailto:${esc(email)}">open your mail app</a>.</p>
        </div>
        <ul class="contact__links">${links.map((l) => `<li><a ${linkAttrs(l.href, l.external)}>${esc(l.label)}</a></li>`).join('')}</ul>
      </div>
    </section>`;
  },

  init() {
    document.querySelector('[data-copy]')?.addEventListener('click', (e) => copyEmail(e.currentTarget as HTMLElement));
    document.querySelector('[data-top]')?.addEventListener('click', backToTop);
  },

  animate(cond: Conditions) {
    reduceMotion = cond.reduceMotion;
    canBlur = cond.isDesktop;
    const section = document.getElementById('contact')!;
    const footer = document.getElementById('site-footer')!;
    const cleanups: Cleanup[] = [];

    if (cond.reduceMotion) {
      gsap.from(section.querySelectorAll('.contact__headline, .contact__body'), {
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      });
      return;
    }

    // C1: "LET'S BUILD SOMETHING" rises line by line. The text stays visible at rest; its hidden starting state is
    // set only when the section's top reaches the bottom of the screen, while the headline is still below the fold.
    const split = SplitText.create(section.querySelector('.contact__headline'), { type: 'lines', mask: 'lines', aria: 'auto' });
    const body = section.querySelectorAll('.contact__body > *');
    const reveal = gsap
      .timeline({ paused: true })
      .to(split.lines, { yPercent: 0, duration: 1.2, stagger: 0.12 })
      .to(body, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, '-=0.7');
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      once: true,
      onEnter: () => {
        gsap.set(split.lines, { yPercent: 110 });
        gsap.set(body, { y: 28, opacity: 0 });
      },
    });
    ScrollTrigger.create({ id: 'contact', trigger: section, start: 'top 70%', once: true, onEnter: () => reveal.play() });
    cleanups.push(() => split.revert());

    // C3: footer marquee
    const loop = createLoop([{ el: footer.querySelector<HTMLElement>('.footer__marquee')!, dir: 1 }], { speed: cond.isMobile ? 30 : 55, boost: 0.25, skew: 5 });
    ScrollTrigger.create({ id: 'footer', trigger: footer, start: 'top bottom', end: 'bottom top', onToggle: (self) => loop.setActive(self.isActive) });
    cleanups.push(() => loop.destroy());

    return () => cleanups.forEach((fn) => fn());
  },
};

export const renderFooter = (c: SiteContent): string => `
  <footer id="site-footer" class="footer">
    <div class="loop footer__marquee" aria-hidden="true">
      <div class="loop__track">
        <div class="loop__group">${c.contactSection.footerMarquee
          .map((t) => `<span class="loop__item">${esc(t)}</span><span class="loop__sep">×</span>`)
          .join('')}</div>
      </div>
    </div>
    <div class="footer__bar">
      <p>© ${new Date().getFullYear()} ${esc(c.person.name)}. ${esc(c.contactSection.credit)}</p>
      <button class="footer__top" type="button" data-top data-magnetic data-cursor=""><span data-magnetic-inner>Back to top</span></button>
    </div>
  </footer>`;
