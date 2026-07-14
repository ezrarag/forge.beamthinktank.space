'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ForgeWordmarkMenu } from '@/components/ForgeWordmarkMenu'

const links = [{ href: '/projects', label: 'Projects', shortLabel: 'Projects' }, { href: '/services-survey', label: 'Services survey', shortLabel: 'Survey' }]

export function MinimalHeader() {
  const pathname = usePathname()
  return <header className="sticky top-0 z-50 h-[4.5rem] border-b border-white/[0.08] bg-[#070912]/90 backdrop-blur-xl"><div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12"><ForgeWordmarkMenu /><nav aria-label="Primary" className="flex items-center gap-4 text-[0.58rem] uppercase tracking-[0.16em] text-white/45 sm:gap-6 sm:text-[0.62rem] sm:tracking-[0.2em]">{links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} className={`transition hover:text-white ${pathname === link.href ? 'text-[#f5a623]' : ''}`}><span className="sm:hidden">{link.shortLabel}</span><span className="hidden sm:inline">{link.label}</span></Link>)}</nav></div></header>
}
