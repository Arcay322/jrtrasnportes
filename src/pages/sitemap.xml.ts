import type { APIRoute } from 'astro';
import { destinations } from '../data/destinations';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site?.origin || 'https://jrtransportesmorochucos.com';
  
  const defaultImage = `${baseUrl}/images/Pampa%20cangallo/pampa-cangallo.webp`;

  const pages = [
    { url: '/', priority: '1.0', changefreq: 'weekly', image: defaultImage },
    { url: '/destinos', priority: '0.9', changefreq: 'weekly', image: defaultImage },
    { url: '/blog', priority: '0.8', changefreq: 'weekly', image: defaultImage },
  ];

  const destinationPages = destinations.map((d) => ({
    url: `/destinos/${d.slug}`,
    priority: d.category === 'destino' ? '0.8' : '0.7',
    changefreq: 'monthly',
    image: d.image.startsWith('http') ? d.image : `${baseUrl}${d.image}`,
  }));

  const blogPosts = [
    { slug: 'ruta-millpu', date: '2026-04-10', image: defaultImage },
    { slug: 'viaje-seguro', date: '2026-04-15', image: defaultImage },
  ];

  const blogPages = blogPosts.map((post) => ({
    url: `/blog/${post.slug}`,
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: post.date,
    image: post.image,
  }));

  const allPages = [...pages, ...destinationPages, ...blogPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages.map((page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <priority>${page.priority}</priority>
    <changefreq>${page.changefreq}</changefreq>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    ${page.image ? `<image:image>
      <image:loc>${page.image}</image:loc>
      <image:caption>JR Transportes - ${page.url === '/' ? 'Transporte Interprovincial Ayacucho' : 'Destinos y Tours Ayacucho'}</image:caption>
    </image:image>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
