import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { forgeTracks } from '@/lib/forge-content'

export default function TracksPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Forge Tracks</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Cohort pathways across the Forge operating floor.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
          Each track can onboard students, professors, and community collaborators through BEAM Home while keeping public work visible through Forge.
        </p>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        {forgeTracks.map((track) => {
          const Icon = track.icon
          return (
            <article key={track.id} className="rounded-[1.75rem] border border-white/10 bg-[#0d111d] p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-2xl border border-[#f5a623]/24 bg-[#f5a623]/10 p-3 text-[#f5a623]">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/44">
                  {track.cohortWindow}
                </span>
              </div>
              <h2 className="mt-5 text-3xl font-semibold text-white">{track.title}</h2>
              <p className="mt-2 text-base text-white/74">{track.tagline}</p>
              <p className="mt-4 text-sm leading-7 text-white/66">{track.summary}</p>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#f5a623]">Focus Areas</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {track.focusAreas.map((item) => (
                      <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/66">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#f5a623]">Current Openings</p>
                  <div className="mt-3 space-y-2">
                    {track.openings.map((opening) => (
                      <div key={opening} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/72">
                        {opening}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/join" className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-4 py-2 text-sm font-semibold text-[#11131d]">
                  Apply via BEAM Home
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/projects" className="inline-flex items-center gap-2 rounded-full border border-white/14 px-4 py-2 text-sm font-medium text-white">
                  View projects
                </Link>
              </div>
            </article>
          )
        })}
      </section>
    </div>
  )
}

