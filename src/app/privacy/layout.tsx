import { createPageMetadata, createBreadcrumbJsonLd, serializeJsonLd } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Privacy Policy',
  description:
    'Read Scanterity\'s privacy policy to understand document processing, data retention, cookies, third-party services and your privacy rights.',
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
