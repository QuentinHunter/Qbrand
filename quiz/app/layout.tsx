import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Growth Score Assessment | Quentin Hunter',
  description: 'Discover your #1 growth bottleneck in 5 minutes. Get your free Growth Score and personalised recommendations.',
  openGraph: {
    title: 'Growth Score Assessment | Quentin Hunter',
    description: 'Discover your #1 growth bottleneck in 5 minutes.',
    url: 'https://quentinhunter.com/growthquiz',
    siteName: 'Quentin Hunter',
    images: [
      {
        url: 'https://quentinhunter.com/assets/images/og-image.png',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Growth Score Assessment | Quentin Hunter',
    description: 'Discover your #1 growth bottleneck in 5 minutes.',
    images: ['https://quentinhunter.com/assets/images/og-image.png'],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="vtag-ai-js"
          src="https://r2.leadsy.ai/tag.js"
          data-pid="12bSesNSEJRsOY7d8"
          data-version="062024"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
