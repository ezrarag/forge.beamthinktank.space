import Link from 'next/link'
import { ArrowRight, Boxes, HardDriveDownload, Orbit, ShieldCheck } from 'lucide-react'
import { buildForgeHandoffUrl } from '@/lib/beam-home'
import { forgeFeed, forgeProjects, forgeSlides, forgeTracks } from '@/lib/forge-content'
import { SubscribeForm } from '@/components/SubscribeForm'

const panelIcons = [Boxes, Orbit, ShieldCheck, HardDriveDownload]

export function ForgeLanding() {
  return (
    <div className="space-y-20 pb-20">
      <section className="mx-auto grid min-h-[calc(100dvh-7rem)] max-w-7xl gap-8 px-4 pt-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:pt-16">
        <div className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#f5a623]">
              Forge Slide Deck
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                {forgeSlides[0]?.title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                {forgeSlides[0]?.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/viewer"
                className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-5 py-3 text-sm font-semibold text-[#11131d]"
              >
                Open Viewer
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={buildForgeHandoffUrl({ returnPath: '/member' })}
                className="inline-flex items-center gap-2 rounded-full border border-white/14 px-5 py-3 text-sm font-medium text-white"
              >
                Sign In Through Home
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {forgeSlides.map((slide) => (
              <article key={slide.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{slide.eyebrow}</p>
                <p className="mt-3 text-lg font-semibold text-white">{slide.metric}</p>
                <p className="mt-2 text-sm text-white/60">{slide.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {forgeSlides.map((slide, index) => {
            const Icon = panelIcons[index] || Boxes
            return (
              <article
                key={slide.id}
                className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111423] p-6 shadow-forge"
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${slide.accent}`} />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-[#f5a623]">{slide.eyebrow}</p>
                      <h2 className="mt-3 text-2xl font-semibold text-white">{slide.title}</h2>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-[#f5a623]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-white/68">{slide.description}</p>
                  <Link href={slide.ctaHref} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
                    {slide.ctaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Tracks</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Four operating tracks, one shared build floor.</h2>
          </div>
          <Link href="/tracks" className="hidden text-sm font-semibold text-white/78 hover:text-white sm:inline-flex">
            View all tracks
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {forgeTracks.map((track) => {
            const Icon = track.icon
            return (
              <article key={track.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="rounded-2xl border border-[#f5a623]/24 bg-[#f5a623]/10 p-3 text-[#f5a623]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-white/42">{track.cohortWindow}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{track.title}</h3>
                <p className="mt-2 text-sm text-white/66">{track.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {track.focusAreas.slice(0, 3).map((focus) => (
                    <span key={focus} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/64">
                      {focus}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Active Projects</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Partner delivery and BEAM R&D stay on the same board.</h2>
            </div>
            <Link href="/projects" className="text-sm font-semibold text-white/76 hover:text-white">
              Open project board
            </Link>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {forgeProjects.slice(0, 4).map((project) => (
              <article key={project.id} className="rounded-[1.5rem] border border-white/10 bg-[#0b0e18] p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#f5a623]/25 bg-[#f5a623]/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f5a623]">
                    {project.phase}
                  </span>
                  <span className="text-xs uppercase tracking-[0.16em] text-white/46">{project.partner}</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-white">{project.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/68">{project.summary}</p>
                <p className="mt-4 text-sm font-medium text-white">{project.compensation}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Public Feed</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Viewer-style panels for launches, logs, and cohort output.</h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-4">
          {forgeFeed.map((entry) => (
            <article key={entry.id} className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">{entry.type.replace('-', ' ')}</span>
                <span className="text-xs text-white/44">{entry.publishedAt}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">{entry.title}</h3>
              <p className="mt-3 text-sm leading-6 text-white/66">{entry.summary}</p>
              <div className="mt-5 space-y-2">
                {entry.panels.map((panel) => (
                  <div key={panel} className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-white/72">
                    {panel}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid gap-6 rounded-[2rem] border border-white/10 bg-[#121624] p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Join / Subscribe</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Follow the public output or enter the cohort pipeline.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              Public subscribers get release notes, fabrication logs, product launches, and cohort output updates. Full participants
              register through BEAM Home and return with Forge organization and cohort context.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/join" className="rounded-full bg-[#f5a623] px-5 py-3 text-sm font-semibold text-[#11131d]">
                Join Forge
              </Link>
              <Link
                href={buildForgeHandoffUrl({ returnPath: '/member' })}
                className="rounded-full border border-white/14 px-5 py-3 text-sm font-medium text-white"
              >
                Sign In Through Home
              </Link>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
            <p className="text-sm font-semibold text-white">Subscribe for public Forge updates</p>
            <div className="mt-4">
              <SubscribeForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

