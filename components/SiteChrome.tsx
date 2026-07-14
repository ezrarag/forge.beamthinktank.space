'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { MinimalHeader } from '@/components/MinimalHeader'

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isCarouselHome = pathname === '/'

  return (
    <>
      {isCarouselHome ? null : <MinimalHeader />}
      <main className="relative z-10">{children}</main>
    </>
  )
}
