import { P, svg, label, rng, f } from './shared';

/** FDI network: directed, weighted flows between economies; hubs in gold. */
export function network(): string {
  const r = rng(170);
  const nodes = Array.from({ length: 38 }, (_, i) => {
    const a = (i / 38) * Math.PI * 2 + r() * 0.3;
    const rad = 220 + r() * 200;
    return { x: 800 + Math.cos(a) * rad * 1.5, y: 450 + Math.sin(a) * rad, hub: i % 9 === 0 };
  });
  let body = '';
  for (let i = 0; i < 90; i++) {
    const a = nodes[Math.floor(r() * nodes.length)];
    const b = nodes.filter((n) => n.hub)[Math.floor(r() * 5)] ?? nodes[0];
    if (a === b) continue;
    const mx = (a.x + b.x) / 2 + (r() - 0.5) * 160;
    const my = (a.y + b.y) / 2 + (r() - 0.5) * 160;
    body += `<path d="M${f(a.x)} ${f(a.y)} Q${f(mx)} ${f(my)} ${f(b.x)} ${f(b.y)}" fill="none" stroke="${b.hub ? P.gold : P.dim}" stroke-opacity="${b.hub ? 0.35 : 0.8}" stroke-width="${f(1 + r() * 3)}"/>`;
  }
  for (const n of nodes) body += `<circle cx="${f(n.x)}" cy="${f(n.y)}" r="${n.hub ? 18 : 6}" fill="${n.hub ? P.gold : P.bone}"/>`;
  return svg(body);
}

/** CV fire detector: a flame with a detection box. */
export function flame(): string {
  const body =
    `<path d="M800 760 C 640 760 560 650 590 520 C 615 410 700 360 690 230 C 780 290 820 370 810 450 C 860 410 880 350 870 300 C 980 400 1030 520 1000 620 C 975 710 900 760 800 760 Z" fill="${P.gold}"/>` +
    `<path d="M800 760 C 730 760 690 700 705 630 C 720 570 770 540 770 480 C 830 530 850 580 840 630 C 870 610 880 585 880 560 C 920 620 920 700 870 735 C 850 750 825 760 800 760 Z" fill="${P.bone}"/>` +
    `<path d="M520 200 h80 M520 200 v80 M1080 200 h-80 M1080 200 v80 M520 820 h80 M520 820 v-80 M1080 820 h-80 M1080 820 v-80" stroke="${P.bone}" stroke-width="5" fill="none"/>` +
    label(520, 180, 'fire', P.gold);
  return svg(body);
}

/** Angry Birds clone: slingshot, a dotted arc and a stack of blocks. */
export function slingshot(): string {
  let body = `<path d="M0 800 H1600" stroke="${P.dim}" stroke-width="4"/>`;
  body += `<path d="M330 800 V610 M330 610 L290 520 M330 610 L370 520" stroke="${P.bone}" stroke-width="16" stroke-linecap="round" fill="none"/>`;
  let arc = '';
  for (let i = 1; i < 22; i++) {
    const t = i / 22;
    arc += `<circle cx="${f(370 + t * 860)}" cy="${f(520 - Math.sin(t * Math.PI) * 330 + t * 120)}" r="5" fill="${P.grey}"/>`;
  }
  body += arc;
  body += `<circle cx="370" cy="520" r="30" fill="${P.gold}"/>`;
  const blocks = [
    [1180, 700, 60, 100], [1300, 700, 60, 100], [1180, 670, 180, 30], [1210, 570, 50, 100], [1290, 570, 50, 100], [1200, 540, 150, 30],
  ];
  for (const [x, y, w, h] of blocks) body += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${P.faint}" stroke="${P.bone}" stroke-width="3"/>`;
  body += `<circle cx="1270" cy="645" r="22" fill="${P.grey}"/>`;
  return svg(body);
}
