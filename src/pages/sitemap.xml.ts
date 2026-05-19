import type { APIRoute } from 'astro';
import { destinations } from '../data/destinations';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.origin || 'https://jrtours-morochucos.vercel.app';
  
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/destinos', priority: '0.9', changefreq: 'weekly' },
    { url: '/blog', priority: '0.8', changefreq: 'weekly' },
  ];

  const destinationPages = destinations.map((d) => ({
    url: `/destinos/${d.slug}`,
    priority: d.category === 'destino' ? '0.8' : '0.7',
    changefreq: 'monthly',
  }));

  const blogPosts = [
    { slug: 'ruta-millpu', date: '2026-04-10' },
    { slug: 'viaje-seguro', date: '2026-04-15' },
  ];

  const blogPages = blogPosts.map((post) => ({
    url: `/blog/${post.slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: post.date,
  }));

  const allPages = [...pages, ...destinationPages, ...blogPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
