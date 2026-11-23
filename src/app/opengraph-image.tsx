import { ImageResponse } from 'next/og';
import { SITE_NAME, SOCIAL_IMAGE } from '@/lib/seo';

export const alt = SOCIAL_IMAGE.alt;
export const size = { width: SOCIAL_IMAGE.width, height: SOCIAL_IMAGE.height };
export const contentType = 'image/png';

// Pre-rendered by Next.js at build time; no external image or font requests.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', height: '100%', padding: 64, background: '#FAFAFA', color: '#111', border: '16px solid #B794F6' }}>
        <div style={{ display: 'flex', fontSize: 36, fontWeight: 700 }}>{SITE_NAME}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', fontSize: 70, fontWeight: 700, letterSpacing: -3 }}>Free Plagiarism Checker</div>
          <div style={{ display: 'flex', fontSize: 70, fontWeight: 700, letterSpacing: -3 }}>&amp; AI Detector</div>
          <div style={{ display: 'flex', fontSize: 28, marginTop: 12, color: '#444' }}>Check your writing. Review sources. Download reports.</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24 }}>
          <div style={{ display: 'flex', padding: '12px 20px', background: '#B794F6', border: '2px solid #111', borderRadius: 8 }}>Free · No sign-up</div>
          <div style={{ display: 'flex' }}>scanterity.com</div>
        </div>
      </div>
    ),
    size,
  );
}
