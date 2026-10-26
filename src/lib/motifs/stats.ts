import { P, rng, f } from './shared';

/**
 * Line drawings beside the four stats, each built from that stat's own numbers.
 * `.art-line` parts fade in and `.art-bit` parts pop in on the stat's beat (see sections/stats.ts).
 */
const W = 800;
const H = 520;

const art = (body: string): string =>
  `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" focusable="false">${body}</svg>`;

const text = (x: number, y: number, s: string, fill = P.grey, anchor = 'start', cls = 'art-line') =>
  `<text x="${f(x)}" y="${f(y)}" fill="${fill}" text-anchor="${anchor}" class="motif-label ${cls}">${s}</text>`;

/** 3.95M triples: medicines, phytochemicals, targets and diseases, with one triple chain picked out in gold. */
function graph(): string {
  const r = rng(395);
  const cols = [
    { x: 90, name: 'medicine', n: 5 },
    { x: 300, name: 'phytochemical', n: 7 },
    { x: 510, name: 'target', n: 6 },
    { x: 710, name: 'disease', n: 5 },
  ];
  const nodes = cols.map((c, ci) =>
    Array.from({ length: c.n }, (_, i) => ({
      x: c.x + (r() - 0.5) * 70,
      y: 110 + (i / (c.n - 1)) * 330 + (r() - 0.5) * 30,
      ci,
    })),
  );
  const chain = [nodes[0][2], nodes[1][3], nodes[2][2], nodes[3][1]];
  let edges = '';
  for (let ci = 0; ci < 3; ci++) {
    for (const a of nodes[ci]) {
      for (let k = 0; k < 2; k++) {
        const b = nodes[ci + 1][Math.floor(r() * nodes[ci + 1].length)];
        edges += `<path class="art-line" d="M${f(a.x)} ${f(a.y)} L${f(b.x)} ${f(b.y)}" stroke="${P.dim}" stroke-width="1.5"/>`;
      }
    }
  }
  // medicine → disease shortcuts (a different relation type)
  for (let k = 0; k < 4; k++) {
    const a = nodes[0][Math.floor(r() * 5)];
    const b = nodes[3][Math.floor(r() * 5)];
    edges += `<path class="art-line" d="M${f(a.x)} ${f(a.y)} Q 400 ${f(470 + r() * 30)} ${f(b.x)} ${f(b.y)}" stroke="${P.dim}" stroke-width="1.2" fill="none" stroke-dasharray="4 6"/>`;
  }
  for (let i = 0; i < chain.length - 1; i++) {
    edges += `<path class="art-line" d="M${f(chain[i].x)} ${f(chain[i].y)} L${f(chain[i + 1].x)} ${f(chain[i + 1].y)}" stroke="${P.gold}" stroke-width="2.5"/>`;
  }
  const shape = (n: { x: number; y: number; ci: number }) => {
    const on = chain.includes(n);
    const stroke = on ? P.gold : P.bone;
    switch (n.ci) {
      case 0:
        return `<circle class="art-bit" cx="${f(n.x)}" cy="${f(n.y)}" r="11" fill="${on ? P.gold : P.bone}"/>`;
      case 1:
        return `<circle class="art-bit" cx="${f(n.x)}" cy="${f(n.y)}" r="9" fill="#151513" stroke="${stroke}" stroke-width="2"/>`;
      case 2:
        return `<rect class="art-bit" x="${f(n.x - 8)}" y="${f(n.y - 8)}" width="16" height="16" fill="#151513" stroke="${stroke}" stroke-width="2"/>`;
      default:
        return `<circle class="art-bit" cx="${f(n.x)}" cy="${f(n.y)}" r="10" fill="${on ? P.gold : P.grey}"/>`;
    }
  };
  const labels = cols.map((c) => text(c.x, 60, c.name, P.grey, 'middle')).join('');
  return art(edges + nodes.flat().map(shape).join('') + labels + text(W / 2, 510, '10 relation types', P.gold, 'middle'));
}

