import { P, svg, label, rng, gauss, f } from './shared';

const OUTLINE =
  'M330 560 C 280 430 330 280 470 205 C 600 135 790 120 950 150 C 1110 180 1250 265 1300 400 C 1335 495 1310 585 1240 630 C 1270 690 1230 760 1150 770 C 1060 780 1010 740 990 700 C 930 715 870 712 820 700 L 800 820 L 735 820 L 745 690 C 640 690 520 690 430 660 C 380 640 345 610 330 560 Z';

const SULCI = [
  'M520 230 C 560 300 540 380 600 430',
  'M700 175 C 690 260 760 300 740 380',
  'M880 165 C 860 250 930 290 900 380 C 880 440 940 480 920 540',
  'M1060 210 C 1030 290 1100 330 1060 410',
  'M1190 300 C 1140 360 1200 420 1150 480',
  'M430 420 C 520 430 600 500 700 480 C 800 460 860 520 960 520 C 1050 520 1100 560 1180 560',
  'M1000 700 C 1060 680 1110 700 1160 730',
  'M1020 660 C 1090 640 1150 660 1210 690',
];

/** Brain map: affected cells plotted (gold up, grey down); three regions glow where most of them are. */
export function brain(): string {
  const r = rng(4);
  const regions = [
    { x: 600, y: 330, rx: 120, n: 70 },
    { x: 960, y: 300, rx: 140, n: 90 },
    { x: 1110, y: 690, rx: 70, n: 40 },
  ];
  let defs = `<clipPath id="brain-clip"><path d="${OUTLINE}"/></clipPath>`;
  defs += `<radialGradient id="brain-glow"><stop offset="0" stop-color="${P.gold}" stop-opacity="0.55"/><stop offset="1" stop-color="${P.gold}" stop-opacity="0"/></radialGradient>`;
  let body = `<path d="${OUTLINE}" fill="${P.faint}"/>`;
  body += `<g clip-path="url(#brain-clip)">`;
  for (const g of regions) body += `<ellipse cx="${g.x}" cy="${g.y}" rx="${g.rx * 1.9}" ry="${g.rx * 1.5}" fill="url(#brain-glow)"/>`;
  // background cells
  for (let i = 0; i < 260; i++) {
    const x = 340 + r() * 960;
    const y = 140 + r() * 640;
    body += `<circle cx="${f(x)}" cy="${f(y)}" r="2.2" fill="${P.dim}"/>`;
  }
  // affected cells, concentrated in the regions
  for (const g of regions) {
    for (let i = 0; i < g.n; i++) {
      const up = r() > 0.38;
      body += `<circle cx="${f(g.x + gauss(r) * g.rx)}" cy="${f(g.y + gauss(r) * g.rx * 0.75)}" r="${up ? 3.6 : 3}" fill="${up ? P.gold : P.grey}"/>`;
    }
  }
  body += `</g>`;
  for (const s of SULCI) body += `<path d="${s}" fill="none" stroke="${P.dim}" stroke-width="3" stroke-linecap="round"/>`;
  body += `<path d="${OUTLINE}" fill="none" stroke="${P.bone}" stroke-width="2.5"/>`;
  body += `<circle cx="1360" cy="120" r="5" fill="${P.gold}"/>` + label(1376, 127, 'up-regulated');
  body += `<circle cx="1360" cy="160" r="5" fill="${P.grey}"/>` + label(1376, 167, 'down-regulated');
  return svg(body, defs);
}
