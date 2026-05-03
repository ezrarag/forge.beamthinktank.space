'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { addDoc, collection, doc, onSnapshot, query, serverTimestamp, where } from 'firebase/firestore'
import { useForgeAuth } from '@/components/AuthBootstrapper'
import { useForgeContent } from '@/components/ForgeContentProvider'
import { getLinkedParticipantNames } from '@/lib/forge-content'
import { db } from '@/lib/firebase'
import type { ForgeTrackId } from '@/lib/types'
import { toCurrency } from '@/lib/utils'

const filters: Array<{ id: ForgeTrackId | 'all'; label: string }> = [
  { id: 'all', label: 'All projects' },
  { id: 'fintech', label: 'Fintech' },
  { id: 'software', label: 'Software' },
  { id: 'fabrication', label: 'Fabrication' },
  { id: 'it', label: 'Infrastructure' },
  { id: 'content-production', label: 'Content' },
]

const inviteRoleOptions = ['developer', 'designer', 'strategist', 'project-manager', 'researcher'] as const
const elevatedInviteRoles = new Set(['beam-admin', 'rag-lead'])

type InviteRole = (typeof inviteRoleOptions)[number]

interface LiveBeamProject {
  id: string
  clientName: string
  status: string
  sourceNgo: string
  ragRevenue: number | null
  participantRevenueShare: number | null
  deliverables: string[]
  cohortMemberCount: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(value: unknown) {
  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized || null
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function readNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const normalized = Number(value.replace(/[$,%\s,]/g, ''))
    return Number.isFinite(normalized) ? normalized : null
  }

  return null
}

function readStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      if (typeof entry === 'string') {
        const normalized = entry.trim()
        return normalized ? [normalized] : []
      }

      if (!isRecord(entry)) {
        return []
      }

      const normalized = readString(entry.label) ?? readString(entry.title) ?? readString(entry.name)
      return normalized ? [normalized] : []
    })
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  return []
}

function readCohortMemberCount(data: Record<string, unknown>) {
  const directCount =
    readNumber(data.cohortMemberCount) ??
    readNumber(data.cohortMembersCount) ??
    readNumber(data.memberCount) ??
    readNumber(data.cohortSize)

  if (directCount !== null) {
    return Math.max(0, Math.round(directCount))
  }

  const memberLists = [data.cohortMembers, data.cohortMemberIds, data.participantIds, data.participants]

  for (const entry of memberLists) {
    if (Array.isArray(entry)) {
      return entry.length
    }
  }

  return 0
}

function normalizeLiveBeamProject(id: string, data: Record<string, unknown>): LiveBeamProject {
  return {
    id,
    clientName: readString(data.clientName) ?? readString(data.title) ?? 'Untitled BEAM project',
    status: readString(data.status) ?? 'unknown',
    sourceNgo: readString(data.sourceNgo) ?? 'forge',
    ragRevenue: readNumber(data.ragRevenue),
    participantRevenueShare: readNumber(data.participantRevenueShare),
    deliverables: readStringArray(data.deliverables),
    cohortMemberCount: readCohortMemberCount(data),
  }
}

function normalizeRoles(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim().toLowerCase() : ''))
    .filter(Boolean)
}

