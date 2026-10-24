import { P, svg, label, f, rng } from './shared';

/** Electricity bill spike: 15-minute interval load above a five-way cost-variance waterfall. */
export function telemetry(): string {
  const r = rng(15);
  let body = '';
  // 7 days × 96 intervals of load, with a spike on day 5
  const n = 7 * 96;
  const x0 = 110;
  const w = 1380;
  let d = '';
  for (let i = 0; i < n; i++) {
    const hour = (i % 96) / 4;
    const day = Math.floor(i / 96);
    const base = 0.35 + 0.3 * Math.max(0, Math.sin(((hour - 6) / 24) * Math.PI * 2));
    const spike = day === 4 && hour > 9 && hour < 19 ? 0.28 : 0;
    const v = base + spike + (r() - 0.5) * 0.08;
    d += `${i ? 'L' : 'M'}${f(x0 + (i / (n - 1)) * w)} ${f(400 - v * 300)}`;
  }
  body += `<rect x="${f(x0 + (4 / 7) * w)}" y="70" width="${f(w / 7)}" height="350" fill="${P.faint}"/>`;
  body += `<path d="${d}" fill="none" stroke="${P.bone}" stroke-width="1.6"/>`;
  body += label(x0, 60, '15-min interval load, 7 days');
  body += label(x0 + (4 / 7) * w + 16, 100, 'spike', P.gold);

  // waterfall: last month → tariff, volume, mix, weather, waste → this month
  const steps = [
    { k: 'last month', v: 100, total: true },
    { k: 'tariff', v: 9 },
    { k: 'volume', v: 14 },
    { k: 'mix', v: -4 },
    { k: 'weather', v: 6 },
    { k: 'waste', v: 11 },
    { k: 'this month', v: 136, total: true },
  ];
  const by = 840;
  const scale = 2.2;
  const bw = 150;
  const gap = (w - bw * steps.length) / (steps.length - 1);
  let run = 0;
  steps.forEach((s, i) => {
    const x = x0 + i * (bw + gap);
    let top: number;
    let h: number;
    let fill: string;
    if (s.total) {
      top = by - s.v * scale;
      h = s.v * scale;
      fill = P.grey;
      run = s.v;
    } else {
      const from = run;
      run += s.v;
      top = by - Math.max(from, run) * scale;
      h = Math.abs(s.v) * scale;
      fill = s.v > 0 ? P.gold : P.dim;
    }
    body += `<rect x="${f(x)}" y="${f(top)}" width="${bw}" height="${f(h)}" fill="${fill}"/>`;
    body += label(x + bw / 2, by + 36, s.k, P.grey, 'middle');
  });
  return svg(body);
}
