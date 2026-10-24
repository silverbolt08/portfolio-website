const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Keeps Tab and Shift+Tab inside `roots`. Returns a release function. */
export function trapFocus(roots: HTMLElement[]): () => void {
  const items = () =>
    roots
      .flatMap((r) => [...(r.matches(FOCUSABLE) ? [r] : []), ...Array.from(r.querySelectorAll<HTMLElement>(FOCUSABLE))])
      .filter((el) => el.getClientRects().length > 0);
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const list = items();
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    const active = document.activeElement as HTMLElement | null;
    const inside = active ? list.includes(active) : false;
    if (e.shiftKey && (active === first || !inside)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !inside)) {
      e.preventDefault();
      first.focus();
    }
  };
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}

/** Makes the page content inert while an overlay is open. The persistent UI stays reachable. */
export function setPageInert(inert: boolean): void {
  for (const id of ['main', 'site-footer']) {
    const el = document.getElementById(id);
    if (el) el.inert = inert;
  }
}

let live: HTMLElement | null = null;

/** Announces a short message to screen readers. */
export function announce(message: string): void {
  live ??= document.getElementById('live');
  if (!live) return;
  live.textContent = '';
  requestAnimationFrame(() => {
    if (live) live.textContent = message;
  });
}
