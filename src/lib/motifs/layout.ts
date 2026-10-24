import { P, svg, label, f, rng } from './shared';

/** Picasso: a dashboard assembled from 4 structural roles and 3 sizing tiers. */
export function layout(): string {
  const r = rng(7);
  const g = 24;
  const x0 = 120;
  const y0 = 110;
  const W = 1360;
  let body = '';
  const box = (x: number, y: number, w: number, h: number, role: string) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${P.faint}"/>` + label(x + 20, y + 36, role);

  // Role 1: KPI strip (small tier)
  const kw = (W - g * 3) / 4;
  for (let i = 0; i < 4; i++) {
    const x = x0 + i * (kw + g);
    body += box(x, y0, kw, 130, 'kpi');
    body += `<text x="${x + 20}" y="${y0 + 104}" class="motif-figure" fill="${P.bone}">${(r() * 90 + 10).toFixed(1)}</text>`;
  }
  // Role 2: primary chart (large tier) — a line chart
  const py = y0 + 130 + g;
  const pw = W * 0.64;
  body += box(x0, py, pw, 380, 'primary');
  let d = '';
  let v = 0.5;
  for (let i = 0; i <= 40; i++) {
    v = Math.min(0.92, Math.max(0.1, v + (r() - 0.45) * 0.12));
    d += `${i ? 'L' : 'M'}${f(x0 + 30 + (i / 40) * (pw - 60))} ${f(py + 350 - v * 280)}`;
  }
  body += `<path d="${d}" fill="none" stroke="${P.gold}" stroke-width="3"/>`;
  // Role 3: secondary charts (medium tier) — bars and a ring
  const sx = x0 + pw + g;
  const sw = W - pw - g;
  body += box(sx, py, sw, 178, 'secondary');
  for (let i = 0; i < 9; i++) {
    const h = 30 + r() * 90;
    body += `<rect x="${f(sx + 30 + i * ((sw - 60) / 9))}" y="${f(py + 160 - h)}" width="${f((sw - 60) / 9 - 10)}" height="${f(h)}" fill="${i === 5 ? P.gold : P.grey}"/>`;
  }
  body += box(sx, py + 178 + g, sw, 178, 'secondary');
  const cx = sx + sw / 2;
  const cy = py + 178 + g + 100;
  body += `<circle cx="${cx}" cy="${cy}" r="56" fill="none" stroke="${P.dim}" stroke-width="18"/>`;
  body += `<circle cx="${cx}" cy="${cy}" r="56" fill="none" stroke="${P.gold}" stroke-width="18" stroke-dasharray="230 400" transform="rotate(-90 ${cx} ${cy})"/>`;
  // Role 4: detail table
  const ty = py + 380 + g;
  body += box(x0, ty, W, 150, 'detail');
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 6; col++) {
      body += `<rect x="${x0 + 20 + col * 222}" y="${ty + 62 + row * 28}" width="${120 + r() * 70}" height="8" fill="${P.dim}"/>`;
    }
  }
  return svg(body);
}
