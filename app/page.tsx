import { Metadata } from 'next';
import { Header } from '@/app/_components/landing/header';
import { MainContent } from '@/app/_components/landing/main-content';
import { Footer } from '@/app/_components/landing/footer';

// Konfigurasi situs untuk branding dan link
const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Secure Auth',
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Layanan otentikasi terpusat yang aman, handal, dan self-hosted, dibangun di atas standar OIDC/OAuth2 untuk mengamankan semua aplikasi Anda.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://join.tumbuhide.tech',
  links: {
    docs: process.env.NEXT_PUBLIC_DOCS_URL || '/docs', // Arahkan ke dokumentasi internal atau eksternal
  },
};

// Menambahkan Metadata untuk SEO dan Social Sharing
export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['OIDC', 'OAuth2', 'Authentication', 'Authorization', 'Self-Hosted', 'Security', 'Identity Provider'],
  authors: [{ name: 'AI Developer' }],
  creator: 'AI Developer',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    // Tambahkan gambar di /public/og.png (1200x630)
    // images: [`${siteConfig.url}/og.png`], 
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    // Tambahkan gambar di /public/og.png (1200x630)
    // images: [`${siteConfig.url}/og.png`], 
    creator: '@your_twitter_handle',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <MainContent siteConfig={siteConfig} />
      <Footer />
    </div>
  );
}
