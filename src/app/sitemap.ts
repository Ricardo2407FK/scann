import type { MetadataRoute } from 'next';
import { absoluteUrl, PUBLIC_PATHS } from '@/lib/seo';

/**
 * XML Sitemap — Lists all canonical, indexable URLs with priority hints.
 * Google technically ignores priority/changeFrequency, but Bing, Yandex,
 * and other engines still use them for crawl scheduling.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Stable lastModified dates reflecting actual content updates
  // prevents crawlers from treating the entire domain as constantly mutating
  const routeConfig: Record<
    string,
    { priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly'; lastModified: string }
  > = {
    '/': { priority: 1.0, changeFrequency: 'daily', lastModified: '2026-10-18T00:00:00.000Z' },
    '/why-choose-us': { priority: 0.9, changeFrequency: 'weekly', lastModified: '2026-10-15T00:00:00.000Z' },
    '/privacy': { priority: 0.3, changeFrequency: 'monthly', lastModified: '2026-08-18T00:00:00.000Z' },
    '/terms': { priority: 0.3, changeFrequency: 'monthly', lastModified: '2026-08-18T00:00:00.000Z' },
    '/compliance': { priority: 0.3, changeFrequency: 'monthly', lastModified: '2026-08-18T00:00:00.000Z' },
    '/contact': { priority: 0.5, changeFrequency: 'monthly', lastModified: '2026-08-18T00:00:00.000Z' },
  };

  return PUBLIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: routeConfig[path]?.lastModified ?? '2026-10-18T00:00:00.000Z',
    priority: routeConfig[path]?.priority ?? 0.5,
    changeFrequency: routeConfig[path]?.changeFrequency ?? 'monthly',
  }));
}
