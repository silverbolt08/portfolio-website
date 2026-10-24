import type { SiteContent } from '../types';
import { esc } from '../lib/html';
import { scroll } from '../lib/scroll';

/** Top-left "SS". Each letter is its own inline-block so the hero initials can land on it exactly. */
export const renderMonogram = (c: SiteContent): string =>
  `<a class="monogram" href="#hero" data-monogram><span class="sr-only">${esc(c.person.name)}, back to the top</span>${[
    ...c.person.monogram,
  ]
    .map((l) => `<span class="monogram__l" data-monogram-slot aria-hidden="true">${esc(l)}</span>`)
    .join('')}</a>`;

export function initMonogram(): void {
  document.querySelector('[data-monogram]')?.addEventListener('click', (e) => {
    e.preventDefault();
    scroll.to(0, { duration: 1.4 });
  });
}
