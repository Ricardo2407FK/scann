import type { MetadataRoute } from 'next';
import { absoluteUrl, PUBLIC_PATHS } from '@/lib/seo';

/**
 * Priority and freshness hints for crawlers. Higher priority pages get
 * crawled more frequently. `changeFrequency` guides re-crawl cadence.
 *
 * While Google has stated it doesn't heavily rely on these hints, Bing,
 * Yandex, Baidu, and other engines actively use them for crawl scheduling.
 */

const PRIORITY_MAP: Record<string, number> = {
  '/': 1.0,
  '/why-choose-us': 0.8,
  '/contact': 0.6,
  '/privacy': 0.3,
  '/terms': 0.3,
  '/compliance': 0.3,
};

const CHANGE_FREQ_MAP: Record<string, MetadataRoute.Sitemap[number]['changeFrequency']> = {
  '/': 'daily',
  '/why-choose-us': 'weekly',
  '/contact': 'monthly',
  '/privacy': 'yearly',
  '/terms': 'yearly',
  '/compliance': 'yearly',
};

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: CHANGE_FREQ_MAP[path] ?? 'monthly',
    priority: PRIORITY_MAP[path] ?? 0.5,
  }));
}
