import type { MetadataRoute } from 'next';
import { HOME_DESCRIPTION } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Scanterity — Free Plagiarism Checker & AI Detector',
    short_name: 'Scanterity',
    description: HOME_DESCRIPTION,
    lang: 'en',
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FAFAFA',
    theme_color: '#0a0a0a',
    orientation: 'portrait-primary',
    categories: ['education', 'productivity', 'utilities'],
    prefer_related_applications: false,
    icons: [
      {
        src: '/favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon-48.png',
        sizes: '48x48',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon-32.png',
        sizes: '32x32',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Check Plagiarism',
        short_name: 'Scan',
        description: 'Start a new plagiarism and AI detection scan',
        url: '/',
      },
    ],
  };
}
