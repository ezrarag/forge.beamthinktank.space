import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppHeader } from '@/components/AppHeader'
import { AuthBootstrapper } from '@/components/AuthBootstrapper'
import { SiteFooter } from '@/components/SiteFooter'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'BEAM Forge',
  description: 'Technology, fabrication, fintech, and infrastructure arm of the BEAM Think Tank nonprofit ecosystem.',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#070912] text-white antialiased">
        <AuthBootstrapper />
        <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(245,166,35,0.16),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(62,174,255,0.14),transparent_26%),linear-gradient(180deg,#090b14_0%,#070912_52%,#06070c_100%)]">
          <div className="pointer-events-none absolute inset-0 bg-forge-grid bg-[size:40px_40px] opacity-[0.06]" />
          <AppHeader />
          <main className="relative z-10">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  )
}
