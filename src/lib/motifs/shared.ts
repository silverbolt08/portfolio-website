/** Palette for the drawings (flat, in the site's own colours). */
export const P = {
  bone: '#EDE8DC',
  gold: '#D9B45A',
  grey: '#8E8A80',
  dim: '#3A3934',
  faint: '#262622',
};

/** Deterministic random numbers, so every drawing is the same on every visit. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Normal-ish sample (sum of uniforms). */
export const gauss = (r: () => number): number => (r() + r() + r() + r() - 2) / 2;

/** Every motif draws into a 1600×900 box and fits whole inside any aspect ratio (`meet`), on the media's own fill. */
export const svg = (body: string, defs = ''): string =>
  `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" focusable="false">${
    defs ? `<defs>${defs}</defs>` : ''
  }${body}</svg>`;

export const label = (x: number, y: number, text: string, fill = P.grey, anchor = 'start'): string =>
  `<text x="${x}" y="${y}" fill="${fill}" text-anchor="${anchor}" class="motif-label">${text}</text>`;

export const f = (n: number): string => n.toFixed(1);
