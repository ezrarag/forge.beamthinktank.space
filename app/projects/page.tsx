'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { forgeProjects } from '@/lib/forge-content'
import type { ForgeTrackId } from '@/lib/types'

const filters: Array<{ id: ForgeTrackId | 'all'; label: string }> = [
  { id: 'all', label: 'All projects' },
  { id: 'fintech', label: 'Fintech' },
  { id: 'software', label: 'Software' },
  { id: 'fabrication', label: 'Fabrication' },
  { id: 'it', label: 'Infrastructure' },
]

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ForgeTrackId | 'all'>('all')
  const projects = useMemo(() => forgeProjects.filter((project) => filter === 'all' || project.track === filter), [filter])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Project Board</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Active and past Forge work across BEAM and partner delivery.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
          This board spans internal R&D, NGO platform work, repair initiatives, and outside client engagements. Filter by track to isolate the current operating surface.
        </p>
      </section>

      <section className="mt-8 flex flex-wrap gap-3">
        {filters.map((option) => (
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

      <section className="mt-8 grid gap-4 xl:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="rounded-[1.75rem] border border-white/10 bg-[#0d111d] p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#f5a623]/24 bg-[#f5a623]/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f5a623]">
                {project.phase}
              </span>
              <span className="text-xs uppercase tracking-[0.16em] text-white/42">{project.track}</span>
              <span className="text-xs uppercase tracking-[0.16em] text-white/42">{project.partner}</span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-white">{project.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/68">{project.summary}</p>
            <p className="mt-4 text-sm font-medium text-white">{project.compensation}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.outcomes.map((outcome) => (
                <span key={outcome} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/66">
                  {outcome}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm text-white/70">
          Want access to assignments, compensation context, and cohort placement? <Link href="/join" className="font-semibold text-white">Join Forge through BEAM Home</Link>.
        </p>
      </section>
    </div>
  )
}

