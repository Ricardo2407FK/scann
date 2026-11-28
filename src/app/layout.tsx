import type { Metadata, Viewport } from "next";
import { Inter, Outfit, JetBrains_Mono, Plus_Jakarta_Sans, Hanken_Grotesk } from "next/font/google";
import { HOME_DESCRIPTION, HOME_TITLE, SITE_NAME, SITE_URL, SOCIAL_IMAGE, serializeJsonLd, siteJsonLd } from "@/lib/seo";
import CookieConsent from "@/components/CookieConsent";
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
  // This is a fallback family, not an initial-render font.
  preload: false,
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  // Used in scan results; keep it available without competing with hero fonts.
  preload: false,
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
});

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
const bingVerification = process.env.BING_SITE_VERIFICATION?.trim();
const yandexVerification = process.env.YANDEX_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE + ' | ' + SITE_NAME,
    template: '%s | ' + SITE_NAME,
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Scanterity Forensic Systems", url: SITE_URL }],
  creator: SITE_NAME,
  publisher: "Scanterity Forensic Systems",
  category: "Education Technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Public pages opt into indexing in createPageMetadata(). Do not override 404s.
  // Emit verification tags only when real tokens are supplied at build time.
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { other: { 'msvalidate.01': bingVerification } } : {}),
    ...(yandexVerification ? { yandex: yandexVerification } : {}),
  },
  // Fallback Open Graph metadata — pages override this via createPageMetadata()
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${HOME_TITLE} | ${SITE_NAME}`,
    description: HOME_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${HOME_TITLE} | ${SITE_NAME}`,
    description: HOME_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: 'black-translucent',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#000000',
    'google-adsense-account': 'ca-pub-4767507523459649',
  },
  icons: {
    icon: [
      { url: '/favicon-48.png', type: 'image/png', sizes: '48x48' },
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} ${hankenGrotesk.variable}`} suppressHydrationWarning>
      <head>
        {/* Preconnect hints for faster external resource loading — these are non-blocking */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Material Symbols is not available via next/font; App Router layout applies to all routes */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
        {/* JSON-LD Structured Data for Google rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteJsonLd) }}
        />
        {/* Google Consent Mode v2 + Global Privacy Control (GPC) default state.
            Defaults ad/analytics storage to denied until explicit user consent,
            while allowing non-personalized AdSense fallback when declined. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}window.gtag=gtag;gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});gtag('set','ads_data_redaction',true);try{var gpc=navigator.globalPrivacyControl===true;var saved=localStorage.getItem('scanterity_cookie_consent');if(saved==='all'&&!gpc){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});gtag('set','ads_data_redaction',false);}else{window.adsbygoogle=window.adsbygoogle||[];window.adsbygoogle.requestNonPersonalizedAds=1;}}catch(e){window.adsbygoogle=window.adsbygoogle||[];window.adsbygoogle.requestNonPersonalizedAds=1;}`,
          }}
        />
        {/* Google AdSense — rendered as a plain <script> in <head> so the
            AdSense verification crawler sees it in the raw server-rendered HTML.
            Respects Consent Mode v2 defaults set immediately above. */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4767507523459649"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
