import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/', // Prevents Google from unnecessarily triggering your PDF API
    },
    sitemap: 'https://www.pdfbuilder.org/sitemap.xml', // Replace with your real URL
  }
}