import { P, svg, label, rng, gauss, f } from './shared';

/** scRNA-seq: a UMAP-like embedding of single cells in clusters, one cell type picked out in gold. */
export function cells(): string {
  const r = rng(23);
  const clusters = [
    { x: 380, y: 300, s: 70, n: 140, c: P.grey, name: 'chondrocytes' },
    { x: 560, y: 560, s: 90, n: 170, c: P.bone, name: '' },
    { x: 820, y: 260, s: 60, n: 110, c: P.gold, name: 'microglia' },
    { x: 1000, y: 520, s: 100, n: 180, c: P.grey, name: '' },
    { x: 1250, y: 300, s: 65, n: 120, c: P.bone, name: 'podocytes' },
    { x: 1260, y: 680, s: 55, n: 90, c: P.dim, name: '' },
    { x: 760, y: 760, s: 50, n: 80, c: P.dim, name: '' },
  ];
  let body = '';
  for (const k of clusters) {
    const stretch = 0.6 + r() * 0.8;
    const rot = r() * Math.PI;
    for (let i = 0; i < k.n; i++) {
      const u = gauss(r) * k.s * 1.4;
      const v = gauss(r) * k.s * stretch;
      const x = k.x + u * Math.cos(rot) - v * Math.sin(rot);
      const y = k.y + u * Math.sin(rot) + v * Math.cos(rot);
      body += `<circle cx="${f(x)}" cy="${f(y)}" r="4" fill="${k.c}" fill-opacity="${k.c === P.gold ? 0.95 : 0.7}"/>`;
    }
    if (k.name) body += label(k.x + k.s * 1.6, k.y - k.s * 1.2, k.name, k.c === P.gold ? P.gold : P.grey);
  }
  body += label(110, 840, 'UMAP 1') + label(70, 110, 'UMAP 2');
  return svg(body);
}
