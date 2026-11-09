import type { Metadata } from 'next';
import PointerFollower from '../components/PointerFollower';
import { Bricolage_Grotesque, Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';
import '@clipper/ui/tokens.css';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin', 'latin-ext'], weight: ['700', '800'], variable: '--font-display', display: 'swap' });
const editorial = Instrument_Serif({ subsets: ['latin', 'latin-ext'], weight: '400', style: ['italic'], variable: '--font-editorial', display: 'swap', preload: false });
const sans = Inter({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], variable: '--font-mono', display: 'swap', preload: false });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clipper.ai'),
  title: 'Clipper — Encontrá lo mejor de cualquier video',
  description: 'Encontrá los mejores momentos, editá clips y armá videos con tus fotos.',
  openGraph: {
    title: 'Clipper — Encontrá lo mejor de cualquier video',
    description: 'Clips listos para publicar, con subtítulos y audio.',
    type: 'website',
    locale: 'es_AR',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${display.variable} ${editorial.variable} ${sans.variable} ${mono.variable}`}>
        {children}
        <PointerFollower />
      </body>
    </html>
  );
}
