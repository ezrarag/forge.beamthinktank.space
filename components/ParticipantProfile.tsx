'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { ExternalLink, MessageSquare } from 'lucide-react'
import { useForgeAuth } from '@/components/AuthBootstrapper'
import { buildForgeHandoffUrl } from '@/lib/beam-home'
import { db } from '@/lib/firebase'
import { mergeParticipantProfile, type ParticipantProfileData } from '@/lib/project-models'

const leadRoles = new Set(['beam-admin', 'rag-lead', 'project-lead'])

export function ParticipantProfile({ participantUid }: { participantUid: string }) {
  const { activeSession, isReady } = useForgeAuth()
  const [profile, setProfile] = useState<ParticipantProfileData | null>(null)
  const [viewer, setViewer] = useState<ParticipantProfileData | null>(null)
  const [message, setMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [messageState, setMessageState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isReady || activeSession?.uid) return
    window.location.replace(buildForgeHandoffUrl({ role: 'community', returnPath: `/participants/${participantUid}` }))
  }, [activeSession?.uid, isReady, participantUid])

  useEffect(() => {
    if (!db || !activeSession?.uid) return
    let cancelled = false
    void (async () => {
      try {
        const [userSnapshot, profileSnapshot, viewerSnapshot, viewerProfileSnapshot] = await Promise.all([
          getDoc(doc(db!, 'users', participantUid)),
          getDoc(doc(db!, 'users', participantUid, 'profiles', 'beamProfile')),
          getDoc(doc(db!, 'users', activeSession.uid)),
          getDoc(doc(db!, 'users', activeSession.uid, 'profiles', 'beamProfile')),
        ])
        if (!userSnapshot.exists()) throw new Error('Participant profile not found.')
        if (cancelled) return
        setProfile(mergeParticipantProfile(userSnapshot.data(), profileSnapshot.exists() ? profileSnapshot.data() : {}))
        setViewer(mergeParticipantProfile(viewerSnapshot.exists() ? viewerSnapshot.data() : {}, viewerProfileSnapshot.exists() ? viewerProfileSnapshot.data() : {}))
      } catch (loadError) { if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Unable to load this profile.') }
    })()
    return () => { cancelled = true }
  }, [activeSession?.uid, participantUid])

  const sharedProjectIds = useMemo(() => viewer?.activeProjectIds.filter((id) => profile?.activeProjectIds.includes(id)) ?? [], [profile, viewer])
  const canMessage = Boolean(activeSession?.uid && activeSession.uid !== participantUid && (viewer?.roles.some((role) => leadRoles.has(role)) || sharedProjectIds.length))

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!db || !activeSession?.uid || !message.trim()) return
    setMessageState('sending'); setError(null)
    try {
      await addDoc(collection(db, 'projectMessages'), {
        senderUid: activeSession.uid,
        senderEmail: activeSession.email ?? '',
        recipientUid: participantUid,
        projectId: sharedProjectIds[0] ?? null,
        body: message.trim(),
        status: 'unread',
        createdAt: serverTimestamp(),
      })
      setMessage(''); setMessageState('sent'); setIsComposing(false)
    } catch (sendError) { setMessageState('idle'); setError(sendError instanceof Error ? sendError.message : 'Unable to send message.') }
  }

  if (!isReady || !activeSession?.uid) return <ProfileMessage>Sign in is required to view participant profiles.</ProfileMessage>
  if (error && !profile) return <ProfileMessage>{error}</ProfileMessage>
  if (!profile) return <ProfileMessage>Loading participant profile…</ProfileMessage>

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-[#0d111d] p-6 shadow-forge sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {profile.photoURL ? <div role="img" aria-label={`${profile.displayName} profile photo`} className="h-24 w-24 rounded-full border border-white/10 bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(profile.photoURL)})` }} /> : <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f5a623]/15 text-3xl text-[#f5a623]">{profile.displayName.slice(0, 1)}</div>}
          <div><p className="text-xs uppercase tracking-[0.2em] text-[#f5a623]">Forge participant</p><h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">{profile.displayName}</h1><p className="mt-2 text-sm text-white/48">{profile.availability}</p></div>
        </div>
        <p className="mt-8 max-w-3xl text-base leading-7 text-white/68">{profile.bio || 'This participant has not added a bio yet.'}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <ProfileField label="Skills" values={profile.skills} />
          <ProfileField label="Preferred roles" values={profile.preferredRoles} />
          <div><p className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">Work style</p><p className="mt-3 text-sm text-white/66">{profile.workStyle || 'Not specified'}</p></div>
          <div className="flex flex-col gap-2"><p className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">Links</p>{profile.portfolioUrl ? <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-white">Portfolio <ExternalLink className="h-4 w-4" /></a> : null}{profile.githubHandle ? <a href={`https://github.com/${profile.githubHandle.replace(/^@/, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-white">GitHub: {profile.githubHandle} <ExternalLink className="h-4 w-4" /></a> : null}</div>
        </div>

        {canMessage ? <div className="mt-8 border-t border-white/10 pt-6"><button type="button" onClick={() => setIsComposing((current) => !current)} className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-5 py-3 text-sm font-semibold text-[#11131d]"><MessageSquare className="h-4 w-4" /> Message</button>{isComposing ? <form onSubmit={sendMessage} className="mt-4"><textarea required value={message} onChange={(event) => setMessage(event.target.value)} rows={5} className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white outline-none focus:border-[#f5a623]/50" placeholder="Write a project message…" /><button disabled={messageState === 'sending'} className="mt-3 rounded-full border border-white/14 px-4 py-2 text-sm text-white">{messageState === 'sending' ? 'Sending…' : 'Send message'}</button></form> : null}{messageState === 'sent' ? <p className="mt-3 text-sm text-emerald-200">Message sent.</p> : null}{error ? <p className="mt-3 text-sm text-rose-200">{error}</p> : null}</div> : null}
      </section>
    </div>
  )
}

function ProfileField({ label, values }: { label: string; values: string[] }) { return <div><p className="text-xs uppercase tracking-[0.18em] text-[#f5a623]">{label}</p><div className="mt-3 flex flex-wrap gap-2">{values.length ? values.map((value) => <span key={value} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/68">{value}</span>) : <span className="text-sm text-white/42">Not specified</span>}</div></div> }
function ProfileMessage({ children }: { children: React.ReactNode }) { return <div className="mx-auto max-w-4xl px-4 py-10"><div className="rounded-[2rem] border border-white/10 bg-[#0d111d] p-8 text-white/68">{children}</div></div> }
