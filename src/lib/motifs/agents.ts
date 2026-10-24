import { P, svg, label } from './shared';

/** GravityOS: one brief → brand analysis → 3 platform pipelines of 3 agents → a critic loop → output. 11 agents. */
export function agents(): string {
  const lanes = [
    { y: 250, name: 'Instagram' },
    { y: 450, name: 'LinkedIn' },
    { y: 650, name: 'Twitter/X' },
  ];
  const brief = { x: 150, y: 450 };
  const brand = { x: 380, y: 450 };
  const critic = { x: 1250, y: 450 };
  const out = { x: 1460, y: 450 };
  const cols = [620, 800, 980];
  let body = '';

  body += `<path d="M${brief.x} ${brief.y} L${brand.x} ${brand.y}" stroke="${P.dim}" stroke-width="2"/>`;
  for (const lane of lanes) {
    body += `<path d="M${brand.x} ${brand.y} C ${brand.x + 120} ${brand.y}, ${cols[0] - 120} ${lane.y}, ${cols[0]} ${lane.y}" stroke="${P.dim}" stroke-width="2" fill="none"/>`;
    body += `<path d="M${cols[0]} ${lane.y} L${cols[2]} ${lane.y}" stroke="${P.dim}" stroke-width="2"/>`;
    body += `<path d="M${cols[2]} ${lane.y} C ${cols[2] + 140} ${lane.y}, ${critic.x - 140} ${critic.y}, ${critic.x} ${critic.y}" stroke="${P.dim}" stroke-width="2" fill="none"/>`;
    body += label(cols[0] - 40, lane.y - 52, lane.name);
    for (const x of cols) body += `<circle cx="${x}" cy="${lane.y}" r="26" fill="${P.faint}" stroke="${P.bone}" stroke-width="2"/>`;
  }
  // critic loop: back to the drafting column, at most 3 times
  body += `<path d="M${critic.x} ${critic.y - 60} C ${critic.x} ${critic.y - 260}, ${cols[1]} ${80}, ${cols[1]} ${lanes[0].y - 40}" stroke="${P.gold}" stroke-width="2" fill="none" stroke-dasharray="6 10"/>`;
  body += label(critic.x - 10, 140, 'revise ≤ 3×', P.gold, 'middle');
  body += `<path d="M${critic.x} ${critic.y} L${out.x} ${out.y}" stroke="${P.gold}" stroke-width="2"/>`;

  body += `<rect x="${brief.x - 60}" y="${brief.y - 40}" width="120" height="80" fill="none" stroke="${P.grey}" stroke-width="2"/>`;
  body += label(brief.x, brief.y + 8, 'brief', P.bone, 'middle');
  body += `<circle cx="${brand.x}" cy="${brand.y}" r="34" fill="${P.faint}" stroke="${P.bone}" stroke-width="2"/>`;
  body += label(brand.x, brand.y + 78, 'brand', P.grey, 'middle');
  body += `<circle cx="${critic.x}" cy="${critic.y}" r="58" fill="none" stroke="${P.gold}" stroke-width="3"/>`;
  body += `<circle cx="${critic.x}" cy="${critic.y}" r="34" fill="${P.faint}" stroke="${P.gold}" stroke-width="2"/>`;
  body += label(critic.x, critic.y + 108, 'critic ≥ 8.0', P.gold, 'middle');
  body += `<rect x="${out.x - 34}" y="${out.y - 34}" width="68" height="68" fill="${P.gold}"/>`;
  body += label(out.x, out.y + 78, 'publish', P.grey, 'middle');
  return svg(body);
}
