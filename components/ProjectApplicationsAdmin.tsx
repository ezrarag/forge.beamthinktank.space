'use client'

import { useEffect, useState } from 'react'
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { CheckCircle2, ExternalLink, Inbox, XCircle } from 'lucide-react'
import { db } from '@/lib/firebase'
import { useForgeAuth } from '@/components/AuthBootstrapper'
import { forgeProjects } from '@/lib/forge-content'

export interface ProjectApplicationItem {
  id: string
  projectId: string
  projectName?: string
  applicantUid: string
  applicantEmail: string
  proposedRole: string
  whatToBuild: string
  availableHours: number
  portfolioUrl?: string
  githubHandle?: string
  contactPreference?: string
  status: string
  createdAt?: unknown
}

export function ProjectApplicationsAdmin() {
  const { activeSession, isReady } = useForgeAuth()
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loadingAuth, setLoadingAuth] = useState(true)

  const [applications, setApplications] = useState<ProjectApplicationItem[]>([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Fetch viewer roles and check authorization
  useEffect(() => {
    if (!isReady) return
    if (!activeSession?.uid || !db) {
      setLoadingAuth(false)
      setIsAuthorized(false)
      return
    }

    let isCancelled = false

    async function checkAdminRoles() {
      try {
        const snap = await getDoc(doc(db!, 'users', activeSession!.uid))
        if (snap.exists() && !isCancelled) {
          const roles: string[] = Array.isArray(snap.data()?.roles) ? snap.data().roles : []
          setUserRoles(roles)
          const authorized = roles.some((r) => ['beam-admin', 'rag-lead', 'admin'].includes(r.toLowerCase()))
          setIsAuthorized(authorized)
        }
      } catch {
        // Auth check error
      } finally {
        if (!isCancelled) setLoadingAuth(false)
      }
    }

    void checkAdminRoles()

    return () => {
      isCancelled = true
    }
  }, [activeSession, isReady])

  // Fetch pending project applications if authorized
  useEffect(() => {
    if (!isAuthorized || !db) {
      setLoadingApps(false)
      return
    }

    let isCancelled = false

    async function loadApplications() {
      setLoadingApps(true)
      try {
        // Primary query: projectApplications where status == 'pending'
        const appQuery = query(
          collection(db!, 'projectApplications'),
          where('status', '==', 'pending')
        )
        const snap = await getDocs(appQuery)
        const rawApps: ProjectApplicationItem[] = []

        snap.forEach((docSnap) => {
          rawApps.push({ id: docSnap.id, ...(docSnap.data() as Omit<ProjectApplicationItem, 'id'>) })
        })

        // Sort by createdAt desc if timestamp exists
        rawApps.sort((a, b) => {
          const timeA = (a.createdAt as { seconds?: number })?.seconds || 0
          const timeB = (b.createdAt as { seconds?: number })?.seconds || 0
          return timeB - timeA
        })

        // Populate project names
        const enrichedApps: ProjectApplicationItem[] = []
        for (const appItem of rawApps) {
          let pName = appItem.projectId
          try {
            const pSnap = await getDoc(doc(db!, 'projects', appItem.projectId))
            if (pSnap.exists()) {
              pName = pSnap.data().clientName || pSnap.data().title || appItem.projectId
            } else {
              const seedMatch = forgeProjects.find((p) => p.id === appItem.projectId)
              if (seedMatch) pName = seedMatch.title
            }
          } catch {
            const seedMatch = forgeProjects.find((p) => p.id === appItem.projectId)
            if (seedMatch) pName = seedMatch.title
          }

          enrichedApps.push({ ...appItem, projectName: pName })
        }

        if (!isCancelled) {
          setApplications(enrichedApps)
        }
      } catch (err) {
        console.warn('Error loading project applications:', err)
      } finally {
        if (!isCancelled) setLoadingApps(false)
      }
    }

    void loadApplications()

    return () => {
      isCancelled = true
    }
  }, [isAuthorized])

  async function handleAccept(appItem: ProjectApplicationItem) {
    if (!db) return
    setActionLoadingId(appItem.id)

    try {
      // 1. Update application status to 'accepted'
      await updateDoc(doc(db, 'projectApplications', appItem.id), {
        status: 'accepted',
      })

      // 2. Add applicantUid to projects/{projectId}.cohort array
      await setDoc(
        doc(db, 'projects', appItem.projectId),
        { cohort: arrayUnion(appItem.applicantUid) },
        { merge: true }
      )

      // 3. Write projectId to users/{applicantUid}.activeProjectIds array
      await setDoc(
        doc(db, 'users', appItem.applicantUid),
        { activeProjectIds: arrayUnion(appItem.projectId) },
        { merge: true }
      )

      // Filter out accepted app from pending list
      setApplications((prev) => prev.filter((a) => a.id !== appItem.id))
    } catch (err) {
      console.error('Error accepting application:', err)
    } finally {
      setActionLoadingId(null)
    }
  }

  async function handleDecline(appItem: ProjectApplicationItem) {
    if (!db) return
    setActionLoadingId(appItem.id)

    try {
      // Update application status to 'declined'
      await updateDoc(doc(db, 'projectApplications', appItem.id), {
        status: 'declined',
      })

      // Filter out declined app from pending list
      setApplications((prev) => prev.filter((a) => a.id !== appItem.id))
    } catch (err) {
      console.error('Error declining application:', err)
    } finally {
      setActionLoadingId(null)
    }
  }

  if (loadingAuth) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 text-sm text-white/50">
        Checking admin permissions...
      </section>
    )
  }

  // Section visible ONLY to users with beam-admin or rag-lead in their roles array
  if (!isAuthorized) {
    return null
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-[#f5a623]" />
            <p className="text-xs uppercase tracking-[0.2em] text-[#f5a623]">Admin Review</p>
          </div>
          <h2 className="text-2xl font-semibold text-white mt-1">Pending Project Applications</h2>
          <p className="text-xs text-white/60 mt-1">
            Review cohort member applications for client and R&amp;D workstreams. Authorized as: {userRoles.join(', ')}.
          </p>
        </div>

        <span className="rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3.5 py-1 text-xs font-bold text-[#f5a623]">
          {applications.length} Pending
        </span>
      </div>

      {loadingApps ? (
        <p className="text-xs text-white/50">Loading applications...</p>
      ) : applications.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {applications.map((appItem) => {
            const isProcessing = actionLoadingId === appItem.id
            return (
              <div
                key={appItem.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0c101c] p-5 space-y-4 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs border-b border-white/10 pb-3">
                    <span className="font-semibold text-white">{appItem.applicantEmail}</span>
                    <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 font-bold text-emerald-300">
                      {appItem.proposedRole}
                    </span>
                  </div>

                  <p className="mt-3 text-xs uppercase tracking-wider text-white/40 font-mono">Project</p>
                  <p className="text-base font-bold text-white">{appItem.projectName || appItem.projectId}</p>

                  <p className="mt-3 text-xs uppercase tracking-wider text-white/40 font-mono">What they want to build</p>
                  <p className="mt-1 text-xs text-white/80 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                    {appItem.whatToBuild}
                  </p>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl border border-white/5 bg-black/20 p-2.5">
                      <span className="text-white/40">Available Hours:</span>{' '}
                      <strong className="text-white">{appItem.availableHours} hrs / wk</strong>
                    </div>

                    {appItem.portfolioUrl ? (
                      <a
                        href={appItem.portfolioUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-cyan-300 hover:underline rounded-xl border border-white/5 bg-black/20 p-2.5 truncate"
                      >
                        Portfolio <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <div className="rounded-xl border border-white/5 bg-black/20 p-2.5 text-white/40">
                        No portfolio link
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleDecline(appItem)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-400/20 transition disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" /> Decline
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleAccept(appItem)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-5 py-2 text-xs font-bold text-[#0c101c] hover:bg-emerald-300 transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Accept Application'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-xs text-white/50">
          No pending project applications awaiting review.
        </div>
      )}
    </section>
  )
}
