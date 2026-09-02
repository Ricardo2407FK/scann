import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Scanterity — Free Plagiarism Checker & AI Detector',
    short_name: 'Scanterity',
    description: 'The #1 free plagiarism checker and AI content detector. Detect exact matches, deep paraphrasing, and AI-generated text with forensic precision. No sign-up required.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f3f0',
    theme_color: '#0a0a0a',
    orientation: 'portrait-primary',
    categories: ['education', 'productivity', 'utilities'],
    icons: [
      {
        src: '/favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon-48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/favicon-32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
  };
}
