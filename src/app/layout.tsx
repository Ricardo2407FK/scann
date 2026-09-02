import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono, Plus_Jakarta_Sans, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://scanterity.com"),
  title: {
    default: "Scanterity — #1 Free Plagiarism Checker & AI Detector | Forensic Accuracy",
    template: "%s | Scanterity"
  },
  description: "Scanterity is the most advanced free plagiarism checker and AI content detector. Detect exact matches, deep paraphrasing, and ChatGPT/AI-generated text with forensic precision. Trusted by students, educators, and professionals worldwide. Try now — no sign-up required.",
  keywords: [
    // Primary high-volume keywords
    "plagiarism checker", "plagiarism checker free", "free plagiarism checker",
    "check plagiarism", "plagiarism detector", "plagiarism checker online",
    "best plagiarism checker", "plagiarism checker for students",
    // AI detection keywords (fast-growing volume)
    "AI detector", "AI content detector", "ChatGPT detector", "AI checker",
    "AI writing detector", "detect AI writing", "AI text detector",
    "AI plagiarism checker", "GPT detector", "check if text is AI",
    // Long-tail high-intent keywords
    "free plagiarism checker for students", "plagiarism checker no sign up",
    "online plagiarism checker free", "check my essay for plagiarism",
    "plagiarism checker for teachers", "plagiarism checker for research papers",
    "academic plagiarism checker", "university plagiarism checker",
    "plagiarism checker percentage", "turnitin alternative free",
    "grammarly plagiarism checker alternative", "copyscape alternative",
    // Feature-specific keywords
    "paraphrase detector", "content originality checker", "duplicate content checker",
    "forensic plagiarism detection", "deep scan plagiarism",
    "document similarity checker", "text comparison tool",
    // Brand + misspelling capture
    "Scanterity", "scanterity plagiarism checker",
    "plagarism checker", "plagerism checker", "plaigiarism checker",
    // SEO content marketing
    "how to check for plagiarism", "is my text plagiarized",
    "best free AI detector 2026", "plagiarism checker with percentage",
  ],
  authors: [{ name: "Scanterity Forensic Systems", url: "https://scanterity.com" }],
  creator: "Scanterity",
  publisher: "Scanterity Forensic Systems",
  category: "Education Technology",
  alternates: {
    canonical: "/",
    languages: {
      'en': '/',
      'x-default': '/',
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://scanterity.com",
    title: "Scanterity — #1 Free Plagiarism Checker & AI Detector",
    description: "The most advanced free plagiarism checker with multi-signal forensic detection. Catches exact matches, paraphrasing, and AI-generated text. No sign-up required.",
    siteName: "Scanterity",
    images: [
      {
        url: "/Scanterity.png",
        width: 1200,
        height: 630,
        alt: "Scanterity — Free Forensic Plagiarism Checker & AI Content Detector",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scanterity — #1 Free Plagiarism Checker & AI Detector",
    description: "Advanced forensic plagiarism detection. Catches exact matches, paraphrasing & AI text. Free, no sign-up.",
    images: ["/Scanterity.png"],
    creator: "@scanterity",
    site: "@scanterity",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "scanterity-google-verification",
  },
  other: {
    'apple-mobile-web-app-title': 'Scanterity',
    'application-name': 'Scanterity',
    'msapplication-TileColor': '#000000',
  },
  icons: {
    icon: [
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
    ],
    shortcut: '/favicon-32.png',
  },
};

// JSON-LD Structured Data for rich Google results
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://scanterity.com/#organization",
      "name": "Scanterity Forensic Systems",
      "url": "https://scanterity.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://scanterity.com/Scanterity.png",
        "width": 512,
        "height": 512,
      },
      "sameAs": [],
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "email": "hello@scanterity.com",
          "availableLanguage": ["English"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://scanterity.com/#website",
      "name": "Scanterity",
      "alternateName": ["Scanterity Plagiarism Checker", "Scanterity AI Detector"],
      "url": "https://scanterity.com",
      "publisher": { "@id": "https://scanterity.com/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://scanterity.com/?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebApplication",
      "@id": "https://scanterity.com/#webapp",
      "name": "Scanterity — Free Plagiarism Checker & AI Detector",
      "url": "https://scanterity.com",
      "description": "The #1 free plagiarism checker and AI content detector. Detect exact matches, deep paraphrasing, and ChatGPT/AI-generated text with forensic precision. No sign-up required. Trusted by students, educators, and professionals.",
      "applicationCategory": "EducationalApplication",
      "applicationSubCategory": "Plagiarism Detection",
      "operatingSystem": "All",
      "browserRequirements": "Requires a modern web browser",
      "featureList": "Plagiarism Detection, AI Content Detection, Paraphrase Detection, Forensic PDF Reports, Document Upload, Multi-Algorithm Analysis",
      "screenshot": "https://scanterity.com/Scanterity.png",
      "softwareVersion": "2.0",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free plagiarism and AI detection — no sign-up, no credit card",
        "availability": "https://schema.org/InStock",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "3841",
        "bestRating": "5",
        "worstRating": "1",
      },
      "publisher": { "@id": "https://scanterity.com/#organization" },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://scanterity.com/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://scanterity.com" },
        { "@type": "ListItem", "position": 2, "name": "Plagiarism Checker", "item": "https://scanterity.com" },
      ],
    },
    {
      "@type": "HowTo",
      "@id": "https://scanterity.com/#howto",
      "name": "How to Check for Plagiarism with Scanterity",
      "description": "Use Scanterity's free plagiarism checker to detect copied content, paraphrasing, and AI-generated text in seconds.",
      "totalTime": "PT1M",
      "tool": { "@type": "HowToTool", "name": "Scanterity Plagiarism Checker" },
      "step": [
        { "@type": "HowToStep", "position": 1, "name": "Paste or Upload", "text": "Paste your text into the editor or upload a PDF, DOCX, or TXT file." },
        { "@type": "HowToStep", "position": 2, "name": "Click Forensic Scan", "text": "Click the Forensic Scan button to start the analysis." },
        { "@type": "HowToStep", "position": 3, "name": "Review Results", "text": "View detailed plagiarism scores, matched sources, AI detection results, and download a professional PDF report." },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://scanterity.com/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is Scanterity free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Scanterity is 100% free with no sign-up, no credit card, and no hidden limits. Simply paste your text or upload a document and click Forensic Scan to get instant results.",
          },
        },
        {
          "@type": "Question",
          "name": "How accurate is Scanterity's plagiarism detection?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Scanterity uses a proprietary multi-signal forensic engine that goes beyond simple string matching. It detects exact copies, intelligent paraphrasing, and conceptual similarity across billions of web pages, academic journals, and published works — delivering industry-leading accuracy.",
          },
        },
        {
          "@type": "Question",
          "name": "Can Scanterity detect AI-generated content from ChatGPT?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Scanterity's built-in AI detector analyzes perplexity, burstiness, and linguistic fingerprints to identify content generated by ChatGPT, GPT-4, Claude, Gemini, and other large language models with high confidence.",
          },
        },
        {
          "@type": "Question",
          "name": "Does Scanterity store my documents?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. All documents are processed in volatile memory (RAM) and immediately discarded. Nothing is stored, indexed, or shared. Scanterity is fully GDPR and CCPA compliant.",
          },
        },
        {
          "@type": "Question",
          "name": "Is Scanterity better than Turnitin or Grammarly?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Scanterity combines plagiarism detection, paraphrase detection, and AI content detection in one free tool — capabilities that require premium subscriptions on Turnitin or Grammarly. It also provides forensic PDF reports with source attributions and confidence scores, all with no sign-up required.",
          },
        },
        {
          "@type": "Question",
          "name": "Can I use Scanterity for academic papers and essays?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. Scanterity is built for students, teachers, professors, and researchers. Upload essays, theses, or research papers to get detailed originality reports with match percentages, source links, and downloadable PDF reports.",
          },
        },
        {
          "@type": "Question",
          "name": "What file formats does Scanterity support?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Scanterity accepts PDF, DOCX, and TXT files, or you can paste text directly into the editor. Documents up to 15,000 words can be scanned in a single check.",
          },
        },
        {
          "@type": "Question",
          "name": "How is Scanterity different from other plagiarism checkers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Scanterity is the only free tool that combines forensic plagiarism detection, deep paraphrase analysis, and AI content detection in a single scan. Most competitors charge for these features separately. Scanterity also generates professional PDF reports and requires no account creation.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} ${hankenGrotesk.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" type="image/png" href="/favicon-32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/favicon-16.png" sizes="16x16" />
        <link rel="icon" type="image/png" href="/favicon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="shortcut icon" href="/favicon-32.png" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Material Symbols is not available via next/font; App Router layout applies to all routes */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
        {/* JSON-LD Structured Data for Google rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
