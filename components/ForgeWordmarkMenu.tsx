'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogIn } from 'lucide-react'
import { buildForgeHandoffUrl } from '@/lib/beam-home'

const beamDestinations = [
  { label: 'BEAM Home', detail: 'Network entry', href: 'https://home.beamthinktank.space' },
  { label: 'Grounds', detail: 'Civic places', href: 'https://grounds.beamthinktank.space' },
  { label: 'Orchestra', detail: 'Music and culture', href: 'https://orchestra.beamthinktank.space' },
  { label: 'ReadyAimGo', detail: 'Roles and opportunities', href: 'https://www.readyaimgo.biz' },
]

const forgeEntrances = [
  { label: 'Returning member', detail: 'Open your dashboard', role: 'community' as const },
  { label: 'Student', detail: 'Cohorts and project work', role: 'student' as const },
  { label: 'Community builder', detail: 'Independent collaboration', role: 'community' as const },
  { label: 'Business or partner', detail: 'Client and sponsor access', role: 'business' as const },
]

export function ForgeWordmarkMenu() {
  const [openMenu, setOpenMenu] = useState<'beam' | 'forge' | null>(null)
  const menuAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function closeFromOutside(event: PointerEvent) {
      if (!menuAreaRef.current?.contains(event.target as Node)) setOpenMenu(null)
    }
    function closeFromEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('pointerdown', closeFromOutside)
    document.addEventListener('keydown', closeFromEscape)
    return () => {
      document.removeEventListener('pointerdown', closeFromOutside)
      document.removeEventListener('keydown', closeFromEscape)
    }
  }, [])

  return (
    <div ref={menuAreaRef} className="relative flex items-center text-[0.68rem] uppercase tracking-[0.28em] text-white/58">
      <button type="button" onClick={() => setOpenMenu((current) => current === 'beam' ? null : 'beam')} aria-expanded={openMenu === 'beam'} aria-controls="beam-network-menu" className="inline-flex items-center gap-2 py-2 text-white transition hover:text-[#f5a623]">
        BEAM <ChevronDown className={`h-3 w-3 transition ${openMenu === 'beam' ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <span className="mx-3 text-white/30 sm:mx-4">·</span>
      <button type="button" onClick={() => setOpenMenu((current) => current === 'forge' ? null : 'forge')} aria-expanded={openMenu === 'forge'} aria-controls="forge-entry-menu" className="inline-flex items-center gap-2 py-2 text-white transition hover:text-[#f5a623]">
        Forge <ChevronDown className={`h-3 w-3 transition ${openMenu === 'forge' ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {openMenu === 'beam' ? (
        <div id="beam-network-menu" className="pixel-menu absolute left-0 top-full z-30 mt-3 w-[min(21rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-white/18 bg-[#090d16]/95 p-2 shadow-2xl backdrop-blur-xl">
          <p className="px-3 pb-2 pt-2 text-[0.62rem] tracking-[0.24em] text-[#f5a623]">BEAM network</p>
          {beamDestinations.map((destination) => <a key={destination.label} href={destination.href} className="pixel-menu-item flex items-center justify-between gap-4 rounded-xl px-3 py-3 normal-case tracking-normal transition hover:bg-white/[0.07]"><span className="text-sm font-semibold text-white">{destination.label}</span><span className="text-right text-xs text-white/42">{destination.detail}</span></a>)}
        </div>
      ) : null}

      {openMenu === 'forge' ? (
        <div id="forge-entry-menu" className="pixel-menu absolute left-0 top-full z-30 mt-3 w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-white/18 bg-[#090d16]/95 p-2 shadow-2xl backdrop-blur-xl sm:left-20">
          <p className="flex items-center gap-2 px-3 pb-2 pt-2 text-[0.62rem] tracking-[0.24em] text-[#f5a623]"><LogIn className="h-3.5 w-3.5" aria-hidden="true" /> Enter Forge</p>
          {forgeEntrances.map((entrance, index) => <a key={`${entrance.label}-${index}`} href={buildForgeHandoffUrl({ role: entrance.role, returnPath: '/dashboard' })} className="pixel-menu-item flex items-center justify-between gap-4 rounded-xl px-3 py-3 normal-case tracking-normal transition hover:bg-white/[0.07]"><span className="text-sm font-semibold text-white">{entrance.label}</span><span className="text-right text-xs text-white/42">{entrance.detail}</span></a>)}
        </div>
      ) : null}
    </div>
  )
}
