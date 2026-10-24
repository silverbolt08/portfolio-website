import type { SiteContent } from '../types';
import { esc } from '../lib/html';

const zoneName = (timeZone: string): string =>
  new Intl.DateTimeFormat('en-IN', { timeZone, timeZoneName: 'short' })
    .formatToParts(new Date())
    .find((p) => p.type === 'timeZoneName')?.value ?? '';

export const renderClock = (c: SiteContent): string =>
  `<p class="hud hud--clock">${esc(c.person.city)}, <time data-clock>00:00:00</time> ${esc(zoneName(c.person.timeZone))}</p>`;

export function initClock(timeZone: string): void {
  const el = document.querySelector<HTMLTimeElement>('[data-clock]');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const tick = () => {
    const now = new Date();
    el.textContent = fmt.format(now);
    el.dateTime = now.toISOString();
  };
  tick();
  setInterval(tick, 1000);
}