/** 11 agents: brand analysis, three platform lanes of three, and the critic that sends drafts back. */
function agents(): string {
  const lanes = [150, 270, 390];
  const cols = [300, 420, 540];
  const brand = { x: 150, y: 270 };
  const critic = { x: 690, y: 270 };
  let lines = `<path class="art-line" d="M40 270 L${brand.x} ${brand.y}" stroke="${P.dim}" stroke-width="2"/>`;
  let bits = `<rect class="art-bit" x="16" y="248" width="44" height="44" fill="none" stroke="${P.grey}" stroke-width="2"/>`;
  for (const y of lanes) {
    lines += `<path class="art-line" d="M${brand.x} ${brand.y} C ${brand.x + 80} ${brand.y} ${cols[0] - 80} ${y} ${cols[0]} ${y} L ${cols[2]} ${y} C ${cols[2] + 80} ${y} ${critic.x - 80} ${critic.y} ${critic.x} ${critic.y}" stroke="${P.dim}" stroke-width="2" fill="none"/>`;
    for (const x of cols) bits += `<circle class="art-bit" cx="${x}" cy="${y}" r="17" fill="#151513" stroke="${P.bone}" stroke-width="2"/>`;
  }
  lines += `<path class="art-line" d="M${critic.x} ${critic.y - 44} C ${critic.x} 50 ${cols[2]} 50 ${cols[2]} ${lanes[0] - 26}" stroke="${P.gold}" stroke-width="2" fill="none" stroke-dasharray="6 9"/>`;
  bits += `<circle class="art-bit" cx="${brand.x}" cy="${brand.y}" r="22" fill="${P.bone}"/>`;
  bits += `<circle class="art-bit" cx="${critic.x}" cy="${critic.y}" r="30" fill="none" stroke="${P.gold}" stroke-width="3"/>`;
  bits += `<circle class="art-bit" cx="${critic.x}" cy="${critic.y}" r="18" fill="${P.gold}"/>`;
  const labels =
    text(cols[1], lanes[0] - 34, 'Instagram', P.grey, 'middle') +
    text(cols[1], lanes[1] - 34, 'LinkedIn', P.grey, 'middle') +
    text(cols[1], lanes[2] - 34, 'Twitter/X', P.grey, 'middle') +
    text(brand.x, brand.y + 56, 'brand', P.grey, 'middle') +
    text(critic.x, critic.y + 66, 'critic ≥ 8.0', P.gold, 'middle') +
    text((cols[2] + critic.x) / 2, 46, 'revise ≤ 3×', P.gold, 'middle');
  return art(lines + bits + labels);
}

/** Hits@10: RotatE 0.95 against TransE 0.86 on a 0–1 axis. */
function hits(): string {
  const x0 = 120;
  const x1 = 740;
  const at = (v: number) => x0 + v * (x1 - x0);
  let body = `<path class="art-line" d="M${x0} 380 H${x1}" stroke="${P.dim}" stroke-width="2"/>`;
  for (const v of [0, 0.25, 0.5, 0.75, 1]) {
    body += `<path class="art-line" d="M${f(at(v))} 380 V392" stroke="${P.dim}" stroke-width="2"/>`;
    body += text(at(v), 424, String(v), P.grey, 'middle');
  }
  body += `<path class="art-line" d="M${f(at(0.86))} 120 V380" stroke="${P.dim}" stroke-width="1.5" stroke-dasharray="4 6"/>`;
  const bar = (y: number, v: number, name: string, fill: string) =>
    `<rect class="art-bit art-bar" x="${x0}" y="${y}" width="${f(at(v) - x0)}" height="64" fill="${fill}"/>` +
    text(x0 - 16, y + 41, name, P.bone, 'end') +
    text(at(v) + 14, y + 41, v.toFixed(2), fill === P.gold ? P.gold : P.bone);
  body += bar(150, 0.95, 'RotatE', P.gold) + bar(260, 0.86, 'TransE', P.dim);
  body += text(x0, 90, 'Hits@10 on a 3.16M-triple training set', P.grey);
  body += text(at(0.905), 480, '+11% relative', P.gold, 'middle');
  return art(body);
}

/** 50K+ documents: a field of documents, the few that come back for a query lit in gold. */
function documents(): string {
  const r = rng(50);
  const cols = 12;
  const rows = 6;
  const w = 36;
  const h = 46;
  const gx = 14;
  const gy = 16;
  const x0 = 800 - cols * (w + gx) + gx - 20;
  const y0 = 70;
  const hits = new Set<number>();
  while (hits.size < 6) hits.add(Math.floor(r() * cols * rows));
  let tiles = '';
  for (let i = 0; i < cols * rows; i++) {
    const x = x0 + (i % cols) * (w + gx);
    const y = y0 + Math.floor(i / cols) * (h + gy);
    const on = hits.has(i);
    tiles += `<rect class="${on ? 'art-bit' : 'art-line'}" x="${x}" y="${y}" width="${w}" height="${h}" fill="${on ? P.gold : '#151513'}" stroke="${on ? P.gold : P.dim}" stroke-width="1.5"/>`;
  }
  const qy = y0 + (rows * (h + gy)) / 2 - 22;
  const query =
    `<rect class="art-bit" x="20" y="${qy}" width="110" height="44" fill="none" stroke="${P.bone}" stroke-width="2"/>` +
    text(75, qy + 29, 'query', P.bone, 'middle') +
    `<path class="art-line" d="M136 ${qy + 22} H${x0 - 14}" stroke="${P.gold}" stroke-width="2"/>` +
    `<path class="art-line" d="M${x0 - 24} ${qy + 14} L${x0 - 14} ${qy + 22} L${x0 - 24} ${qy + 30}" stroke="${P.gold}" stroke-width="2" fill="none"/>`;
  const foot = text(x0, y0 + rows * (h + gy) + 40, 'vector search + structured databases', P.grey) + text(780, 40, 'sub-second retrieval', P.gold, 'end');
  return art(tiles + query + foot);
}

/** One drawing per stat, in the order of content.stats.items. */
export const statArt = [graph, agents, hits, documents];
