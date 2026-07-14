'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { useForgeAuth } from '@/components/AuthBootstrapper'
import { buildForgeHandoffUrl } from '@/lib/beam-home'
import { db } from '@/lib/firebase'
import { normalizeLiveProject, type LiveForgeProject } from '@/lib/project-models'

export function ProjectApplicationForm({ projectId }: { projectId: string }) {
  const { activeSession, isReady } = useForgeAuth()
  const [project, setProject] = useState<LiveForgeProject | null>(null)
  const [proposedRole, setProposedRole] = useState('')
  const [buildProposal, setBuildProposal] = useState('')
  const [availableHours, setAvailableHours] = useState(5)
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [githubHandle, setGithubHandle] = useState('')
  const [contactPreference, setContactPreference] = useState<'email' | 'in-app' | 'both'>('email')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isReady || activeSession?.uid) return
    window.location.replace(buildForgeHandoffUrl({ role: 'community', returnPath: `/projects/${projectId}/apply` }))
  }, [activeSession?.uid, isReady, projectId])

  useEffect(() => {
    if (!db) return
    void getDoc(doc(db, 'projects', projectId)).then((snapshot) => {
      if (!snapshot.exists()) { setError('This project could not be found.'); return }
      const nextProject = normalizeLiveProject(snapshot.id, snapshot.data() as Record<string, unknown>)
      setProject(nextProject)
      setProposedRole(nextProject.openRoles[0] ?? 'Project contributor')
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load the project.'))
  }, [projectId])

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!db || !activeSession?.uid || !project) { setError('An authenticated Firebase session is required.'); return }
    setIsSubmitting(true); setError(null)
    try {
      await addDoc(collection(db, 'projectApplications'), {
        projectId: project.id,
        projectName: project.clientName,
        applicantUid: activeSession.uid,
        applicantEmail: activeSession.email ?? '',
        proposedRole,
        buildProposal: buildProposal.trim(),
        availableHours,
        portfolioUrl: portfolioUrl.trim(),
        githubHandle: githubHandle.trim(),
        contactPreference,
        status: 'pending',
        createdAt: serverTimestamp(),
      })
      setSubmitted(true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit the application.')
    } finally { setIsSubmitting(false) }
  }

  if (!isReady || !activeSession?.uid) return <Message>Connecting you to Forge sign-in…</Message>
  if (submitted) return <Message><h1 className="text-3xl font-semibold text-white">Application received.</h1><p className="mt-3">The Forge team will review your proposed contribution to {project?.clientName}.</p><Link href={`/projects/${projectId}`} className="mt-6 inline-flex rounded-full bg-[#f5a623] px-5 py-3 font-semibold text-[#11131d]">Return to project</Link></Message>

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <section className="rounded-[2rem] border border-white/10 bg-[#0d111d] p-6 shadow-forge sm:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Project application</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Apply to {project?.clientName || 'this Forge project'}</h1>
        <form onSubmit={submitApplication} className="mt-8 space-y-5">
          <Field label="Proposed role"><select value={proposedRole} onChange={(event) => setProposedRole(event.target.value)} className={inputClass}>{(project?.openRoles.length ? project.openRoles : ['Project contributor']).map((role) => <option key={role} value={role}>{role}</option>)}</select></Field>
          <Field label="What do you want to build?"><textarea required value={buildProposal} onChange={(event) => setBuildProposal(event.target.value)} rows={6} className={inputClass} /></Field>
          <Field label="Available hours per week"><input required min={1} max={80} type="number" value={availableHours} onChange={(event) => setAvailableHours(Number(event.target.value))} className={inputClass} /></Field>
          <Field label="Portfolio URL"><input type="url" value={portfolioUrl} onChange={(event) => setPortfolioUrl(event.target.value)} className={inputClass} /></Field>
          <Field label="GitHub handle"><input value={githubHandle} onChange={(event) => setGithubHandle(event.target.value)} className={inputClass} /></Field>
          <Field label="Contact preference"><select value={contactPreference} onChange={(event) => setContactPreference(event.target.value as typeof contactPreference)} className={inputClass}><option value="email">Email</option><option value="in-app">In-app</option><option value="both">Both</option></select></Field>
          {error ? <p className="text-sm text-rose-200">{error}</p> : null}
          <button disabled={isSubmitting || !project} className="rounded-full bg-[#f5a623] px-5 py-3 text-sm font-semibold text-[#11131d] disabled:opacity-50">{isSubmitting ? 'Submitting…' : 'Submit application'}</button>
        </form>
      </section>
    </div>
  )
}

const inputClass = 'mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623]/50'
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-white">{label}{children}</label> }
function Message({ children }: { children: React.ReactNode }) { return <div className="mx-auto max-w-3xl px-4 py-10"><section className="rounded-[2rem] border border-white/10 bg-[#0d111d] p-8 text-white/68">{children}</section></div> }
