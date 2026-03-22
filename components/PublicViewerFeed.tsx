'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, Filter } from 'lucide-react'
import Link from 'next/link'
import { forgeFeed, forgeTracks } from '@/lib/forge-content'
import type { ForgeTrackId } from '@/lib/types'

const filterOptions: Array<{ id: ForgeTrackId | 'all'; label: string }> = [
  { id: 'all', label: 'All panels' },
  { id: 'fintech', label: 'Fintech' },
  { id: 'software', label: 'Software' },
  { id: 'fabrication', label: 'Fabrication' },
  { id: 'it', label: 'Infrastructure' },
]

export function PublicViewerFeed() {
  const [filter, setFilter] = useState<ForgeTrackId | 'all'>('all')

  const items = useMemo(() => {
    return forgeFeed.filter((entry) => filter === 'all' || entry.track === filter)
  }, [filter])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Forge Viewer</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Public content panels modeled after the orchestra viewer pattern.
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
              Slides and panels stay grouped into releases, logs, and output snapshots so public viewers can track work without
              entering the participant system.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
            <Filter className="h-4 w-4 text-[#f5a623]" />
            Viewer panels
          </div>
        </div>
      </section>

      <section className="mt-8 flex flex-wrap gap-3">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              filter === option.id
                ? 'border-[#f5a623]/40 bg-[#f5a623]/12 text-[#f5a623]'
                : 'border-white/10 bg-white/[0.02] text-white/68 hover:border-white/24 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-[0.68fr_1.32fr]">
        <div className="space-y-4">
          {forgeTracks.map((track) => {
            const Icon = track.icon
            return (
              <article key={track.id} className="rounded-[1.5rem] border border-white/10 bg-[#0d111d] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-[#f5a623]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.16em] text-white/40">{track.id}</span>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-white">{track.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/64">{track.tagline}</p>
              </article>
            )
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((entry) => (
            <article key={entry.id} className="rounded-[1.75rem] border border-white/10 bg-[#111522] p-5 shadow-forge">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-[#f5a623]/24 bg-[#f5a623]/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f5a623]">
                  {entry.type.replace('-', ' ')}
                </span>
                <span className="text-xs text-white/42">{entry.publishedAt}</span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold text-white">{entry.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/68">{entry.summary}</p>
              <div className="mt-6 space-y-2">
                {entry.panels.map((panel, index) => (
                  <div key={`${entry.id}-${index}`} className="rounded-xl border border-white/8 bg-black/20 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/42">Panel {index + 1}</p>
                    <p className="mt-1 text-sm text-white/78">{panel}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-white/62">
                <span>{entry.author}</span>
                <Link href="/join" className="inline-flex items-center gap-2 font-semibold text-white">
                  Join this track
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

