import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME || 'Secure Auth',
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME || 'Secure Auth'}`,
  },
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Secure and reliable authentication service.',
  keywords: process.env.NEXT_PUBLIC_APP_KEYWORDS || 'auth, security, oidc',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
