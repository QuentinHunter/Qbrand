import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
