import { P, svg, label, f } from './shared';

/** An RNA aptamer hairpin: a paired stem, a gold binding loop, and the 5' and 3' tails. */
export function aptamer(): string {
  const stem = ['GC', 'CG', 'AU', 'GC', 'UA', 'CG', 'GC', 'AU', 'CG'];
  const loop = 'GGAUACUC';
  const cx = 800;
  const left = cx - 46;
  const right = cx + 46;
  const step = 58;
  const base = 760;
  let body = '';
  const nt = (x: number, y: number, ch: string, gold = false) =>
    `<circle cx="${f(x)}" cy="${f(y)}" r="21" fill="${gold ? P.gold : P.faint}" stroke="${gold ? P.gold : P.bone}" stroke-width="2"/>` +
    `<text x="${f(x)}" y="${f(y + 6)}" text-anchor="middle" class="motif-nt" fill="${gold ? '#0A0A0A' : P.bone}">${ch}</text>`;

  // backbone
  const topY = base - (stem.length - 1) * step;
  body += `<path d="M${left} ${base + 150} L${left} ${topY}" stroke="${P.dim}" stroke-width="3"/>`;
  body += `<path d="M${right} ${topY} L${right} ${base + 150}" stroke="${P.dim}" stroke-width="3"/>`;
  // base pairs
  stem.forEach((pair, i) => {
    const y = base - i * step;
    body += `<path d="M${left + 21} ${y} L${right - 21} ${y}" stroke="${P.grey}" stroke-width="2" stroke-dasharray="4 5"/>`;
    body += nt(left, y, pair[0]) + nt(right, y, pair[1]);
  });
  // loop: a circle of unpaired bases above the stem
  const lr = 118;
  const lcy = topY - lr + 14;
  body += `<circle cx="${cx}" cy="${lcy}" r="${lr}" fill="none" stroke="${P.dim}" stroke-width="3"/>`;
  [...loop].forEach((ch, i) => {
    const a = Math.PI * 0.62 + (i / (loop.length - 1)) * Math.PI * 1.76;
    body += nt(cx + Math.cos(a) * lr, lcy + Math.sin(a) * lr, ch, true);
  });
  // tails
  body += nt(left - 70, base + 110, 'A') + nt(left - 130, base + 60, 'G');
  body += nt(right + 70, base + 110, 'U') + nt(right + 130, base + 60, 'C');
  body += label(left - 190, base + 70, "5′", P.grey, 'end') + label(right + 190, base + 70, "3′");
  body += label(cx + lr + 60, lcy, 'binding loop', P.gold);
  body += label(right + 80, base - 4 * step, 'stem');
  return svg(body);
}
