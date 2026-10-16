import type { MetadataRoute } from 'next';
import { absoluteUrl, PUBLIC_PATHS } from '@/lib/seo';

/**
 * XML Sitemap — Lists all canonical, indexable URLs with priority hints.
 * Google technically ignores priority/changeFrequency, but Bing, Yandex,
 * and other engines still use them for crawl scheduling.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  // Priority and change frequency per route
  const routeConfig: Record<string, { priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }> = {
    '/': { priority: 1.0, changeFrequency: 'daily' },
    '/why-choose-us': { priority: 0.9, changeFrequency: 'weekly' },
    '/privacy': { priority: 0.3, changeFrequency: 'monthly' },
    '/terms': { priority: 0.3, changeFrequency: 'monthly' },
    '/compliance': { priority: 0.3, changeFrequency: 'monthly' },
    '/contact': { priority: 0.5, changeFrequency: 'monthly' },
  };

  return PUBLIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: now,
    priority: routeConfig[path]?.priority ?? 0.5,
    changeFrequency: routeConfig[path]?.changeFrequency ?? 'monthly',
  }));
}
