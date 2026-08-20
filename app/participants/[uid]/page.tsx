'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  ExternalLink,
  Github,
  Globe,
  Lock,
  MessageSquare,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { db } from '@/lib/firebase'
import { useForgeAuth } from '@/components/AuthBootstrapper'

interface ParticipantProfileData {
  uid: string
  displayName?: string
  photoURL?: string
  email?: string
  bio?: string
  skills?: string[]
  availability?: string
  preferredRoles?: string[] | string
  workStyle?: string
  portfolioUrl?: string
  githubHandle?: string
  contactPreference?: string
  activeProjectIds?: string[]
  roles?: string[]
}

export default function ParticipantProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params)
  const { activeSession, isReady } = useForgeAuth()

  const [profile, setProfile] = useState<ParticipantProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  const [viewerRoles, setViewerRoles] = useState<string[]>([])
  const [viewerActiveProjects, setViewerActiveProjects] = useState<string[]>([])

  const [composeOpen, setComposeOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  // Fetch target profile (from users/{uid} and subcollection users/{uid}/beamProfile)
  useEffect(() => {
    let isCancelled = false

    async function loadProfile() {
      setLoading(true)

      let mergedData: ParticipantProfileData = { uid }

      if (db) {
        try {
          // 1. Read main user doc
          const userSnap = await getDoc(doc(db, 'users', uid))
          if (userSnap.exists()) {
            mergedData = { ...mergedData, ...(userSnap.data() as ParticipantProfileData) }
          }

          // 2. Read beamProfile subcollection if it exists
          const profileSnap = await getDoc(doc(db, 'users', uid, 'beamProfile', 'default'))
            .catch(() => getDoc(doc(db!, 'users', uid, 'profiles', 'beamProfile')).catch(() => null))

          if (profileSnap && profileSnap.exists()) {
            mergedData = { ...mergedData, ...(profileSnap.data() as ParticipantProfileData) }
          }
        } catch (err) {
          console.warn('Error loading participant profile:', err)
        }
      }

      // Provide reasonable fallback for demo/seed view if doc doesn't exist
      if (!mergedData.displayName) {
        mergedData = {
          uid,
          displayName: uid === 'demo-ezra' ? 'Ezra Haugabrooks' : `Participant (${uid.slice(0, 6)})`,
          email: `${uid}@beamthinktank.space`,
          bio: 'Active participant building software, hardware fabrication, and fintech infrastructure in the BEAM network.',
          skills: ['Next.js', 'TypeScript', 'Hardware Repair', 'ComfyUI Video'],
          availability: '15 hours / week',
          preferredRoles: ['Full-stack Engineer', 'Fabrication Lead'],
          workStyle: 'Collaborative & Sprint-focused',
          portfolioUrl: 'https://beamthinktank.space',
          githubHandle: 'ezrarag',
          contactPreference: 'email',
          activeProjectIds: ['mke-black-digital-platform'],
        }
      }

      if (!isCancelled) {
        setProfile(mergedData)
        setLoading(false)
      }
    }

    void loadProfile()

    return () => {
      isCancelled = true
    }
  }, [uid])

  // Fetch viewer credentials and roles
  useEffect(() => {
    if (!activeSession?.uid || !db) return

    let isCancelled = false

    async function loadViewerData() {
      try {
        const viewerSnap = await getDoc(doc(db!, 'users', activeSession!.uid))
        if (viewerSnap.exists() && !isCancelled) {
          const data = viewerSnap.data()
          setViewerRoles(Array.isArray(data.roles) ? data.roles : [])
          setViewerActiveProjects(Array.isArray(data.activeProjectIds) ? data.activeProjectIds : [])
        }
      } catch {
        // Ignore viewer fetch error
      }
    }

    void loadViewerData()

    return () => {
      isCancelled = true
    }
  }, [activeSession])

  // Determine messaging permission:
  // Is project lead or admin? (check viewerRoles for 'beam-admin', 'rag-lead', 'project-lead', 'admin')
  const isLeadOrAdmin = viewerRoles.some((r) =>
    ['beam-admin', 'rag-lead', 'project-lead', 'admin'].includes(r.toLowerCase())
  )

  // Does viewer share an overlapping active project with profile owner?
  const ownerProjects = profile?.activeProjectIds || []
  const hasOverlappingProject = viewerActiveProjects.some((pId) => ownerProjects.includes(pId))

  const canSendMessage = (isLeadOrAdmin || hasOverlappingProject) && activeSession?.uid !== uid

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!messageText.trim() || !activeSession?.uid) return

    setIsSending(true)
    setSendError(null)

    try {
      if (db) {
        const sharedProject = viewerActiveProjects.find((pId) => ownerProjects.includes(pId)) || null

        await addDoc(collection(db, 'projectMessages'), {
          senderUid: activeSession.uid,
          senderEmail: activeSession.email || '',
          senderName: activeSession.displayName || '',
          recipientUid: uid,
          projectId: sharedProject,
          message: messageText.trim(),
          createdAt: serverTimestamp(),
        })
      }

      setSendSuccess(true)
      setMessageText('')
      setComposeOpen(false)
    } catch (err) {
      console.error('Error sending message:', err)
      setSendError('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  if (!isReady) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-white text-center">
        <p className="text-white/60">Loading session...</p>
      </div>
    )
  }

  if (!activeSession?.uid) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-white">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center shadow-forge space-y-4">
          <Lock className="mx-auto h-10 w-10 text-[#f5a623]" />
          <h1 className="text-2xl font-bold text-white">Authenticated Access Required</h1>
          <p className="text-sm text-white/60 max-w-md mx-auto">
            Participant profile details and direct contacts are visible only to authenticated BEAM Forge members.
          </p>
          <div className="pt-2">
            <Link
              href="/?signin=true"
              className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-6 py-2.5 text-xs font-bold text-[#11131d]"
            >
              Sign in to View Profile
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-white text-center">
        <p className="text-white/60">Loading participant profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-white text-center">
        <p className="text-white/60">Profile not found for ID `{uid}`.</p>
      </div>
    )
  }

  const skillsList = Array.isArray(profile.skills) ? profile.skills : []
  const preferredRolesList = Array.isArray(profile.preferredRoles)
    ? profile.preferredRoles
    : typeof profile.preferredRoles === 'string' && profile.preferredRoles
    ? [profile.preferredRoles]
    : []

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 lg:px-10 text-white">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/50 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      {sendSuccess && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <span>Message sent successfully to {profile.displayName}!</span>
          </div>
          <button onClick={() => setSendSuccess(false)} className="text-white/60 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Profile Section */}
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8 space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName || 'Participant'}
                  className="h-24 w-24 rounded-full border-2 border-white/20 object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0c101c] border-2 border-white/20 font-bold text-2xl text-[#f5a623]">
                  {(profile.displayName || 'P').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#0c101c] ring-2 ring-[#f5a623] text-[#f5a623]">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-white">{profile.displayName || 'BEAM Participant'}</h1>
              <p className="text-xs text-white/50">{profile.email}</p>
              {profile.availability && (
                <p className="text-xs font-semibold text-emerald-300 pt-1">
                  Availability: {profile.availability}
                </p>
              )}
            </div>
          </div>

          {/* Conditional Message Button */}
          {canSendMessage && (
            <button
              type="button"
              onClick={() => setComposeOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-6 py-2.5 text-xs font-bold text-[#11131d] hover:bg-[#f5a623]/90 transition shrink-0"
            >
              <MessageSquare className="h-4 w-4" />
              {composeOpen ? 'Close Composer' : 'Message Participant'}
            </button>
          )}
        </div>

        {/* Inline Message Compose Form */}
        {composeOpen && (
          <div className="rounded-2xl border border-[#f5a623]/30 bg-black/40 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#f5a623]" /> Send Direct Message to {profile.displayName}
            </h3>

            {sendError && (
              <p className="text-xs text-rose-300">{sendError}</p>
            )}

            <form onSubmit={handleSendMessage} className="space-y-3">
              <textarea
                required
                rows={3}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Write your message regarding project deliverables, role fit, or collaboration..."
                className="w-full rounded-2xl border border-white/10 bg-[#0c101c] px-4 py-3 text-xs text-white outline-none focus:border-[#f5a623]/50 placeholder:text-white/30"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setComposeOpen(false)}
                  className="rounded-full border border-white/14 px-4 py-2 text-xs font-medium text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-5 py-2 text-xs font-bold text-[#11131d] hover:bg-[#f5a623]/90 transition disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="border-t border-white/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 mb-1.5">Bio</p>
            <p className="text-sm text-white/70 leading-relaxed max-w-2xl">{profile.bio}</p>
          </div>
        )}

        {/* Skills Tags */}
        {skillsList.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50 mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs text-white/80"
                >
                  <Code2 className="h-3 w-3 text-cyan-300" /> {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Grid: Additional Profile Details */}
      <section className="grid gap-4 sm:grid-cols-2">
        {/* Preferred Roles & Work Style */}
        <div className="rounded-[2rem] border border-white/10 bg-[#0c101c] p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-white/40 font-mono">Preferred Roles</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {preferredRolesList.length > 0 ? (
                preferredRolesList.map((role) => (
                  <span key={role} className="rounded-md border border-[#f5a623]/30 bg-[#f5a623]/10 px-2.5 py-1 text-xs font-semibold text-[#f5a623]">
                    {role}
                  </span>
                ))
              ) : (
                <p className="text-xs text-white/50">Project Contributor</p>
              )}
            </div>
          </div>

          {profile.workStyle && (
            <div className="border-t border-white/10 pt-3">
              <p className="text-xs uppercase tracking-[0.16em] text-white/40 font-mono">Work Style</p>
              <p className="mt-1 text-xs text-white/70">{profile.workStyle}</p>
            </div>
          )}
        </div>

        {/* Contact Links & GitHub */}
        <div className="rounded-[2rem] border border-white/10 bg-[#0c101c] p-6 space-y-4">
          <p className="text-xs uppercase tracking-[0.16em] text-white/40 font-mono">Links &amp; External Profiles</p>
          <div className="space-y-3 text-xs">
            {profile.portfolioUrl && (
              <a
                href={profile.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3 text-white hover:border-white/20 transition"
              >
                <span className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-cyan-300" /> Portfolio Website
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-white/40" />
              </a>
            )}

            {profile.githubHandle && (
              <a
                href={`https://github.com/${profile.githubHandle.replace(/^@/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3 text-white hover:border-white/20 transition"
              >
                <span className="flex items-center gap-2">
                  <Github className="h-4 w-4 text-white/70" /> GitHub: {profile.githubHandle}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-white/40" />
              </a>
            )}

            {!profile.portfolioUrl && !profile.githubHandle && (
              <p className="text-white/40">No external links attached to this profile.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
