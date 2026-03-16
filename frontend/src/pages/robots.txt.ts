import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site || new URL('https://www.tappauf-zt.at');
  const basePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
  const robots = `User-agent: *
Allow: /
Disallow: ${basePath}/keystatic/

Sitemap: ${new URL(`${basePath}/sitemap.xml`, siteUrl).toString()}
`;

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
