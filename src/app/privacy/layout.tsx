import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — How Scanterity Protects Your Data',
  description: 'Scanterity Privacy Policy — Learn how we protect your data. Zero storage, ephemeral processing, full GDPR & CCPA compliance. Your documents are never saved, indexed, or shared.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: 'Privacy Policy | Scanterity',
    description: 'Zero-storage privacy architecture. Your documents are processed in RAM and immediately discarded. Fully GDPR & CCPA compliant.',
    url: 'https://scanterity.com/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
