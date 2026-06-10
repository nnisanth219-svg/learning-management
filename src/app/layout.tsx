import { APP_BRAND } from '@/lib/branding';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import faviconSvg from '@/assets/images/favicon.svg';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1E40AF',
};

export const metadata: Metadata = {
  title: {
    default: `${APP_BRAND.name} — ${APP_BRAND.tagline}`,
    template: `%s | ${APP_BRAND.name}`,
  },
  description: APP_BRAND.description,
  icons: {
    icon: { url: faviconSvg.src, type: 'image/svg+xml' },
  },
  openGraph: {
    type: 'website',
    siteName: APP_BRAND.name,
    title: APP_BRAND.title,
    description: APP_BRAND.description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
