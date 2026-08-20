import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppLayoutShell } from '@/components/AppLayoutShell'
import { AuthBootstrapper } from '@/components/AuthBootstrapper'
import { ForgeContentProvider } from '@/components/ForgeContentProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'BEAM Forge',
  description: 'Technology, fabrication, fintech, content, and infrastructure arm of the BEAM Think Tank nonprofit ecosystem.',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#070912] text-white antialiased">
        <AuthBootstrapper>
          <ForgeContentProvider>
            <AppLayoutShell>{children}</AppLayoutShell>
          </ForgeContentProvider>
        </AuthBootstrapper>
      </body>
    </html>
  )
}
