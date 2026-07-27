import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/', // Prevents Google from unnecessarily crawling your API routes
    },
    sitemap: 'https://www.pdfbuilder.org/sitemap.xml', 
  }
}