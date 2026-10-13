import type { Metadata } from 'next';

// ────────────────────────────────────────────────────────────────────────────
// Core Identity
// ────────────────────────────────────────────────────────────────────────────

// Production redirects the bare domain to www. Keep every discovery signal
// on the final, indexable URL instead of sending crawlers through a redirect.
export const SITE_URL = 'https://www.scanterity.com';
export const SITE_NAME = 'Scanterity';
export const HOME_TITLE = 'Free Plagiarism Checker & AI Detector';

// A concise, factual summary for search snippets and link previews.
export const HOME_DESCRIPTION =
  'Check plagiarism and AI writing for free with Scanterity. Upload PDF, DOCX or TXT, review matched sources and download PDF reports. No sign-up required.';

// ────────────────────────────────────────────────────────────────────────────
// Public Routes
// ────────────────────────────────────────────────────────────────────────────
// Only indexable pages that actually exist belong in the sitemap.
export const PUBLIC_PATHS = ['/', '/privacy', '/terms', '/compliance', '/contact'] as const;

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).href;
}

// ────────────────────────────────────────────────────────────────────────────
// Per-Page Metadata Factory
// ────────────────────────────────────────────────────────────────────────────
// Every public page supplies its own canonical and complete social metadata.

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
    alternates: {
      canonical: url,
    },
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
        alt: `${SITE_NAME} — Free Online Plagiarism Checker & AI Content Detector Tool`,
        type: 'image/png',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [{
        url: absoluteUrl('/Scanterity.png'),
        alt: `${SITE_NAME} — Free Online Plagiarism Checker & AI Content Detector Tool`,
      }],
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// JSON-LD Structured Data
// ────────────────────────────────────────────────────────────────────────────

// Site identity shared by all pages. Do not advertise an internal search
// action: the app has no search-results URL or ?q= search feature.
export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': absoluteUrl('/#organization'),
      name: 'Scanterity Forensic Systems',
      alternateName: [SITE_NAME, 'Scanterity Plagiarism Checker', 'Scanterity AI Detector'],
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
      alternateName: [
        'Scanterity Plagiarism Checker',
        'Scanterity AI Detector',
        'Scanterity Free Plagiarism Checker',
      ],
      url: absoluteUrl('/'),
      inLanguage: 'en',
      publisher: { '@id': absoluteUrl('/#organization') },
    },
  ],
};

/**
 * Describe the app and the FAQs actually visible on the homepage.
 * Structured data does not guarantee rich results or search rankings.
 */
export const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // ── WebPage ────────────────────────────────────────────────────────────
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
    // ── WebApplication / SoftwareApplication ──────────────────────────────
    {
      '@type': ['WebApplication', 'SoftwareApplication'],
      '@id': absoluteUrl('/#webapp'),
      name: 'Scanterity — Free Plagiarism Checker & AI Detector',
      url: absoluteUrl('/'),
      description: HOME_DESCRIPTION,
      applicationCategory: 'EducationalApplication',
      applicationSubCategory: 'Plagiarism Detection',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a modern web browser with JavaScript enabled',
      inLanguage: 'en',
      isAccessibleForFree: true,
      featureList: [
        'Free plagiarism checking with no sign-up',
        'AI writing analysis',
        'PDF, DOCX and TXT file upload support',
        'Up to 15,000 words per scan',
        'Matched source links with direct URLs',
        'Downloadable forensic PDF reports',
        'Plagiarism percentage scoring',
      ],
      image: {
        '@type': 'ImageObject',
        url: absoluteUrl('/Scanterity.png'),
        caption: 'Scanterity logo',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        url: absoluteUrl('/'),
        availability: 'https://schema.org/InStock',
        category: 'Free',
      },
      publisher: { '@id': absoluteUrl('/#organization') },
      mainEntityOfPage: { '@id': absoluteUrl('/#webpage') },
    },
    // Keep questions and answers in sync with the visible FAQ section.
    // Google retired FAQ rich results in May 2026; this is descriptive schema.
    {
      '@type': 'FAQPage',
      '@id': absoluteUrl('/#faq'),
      isPartOf: { '@id': absoluteUrl('/#webpage') },
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is this plagiarism checker actually free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Scanterity is a 100% free plagiarism checker online. There are no paywalls, no daily limits for reasonable use, and we never ask for your credit card. We sustain the platform through optional premium features for enterprise users.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do you save or steal my documents?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely not. We care about your privacy. All scans are processed in volatile memory (RAM) and immediately wiped after the session ends. Your work is never indexed, stored, or shared with third parties.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can it detect AI writing?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The Scanterity AI content detector is designed specifically to catch text generated by large language models like ChatGPT, GPT-4, and Claude. It flags unnatural linguistic patterns and low perplexity.',
          },
        },
        {
          '@type': 'Question',
          name: 'How accurate is it compared to Turnitin or Grammarly?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Scanterity is designed to be highly competitive with premium tools like Turnitin and Grammarly. Our forensic engine uses deep semantic analysis to find paraphrased matches that many basic online checkers miss entirely.',
          },
        },
      ],
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Breadcrumb Generator (for sub-pages)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Generate BreadcrumbList JSON-LD for any sub-page.
 * Always starts with "Home" and adds the page itself.
 */
export function createBreadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      ...crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      })),
    ],
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
