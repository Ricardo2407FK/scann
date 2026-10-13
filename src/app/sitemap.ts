import type { MetadataRoute } from 'next';
import { absoluteUrl, PUBLIC_PATHS } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  // Only canonical, indexable URLs. Omit lastModified until real per-page
  // content dates are tracked; a build time is not a content update time.
  // Google ignores the optional priority and changeFrequency hints.
  return PUBLIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
  }));
}
