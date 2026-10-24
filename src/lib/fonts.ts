const FACES = [
  '400 1em "Instrument Serif"',
  'italic 400 1em "Instrument Serif"',
  '400 1em "Inter Tight Variable"',
  '400 1em "Geist Mono Variable"',
];

/** Resolves once the three faces are ready, or after `timeout` so a slow font never blocks the page. */
export function loadFonts(timeout = 4000): Promise<void> {
  const all = Promise.all(FACES.map((face) => document.fonts.load(face))).then(() => undefined);
  const cap = new Promise<void>((resolve) => setTimeout(resolve, timeout));
  return Promise.race([all.catch(() => undefined), cap]);
}
