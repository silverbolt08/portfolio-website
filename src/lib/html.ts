const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapes text for use in markup and attributes. */
export const esc = (value: string | number): string => String(value).replace(/[&<>"']/g, (ch) => ENTITIES[ch]);

/** Attributes for a link that may open elsewhere. */
export const linkAttrs = (href: string, external?: boolean): string =>
  `href="${esc(href)}"${external && href !== '#' ? ' target="_blank" rel="noopener noreferrer"' : ''}`;

export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T => {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el;
};

export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(sel));
