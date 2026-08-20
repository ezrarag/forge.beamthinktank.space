'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  ExternalLink,
  Github,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { useForgeAuth } from '@/components/AuthBootstrapper'
import { forgeProjects } from '@/lib/forge-content'

interface DeliverableItem {
  id?: string
  title?: string
  name?: string
  status?: string
  done?: boolean
}

interface ProjectData {
  id: string
  clientName?: string
  title?: string
  status?: string
  sourceNgo?: string
  techStack?: string[]
  openRoles?: string[]
  cohort?: string[]
  githubRepoUrl?: string
  deliverables?: DeliverableItem[]
  summary?: string
  partner?: string
  compensation?: string
  phase?: string
  outcomes?: string[]
}

interface CohortMember {
  uid: string
  displayName: string
  photoURL?: string
  role?: string
  email?: string
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { activeSession, isReady } = useForgeAuth()

  const [project, setProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInCohort, setIsInCohort] = useState(false)
  const [cohortMembers, setCohortMembers] = useState<CohortMember[]>([])
  const [showTeam, setShowTeam] = useState(false)

  useEffect(() => {
    let isCancelled = false

    async function loadProjectDetails() {
      setLoading(true)

      let loadedProject: ProjectData | null = null

      if (db) {
        try {
          const snap = await getDoc(doc(db, 'projects', id))
          if (snap.exists()) {
            loadedProject = { id: snap.id, ...(snap.data() as Omit<ProjectData, 'id'>) }
          }
        } catch (err) {
          console.warn('Unable to load project from Firestore:', err)
        }
      }

      // Fallback to static seed data if not found in Firestore
      if (!loadedProject) {
        const seedMatch = forgeProjects.find((p) => p.id === id)
        if (seedMatch) {
          loadedProject = {
            id: seedMatch.id,
            clientName: seedMatch.title,
            title: seedMatch.title,
            status: seedMatch.phase,
            sourceNgo: seedMatch.partner,
            techStack: ['Next.js', 'TypeScript', 'Tailwind CSS'],
            openRoles: ['Frontend Engineer', 'Full-stack Engineer', 'UI Designer'],
            cohort: ['demo-ezra', 'demo-jordan'],
            githubRepoUrl: 'https://github.com/ezrarag/forge.beamthinktank.space',
            deliverables: (seedMatch.outcomes || []).map((o, idx) => ({
              title: o,
              status: idx === 0 ? 'done' : 'pending',
            })),
            summary: seedMatch.summary,
            partner: seedMatch.partner,
            compensation: seedMatch.compensation,
          }
        }
      }

      if (isCancelled) return

      setProject(loadedProject)
      setLoading(false)
    }

    void loadProjectDetails()

    return () => {
      isCancelled = true
    }
  }, [id])

  // Check if current user is already in cohort
  useEffect(() => {
    let isCancelled = false

    async function checkUserCohort() {
      if (!activeSession?.uid || !db) {
        if (!isCancelled) setIsInCohort(false)
        return
      }

      try {
        const userSnap = await getDoc(doc(db!, 'users', activeSession.uid))
        if (userSnap.exists() && !isCancelled) {
          const data = userSnap.data()
          const activeProjectIds: string[] = Array.isArray(data.activeProjectIds) ? data.activeProjectIds : []
          if (activeProjectIds.includes(id)) {
            setIsInCohort(true)
            return
          }
        }

        // Also check if user uid is inside project's cohort array
        if (!isCancelled && activeSession?.uid && project?.cohort?.includes(activeSession.uid)) {
          setIsInCohort(true)
        }
      } catch {
        // Ignore check error
      }
    }

    void checkUserCohort()

    return () => {
      isCancelled = true
    }
  }, [activeSession, id, project?.cohort])

  // Fetch cohort team members when authenticated and showTeam is enabled
  useEffect(() => {
    if (!showTeam || !activeSession?.uid || !db || !project?.cohort?.length) {
      return
    }

    let isCancelled = false

    async function loadCohortMembers() {
      const memberUids = project!.cohort || []
      const members: CohortMember[] = []

      for (const memberUid of memberUids) {
        try {
          const memberSnap = await getDoc(doc(db!, 'users', memberUid))
          if (memberSnap.exists()) {
            const data = memberSnap.data()
            members.push({
              uid: memberUid,
              displayName: data.displayName || data.email || 'Team Member',
              photoURL: data.photoURL,
              role: data.role || data.headline || 'Cohort Contributor',
              email: data.email,
            })
          } else {
            members.push({
              uid: memberUid,
              displayName: `Member ${memberUid.slice(0, 6)}`,
              role: 'Cohort Contributor',
            })
          }
        } catch {
          members.push({
            uid: memberUid,
            displayName: `Member ${memberUid.slice(0, 6)}`,
            role: 'Cohort Contributor',
          })
        }
      }

      if (!isCancelled) {
        setCohortMembers(members)
      }
    }

    void loadCohortMembers()

    return () => {
      isCancelled = true
    }
  }, [activeSession, project?.cohort, showTeam])

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center text-white/60">
          Loading project details...
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Project Not Found</h1>
          <p className="mt-2 text-sm text-white/60">No project was found with ID `{id}`.</p>
          <Link
            href="/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-5 py-2.5 text-xs font-semibold text-[#11131d]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  // Calculate deliverable progress
  const deliverables = project.deliverables || []
  const totalDeliverables = deliverables.length
  const doneDeliverables = deliverables.filter(
    (d) => d.status === 'done' || d.status === 'completed' || d.done === true
  ).length
  const progressPercent = totalDeliverables > 0 ? Math.round((doneDeliverables / totalDeliverables) * 100) : 0

