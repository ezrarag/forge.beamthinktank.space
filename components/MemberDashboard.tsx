'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { AlertTriangle, ArrowUpRight, CheckCircle2, Lock, RefreshCcw } from 'lucide-react'
import {
  buildForgeHandoffUrl,
  deriveDefaultDashboardPreferences,
  fetchParticipantWorkContexts,
  fetchPublishedRoles,
  getKnownSessionCookieName,
  getParticipantCohorts,
  getParticipantOrganizations,
  getParticipantWorkContexts,
} from '@/lib/beam-home'
import { memberAssignments } from '@/lib/forge-content'
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

function readSessionCookieHint() {
  if (typeof document === 'undefined') return false
  const cookieName = getKnownSessionCookieName()
  if (!cookieName) return false
  return document.cookie.split(';').some((item) => item.trim().startsWith(`${cookieName}=`))
}

export function MemberDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [uid, setUid] = useState<string | null>(null)
  const [roles, setRoles] = useState<BeamRole[]>([])
  const [snapshot, setSnapshot] = useState<ForgeMemberSnapshot>({
    handoff: null,
    onboarding: null,
    roles: [],
    organizations: getParticipantOrganizations(null),
    workContexts: getParticipantWorkContexts(null),
    cohorts: getParticipantCohorts(null),
    preferences: deriveDefaultDashboardPreferences(null),
    matchedClientName: null,
    workContextResolution: null,
  })
  const [sessionHintFound] = useState(() => readSessionCookieHint())

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setUid(user?.uid ?? null)
      setUserEmail(user?.email ?? null)

      if (!user?.uid) {
        setSnapshot({
          handoff: null,
          onboarding: null,
          roles: [],
          organizations: getParticipantOrganizations(null),
          workContexts: getParticipantWorkContexts(null),
          cohorts: getParticipantCohorts(null),
          preferences: deriveDefaultDashboardPreferences(null),
          matchedClientName: null,
          workContextResolution: null,
        })
        setRoles([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      const [handoff, onboarding, publishedRoles] = await Promise.all([
        readProfileDoc<BeamHandoffRecord>(user.uid, 'beamHandoff'),
        readProfileDoc<ParticipantOnboardingProfile>(user.uid, 'onboarding'),
        fetchPublishedRoles(),
      ])

      const external = handoff ? await fetchParticipantWorkContexts(handoff) : { contexts: [], matchedClientName: null, resolution: null }
      const preferences: ParticipantDashboardPreferences = deriveDefaultDashboardPreferences(handoff)
      const organizations = getParticipantOrganizations(handoff)
      const workContexts = getParticipantWorkContexts(handoff, external.contexts)
      const cohorts = getParticipantCohorts(handoff)

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
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const memberRoleLabel = useMemo(() => {
    if (snapshot.handoff?.role) return snapshot.handoff.role
    if (snapshot.onboarding?.role) return snapshot.onboarding.role
    return null
  }, [snapshot.handoff?.role, snapshot.onboarding?.role])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-white/72">
          Loading Forge member context...
        </section>
      </div>
    )
  }

  if (!uid) {
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
                <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">No BEAM Home member session is active in this browser.</h1>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-white/70">
                Forge is intentionally not creating its own auth flow. This page checks the same Firebase-backed BEAM Home identity
                used by `home.beamthinktank.space` and then reads your BEAM profile documents for role, cohort, and work context.
              </p>
              {sessionHintFound ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                  A home session cookie hint was detected, but BEAM Home does not currently expose a documented cross-subdomain
                  session exchange endpoint in its local codebase. If the Firebase session is not already available on this origin,
                  return after BEAM Home sign-in or add a shared cookie/token handoff later.
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Link
                  href={buildForgeHandoffUrl({ returnPath: '/member' })}
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
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Forge Member</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">Member dashboard</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
              This view is populated from the BEAM Home Firebase profile path and public role/context endpoints. It reflects the
              current handoff model found in `home.beamthinktank.space`.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4 text-sm text-white/72">
            Signed in as <span className="font-semibold text-white">{userEmail || uid}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Role path</p>
          <p className="mt-3 text-2xl font-semibold text-white">{memberRoleLabel || 'Unclassified'}</p>
          <p className="mt-2 text-sm text-white/62">
            {snapshot.handoff?.scenarioLabel || 'Using current BEAM handoff and onboarding documents.'}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Cohort</p>
          <p className="mt-3 text-2xl font-semibold text-white">{snapshot.handoff?.cohortName || snapshot.cohorts[0]?.name || 'Not assigned'}</p>
          <p className="mt-2 text-sm text-white/62">{snapshot.handoff?.cohortId || snapshot.cohorts[0]?.id || 'Pending BEAM Home assignment'}</p>
        </article>
        <article className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-white/42">Payment status</p>
          <p className="mt-3 text-2xl font-semibold text-white">Hybrid compensation enabled</p>
          <p className="mt-2 text-sm text-white/62">Forge tracks can mix cash payouts and in-kind equity/IP positions.</p>
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
            {memberAssignments.map((assignment) => (
              <div key={assignment.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-white">{assignment.title}</p>
                  <span className="rounded-full border border-[#f5a623]/24 bg-[#f5a623]/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f5a623]">
                    {assignment.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/66">{assignment.owner}</p>
                <p className="mt-3 text-sm font-medium text-white">{assignment.payment}</p>
              </div>
            ))}
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