function formatRevenueShare(value: number | null) {
  if (value === null) {
    return '—'
  }

  const normalized = Math.abs(value) <= 1 ? value * 100 : value
  const rounded = Number.isInteger(normalized) ? normalized.toFixed(0) : normalized.toFixed(1)
  return `${rounded}%`
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState<ForgeTrackId | 'all'>('all')
  const [liveProjects, setLiveProjects] = useState<LiveBeamProject[]>([])
  const [isLiveProjectsLoading, setIsLiveProjectsLoading] = useState(false)
  const [liveProjectsError, setLiveProjectsError] = useState<string | null>(null)
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [inviteProjectId, setInviteProjectId] = useState<string | null>(null)
  const [inviteeEmail, setInviteeEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<InviteRole>('developer')
  const [portfolioCredit, setPortfolioCredit] = useState(true)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false)
  const [inviteSuccessByProject, setInviteSuccessByProject] = useState<Record<string, string>>({})
  const { activeSession } = useForgeAuth()
  const { participants, projects: allProjects } = useForgeContent()
  const projects = useMemo(() => allProjects.filter((project) => filter === 'all' || project.track === filter), [allProjects, filter])
  const isAuthenticated = Boolean(activeSession?.uid)
  const hasFirestoreConnection = Boolean(db)
  const canInviteParticipants = useMemo(
    () => userRoles.some((role) => elevatedInviteRoles.has(role)),
    [userRoles]
  )
  const activeInviteProject = useMemo(
    () => liveProjects.find((project) => project.id === inviteProjectId) ?? null,
    [inviteProjectId, liveProjects]
  )

  useEffect(() => {
    if (!db || !activeSession?.uid) {
      setLiveProjects([])
      setIsLiveProjectsLoading(false)
      setLiveProjectsError(null)
      return
    }

    setIsLiveProjectsLoading(true)
    setLiveProjectsError(null)

    const liveProjectsQuery = query(
      collection(db, 'projects'),
      where('beamBookEntry', '==', true),
      where('sourceNgo', '==', 'forge')
    )

    const unsubscribe = onSnapshot(
      liveProjectsQuery,
      (snapshot) => {
        const nextProjects = snapshot.docs
          .map((projectDoc) => normalizeLiveBeamProject(projectDoc.id, projectDoc.data() as Record<string, unknown>))
          .sort((left, right) => left.clientName.localeCompare(right.clientName))

        setLiveProjects(nextProjects)
        setIsLiveProjectsLoading(false)
      },
      (error) => {
        setLiveProjects([])
        setIsLiveProjectsLoading(false)
        setLiveProjectsError(error instanceof Error ? error.message : 'Unable to subscribe to live BEAM projects.')
      }
    )

    return unsubscribe
  }, [activeSession?.uid])

  useEffect(() => {
    if (!db || !activeSession?.uid) {
      setUserRoles([])
      return
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', activeSession.uid),
      (snapshot) => {
        setUserRoles(normalizeRoles(snapshot.data()?.roles))
      },
      () => {
        setUserRoles([])
      }
    )

    return unsubscribe
  }, [activeSession?.uid])

  useEffect(() => {
    if (!inviteProjectId) {
      setInviteeEmail('')
      setInviteRole('developer')
      setPortfolioCredit(true)
      setInviteError(null)
      setIsSubmittingInvite(false)
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setInviteProjectId(null)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [inviteProjectId])

  useEffect(() => {
    if (!activeSession?.uid) {
      setInviteProjectId(null)
    }
  }, [activeSession?.uid])

  async function handleInviteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!db || !activeSession?.uid || !activeInviteProject) {
      setInviteError('An authenticated Firestore session is required before an invite can be created.')
      return
    }

    const normalizedEmail = inviteeEmail.trim().toLowerCase()

    if (!normalizedEmail) {
      setInviteError('Enter an email address to send this invite.')
      return
    }

    setIsSubmittingInvite(true)
    setInviteError(null)

    try {
      await addDoc(collection(db, 'projectInvites'), {
        projectId: activeInviteProject.id,
        inviteeEmail: normalizedEmail,
        role: inviteRole,
        portfolioCredit,
        invitedBy: activeSession.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      })

      setInviteSuccessByProject((current) => ({
        ...current,
        [activeInviteProject.id]: `Invite sent to ${normalizedEmail}.`,
      }))
      setInviteProjectId(null)
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : 'Unable to create the project invite.')
    } finally {
      setIsSubmittingInvite(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Project Board</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">Active and past Forge work across BEAM and partner delivery.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
          This board spans internal R&amp;D, NGO platform work, repair initiatives, and outside client engagements. Filter by track to isolate the current operating surface.
        </p>
      </section>

      {isAuthenticated ? (
        <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Live BEAM Projects</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Real-time Forge projects streamed from Firestore.</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
                This panel shows BEAM book entries where `beamBookEntry` is true and `sourceNgo` is `forge`. The static Forge board remains below unchanged.
              </p>
            </div>
            {canInviteParticipants ? (
              <span className="rounded-full border border-[#f5a623]/24 bg-[#f5a623]/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f5a623]">
                Invite access enabled
              </span>
            ) : null}
          </div>

          {!hasFirestoreConnection ? (
            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-[#0d111d] p-6 text-sm text-white/68">
              Live Firestore access is not configured in this environment.
            </div>
          ) : null}

          {hasFirestoreConnection && isLiveProjectsLoading ? (
            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-[#0d111d] p-6 text-sm text-white/68">
              Loading live BEAM projects...
            </div>
          ) : null}

          {hasFirestoreConnection && !isLiveProjectsLoading && liveProjectsError ? (
            <div className="mt-6 rounded-[1.75rem] border border-rose-300/20 bg-rose-300/10 p-6 text-sm text-rose-100">
              {liveProjectsError}
            </div>
          ) : null}

          {hasFirestoreConnection && !isLiveProjectsLoading && !liveProjectsError && liveProjects.length === 0 ? (
            <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-[#0d111d] p-6 text-sm text-white/68">
              No live BEAM projects currently match the Forge query.
            </div>
          ) : null}

          {hasFirestoreConnection && !isLiveProjectsLoading && !liveProjectsError && liveProjects.length > 0 ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {liveProjects.map((project) => (
                <article key={project.id} className="rounded-[1.75rem] border border-white/10 bg-[#0d111d] p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-[#f5a623]/24 bg-[#f5a623]/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f5a623]">
                      {project.status}
                    </span>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-white/68">
                      {project.sourceNgo}
                    </span>
                    <span className="text-xs uppercase tracking-[0.16em] text-white/42">{project.cohortMemberCount} cohort members</span>
                  </div>
                  <h2 className="mt-4 text-3xl font-semibold text-white">{project.clientName}</h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/42">RAG revenue</p>
                      <p className="mt-2 text-2xl font-semibold text-white">
                        {project.ragRevenue !== null ? toCurrency(project.ragRevenue) : '—'}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.02] p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/42">Participant revenue share</p>
                      <p className="mt-2 text-2xl font-semibold text-white">{formatRevenueShare(project.participantRevenueShare)}</p>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {project.deliverables.length > 0 ? (
                      project.deliverables.map((deliverable) => (
                        <span key={deliverable} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/66">
                          {deliverable}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/66">No deliverables listed</span>
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {canInviteParticipants ? (
                      <button
                        type="button"
                        onClick={() => setInviteProjectId(project.id)}
                        className="rounded-full border border-[#f5a623]/40 bg-[#f5a623]/12 px-4 py-2 text-sm text-[#f5a623] transition hover:border-[#f5a623]/60 hover:bg-[#f5a623]/16"
                      >
                        Invite participant
                      </button>
                    ) : null}
                    {inviteSuccessByProject[project.id] ? (
                      <p className="text-sm text-[#f5a623]">{inviteSuccessByProject[project.id]}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

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
        {projects.map((project) => {
          const linkedParticipants = getLinkedParticipantNames(participants, project.linkedParticipantIds)

          return (
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
              {linkedParticipants.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {linkedParticipants.map((participant) => (
                    <span key={participant} className="rounded-full border border-[#f5a623]/24 bg-[#f5a623]/10 px-3 py-1 text-xs text-[#f5a623]">
                      {participant}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          )
        })}
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm text-white/70">
          Want access to assignments, compensation context, and cohort placement? <Link href="/join" className="font-semibold text-white">Join Forge through BEAM Home</Link>.
        </p>
      </section>

      {activeInviteProject && canInviteParticipants ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8"
          onClick={() => setInviteProjectId(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-participant-title"
            className="w-full max-w-lg rounded-[1.75rem] border border-white/10 bg-[#0d111d] p-6 shadow-forge"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Invite Participant</p>
                <h2 id="invite-participant-title" className="mt-3 text-3xl font-semibold text-white">
                  {activeInviteProject.clientName}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/68">
                  Create a pending participant invite directly in Firestore for this live BEAM project.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInviteProjectId(null)}
                className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/68 transition hover:border-white/24 hover:text-white"
              >
                Close
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleInviteSubmit}>
              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-white/42">Email</span>
                <input
                  type="email"
                  required
                  value={inviteeEmail}
                  onChange={(event) => setInviteeEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f5a623]/40"
                  placeholder="participant@beamthinktank.space"
                />
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-white/42">Role</span>
                <select
                  value={inviteRole}
                  onChange={(event) => setInviteRole(event.target.value as InviteRole)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition focus:border-[#f5a623]/40"
                >
                  {inviteRoleOptions.map((role) => (
                    <option key={role} value={role} className="bg-[#0d111d] text-white">
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <input
                  type="checkbox"
                  checked={portfolioCredit}
                  onChange={(event) => setPortfolioCredit(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/10 bg-transparent accent-[#f5a623]"
                />
                <span>
                  <span className="block text-sm font-medium text-white">Portfolio credit</span>
                  <span className="mt-1 block text-sm leading-6 text-white/68">
                    Enabled by default so invited participants are credited for eligible project work.
                  </span>
                </span>
              </label>

              {inviteError ? <p className="text-sm text-rose-200">{inviteError}</p> : null}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingInvite}
                  className="rounded-full border border-[#f5a623]/40 bg-[#f5a623]/12 px-4 py-2 text-sm text-[#f5a623] transition hover:border-[#f5a623]/60 hover:bg-[#f5a623]/16 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmittingInvite ? 'Sending invite...' : 'Send invite'}
                </button>
                <button
                  type="button"
                  onClick={() => setInviteProjectId(null)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/68 transition hover:border-white/24 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
