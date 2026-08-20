'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { ArrowLeft, CheckCircle2, Send, Sparkles } from 'lucide-react'
import { db } from '@/lib/firebase'
import { useForgeAuth } from '@/components/AuthBootstrapper'
import { forgeProjects } from '@/lib/forge-content'

export default function ProjectApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { activeSession, isReady } = useForgeAuth()

  const [openRoles, setOpenRoles] = useState<string[]>([])
  const [projectTitle, setProjectTitle] = useState<string>('')
  const [proposedRole, setProposedRole] = useState('')
  const [whatToBuild, setWhatToBuild] = useState('')
  const [availableHours, setAvailableHours] = useState('10')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [githubHandle, setGithubHandle] = useState('')
  const [contactPreference, setContactPreference] = useState<'email' | 'in-app' | 'both'>('email')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Auth redirect check
  useEffect(() => {
    if (!isReady) return
    if (!activeSession?.uid) {
      const timeoutId = window.setTimeout(() => {
        window.location.replace('/?signin=true')
      }, 0)
      return () => window.clearTimeout(timeoutId)
    }
  }, [activeSession?.uid, isReady])

  // Fetch project document to populate openRoles
  useEffect(() => {
    let isCancelled = false

    async function loadProjectRoles() {
      if (db) {
        try {
          const snap = await getDoc(doc(db, 'projects', id))
          if (snap.exists() && !isCancelled) {
            const data = snap.data()
            const roles: string[] = Array.isArray(data.openRoles) && data.openRoles.length > 0
              ? data.openRoles
              : ['Developer', 'Designer', 'Full-stack Engineer', 'Content Producer']
            setOpenRoles(roles)
            setProposedRole(roles[0] || 'Developer')
            setProjectTitle(data.clientName || data.title || id)
            return
          }
        } catch {
          // Fall back to seed project
        }
      }

      const seedMatch = forgeProjects.find((p) => p.id === id)
      const fallbackRoles = ['Frontend Engineer', 'Full-stack Engineer', 'Technical Writer']
      if (!isCancelled) {
        setOpenRoles(fallbackRoles)
        setProposedRole(fallbackRoles[0] || 'Frontend Engineer')
        setProjectTitle(seedMatch?.title || id)
      }
    }

    void loadProjectRoles()

    return () => {
      isCancelled = true
    }
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activeSession?.uid) return
    if (!whatToBuild.trim()) {
      setErrorMsg('Please describe what you want to build.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      if (db) {
        await addDoc(collection(db, 'projectApplications'), {
          projectId: id,
          applicantUid: activeSession.uid,
          applicantEmail: activeSession.email || '',
          proposedRole,
          whatToBuild: whatToBuild.trim(),
          availableHours: Number(availableHours) || 0,
          portfolioUrl: portfolioUrl.trim(),
          githubHandle: githubHandle.trim(),
          contactPreference,
          status: 'pending',
          createdAt: serverTimestamp(),
        })
      }

      setIsSubmitted(true)
    } catch (err) {
      console.error('Error submitting application:', err)
      setErrorMsg('Failed to submit application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isReady || !activeSession?.uid) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-white text-center">
        <p className="text-white/60">Redirecting to sign-in...</p>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-12 text-white">
        <div className="rounded-[2rem] border border-emerald-400/30 bg-emerald-400/10 p-8 text-center shadow-forge space-y-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" />
          <h1 className="text-3xl font-bold text-white">Application Submitted!</h1>
          <p className="text-sm text-white/80 leading-relaxed max-w-lg mx-auto">
            Your application for <strong className="text-emerald-300">{projectTitle}</strong> as a{' '}
            <strong className="text-emerald-300">{proposedRole}</strong> has been received. The project lead and BEAM admins will review your application soon.
          </p>

          <div className="pt-4 flex justify-center gap-3">
            <Link
              href={`/projects/${id}`}
              className="rounded-full border border-white/20 bg-white/[0.05] px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              Return to Project Page
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-[#f5a623] px-6 py-2.5 text-xs font-bold text-[#11131d] hover:bg-[#f5a623]/90 transition"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10 sm:px-6 lg:px-10 text-white">
      <div>
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/50 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Cancel &amp; Back to Project
        </Link>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#f5a623]" />
            <p className="text-xs uppercase tracking-[0.2em] text-[#f5a623]">Project Application</p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">Apply to {projectTitle}</h1>
          <p className="mt-2 text-xs text-white/60">
            Submit your application details below. This will be reviewed by the BEAM admin and project leads.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-xs text-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Proposed Role Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/60 mb-2">
              Proposed Role
            </label>
            <select
              value={proposedRole}
              onChange={(e) => setProposedRole(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623]/50 cursor-pointer"
            >
              {openRoles.map((role) => (
                <option key={role} value={role} className="bg-[#0c101c]">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* What you want to build */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/60 mb-2">
              What do you want to build? <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={whatToBuild}
              onChange={(e) => setWhatToBuild(e.target.value)}
              placeholder="Describe what components, deliverables, or features you want to build on this project..."
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623]/50 placeholder:text-white/30"
            />
          </div>

          {/* Available Hours */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/60 mb-2">
              Available Hours Per Week
            </label>
            <input
              type="number"
              min={1}
              max={80}
              value={availableHours}
              onChange={(e) => setAvailableHours(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623]/50"
            />
          </div>

          {/* Portfolio & GitHub */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/60 mb-2">
                Portfolio URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://yourportfolio.com"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623]/50 placeholder:text-white/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/60 mb-2">
                GitHub Handle
              </label>
              <input
                type="text"
                value={githubHandle}
                onChange={(e) => setGithubHandle(e.target.value)}
                placeholder="@username"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623]/50 placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Contact Preference */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/60 mb-2">
              Contact Preference
            </label>
            <select
              value={contactPreference}
              onChange={(e) => setContactPreference(e.target.value as 'email' | 'in-app' | 'both')}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623]/50 cursor-pointer"
            >
              <option value="email" className="bg-[#0c101c]">Email</option>
              <option value="in-app" className="bg-[#0c101c]">In-App Messages</option>
              <option value="both" className="bg-[#0c101c]">Both Email and In-App</option>
            </select>
          </div>

          {/* Applicant Email Indicator */}
          <div className="rounded-2xl border border-white/10 bg-black/20 p-3.5 text-xs text-white/50">
            Submitting as: <strong className="text-white">{activeSession.email}</strong>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#f5a623] px-6 py-3.5 text-sm font-bold text-[#11131d] hover:bg-[#f5a623]/90 transition disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </section>
    </div>
  )
}
