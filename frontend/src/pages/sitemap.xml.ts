import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

const staticPaths = [
  '/',
  '/leistungen',
  '/projekte',
  '/team',
  '/jobs',
  '/kontakt',
  '/publikationen',
  '/impressum',
  '/datenschutz',
];

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site || new URL('https://www.tappauf-zt.at');
  const basePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
  const toUrl = (path: string) => new URL(`${basePath}${path}`, siteUrl).toString();
  const services = await getCollection('services');
  const references = await getCollection('references');
  const jobs = await getCollection('jobs');

  const urls = [
    ...staticPaths.map(toUrl),
    ...services.map((entry) => toUrl(`/leistungen/${entry.id}`)),
    ...references
      .filter((entry) => typeof entry.body === 'string' && entry.body.trim().length > 0)
      .map((entry) => toUrl(`/projekte/${entry.id}`)),
    ...jobs
      .filter((entry) => entry.data.status === 'aktiv')
      .map((entry) => toUrl(`/jobs/${entry.id}`)),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
