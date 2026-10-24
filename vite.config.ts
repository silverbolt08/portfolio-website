import { defineConfig, type Plugin } from 'vite';

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
        attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${f}`, crossorigin: '' },
        injectTo: 'head-prepend' as const,
      }));
    },
  };
}

export default defineConfig({
  plugins: [preloadFonts()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
  },
});
