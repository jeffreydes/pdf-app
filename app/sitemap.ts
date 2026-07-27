import { MetadataRoute } from 'next';
import { NICHES } from '@/lib/niches';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.pdfbuilder.org';

  // Static homepage
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];

  // Dynamically add all Programmatic SEO landing pages
  Object.keys(NICHES).forEach((slug) => {
    routes.push({
      url: `${baseUrl}/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  return routes;
}