import type { Metadata } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Empire Empire Cloud Cockpit | Grow, Sell, Heal 🌾⚖️🇺🇸',
  description: 'Voice-first cannabis commerce cockpit with gamification, policy tools, and Herbitrage Greeks. Texas Truth Terminal for cannabis freedom.',
  keywords: ['cannabis', 'hemp', 'thca', 'texas', 'commerce', 'gamification', 'policy', 'advocacy'],
  authors: [{ name: 'Jesse Niesen', url: 'https://reggieanddro.com' }],
  creator: 'Reggie & Dro LLC',
  publisher: 'LivHana AI',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://empireempire.com',
    title: 'Empire Empire Cloud Cockpit',
    description: 'Grow, Sell, Heal. Texas Truth Terminal for cannabis freedom.',
    siteName: 'Empire Empire',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Empire Empire Cloud Cockpit',
    description: 'Grow, Sell, Heal. Texas Truth Terminal.',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-texas-blue via-slate-900 to-black text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
