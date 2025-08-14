import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Small Wins - The game of your day',
  description: 'Log tiny victories, keep a streak, and compete with friends weekly.',
  keywords: ['small wins', 'achievements', 'productivity', 'goals', 'daily wins'],
  authors: [{ name: 'Small Wins Team' }],
  creator: 'Small Wins',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://smallwins.com',
    title: 'Small Wins - The game of your day',
    description: 'Log tiny victories, keep a streak, and compete with friends weekly.',
    siteName: 'Small Wins',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Small Wins - The game of your day',
    description: 'Log tiny victories, keep a streak, and compete with friends weekly.',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body
        className="antialiased"
        style={{
          margin: 0,
          minHeight: '100svh',
          backgroundColor: '#0b1026',
          color: 'white',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.08)'
        }}>
          <Link href="/" style={{ fontWeight: 800, fontSize: 18, color: 'white', textDecoration: 'none' }}>Small Wins</Link>
          <nav style={{ display: 'flex', gap: 12 }}>
            <Link href="/waitlist" className="ctaSecondary">Waitlist</Link>
            <Link href="/plans" className="ctaSecondary">Plans</Link>
            <Link href="/auth/sign-in" className="ctaSecondary">Sign in</Link>
            <Link href="/auth/sign-up" className="ctaPrimary">Create account</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  )
}
