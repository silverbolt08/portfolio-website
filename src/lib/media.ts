/** Conditions for the single gsap.matchMedia() in main.ts. */
export const conditions = {
  isDesktop: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
  isMobile: '(max-width: 767.98px) and (prefers-reduced-motion: no-preference)',
  reduceMotion: '(prefers-reduced-motion: reduce)',
  canHover: '(hover: hover) and (pointer: fine)',
};

export type Conditions = Record<keyof typeof conditions, boolean>;

export type Cleanup = () => void;
