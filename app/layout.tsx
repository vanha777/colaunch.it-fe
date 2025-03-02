import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Head from 'next/head';
import { Analytics } from "@vercel/analytics/react"
import { config } from '@fortawesome/fontawesome-svg-core'
import '@fortawesome/fontawesome-svg-core/styles.css'
import { AppProvider } from './utils/AppContext';
config.autoAddCss = false
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CoLaunch - Connect Business and Scale Up',
  description: 'CoLaunch is a platform that connects businesses and scale ups with the right people and resources to help them grow.',
  openGraph: {
    title: 'CoLaunch - Connect Business and Scale Up',
    description: 'CoLaunch is a platform that connects businesses and scale ups with the right people and resources to help them grow.',
    // url: 'https://www.metaloot.dev/',
    images: [
      {
        url: 'https://vbfejmafjqgcfrzxewcd.supabase.co/storage/v1/object/public/general//colaunchit.jpeg',
        alt: 'CoLaunch - Connect Business and Scale Up',
      },
    ],
  },
  icons: {
    icon: '/logo.png',
    // You can also specify different sizes
    apple: [
      { url: '/logo.png' },
      { url: '/apple.png', sizes: '180x180' }
    ],
    shortcut: '/favicon.ico'
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light">
      <Head>
        {/* General Meta Tags */}
        <meta name="title" content="CoLaunch - Connect Business and Scale Up" />
        <meta name="description" content="CoLaunch is a platform that connects businesses and scale ups with the right people and resources to help them grow." />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.metaloot.dev/" />
        <meta property="og:title" content="MetaLoot - Gaming Digital Asset Register" />
        <meta property="og:description" content="Ship faster, cheaper and better with our API." />
        <meta property="og:image" content="https://vbfejmafjqgcfrzxewcd.supabase.co/storage/v1/object/public/general//colaunchit.jpeg" />
        <meta property="og:image:alt" content="A stunning preview of MetaLoot's multiverse gaming platform" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.metaloot.dev/" />
        <meta name="twitter:title" content="MetaLoot - Gaming Digital Asset Register" />
        <meta name="twitter:description" content="Ship faster, cheaper and better with our API." />
        <meta name="twitter:image" content="https://vbfejmafjqgcfrzxewcd.supabase.co/storage/v1/object/public/general//colaunchit.jpeg" />
        <meta name="twitter:image:alt" content="A stunning preview of MetaLoot's multiverse gaming platform" />
        <meta name="twitter:site" content="@playmetaloot" />
        <meta name="twitter:creator" content="@playmetaloot" />

        {/* Telegram */}
        <meta property="og:title" content="MetaLoot - Gaming Digital Asset Register" />
        <meta property="og:description" content="Ship faster, cheaper and better with our API." />
        <meta property="og:image" content="https://vbfejmafjqgcfrzxewcd.supabase.co/storage/v1/object/public/general//colaunchit.jpeg" />
        <meta property="og:url" content="https://www.metaloot.dev/" />

        {/* Discord */}
        <meta property="og:title" content="MetaLoot - Gaming Digital Asset Register" />
        <meta property="og:description" content="Ship faster, cheaper and better with our API." />
        <meta property="og:image" content="https://vbfejmafjqgcfrzxewcd.supabase.co/storage/v1/object/public/general//colaunchit.jpeg" />
        <meta property="og:type" content="website" />
      </Head>
      <body suppressHydrationWarning={true} className={inter.className}>
        <AppProvider>
          {children}
        </AppProvider>
        <Analytics />
      </body>
    </html>
  )
} 