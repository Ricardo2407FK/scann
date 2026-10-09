import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Crawlers need Next.js scripts, styles and images to render the pages.
      disallow: ['/api/'],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
