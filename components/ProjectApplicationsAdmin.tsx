'use client'

import { useEffect, useState } from 'react'
import { arrayUnion, collection, doc, onSnapshot, orderBy, query, where, writeBatch } from 'firebase/firestore'
import { Check, ExternalLink, Inbox, X } from 'lucide-react'
import { useForgeAuth } from '@/components/AuthBootstrapper'
import { db } from '@/lib/firebase'
import { stringArray, type ProjectApplication } from '@/lib/project-models'

const adminRoles = new Set(['beam-admin', 'rag-lead'])

export function ProjectApplicationsAdmin() {
  const { activeSession } = useForgeAuth()
  const [canReview, setCanReview] = useState(false)
  const [applications, setApplications] = useState<ProjectApplication[]>([])
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!db || !activeSession?.uid) { setCanReview(false); return }
    return onSnapshot(doc(db, 'users', activeSession.uid), (snapshot) => {
      const roles = stringArray(snapshot.data()?.roles).map((role) => role.toLowerCase())
      setCanReview(roles.some((role) => adminRoles.has(role)))
    }, () => setCanReview(false))
  }, [activeSession?.uid])

  useEffect(() => {
    if (!db || !canReview) { setApplications([]); return }
    const applicationsQuery = query(collection(db, 'projectApplications'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'))
    return onSnapshot(applicationsQuery, (snapshot) => {
      setApplications(snapshot.docs.map((applicationDoc) => ({ id: applicationDoc.id, ...applicationDoc.data() } as ProjectApplication)))
      setError(null)
    }, (snapshotError) => setError(snapshotError.message))
  }, [canReview])

  async function decide(application: ProjectApplication, decision: 'accepted' | 'declined') {
    if (!db) return
    setActionId(application.id); setError(null)
    try {
      const batch = writeBatch(db)
      batch.update(doc(db, 'projectApplications', application.id), { status: decision })
      if (decision === 'accepted') {
        batch.set(doc(db, 'projects', application.projectId), { cohort: arrayUnion(application.applicantUid) }, { merge: true })
        batch.set(doc(db, 'users', application.applicantUid), { activeProjectIds: arrayUnion(application.projectId) }, { merge: true })
      }
      await batch.commit()
    } catch (decisionError) { setError(decisionError instanceof Error ? decisionError.message : 'Unable to update this application.') }
    finally { setActionId(null) }
  }

  if (!canReview) return null

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Project applications</p><p className="mt-2 text-sm text-white/60">Review pending participant self-enrollment requests.</p></div><div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-[#f5a623]"><Inbox className="h-5 w-5" /></div></div>
      {error ? <p className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">{error}</p> : null}
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {applications.map((application) => (
          <article key={application.id} className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.16em] text-[#f5a623]">{application.projectName || application.projectId}</p><h3 className="mt-2 text-xl font-semibold text-white">{application.proposedRole}</h3></div><span className="text-xs text-white/42">{application.availableHours} hrs/week</span></div>
            <p className="mt-3 text-sm text-white/52">{application.applicantEmail}</p>
            <p className="mt-4 text-sm leading-6 text-white/68">{application.buildProposal}</p>
            {application.portfolioUrl ? <a href={application.portfolioUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">Portfolio <ExternalLink className="h-4 w-4" /></a> : null}
            <div className="mt-5 flex gap-3"><button disabled={actionId === application.id} onClick={() => void decide(application, 'accepted')} className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-950 disabled:opacity-50"><Check className="h-4 w-4" /> Accept</button><button disabled={actionId === application.id} onClick={() => void decide(application, 'declined')} className="inline-flex items-center gap-2 rounded-full border border-rose-300/25 bg-rose-300/10 px-4 py-2 text-sm text-rose-100 disabled:opacity-50"><X className="h-4 w-4" /> Decline</button></div>
          </article>
        ))}
        {!applications.length && !error ? <p className="text-sm text-white/48">No pending applications.</p> : null}
      </div>
    </section>
  )
}
