import type { SectionId } from '../types';
import type { Section } from './section';
import { esc } from '../lib/html';

/** Temporary tall section used until the phase that builds it replaces it. */
export const stub = (id: SectionId, title: string, extra = ''): Section => ({
  id,
  render: () => `<section id="${id}" class="section stub" tabindex="-1" aria-labelledby="${id}-title">
    <h2 id="${id}-title" class="stub__title">${esc(title)}</h2>${extra}
  </section>`,
});
