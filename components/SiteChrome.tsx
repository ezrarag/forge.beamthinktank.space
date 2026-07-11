'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AppHeader } from '@/components/AppHeader'
import { SiteFooter } from '@/components/SiteFooter'

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isCarouselHome = pathname === '/'

  return (
    <>
      {isCarouselHome ? null : <AppHeader />}
      <main className="relative z-10">{children}</main>
      {isCarouselHome ? null : <SiteFooter />}
    </>
  )
}
