import type { APIRoute } from 'astro';
import { withBase } from '../lib/paths';

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('SITE_URL must be configured to generate sitemap.xml.');
  const urls = Object.keys(import.meta.glob('./*.astro'))
    .filter(page => !page.endsWith('/404.astro'))
    .sort()
    .map(page => {
      const slug = page.replace('./', '').replace('.astro', '');
      const route = slug === 'index' ? '' : `${slug}/`;
      const url = new URL(withBase(route), site).href.replaceAll('&', '&amp;');
      return `  <url><loc>${url}</loc></url>`;
    });
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
