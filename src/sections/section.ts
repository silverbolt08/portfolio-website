import type { SectionId, SiteContent } from '../types';
import type { Cleanup, Conditions } from '../lib/media';

/**
 * Every section module renders its markup from content.ts and, once the preloader has finished,
 * builds its animations inside the single gsap.matchMedia() in main.ts (called in page order).
 */
export interface Section {
  id: SectionId;
  render(c: SiteContent): string;
  /** Runs once after the markup is in the document (event wiring that does not depend on media). */
  init?(c: SiteContent): void;
  animate?(conditions: Conditions): Cleanup | void;
}
