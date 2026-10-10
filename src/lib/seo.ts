import type { Metadata } from 'next';

// Production redirects the bare domain to www. Keep every discovery signal
// on the final, indexable URL instead of sending crawlers through a redirect.
export const SITE_URL = 'https://www.scanterity.com';
export const SITE_NAME = 'Scanterity';
export const HOME_TITLE = 'Free Plagiarism Checker & AI Detector';
export const HOME_DESCRIPTION =
  'Check text for plagiarism and AI writing with Scanterity. Upload PDF, DOCX or TXT files, review matched sources, and download PDF reports. Free, no sign-up.';

export const PUBLIC_PATHS = ['/', '/privacy', '/terms', '/compliance', '/contact', '/why-choose-us'] as const;

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).href;
}

export function createPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: (typeof PUBLIC_PATHS)[number];
}): Metadata {
  const url = absoluteUrl(path);
  const pageTitle = `${title} | ${SITE_NAME}`;

  return {
    // The root layout's template does not apply to a page in the same segment.
    // An absolute title keeps the homepage and child routes consistent.
    title: { absolute: pageTitle },
    description,
    alternates: { canonical: url },
    // Next.js replaces nested metadata rather than merging it. Supply complete
    // social metadata on each page to prevent homepage values leaking through.
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: SITE_NAME,
      url,
      title: pageTitle,
      description,
      images: [{
        url: absoluteUrl('/Scanterity.png'),
        width: 2172,
        height: 724,
        alt: 'Scanterity',
        type: 'image/png',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [{ url: absoluteUrl('/Scanterity.png'), alt: 'Scanterity' }],
    },
  };
}

// Only describe verified site identity here. Tool-specific entities belong on
// the homepage, not on contact or policy pages.
export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': absoluteUrl('/#organization'),
      name: 'Scanterity Forensic Systems',
      alternateName: SITE_NAME,
      url: absoluteUrl('/'),
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/Scanterity.png'),
        width: 2172,
        height: 724,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'hello@scanterity.com',
        availableLanguage: ['English'],
        url: absoluteUrl('/contact'),
      },
    },
    {
      '@type': 'WebSite',
      '@id': absoluteUrl('/#website'),
      name: SITE_NAME,
      alternateName: 'Scanterity Plagiarism Checker',
      url: absoluteUrl('/'),
      inLanguage: 'en',
      publisher: { '@id': absoluteUrl('/#organization') },
    },
  ],
};

export const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': absoluteUrl('/#webpage'),
      url: absoluteUrl('/'),
      name: `${HOME_TITLE} | ${SITE_NAME}`,
      description: HOME_DESCRIPTION,
      inLanguage: 'en',
      isPartOf: { '@id': absoluteUrl('/#website') },
      about: { '@id': absoluteUrl('/#webapp') },
      mainEntity: { '@id': absoluteUrl('/#webapp') },
    },
    {
      '@type': 'WebApplication',
      '@id': absoluteUrl('/#webapp'),
      name: 'Scanterity Plagiarism Checker & AI Detector',
      url: absoluteUrl('/'),
      description: HOME_DESCRIPTION,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a modern web browser with JavaScript enabled',
      inLanguage: 'en',
      isAccessibleForFree: true,
      featureList: [
        'Plagiarism checking',
        'AI writing analysis',
        'PDF, DOCX and TXT uploads',
        'Matched source links',
        'Downloadable PDF reports',
      ],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        url: absoluteUrl('/'),
      },
      publisher: { '@id': absoluteUrl('/#organization') },
      mainEntityOfPage: { '@id': absoluteUrl('/#webpage') },
    },
  ],
};

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
