import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '66px 76px', color: '#F4F4F8', background: 'radial-gradient(ellipse at 76% 22%, #7C5CFF55 0%, transparent 40%), #0B0B12', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 31, fontWeight: 700, letterSpacing: '-1px' }}><span style={{ width: 37, height: 37, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', background: 'linear-gradient(120deg,#7C5CFF,#FF5D8F)' }}>c</span> clipper<span style={{ color: '#FF5D8F' }}>.ai</span></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}><div style={{ color: '#FF5D8F', fontSize: 18, letterSpacing: '3px' }}>HIGHLIGHTS · AUDIO · EDITING</div><div style={{ maxWidth: 940, fontSize: 78, fontWeight: 700, letterSpacing: '-4px', lineHeight: 1.02 }}>Find the best in any video.</div><div style={{ color: '#AAA9B9', fontSize: 26 }}>Your moments, ready to share.</div></div>
      <div style={{ width: '100%', height: 2, background: 'linear-gradient(90deg,#7C5CFF,#FF5D8F,transparent)' }} />
    </div>,
    size,
  );
}
