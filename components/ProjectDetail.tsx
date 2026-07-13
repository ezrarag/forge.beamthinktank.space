'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { ExternalLink, Users } from 'lucide-react'
import { useForgeAuth } from '@/components/AuthBootstrapper'
import { db } from '@/lib/firebase'
import { buildForgeHandoffUrl } from '@/lib/beam-home'
import { normalizeLiveProject, type LiveForgeProject } from '@/lib/project-models'

interface TeamMember { uid: string; displayName: string; photoURL: string; skills: string[] }

export function ProjectDetail({ projectId }: { projectId: string }) {
  const { activeSession } = useForgeAuth()
  const [project, setProject] = useState<LiveForgeProject | null>(null)
  const [activeProjectIds, setActiveProjectIds] = useState<string[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!db) { setError('Firebase is not configured.'); setIsLoading(false); return }
    let cancelled = false

    void (async () => {
      try {
        const projectSnapshot = await getDoc(doc(db, 'projects', projectId))
        if (!projectSnapshot.exists()) throw new Error('This project could not be found.')
        const nextProject = normalizeLiveProject(projectSnapshot.id, projectSnapshot.data() as Record<string, unknown>)
        if (cancelled) return
        setProject(nextProject)

        if (!activeSession?.uid) return
        const userSnapshot = await getDoc(doc(db, 'users', activeSession.uid))
        const rawActiveProjectIds: unknown = userSnapshot.data()?.activeProjectIds
        const ids = Array.isArray(rawActiveProjectIds)
          ? rawActiveProjectIds.filter((id: unknown): id is string => typeof id === 'string')
          : []
        if (!cancelled) setActiveProjectIds(ids)

        const members = await Promise.all(nextProject.cohort.map(async (uid) => {
          const memberSnapshot = await getDoc(doc(db!, 'users', uid))
          if (!memberSnapshot.exists()) return null
          const data = memberSnapshot.data()
          return { uid, displayName: data.displayName || data.email || 'Forge participant', photoURL: data.photoURL || '', skills: Array.isArray(data.skills) ? data.skills : [] } as TeamMember
        }))
        if (!cancelled) setTeam(members.filter((member): member is TeamMember => Boolean(member)))
      } catch (loadError) {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load this project.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [activeSession?.uid, projectId])

  const completed = useMemo(() => project?.deliverables.filter((item) => item.done).length ?? 0, [project])
  const progress = project?.deliverables.length ? Math.round((completed / project.deliverables.length) * 100) : 0

  if (isLoading) return <PageMessage>Loading project…</PageMessage>
  if (error || !project) return <PageMessage>{error || 'Project unavailable.'}</PageMessage>

  const isMember = activeProjectIds.includes(project.id)

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8">
        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em]">
          <span className="rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1 text-[#f5a623]">{project.status}</span>
          <span className="rounded-full border border-white/10 px-3 py-1 text-white/60">{project.sourceNgo}</span>
        </div>
        <h1 className="mt-5 font-serif text-5xl leading-none text-white sm:text-7xl">{project.clientName}</h1>
        <div className="mt-8 max-w-3xl">
          <div className="flex justify-between text-xs uppercase tracking-[0.16em] text-white/48"><span>Milestone progress</span><span>{completed}/{project.deliverables.length} complete</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#f5a623] transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <InfoBlock label="Tech stack" values={project.techStack} empty="Tech stack not listed" />
          <InfoBlock label="Open roles" values={project.openRoles} empty="Roles will be posted soon" />
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-5 text-sm text-white/66">
          <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" /> {project.cohort.length} cohort members</span>
          {project.githubRepoUrl ? <a href={project.githubRepoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-semibold text-white">GitHub repository <ExternalLink className="h-4 w-4" /></a> : null}
        </div>
      </section>

      {activeSession?.uid ? (
        <section id="project-team" className="rounded-[2rem] border border-white/10 bg-[#0d111d] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-white">Project team</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => <Link key={member.uid} href={`/participants/${member.uid}`} className="rounded-2xl border border-white/10 p-4 hover:border-white/25"><p className="font-semibold text-white">{member.displayName}</p><p className="mt-2 text-xs text-white/48">{member.skills.slice(0, 3).join(' · ') || 'Participant profile'}</p></Link>)}
            {!team.length ? <p className="text-sm text-white/52">The cohort is open and has no listed members yet.</p> : null}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link href={isMember ? '/dashboard' : `/projects/${project.id}/apply`} className="rounded-full bg-[#f5a623] px-5 py-3 text-sm font-semibold text-[#11131d]">{isMember ? 'Open project messages' : 'Apply to this project'}</Link>
        {activeSession?.uid ? <a href="#project-team" className="rounded-full border border-white/14 px-5 py-3 text-sm font-medium text-white">View team</a> : <a href={buildForgeHandoffUrl({ role: 'community', returnPath: `/projects/${project.id}` })} className="rounded-full border border-white/14 px-5 py-3 text-sm font-medium text-white">Sign in to view team</a>}
      </div>
    </div>
  )
}

function PageMessage({ children }: { children: React.ReactNode }) { return <div className="mx-auto max-w-5xl px-4 py-10"><div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-white/68">{children}</div></div> }
function InfoBlock({ label, values, empty }: { label: string; values: string[]; empty: string }) { return <div><p className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">{label}</p><div className="mt-3 flex flex-wrap gap-2">{values.length ? values.map((value) => <span key={value} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/68">{value}</span>) : <span className="text-sm text-white/42">{empty}</span>}</div></div> }
