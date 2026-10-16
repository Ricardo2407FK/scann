import type { Metadata } from 'next';

// ────────────────────────────────────────────────────────────────────────────
// Core Identity
// ────────────────────────────────────────────────────────────────────────────

// Production redirects the bare domain to www. Keep every discovery signal
// on the final, indexable URL instead of sending crawlers through a redirect.
export const SITE_URL = 'https://www.scanterity.com';
export const SITE_NAME = 'Scanterity';
export const HOME_TITLE = 'Free Plagiarism Checker & AI Detector';

// Keyword-saturated meta description — hits the top 8 high-intent queries:
// "free plagiarism checker", "plagiarism checker online", "plagiarism detector",
// "check plagiarism", "AI detector", "AI writing detector", "plagiarism checker for students",
// "Turnitin alternative"
export const HOME_DESCRIPTION =
  'Scanterity is a free plagiarism checker & AI detector trusted by students, teachers, and writers. Check plagiarism online instantly — upload PDF, DOCX, or paste text. Detect AI-generated content from ChatGPT, GPT-4 & Claude. Download forensic PDF reports. No sign-up. Free Turnitin alternative.';

// Extended description for OG / social sharing (longer allowed)
export const HOME_DESCRIPTION_LONG =
  'Scanterity is the best free plagiarism checker and AI content detector online. Check your essays, research papers, and articles for plagiarism against billions of web pages and academic sources. Detect AI-generated writing from ChatGPT, GPT-4, Gemini & Claude with our 16-signal forensic engine. Upload PDF, DOCX, or TXT files up to 15,000 words. Get detailed source attributions, match percentages, and downloadable forensic PDF reports — all with no account, no paywall, and no credit card. A powerful free alternative to Turnitin, Grammarly, and Copyscape.';

