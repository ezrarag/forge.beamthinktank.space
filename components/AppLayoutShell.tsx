'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { AppHeader } from '@/components/AppHeader'
import { SiteFooter } from '@/components/SiteFooter'

export function AppLayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard' || pathname?.startsWith('/dashboard')

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(245,166,35,0.16),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(62,174,255,0.14),transparent_26%),linear-gradient(180deg,#090b14_0%,#070912_52%,#06070c_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-forge-grid bg-[size:40px_40px] opacity-[0.06]" />
      {!isDashboard && <AppHeader />}
      <main className="relative z-10">{children}</main>
      {!isDashboard && <SiteFooter />}
    </div>
  )
}
