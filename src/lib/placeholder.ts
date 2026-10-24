import type { Media } from '../types';
import { esc } from './html';
import { drawMotif } from './motifs';

let instance = 0;

/** The same drawing can appear twice (card and case study), so its SVG ids get a per-instance suffix. */
const uniqueIds = (svg: string): string => {
  const n = ++instance;
  return svg.replace(/id="([^"]+)"/g, `id="$1-${n}"`).replace(/url\(#([^)]+)\)/g, `url(#$1-${n})`);
};

/**
 * Renders a Media entry. With a `src` it is the real image or video;
 * without one it is a drawn placeholder captioned with the asset that belongs there.
 */
export function placeholder(media: Media, className = ''): string {
  const ratio = media.aspect.replace('/', ' / ');
  const cls = `media ${className}`.trim();
  if (media.kind === 'image' && media.src) {
    return `<figure class="${cls}" style="aspect-ratio:${ratio}"><img src="${esc(media.src)}" alt="${esc(media.alt)}" loading="lazy" decoding="async"></figure>`;
  }
  if (media.kind === 'video' && media.src) {
    const poster = media.poster ? ` poster="${esc(media.poster)}"` : '';
    return `<figure class="${cls}" style="aspect-ratio:${ratio}"><video src="${esc(media.src)}"${poster} muted loop playsinline autoplay preload="none" aria-label="${esc(media.alt)}"></video></figure>`;
  }
  // A div, not a figure: role="img" is not allowed on <figure>
  return `<div class="${cls} media--placeholder" style="aspect-ratio:${ratio}" data-motif="${media.motif ?? ''}" role="img" aria-label="${esc(media.alt)}">
    <div class="media__art" aria-hidden="true">${uniqueIds(drawMotif(media.motif))}</div>
    <div class="media__label" aria-hidden="true">Placeholder: ${esc(media.label)}</div>
  </div>`;
}
