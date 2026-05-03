'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  LayoutDashboard,
  Lock,
  Orbit,
  RefreshCcw,
  ShieldCheck,
} from 'lucide-react'
import { type User } from 'firebase/auth'
import { readBeamReturnSession, readProfileDocWithBeamToken, syncBeamReturnSessionFromUrl, type BeamReturnSession, type BeamReturnSessionStatus } from '@/lib/beam-auth'
import {
  buildForgeHandoffUrl,
  deriveDefaultDashboardPreferences,
  fetchParticipantWorkContexts,
  fetchPublishedRoles,
  getBeamHomeUrl,
  getKnownSessionCookieName,
  getParticipantCohorts,
  getParticipantOrganizations,
  getParticipantWorkContexts,
} from '@/lib/beam-home'
import { getLinkedParticipantNames } from '@/lib/forge-content'
import { useForgeContent } from '@/components/ForgeContentProvider'
import { db, subscribeToAuth } from '@/lib/firebase'
import type {
  BeamHandoffRecord,
  BeamRole,
  ForgeMemberSnapshot,
  ParticipantDashboardPreferences,
  ParticipantOnboardingProfile,
} from '@/lib/types'

async function readProfileDoc<T>(uid: string, docId: string): Promise<T | null> {
  if (!db) return null
  const snapshot = await getDoc(doc(db, 'users', uid, 'profiles', docId))
  return snapshot.exists() ? (snapshot.data() as T) : null
}

function buildEmptySnapshot(): ForgeMemberSnapshot {
  return {
    handoff: null,
    onboarding: null,
    roles: [],
    organizations: getParticipantOrganizations(null),
    workContexts: getParticipantWorkContexts(null),
    cohorts: getParticipantCohorts(null),
    preferences: deriveDefaultDashboardPreferences(null),
    matchedClientName: null,
    workContextResolution: null,
  }
}

function readSessionCookieHint() {
  if (typeof document === 'undefined') return false
  const cookieName = getKnownSessionCookieName()
  if (!cookieName) return false
  return document.cookie.split(';').some((item) => item.trim().startsWith(`${cookieName}=`))
}

function resolveReturnMessage(status: BeamReturnSessionStatus) {
  if (status === 'connected') {
    return {
      tone: 'success' as const,
      title: 'Returned from BEAM Home',
      body: 'Forge received your BEAM handoff token and rebuilt your dashboard context on this domain.',
    }
  }

  if (status === 'expired') {
    return {
      tone: 'warning' as const,
      title: 'The return token expired',
      body: 'Your sign-in completed, but the one-time BEAM handoff token was no longer usable by the time Forge loaded.',
    }
  }

  if (status === 'invalid') {
    return {
      tone: 'warning' as const,
      title: 'The return token was invalid',
      body: 'Forge received a BEAM return payload, but it could not be decoded into a usable dashboard session.',
    }
  }

  return null
}

