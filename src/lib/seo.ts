import type { Metadata } from 'next';

// ────────────────────────────────────────────────────────────────────────────
// Core Identity
// ────────────────────────────────────────────────────────────────────────────

// Production redirects the bare domain to www. Keep every discovery signal
// on the final, indexable URL instead of sending crawlers through a redirect.
export const SITE_URL = 'https://www.scanterity.com';
export const SITE_NAME = 'Scanterity';
export const HOME_TITLE = 'Free Plagiarism Checker & AI Detector';

// Front-load the highest-volume keywords in the first 160 characters so the
// SERP snippet is compelling even when truncated. The full description still
// indexes and feeds long-tail ranking signals.
export const HOME_DESCRIPTION =
  'Scanterity is a free online plagiarism checker and AI content detector. Upload PDF, DOCX, or TXT files to check for plagiarism, detect AI-generated writing from ChatGPT & GPT-4, review matched sources, and download forensic PDF reports — no sign-up required.';

// ────────────────────────────────────────────────────────────────────────────
// Keyword Targeting
// ────────────────────────────────────────────────────────────────────────────
// Google ignores <meta name="keywords">, but Bing, Yandex, Baidu, Naver, and
// many smaller engines still factor it into ranking. Including it costs
// nothing and widens discoverability across all search engines.

export const SITE_KEYWORDS = [
  // Primary head terms
  'plagiarism checker',
  'free plagiarism checker',
  'plagiarism checker online',
  'plagiarism detector',
  'check plagiarism',
  'ai detector',
  'ai content detector',
  'ai writing detector',

  // Long-tail: audience intent
  'plagiarism checker for students',
  'plagiarism checker for teachers',
  'plagiarism checker for researchers',
  'free plagiarism checker for students',
  'free online plagiarism checker for students',

  // Long-tail: use-case
  'essay plagiarism checker',
  'research paper plagiarism checker',
  'assignment plagiarism checker',
  'thesis plagiarism checker',
  'dissertation plagiarism checker',
  'check my essay for plagiarism',
  'check my paper for plagiarism',

  // Feature-specific
  'plagiarism checker with percentage',
  'plagiarism checker pdf',
  'plagiarism percentage checker',
  'plagiarism report',
  'duplicate content checker',
  'content originality checker',
  'text similarity checker',
  'copy checker',
  'plagiarism scanner',
  'plagiarism test',

  // AI detection specific
  'chatgpt detector',
  'ai text detector',
  'free ai detector',
  'gpt detector',
  'detect ai writing',
  'is this ai written',
  'ai generated text detector',
  'ai plagiarism checker',

  // Competitor alternative queries
  'turnitin alternative',
  'turnitin free alternative',
  'grammarly plagiarism checker alternative',
  'best plagiarism checker',
  'best free plagiarism checker',

  // Brand terms
  'scanterity',
  'scanterity plagiarism checker',
] as const;

export const PUBLIC_PATHS = ['/', '/privacy', '/terms', '/compliance', '/contact', '/why-choose-us'] as const;

export function absoluteUrl(path: string): string {
  return new URL(path, `${SITE_URL}/`).href;
}

