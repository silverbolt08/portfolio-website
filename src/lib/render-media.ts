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
 * Renders a Media entry: the real image or video when it has a `src`, otherwise its drawing.
 */
export function renderMedia(media: Media, className = ''): string {
  const auto = media.aspect === 'auto';
  const ratio = auto ? '' : ` style="aspect-ratio:${media.aspect.replace('/', ' / ')}"`;
  const cls = `media ${auto ? 'media--natural ' : ''}${className}`.trim();
  // Intrinsic size, so the browser reserves the space before the file arrives
  const size = media.width && media.height ? ` width="${media.width}" height="${media.height}"` : '';
  if (media.kind === 'image' && media.src) {
    return `<figure class="${cls}"${ratio}><img src="${esc(media.src)}" alt="${esc(media.alt)}"${size} loading="lazy" decoding="async"></figure>`;
  }
  if (media.kind === 'video' && media.src) {
    const poster = media.poster ? ` poster="${esc(media.poster)}"` : '';
    return `<figure class="${cls}"${ratio}><video src="${esc(media.src)}"${poster}${size} muted loop playsinline autoplay preload="none" aria-label="${esc(media.alt)}"></video></figure>`;
  }
  // A div, not a figure: role="img" is not allowed on <figure>
  return `<div class="${cls} media--drawing"${ratio} data-motif="${media.motif ?? ''}" role="img" aria-label="${esc(media.alt)}">
    <div class="media__art" aria-hidden="true">${uniqueIds(drawMotif(media.motif))}</div>
  </div>`;
}