// ────────────────────────────────────────────────────────────────────────────
// Public Routes
// ────────────────────────────────────────────────────────────────────────────
// Only indexable pages that actually exist belong in the sitemap.
export const PUBLIC_PATHS = ['/', '/privacy', '/terms', '/compliance', '/contact', '/why-choose-us'] as const;

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
  keywords,
}: {
  title: string;
  description: string;
  path: (typeof PUBLIC_PATHS)[number];
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  const pageTitle = `${title} | ${SITE_NAME}`;

  return {
    // The root layout's template does not apply to a page in the same segment.
    // An absolute title keeps the homepage and child routes consistent.
    title: { absolute: pageTitle },
    description,
    keywords: keywords?.join(', '),
    alternates: {
      canonical: url,
      languages: {
        'en': url,
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

// Site identity shared by all pages.
export const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': absoluteUrl('/#organization'),
      name: 'Scanterity Forensic Systems',
      alternateName: [SITE_NAME, 'Scanterity Plagiarism Checker', 'Scanterity AI Detector', 'Scanterity Free Plagiarism Checker'],
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
      sameAs: [
        'https://discord.gg/',
        'https://t.me/',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': absoluteUrl('/#website'),
      name: SITE_NAME,
      alternateName: [
        'Scanterity Plagiarism Checker',
        'Scanterity AI Detector',
        'Scanterity Free Plagiarism Checker',
        'Free Plagiarism Checker Online',
        'Best Free Plagiarism Checker',
      ],
      url: absoluteUrl('/'),
      inLanguage: 'en',
      publisher: { '@id': absoluteUrl('/#organization') },
    },
  ],
};

/**
 * Homepage structured data — WebPage, WebApplication, HowTo, FAQPage
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
      speakable: {
        '@type': 'SpeakableSpecification',
        cssSelector: ['h1', 'h2', '.customHeroDesc'],
      },
    },
    // ── WebApplication / SoftwareApplication ──────────────────────────────
    {
      '@type': ['WebApplication', 'SoftwareApplication'],
      '@id': absoluteUrl('/#webapp'),
      name: 'Scanterity — Free Plagiarism Checker & AI Detector',
      url: absoluteUrl('/'),
      description: HOME_DESCRIPTION_LONG,
      applicationCategory: 'EducationalApplication',
      applicationSubCategory: 'Plagiarism Detection',
      operatingSystem: 'Any',
      browserRequirements: 'Requires a modern web browser with JavaScript enabled',
      inLanguage: 'en',
      isAccessibleForFree: true,
      featureList: [
        'Free plagiarism checking with no sign-up or account required',
        'AI writing detection for ChatGPT, GPT-4, Gemini, and Claude',
        'PDF, DOCX and TXT file upload support',
        'Up to 15,000 words per scan',
        '15-algorithm forensic analysis cascade',
        'Matched source links with direct URLs and confidence scores',
        'Downloadable forensic PDF reports with source attributions',
        'Plagiarism percentage scoring with heatmap visualization',
        '7-engine parallel web and academic database search',
        'MinHash, SimHash, and Winnowing document fingerprinting',
        'Paraphrase and conceptual similarity detection',
        'Real-time streaming results during scan',
        'Rate limiting and queue management for fair access',
        'SSRF protection and security hardening',
        'No data retention — documents processed in RAM only',
      ],
      screenshot: {
        '@type': 'ImageObject',
        url: absoluteUrl('/Scanterity.png'),
        caption: 'Scanterity free plagiarism checker interface',
      },
      image: {
        '@type': 'ImageObject',
        url: absoluteUrl('/Scanterity.png'),
        caption: 'Scanterity — Free Plagiarism Checker & AI Detector',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        url: absoluteUrl('/'),
        availability: 'https://schema.org/InStock',
        category: 'Free',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        bestRating: '5',
        worstRating: '1',
        ratingCount: '2847',
        reviewCount: '1563',
      },
      publisher: { '@id': absoluteUrl('/#organization') },
      mainEntityOfPage: { '@id': absoluteUrl('/#webpage') },
    },
    // ── HowTo Schema ─────────────────────────────────────────────────────
    {
      '@type': 'HowTo',
      '@id': absoluteUrl('/#howto'),
      name: 'How to Check Plagiarism for Free Online',
      description: 'Use Scanterity to check your document for plagiarism and AI-generated content in 3 simple steps. No sign-up required.',
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
          text: 'Upload a PDF, DOCX, or TXT file (up to 15,000 words) or paste your text directly into the Scanterity editor.',
          url: absoluteUrl('/#step1'),
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Initiate the Forensic Scan',
          text: 'Click the "Forensic Scan" button. The engine normalizes your text and cross-references it against billions of web pages and academic sources using 7 search engines simultaneously.',
          url: absoluteUrl('/#step2'),
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Review Detailed Results and Download Report',
          text: 'Review the exact plagiarism percentage, highlighted matches with source URLs, AI detection signals, and download a comprehensive forensic PDF report.',
          url: absoluteUrl('/#step3'),
        },
      ],
    },
    // ── FAQPage (10 questions targeting long-tail search queries) ─────────
    {
      '@type': 'FAQPage',
      '@id': absoluteUrl('/#faq'),
      isPartOf: { '@id': absoluteUrl('/#webpage') },
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is Scanterity plagiarism checker really free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Scanterity is a 100% free plagiarism checker online. There are no paywalls, no daily limits for reasonable use, and we never ask for your credit card. You can check up to 15,000 words per scan with no account required. We sustain the platform through optional premium features for enterprise users.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do you save or store my documents?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely not. We care about your privacy. All scans are processed in volatile memory (RAM) and immediately wiped after the session ends. Your work is never indexed, stored, or shared with third parties. We operate on a strict zero-retention policy.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can Scanterity detect AI-generated content from ChatGPT?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. The Scanterity AI content detector uses 16 statistical and linguistic signals to identify text generated by large language models including ChatGPT, GPT-4, GPT-4o, Gemini, Claude, and other AI writing tools. It analyzes burstiness, perplexity, lexical diversity, passive voice patterns, and formulaic sentence structures.',
          },
        },
        {
          '@type': 'Question',
          name: 'How accurate is Scanterity compared to Turnitin?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Scanterity uses a 15-algorithm forensic cascade including TF-IDF cosine similarity, n-gram shingling, MinHash/LSH fingerprinting, SimHash, Winnowing, LCS analysis, and edit distance matching. This multi-layered approach catches paraphrased content that single-algorithm tools miss. While Turnitin has a larger proprietary database, Scanterity searches 7 engines simultaneously including Google, Bing, DuckDuckGo, Yahoo, Wikipedia, CrossRef, and Semantic Scholar.',
          },
        },
        {
          '@type': 'Question',
          name: 'What file formats does Scanterity support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Scanterity supports PDF, DOCX (Microsoft Word), and TXT file uploads up to 15MB. You can also paste text directly into the editor. Maximum document length is 15,000 words per scan.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does Scanterity detect paraphrased plagiarism?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Scanterity goes beyond exact-match detection. Our engine uses stemmed Jaccard similarity, IDF-weighted word overlap, longest common subsequence (LCS) analysis, sliding window matching, and a weighted ensemble score to detect when sentences have been reworded while preserving the original meaning. This catches sophisticated paraphrasing that basic plagiarism checkers miss.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Scanterity a good alternative to Grammarly plagiarism checker?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. While Grammarly\'s plagiarism checker requires a paid Premium subscription, Scanterity offers forensic-grade plagiarism detection completely free. Scanterity also includes an AI writing detector, downloadable PDF reports, and searches across academic databases — features that Grammarly\'s plagiarism tool does not include.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can students use Scanterity to check essays before submission?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Absolutely. Scanterity is specifically designed for students who want to verify the originality of their essays, research papers, dissertations, and assignments before submitting them. It helps avoid unintentional plagiarism and academic integrity violations. No sign-up or payment is required.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many words can I check for plagiarism at once?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Scanterity supports documents up to 15,000 words per scan. This is sufficient for most essays, research papers, articles, and blog posts. The scan typically completes in 30-60 seconds depending on document length.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Scanterity check against academic databases and journals?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Scanterity searches across CrossRef (academic papers and DOIs), Semantic Scholar (research papers), Wikipedia, and four general web search engines simultaneously. This covers millions of academic publications, journal articles, conference papers, and preprints.',
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

// ────────────────────────────────────────────────────────────────────────────
// High-Intent Keywords Registry (used by pages for meta keywords)
// ────────────────────────────────────────────────────────────────────────────

export const HOME_KEYWORDS = [
  'free plagiarism checker',
  'plagiarism checker online',
  'plagiarism checker',
  'plagiarism detector',
  'check plagiarism',
  'plagiarism checker free',
  'AI detector',
  'AI writing detector',
  'AI content detector',
  'ChatGPT detector',
  'plagiarism checker for students',
  'free plagiarism checker for students',
  'plagiarism checker online free',
  'Turnitin alternative',
  'free Turnitin alternative',
  'Grammarly plagiarism checker alternative',
  'plagiarism checker no sign up',
  'plagiarism checker without login',
  'check for plagiarism free',
  'paraphrase detector',
  'duplicate content checker',
  'free AI detector',
  'plagiarism scanner',
  'online plagiarism checker',
  'best free plagiarism checker',
  'plagiarism percentage checker',
  'essay plagiarism checker',
  'research paper plagiarism checker',
  'academic plagiarism checker',
  'plagiarism report',
  'Scanterity',
];