// ────────────────────────────────────────────────────────────────────────────
// Per-Page Metadata Factory
// ────────────────────────────────────────────────────────────────────────────
// Every public page MUST call this to ensure consistent canonical, hreflang,
// OG, Twitter, and keyword metadata.

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: (typeof PUBLIC_PATHS)[number];
  keywords?: readonly string[];
}): Metadata {
  const url = absoluteUrl(path);
  const pageTitle = `${title} | ${SITE_NAME}`;

  return {
    // The root layout's template does not apply to a page in the same segment.
    // An absolute title keeps the homepage and child routes consistent.
    title: { absolute: pageTitle },
    description,
    keywords: (keywords ?? SITE_KEYWORDS) as unknown as string[],
    alternates: {
      canonical: url,
      // hreflang: tell every engine the canonical language and fallback.
      languages: {
        'en-US': url,
        'x-default': url,
      },
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

// Site-wide graph: Organization + WebSite (with SearchAction for sitelinks
// search box). Injected in the root layout so every page inherits it.
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
      // Populate with real social profile URLs as they are created
      sameAs: [],
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
      // SearchAction enables the Google Sitelinks Search Box
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${absoluteUrl('/')}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

/**
 * Homepage-specific structured data: WebPage, WebApplication, FAQPage, HowTo,
 * and BreadcrumbList — all wired into a single @graph for maximum rich-result
 * eligibility across Google, Bing, Yahoo, Yandex, and DuckDuckGo.
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
      breadcrumb: { '@id': absoluteUrl('/#breadcrumb') },
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'h2', '.neumorphic-extruded p'],
      },
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
        'AI-generated content detection (ChatGPT, GPT-4, Claude, Gemini)',
        'Deep paraphrase and semantic similarity detection',
        'PDF, DOCX and TXT file upload support',
        'Up to 15,000 words per scan',
        'Matched source links with direct URLs',
        'Downloadable forensic PDF reports',
        'Plagiarism percentage scoring',
        'No daily usage limits for reasonable use',
        'Privacy-first: zero document retention',
        'Real-time scanning against billions of web pages',
        'Academic integrity verification',
        'Free Turnitin alternative for students',
      ],
      screenshot: {
        '@type': 'ImageObject',
        url: absoluteUrl('/Scanterity.png'),
        caption: 'Scanterity plagiarism checker and AI detector interface',
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
    // ── BreadcrumbList ────────────────────────────────────────────────────
    {
      '@type': 'BreadcrumbList',
      '@id': absoluteUrl('/#breadcrumb'),
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: absoluteUrl('/'),
        },
      ],
    },
    // ── FAQPage (enables FAQ rich snippets in Google & Bing) ─────────────
    {
      '@type': 'FAQPage',
      '@id': absoluteUrl('/#faq'),
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
          name: 'Can Scanterity detect AI writing from ChatGPT?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The Scanterity AI content detector is designed specifically to catch text generated by large language models like ChatGPT, GPT-4, and Claude. It flags unnatural linguistic patterns and low perplexity.',
          },
        },
        {
          '@type': 'Question',
          name: 'How accurate is Scanterity compared to Turnitin or Grammarly?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Scanterity is designed to be highly competitive with premium tools like Turnitin and Grammarly. Our forensic engine uses deep semantic analysis to find paraphrased matches that many basic online checkers miss entirely.',
          },
        },
        {
          '@type': 'Question',
          name: 'What file formats does Scanterity support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Scanterity supports PDF, DOCX, and TXT file uploads up to 15,000 words. You can also paste text directly into the editor for instant plagiarism checking.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to create an account to use Scanterity?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Scanterity requires no sign-up, no email verification, and no credit card. Just paste your text or upload your document and start scanning immediately.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Scanterity a good free alternative to Turnitin?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Scanterity provides forensic-level plagiarism detection with deep paraphrase analysis, AI writing detection, and downloadable PDF reports — all for free. It is designed as a powerful free Turnitin alternative for students, teachers, and researchers.',
          },
        },
      ],
    },
    // ── HowTo (enables how-to rich snippets in Google) ───────────────────
    {
      '@type': 'HowTo',
      '@id': absoluteUrl('/#howto'),
      name: 'How to Check for Plagiarism Online Using Scanterity',
      description:
        'A step-by-step guide to checking your document for plagiarism and AI-generated content using Scanterity\'s free online plagiarism checker tool.',
      totalTime: 'PT2M',
      tool: {
        '@type': 'HowToTool',
        name: 'Scanterity Free Plagiarism Checker',
      },
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Upload or Paste Your Document',
          text: 'Support for PDF, DOCX, and TXT files up to 15,000 words. You can also paste your essay, research paper, or blog post directly into the editor for a fast plagiarism scan.',
          url: absoluteUrl('/'),
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Initiate the Forensic Scan',
          text: 'Click the scan button. Our forensic engine breaks down your text, normalizes it, and cross-references it against a massive live database of academic and web content in real-time.',
          url: absoluteUrl('/'),
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Review Detailed Results',
          text: 'Get an exact breakdown of duplicate content, paraphrased sections, and potential AI-generated text. Every flagged sentence comes with a direct link to the original source.',
          url: absoluteUrl('/'),
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
