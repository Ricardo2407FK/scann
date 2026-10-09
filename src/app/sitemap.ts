import type { MetadataRoute } from 'next';
import { absoluteUrl, PUBLIC_PATHS } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  // Only canonical public pages belong here. Omit lastModified until actual
  // content revision dates are available; build time is not a content update.
  return PUBLIC_PATHS.map((path) => ({ url: absoluteUrl(path) }));
}
