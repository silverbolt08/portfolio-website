import { defineConfig, type HtmlTagDescriptor, type Plugin } from 'vite';
import { content as c } from './src/content';

// The config runs in Node; this is the one Node global it reads (saves a dependency on @types/node).
declare const process: { env: Record<string, string | undefined> };

/**
 * Where the site is published, e.g. https://silverbolt08.github.io/ (set by the deploy workflow).
 * Link previews need absolute URLs, so the canonical link and absolute og:image are only written when it is known.
 */
const SITE_URL = process.env.SITE_URL?.replace(/\/?$/, '/');

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Writes the title, description, link-preview tags, structured data and the no-JavaScript fallback from content.ts,
 * so crawlers and link previews (which do not run scripts) see the same words as the page.
 */
function siteMeta(): Plugin {
  const meta = (attrs: Record<string, string>): HtmlTagDescriptor => ({ tag: 'meta', attrs, injectTo: 'head' });
  const ogImage = `${SITE_URL ?? ''}og.png`;
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: c.person.name,
    jobTitle: c.person.role,
    email: `mailto:${c.contact.email}`,
    address: { '@type': 'PostalAddress', addressLocality: c.person.city, addressCountry: 'IN' },
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'IIIT Delhi' },
    sameAs: [c.contact.github.href, c.contact.linkedin.href],
    ...(SITE_URL ? { url: SITE_URL } : {}),
  };
  const fallback = `<noscript>
      <div class="noscript">
        <h1>${esc(c.person.name)}</h1>
        <p>${esc(c.person.role)}. ${esc(c.person.education)}.</p>
        <p>
          <a href="mailto:${esc(c.contact.email)}">${esc(c.contact.email)}</a> ·
          <a href="${esc(c.contact.github.href)}">${esc(c.contact.github.label)}</a> ·
          <a href="${esc(c.contact.linkedin.href)}">${esc(c.contact.linkedin.label)}</a> ·
          <a href="${esc(c.contact.resume.href)}">${esc(c.contact.resume.label)}</a>
        </p>
        <p>The rest of this portfolio needs JavaScript.</p>
      </div>
    </noscript>`;

  return {
    name: 'site-meta',
    transformIndexHtml(html) {
      const tags: HtmlTagDescriptor[] = [
        meta({ name: 'description', content: c.meta.description }),
        meta({ property: 'og:type', content: 'website' }),
        meta({ property: 'og:site_name', content: c.person.name }),
        meta({ property: 'og:title', content: c.meta.title }),
        meta({ property: 'og:description', content: c.meta.description }),
        meta({ property: 'og:image', content: ogImage }),
        meta({ property: 'og:image:width', content: '1200' }),
        meta({ property: 'og:image:height', content: '630' }),
        meta({ property: 'og:image:alt', content: `${c.person.name}, ${c.person.role}` }),
        meta({ name: 'twitter:card', content: 'summary_large_image' }),
        { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify(person), injectTo: 'head' },
      ];
      if (SITE_URL) {
        tags.push({ tag: 'link', attrs: { rel: 'canonical', href: SITE_URL }, injectTo: 'head' });
        tags.push(meta({ property: 'og:url', content: SITE_URL }));
      }
      return {
        html: html.replace('<title></title>', `<title>${esc(c.meta.title)}</title>`).replace('<!-- noscript -->', fallback),
        tags,
      };
    },
  };
}

/**
 * Preloads the three Latin font files the first screen needs (preloader counter, hero name, role line),
 * so they arrive before first paint instead of swapping in and shifting the layout.
 * Their names are hashed at build time, so the links are written from the bundle.
 */
function preloadFonts(): Plugin {
  const wanted = /(instrument-serif-latin-400-normal|inter-tight-latin-wght-normal|geist-mono-latin-wght-normal)-[\w-]+\.woff2$/;
  return {
    name: 'preload-fonts',
    apply: 'build',
    transformIndexHtml(_html, ctx) {
      const files = Object.keys(ctx.bundle ?? {}).filter((f) => wanted.test(f));
      return files.map((f) => ({
        tag: 'link',
        attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `./${f}`, crossorigin: '' },
        injectTo: 'head-prepend' as const,
      }));
    },
  };
}

export default defineConfig({
  // Relative URLs, so the built site works from a domain root or a sub-folder (e.g. a GitHub Pages project site).
  base: './',
  plugins: [siteMeta(), preloadFonts()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
  },
});