export function MemberDashboard() {
  const { assignments, participants } = useForgeContent()
  const [isLoading, setIsLoading] = useState(true)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [hasResolvedAuth, setHasResolvedAuth] = useState(false)
  const [roles, setRoles] = useState<BeamRole[]>([])
  const [snapshot, setSnapshot] = useState<ForgeMemberSnapshot>(buildEmptySnapshot)
  const [sessionHintFound] = useState(() => readSessionCookieHint())
  const [beamReturnBridge] = useState<{
    status: BeamReturnSessionStatus
    session: BeamReturnSession | null
    hasResolved: boolean
  }>(() => {
    if (typeof window === 'undefined') {
      return {
        status: 'none',
        session: null,
        hasResolved: false,
      }
    }

    const status = syncBeamReturnSessionFromUrl()

    return {
      status,
      session: readBeamReturnSession(),
      hasResolved: true,
    }
  })

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setAuthUser(user)
      setHasResolvedAuth(true)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    let isCancelled = false

    async function loadDashboard() {
      if (!hasResolvedAuth || !beamReturnBridge.hasResolved) {
        return
      }

      const activeUid = authUser?.uid ?? beamReturnBridge.session?.uid ?? null
      const bridgeToken = authUser?.uid ? null : beamReturnBridge.session?.idToken ?? null

      if (!activeUid) {
        setRoles([])
        setSnapshot(buildEmptySnapshot())
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const loadProfileDoc = async <T,>(docId: string) => {
          if (bridgeToken) {
            return readProfileDocWithBeamToken<T>(bridgeToken, activeUid, docId)
          }

          return readProfileDoc<T>(activeUid, docId)
        }

        const [handoff, onboarding, publishedRoles] = await Promise.all([
          loadProfileDoc<BeamHandoffRecord>('beamHandoff'),
          loadProfileDoc<ParticipantOnboardingProfile>('onboarding'),
          fetchPublishedRoles(),
        ])

        const external = handoff ? await fetchParticipantWorkContexts(handoff) : { contexts: [], matchedClientName: null, resolution: null }
        const preferences: ParticipantDashboardPreferences = deriveDefaultDashboardPreferences(handoff)
        const organizations = getParticipantOrganizations(handoff)
        const workContexts = getParticipantWorkContexts(handoff, external.contexts)
        const cohorts = getParticipantCohorts(handoff)

        if (isCancelled) return

        setRoles(publishedRoles)
        setSnapshot({
          handoff,
          onboarding,
          roles: publishedRoles,
          organizations,
          workContexts,
          cohorts,
          preferences,
          matchedClientName: external.matchedClientName,
          workContextResolution: external.resolution,
        })
      } catch {
        if (isCancelled) return
        setRoles([])
        setSnapshot(buildEmptySnapshot())
      }

      if (!isCancelled) {
        setIsLoading(false)
      }
    }

    void loadDashboard()

    return () => {
      isCancelled = true
    }
  }, [authUser?.uid, beamReturnBridge.hasResolved, beamReturnBridge.session?.idToken, beamReturnBridge.session?.uid, hasResolvedAuth])

  const activeUid = authUser?.uid ?? beamReturnBridge.session?.uid ?? null
  const activeEmail = authUser?.email ?? beamReturnBridge.session?.email ?? null
  const activeDisplayName = authUser?.displayName ?? beamReturnBridge.session?.displayName ?? null
  const isUsingBeamReturn = !authUser?.uid && Boolean(beamReturnBridge.session?.uid)
  const memberRoleLabel = useMemo(() => {
    if (snapshot.handoff?.role) return snapshot.handoff.role
    if (snapshot.onboarding?.role) return snapshot.onboarding.role
    return null
  }, [snapshot.handoff?.role, snapshot.onboarding?.role])
  const returnMessage = resolveReturnMessage(beamReturnBridge.status)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-white/72">
          Loading Forge dashboard...
        </section>
      </div>
    )
  }

  if (!activeUid) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-forge">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-[#f5a623]/24 bg-[#f5a623]/10 p-3 text-[#f5a623]">
              <Lock className="h-5 w-5" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Protected Route</p>
                <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">No active Forge dashboard session was found.</h1>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-white/70">
                Forge routes sign-in and registration through BEAM Home, then rebuilds your dashboard from Firebase profile data on
                return.
              </p>
              {returnMessage ? (
                <div
                  className={`rounded-2xl border p-4 text-sm ${
                    returnMessage.tone === 'success'
                      ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                      : 'border-amber-400/20 bg-amber-400/10 text-amber-100'
                  }`}
                >
                  <p className="font-semibold text-white">{returnMessage.title}</p>
                  <p className="mt-2">{returnMessage.body}</p>
                </div>
              ) : null}
              {sessionHintFound ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                  A Home session cookie hint was detected, but Forge still needs the BEAM return handoff or a future shared-session
                  exchange to load your dashboard automatically on this origin.
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={buildForgeHandoffUrl({ returnPath: '/dashboard' })}
                  target="_top"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-5 py-3 text-sm font-semibold text-[#11131d]"
                >
                  Join Or Sign In Through Home
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 rounded-full border border-white/14 px-5 py-3 text-sm font-medium text-white"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Re-check session
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-10">
      {returnMessage && beamReturnBridge.status === 'connected' ? (
        <section className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold text-white">{returnMessage.title}</p>
              <p className="mt-1">{returnMessage.body}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Forge Dashboard</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
              {activeDisplayName ? `Welcome back, ${activeDisplayName.split(' ')[0]}` : 'Welcome back to Forge'}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
              Your cohort, role, organization, and work-lane context are assembled from the current BEAM Home handoff and supporting
              Forge data sources.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-5 py-3 text-sm font-semibold text-[#11131d]"
              >
                Open Project Board
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/viewer"
                className="inline-flex items-center gap-2 rounded-full border border-white/14 px-5 py-3 text-sm font-medium text-white"
              >
                Review Public Feed
                <Orbit className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-sm text-white/72">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">Session</p>
                <p className="mt-3 text-lg font-semibold text-white">{activeEmail || activeUid}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-[#f5a623]">
                <LayoutDashboard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-4">
                <p className="text-white/46">Session source</p>
                <p className="mt-1 font-medium text-white">
                  {isUsingBeamReturn ? 'BEAM Home return token' : 'Forge Firebase session'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-4">
                <p className="text-white/46">Active organization</p>
                <p className="mt-1 font-medium text-white">{snapshot.handoff?.organizationName || 'BEAM Forge'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-4">
                <p className="text-white/46">Preferred work context</p>
                <p className="mt-1 font-medium text-white">{snapshot.preferences.activeWorkContextId || 'Pending resolution'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Role path</p>
          <p className="mt-3 text-2xl font-semibold text-white">{memberRoleLabel || 'Unclassified'}</p>
          <p className="mt-2 text-sm text-white/62">
            {snapshot.handoff?.scenarioLabel || 'Using the latest BEAM handoff and onboarding documents.'}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Cohort</p>
          <p className="mt-3 text-2xl font-semibold text-white">{snapshot.handoff?.cohortName || snapshot.cohorts[0]?.name || 'Not assigned'}</p>
          <p className="mt-2 text-sm text-white/62">{snapshot.handoff?.cohortId || snapshot.cohorts[0]?.id || 'Pending assignment'}</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Work context</p>
          <p className="mt-3 text-2xl font-semibold text-white">{snapshot.matchedClientName || 'Forge delivery'}</p>
          <p className="mt-2 text-sm text-white/62">
            {snapshot.workContextResolution?.reason || 'Using current BEAM and Forge context resolution.'}
          </p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">Quick Actions</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Continue your Forge work</h2>
          <div className="mt-5 space-y-3">
            <Link href="/projects" className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20">
              <p className="font-semibold text-white">Project board</p>
              <p className="mt-1 text-sm text-white/64">Open active delivery, pipeline, and archived work.</p>
            </Link>
            <Link href="/tracks" className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20">
              <p className="font-semibold text-white">Track lineup</p>
              <p className="mt-1 text-sm text-white/64">Review the current software, fintech, fabrication, and IT lanes.</p>
            </Link>
            <a
              href={getBeamHomeUrl('/participant-dashboard')}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">BEAM Home dashboard</p>
                  <p className="mt-1 text-sm text-white/64">Open the upstream participant dashboard in a new tab.</p>
                </div>
                <ExternalLink className="h-4 w-4 text-white/52" />
              </div>
            </a>
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">Active Lanes</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Organizations and work contexts</h2>
            </div>
            {snapshot.workContextResolution?.usedFallback ? (
              <AlertTriangle className="h-5 w-5 text-amber-300" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            )}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {snapshot.workContexts.map((context) => (
              <article key={context.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm uppercase tracking-[0.14em] text-[#f5a623]">{context.kind.replace('_', ' ')}</p>
                <p className="mt-2 text-lg font-semibold text-white">{context.name}</p>
                <p className="mt-2 text-sm text-white/66">{context.description}</p>
                {context.href ? (
                  <a
                    href={context.href}
                    target={context.href.startsWith('http') ? '_blank' : undefined}
                    rel={context.href.startsWith('http') ? 'noreferrer' : undefined}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white"
                  >
                    Open context
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">Context</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">BEAM Home handoff snapshot</h2>
            </div>
            {snapshot.workContextResolution?.usedFallback ? (
              <AlertTriangle className="h-5 w-5 text-amber-300" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            )}
          </div>
          <div className="mt-5 space-y-3 text-sm text-white/72">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/46">Organization</p>
              <p className="mt-1 font-medium text-white">{snapshot.handoff?.organizationName || 'BEAM Forge'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/46">Entry channel</p>
              <p className="mt-1 font-medium text-white">{snapshot.handoff?.entryChannel || 'forge.beamthinktank.space'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/46">Matched client / work context</p>
              <p className="mt-1 font-medium text-white">{snapshot.matchedClientName || 'No external client match'}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-white/46">Resolution method</p>
              <p className="mt-1 font-medium text-white">
                {snapshot.workContextResolution?.method || 'No work-context lookup was required'}
              </p>
              {snapshot.workContextResolution?.reason ? (
                <p className="mt-2 text-white/58">{snapshot.workContextResolution.reason}</p>
              ) : null}
            </div>
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">Assignments</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Current cohort work</h2>
          <div className="mt-5 space-y-3">
            {assignments.map((assignment) => {
              const linkedParticipants = getLinkedParticipantNames(participants, assignment.linkedParticipantIds)

              return (
                <div key={assignment.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-white">{assignment.title}</p>
                    <span className="rounded-full border border-[#f5a623]/24 bg-[#f5a623]/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f5a623]">
                      {assignment.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/66">{assignment.owner}</p>
                  <p className="mt-3 text-sm font-medium text-white">{assignment.payment}</p>
                  {linkedParticipants.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {linkedParticipants.map((participant) => (
                        <span key={participant} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/66">
                          {participant}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5 lg:col-span-2">
          <p className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">Published roles</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">ReadyAimGo / BEAM published roles surfaced through Home</h2>
          <div className="mt-5 grid gap-3">
            {(roles.length > 0 ? roles.slice(0, 4) : []).map((role) => (
              <div key={role.id || role.roleId || role.roleTitle} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-white">{role.roleTitle || 'Untitled role'}</p>
                  <span className="text-xs uppercase tracking-[0.16em] text-white/42">{role.status || 'published'}</span>
                </div>
                <p className="mt-2 text-sm text-white/66">{role.summary || 'No summary provided by the Home roles endpoint.'}</p>
                {role.requirements?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {role.requirements.slice(0, 3).map((requirement) => (
                      <span key={requirement} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/64">
                        {requirement}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            {roles.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/64">
                No published roles were returned by `home.beamthinktank.space/api/roles` for the current environment.
              </div>
            ) : null}
          </div>
        </article>

        <article className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">Organizations</p>
          <div className="mt-4 space-y-3">
            {snapshot.organizations.map((organization) => (
              <div key={organization.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-semibold text-white">{organization.name}</p>
                <p className="mt-1 text-sm text-white/64">{organization.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-white/42">
            Preferred organization: {snapshot.preferences.activeOrganizationId || 'none'}
          </p>
        </article>
      </section>
    </div>
  )
}
