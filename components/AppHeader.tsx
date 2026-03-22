import Link from 'next/link'
import { Anvil, ArrowUpRight, CircuitBoard, LogIn, TerminalSquare, Wrench } from 'lucide-react'
import { buildForgeHandoffUrl } from '@/lib/beam-home'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/viewer', label: 'Viewer' },
  { href: '/tracks', label: 'Tracks' },
  { href: '/projects', label: 'Projects' },
  { href: '/member', label: 'Member' },
]

export function AppHeader({ className }: { className?: string }) {
  return (
    <header className={cn('sticky top-0 z-50 border-b border-white/10 bg-[#090b14]/85 backdrop-blur-xl', className)}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f5a623]/40 bg-[#f5a623]/12 text-[#f5a623] shadow-forge">
            <Anvil className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.26em] text-[#f5a623]">BEAM Forge</p>
            <p className="truncate text-sm text-white/72">Technology, fabrication, fintech, infrastructure</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-white/76 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-white/70 xl:flex">
            <CircuitBoard className="h-4 w-4" />
            <TerminalSquare className="h-4 w-4" />
            <Wrench className="h-4 w-4" />
          </div>
          <Link
            href={buildForgeHandoffUrl({ returnPath: '/member' })}
            className="inline-flex items-center gap-2 rounded-full border border-white/14 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/[0.04]"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
          <Link
            href="/join"
            className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-4 py-2 text-sm font-semibold text-[#11131d] transition hover:brightness-105"
          >
            Join Forge
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}