  const heroTitle = project.clientName || project.title || 'BEAM Forge Project'
  const statusBadge = project.status || project.phase || 'Active'
  const sourceNgo = project.sourceNgo || project.partner || 'BEAM NGO Network'
  const techStack = project.techStack || ['Next.js', 'TypeScript', 'Tailwind CSS']
  const openRoles = project.openRoles || ['Developer', 'Designer', 'Technical Writer']
  const cohortCount = project.cohort?.length || 0

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-10 text-white">
      {/* Back Link */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/50 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Project Board
        </Link>
      </div>

      {/* Hero Header Section */}
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#f5a623]">
                {statusBadge}
              </span>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                {sourceNgo}
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{heroTitle}</h1>
            {project.title && project.title !== heroTitle && (
              <p className="mt-1.5 text-base font-medium text-white/80">{project.title}</p>
            )}
            <p className="mt-3 text-sm leading-relaxed text-white/70 max-w-3xl">
              {project.summary || 'Project delivery and fabrication workstream in the BEAM ecosystem.'}
            </p>
          </div>

          {project.githubRepoUrl && (
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <Github className="h-4 w-4" /> Repository <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Milestone Progress Bar */}
        <div className="rounded-2xl border border-white/10 bg-[#0c101c] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-white/60">Milestone Progress</span>
            <span className="font-bold text-[#f5a623]">
              {doneDeliverables} of {totalDeliverables} Deliverables Complete ({progressPercent}%)
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#f5a623] to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Technical Stack Tags */}
        {techStack.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 mb-2">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs text-white/80"
                >
                  <Code2 className="h-3 w-3 text-cyan-300" /> {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Open Roles */}
        {openRoles.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 mb-2">Open Roles</p>
            <div className="flex flex-wrap gap-2">
              {openRoles.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 text-xs font-medium text-emerald-300"
                >
                  <Sparkles className="h-3 w-3" /> {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cohort Stats */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs">
          <div className="flex items-center gap-2 text-white/70">
            <Users className="h-4 w-4 text-[#f5a623]" />
            <span>Current Cohort: <strong className="text-white">{cohortCount} members</strong></span>
          </div>
          {project.compensation && (
            <span className="font-semibold text-emerald-300">{project.compensation}</span>
          )}
        </div>
      </section>

      {/* Deliverable Items Breakdown */}
      {deliverables.length > 0 && (
        <section className="rounded-[2rem] border border-white/10 bg-[#0c101c] p-6 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white/60">Deliverable Milestones</h2>
          <div className="grid gap-2">
            {deliverables.map((deliv, idx) => {
              const isDone = deliv.status === 'done' || deliv.status === 'completed' || deliv.done === true
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3.5 text-xs"
                >
                  <span className="font-medium text-white">{deliv.title || deliv.name}</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-semibold ${
                      isDone ? 'bg-emerald-400/20 text-emerald-300' : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="h-3 w-3" /> : null}
                    {isDone ? 'Complete' : 'In Progress'}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Team View Accordion / Section */}
      {showTeam && (
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#f5a623]">
            Cohort Team Members ({cohortCount})
          </h2>
          {isReady && activeSession?.uid ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {cohortMembers.map((member) => (
                <Link
                  key={member.uid}
                  href={`/participants/${member.uid}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c101c] p-3.5 transition hover:border-white/20"
                >
                  <div className="h-10 w-10 shrink-0 rounded-full bg-white/10 overflow-hidden border border-white/20">
                    {member.photoURL ? (
                      <img src={member.photoURL} alt={member.displayName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-xs text-white">
                        {member.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{member.displayName}</p>
                    <p className="text-xs text-white/50">{member.role}</p>
                  </div>
                </Link>
              ))}
              {cohortMembers.length === 0 && (
                <p className="text-xs text-white/50">No cohort member profiles loaded yet.</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-white/60">Please sign in to view cohort team member details.</p>
          )}
        </section>
      )}

      {/* Bottom CTAs */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-black/40 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">Get Involved</p>
          <p className="text-sm font-semibold text-white mt-1">Ready to contribute to {heroTitle}?</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowTeam((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-5 py-3 text-xs font-semibold text-white hover:bg-white/10 transition"
          >
            <Users className="h-4 w-4 text-[#f5a623]" />
            {showTeam ? 'Hide team' : 'View team'}
          </button>

          {isInCohort ? (
            <Link
              href={activeSession?.uid ? `/participants/${activeSession.uid}` : '/dashboard'}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-xs font-bold text-[#0c101c] hover:bg-emerald-300 transition"
            >
              <MessageSquare className="h-4 w-4" /> Open project messages
            </Link>
          ) : (
            <Link
              href={`/projects/${id}/apply`}
              className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-6 py-3 text-xs font-bold text-[#11131d] hover:bg-[#f5a623]/90 transition"
            >
              Apply to this project <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
