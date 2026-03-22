import Link from 'next/link'
import { ArrowUpRight, ExternalLink, ShieldCheck } from 'lucide-react'
import { buildForgeHandoffUrl } from '@/lib/beam-home'

const handoffModes = [
  {
    role: 'student' as const,
    title: 'Student path',
    summary: 'For students entering cohorts through university-linked programs, labs, or course-connected work.',
  },
  {
    role: 'community' as const,
    title: 'Community path',
    summary: 'For local participants, independent builders, and public-facing collaborators joining Forge delivery or R&D.',
  },
  {
    role: 'business' as const,
    title: 'Business / partner path',
    summary: 'For partner organizations, sponsors, client contacts, and operator-side collaborators entering the ecosystem.',
  },
]

export default function JoinPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Join Forge</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Forge routes participant registration through BEAM Home.</h1>
            <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
              No separate Forge auth system is created here. These links pre-tag the handoff with `organizationId = org_beam_forge`,
              `cohortId = cohort_beam_forge_launch`, and `entryChannel = forge.beamthinktank.space`, following the BEAM Home handoff pattern.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-[#f5a623]/24 bg-[#f5a623]/10 px-5 py-4 text-sm text-[#ffe4b3]">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                Existing BEAM Home code persists sign-in and handoff data in Firebase client auth plus profile documents. Forge reads those
                documents back for the member view.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {handoffModes.map((mode) => (
          <article key={mode.role} className="rounded-[1.75rem] border border-white/10 bg-[#0d111d] p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">{mode.role}</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{mode.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/66">{mode.summary}</p>
            <Link
              href={buildForgeHandoffUrl({ role: mode.role, returnPath: '/member' })}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-4 py-2 text-sm font-semibold text-[#11131d]"
            >
              Continue in BEAM Home
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-2xl font-semibold text-white">What BEAM Home currently provides</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/68">
            Participant identity model: organizations, cohorts, participant profiles, organization memberships, cohort memberships, and source attribution.
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/68">
            Public role feed: `GET /api/roles` backed by the Readyaimgo BEAM roles feed.
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/68">
            Work-context lookup: `GET /api/participant/work-contexts` using handoff fields such as `sourceDocumentId`, `sourceStoryId`, and organization metadata.
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/68">
            Handoff persistence: BEAM Home stores the payload at `users/&lt;uid&gt;/profiles/beamHandoff` and onboarding/profile data under sibling docs.
          </div>
        </div>
        <div className="mt-6">
          <a
            href="https://home.beamthinktank.space"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white"
          >
            Open BEAM Home
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  )
}

