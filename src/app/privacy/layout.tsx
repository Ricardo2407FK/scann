import { createPageMetadata } from '@/lib/seo';

export const metadata = createPageMetadata({
  title: 'Privacy Policy',
  description: 'Read the Scanterity privacy policy for details about document processing, data collection, cookies, retention, and your privacy rights.',
  path: '/privacy',
});

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
