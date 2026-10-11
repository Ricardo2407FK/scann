import { createPageMetadata, createBreadcrumbJsonLd, serializeJsonLd } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Privacy Policy',
  description:
    'Read Scanterity\'s privacy policy. Learn how we handle your documents with zero retention, ephemeral RAM-only processing, and full GDPR & CCPA compliance. Your documents are never stored, indexed, or shared.',
  path: '/privacy',
});

const breadcrumbJsonLd = createBreadcrumbJsonLd([
  { name: 'Privacy Policy', path: '/privacy' },
]);

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
