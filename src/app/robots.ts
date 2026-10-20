import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

/**
 * robots.txt — Explicitly allow all major search engine bots and point them
 * to the XML sitemap. The `host` directive is honoured by Yandex for
 * canonical domain resolution.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Blanket rule for all well-behaved crawlers
        userAgent: '*',
        allow: '/',
        // Crawlers need Next.js scripts, styles and images to render the pages.
        disallow: ['/api/'],
      },
      {
        // Explicit Googlebot entry (Google ranks pages it can fully render)
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        // Google AdSense crawler
        userAgent: 'Mediapartners-Google',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        // Bing, Yahoo (which is powered by Bing)
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        // Yandex (Russian search engine — significant traffic from CIS region)
        userAgent: 'Yandex',
        allow: '/',
        disallow: ['/api/'],
        crawlDelay: 2,
      },
      {
        // Baidu (Chinese search engine)
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: ['/api/'],
        crawlDelay: 2,
      },
      {
        // DuckDuckGo
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        // Apple's crawler (Siri, Spotlight, Safari suggestions)
        userAgent: 'Applebot',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    // Yandex uses the Host directive for canonical domain resolution
    host: absoluteUrl('/'),
  };
}
