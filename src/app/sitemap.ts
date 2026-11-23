import type { MetadataRoute } from 'next';
import { absoluteUrl, PUBLIC_PATHS } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  // Add lastModified only when actual per-page content dates are tracked.
  // Build times and estimated dates are not reliable freshness signals.
  return PUBLIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
  }));
}
