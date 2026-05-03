'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  type LucideIcon,
  Database,
  FolderKanban,
  Newspaper,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react'
import { useForgeContent } from '@/components/ForgeContentProvider'
import { createDefaultForgeContentSnapshot } from '@/lib/forge-content'
import { slugify } from '@/lib/utils'
import type {
  AdminParticipant,
  EditableFeedEntry,
  EditableForgeProject,
  EditableForgeTrack,
  ForgeContentSnapshot,
  ForgeSlide,
  MemberAssignment,
} from '@/lib/types'

const trackOptions: EditableForgeTrack['id'][] = ['fintech', 'software', 'fabrication', 'it', 'content-production']
const projectPhases: EditableForgeProject['phase'][] = ['Active', 'Pipeline', 'Archived']
const feedTypes: EditableFeedEntry['type'][] = ['fabrication-log', 'launch', 'cohort-output', 'client-delivery']

function linesToArray(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

function arrayToLines(value: string[]) {
  return value.join('\n')
}

function buildId(prefix: string, seed: string) {
  const slug = slugify(seed) || `${prefix}-${Math.random().toString(36).slice(2, 8)}`
  return `${prefix}-${slug}`.slice(0, 64)
}

function formatUpdatedAt(value: string) {
  if (!value) return 'Not saved yet'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function SectionTitle({ icon: Icon, label, description }: { icon: LucideIcon; label: string; description: string }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">{label}</p>
        <p className="mt-2 text-sm text-white/60">{description}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-[#f5a623]">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  )
}

function Field({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-2">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description ? <p className="mt-1 text-xs text-white/48">{description}</p> : null}
      </div>
      {children}
    </label>
  )
}

function inputClassName() {
  return 'w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/24 focus:border-[#f5a623]/40'
}

function ParticipantLinkPicker({
  participants,
  linkedParticipantIds,
  onToggle,
}: {
  participants: AdminParticipant[]
  linkedParticipantIds: string[]
  onToggle: (participantId: string) => void
}) {
  if (!participants.length) {
    return <p className="text-xs text-white/42">Add participants first, then link them here.</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {participants.map((participant) => {
        const isLinked = linkedParticipantIds.includes(participant.id)
        return (
          <button
            key={participant.id}
            type="button"
            onClick={() => onToggle(participant.id)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              isLinked
                ? 'border-[#f5a623]/40 bg-[#f5a623]/12 text-[#f5a623]'
                : 'border-white/10 bg-white/[0.03] text-white/66 hover:border-white/24 hover:text-white'
            }`}
          >
            {participant.name || participant.id}
          </button>
        )
      })}
    </div>
  )
}

function StatusBanner({
  tone,
  message,
}: {
  tone: 'success' | 'warning'
  message: string
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        tone === 'success'
          ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
          : 'border-amber-300/20 bg-amber-300/10 text-amber-100'
      }`}
    >
      {message}
    </div>
  )
}

function createEmptySlide(): ForgeSlide {
  return {
    id: buildId('slide', 'new-slide'),
    eyebrow: 'New section',
    title: 'New slide title',
    description: 'Describe this frontend panel.',
    ctaLabel: 'Open page',
    ctaHref: '/viewer',
    metric: 'New metric',
    accent: 'from-[#f5a623]/30 via-[#f5a623]/8 to-transparent',
  }
}

function createEmptyProject(): EditableForgeProject {
  return {
    id: buildId('project', 'new-project'),
    title: 'New project',
    track: 'software',
    phase: 'Active',
    partner: 'Partner name',
    compensation: 'Compensation',
    summary: 'Project summary',
    outcomes: [],
    linkedParticipantIds: [],
  }
}

function createEmptyFeedEntry(): EditableFeedEntry {
  return {
    id: buildId('feed', 'new-feed-entry'),
    type: 'launch',
    title: 'New feed entry',
    summary: 'Update summary',
    publishedAt: new Date().toISOString().slice(0, 10),
    track: 'software',
    author: 'Forge Team',
    panels: [],
    linkedParticipantIds: [],
  }
}

function createEmptyAssignment(): MemberAssignment {
  return {
    id: buildId('assignment', 'new-assignment'),
    title: 'New assignment',
    owner: 'Owner',
    status: 'Drafting',
    payment: 'Payment',
    linkedParticipantIds: [],
  }
}

function createEmptyParticipant(): AdminParticipant {
  return {
    id: buildId('participant', 'new-participant'),
    name: 'New participant',
    email: '',
    role: '',
    status: 'Active',
    headline: '',
    notes: '',
  }
}

export function AdminStudio() {
  const { snapshot, source, isReady, saveSnapshot, resetToDefault } = useForgeContent()
  const [draft, setDraft] = useState<ForgeContentSnapshot>(snapshot)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [notice, setNotice] = useState<{ tone: 'success' | 'warning'; message: string } | null>(null)

  const liveKey = useMemo(() => JSON.stringify(snapshot), [snapshot])
  const editorSnapshot = hasInteracted ? draft : snapshot
  const draftKey = useMemo(() => JSON.stringify(editorSnapshot), [editorSnapshot])
  const isDirty = hasInteracted && draftKey !== liveKey

  function setUpdatedDraft(updater: (current: ForgeContentSnapshot) => ForgeContentSnapshot) {
    setHasInteracted(true)
    setDraft((current) => updater(hasInteracted ? current : snapshot))
  }

  function toggleLinkedParticipant(linkedParticipantIds: string[], participantId: string) {
    return linkedParticipantIds.includes(participantId)
      ? linkedParticipantIds.filter((value) => value !== participantId)
      : [...linkedParticipantIds, participantId]
  }

  async function handleSave() {
    setIsSaving(true)
    setNotice(null)

    const result = await saveSnapshot(editorSnapshot)

    setDraft(result.snapshot)
    setHasInteracted(false)
    setIsSaving(false)
    setNotice({
      tone: result.error ? 'warning' : 'success',
      message: result.error
        ? `Saved locally. Firestore write failed: ${result.error}`
        : `Saved Forge admin content to ${result.persistedTo}.`,
    })
  }

  async function handleResetToDefault() {
    if (typeof window !== 'undefined' && !window.confirm('Replace the current Forge admin content with the default seed data?')) {
      return
    }

    setIsSaving(true)
    setNotice(null)

    const fallback = createDefaultForgeContentSnapshot()
    const result = await resetToDefault()

    setDraft(result.snapshot ?? fallback)
    setHasInteracted(false)
    setIsSaving(false)
    setNotice({
      tone: result.error ? 'warning' : 'success',
      message: result.error
        ? `Default content restored locally. Firestore write failed: ${result.error}`
        : `Default Forge content restored to ${result.persistedTo}.`,
    })
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Admin Area</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              Manage frontend content and participant links without route middleware.
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
              This route stays open. Edit the public landing content, viewer feed, track copy, project cards, and participant roster
              from one workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em] text-white/52">
              <span className="rounded-full border border-white/10 px-3 py-2">Route access: open</span>
              <span className="rounded-full border border-white/10 px-3 py-2">Live source: {source}</span>
              <span className="rounded-full border border-white/10 px-3 py-2">Updated: {formatUpdatedAt(snapshot.updatedAt)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:min-w-[18rem]">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSaving || !isDirty}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#f5a623] px-5 py-3 text-sm font-semibold text-[#11131d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : isDirty ? 'Save admin changes' : 'Saved'}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(snapshot)
                setHasInteracted(false)
              }}
              disabled={!isDirty || isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Revert unsaved edits
            </button>
            <button
              type="button"
              onClick={() => void handleResetToDefault()}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-300/24 bg-amber-300/10 px-5 py-3 text-sm font-medium text-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Database className="h-4 w-4" />
              Restore default seed
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white/72 transition hover:text-white"
            >
              View public site
            </Link>
          </div>
        </div>
        {!isReady ? <p className="mt-5 text-sm text-white/48">Connecting to saved admin content...</p> : null}
        {notice ? <div className="mt-5">{<StatusBanner tone={notice.tone} message={notice.message} />}</div> : null}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <SectionTitle icon={Users} label="Participants" description="Create participant records once, then attach them to tracks, projects, feed entries, and assignments." />
        <div className="space-y-4">
          {editorSnapshot.participants.map((participant, index) => (
            <article key={participant.id} className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/42">{participant.id}</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{participant.name || 'Unnamed participant'}</h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setUpdatedDraft((current) => ({
                      ...current,
                      participants: current.participants.filter((_, participantIndex) => participantIndex !== index),
                    }))
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-medium text-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Field label="Name">
                  <input
                    value={participant.name}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        participants: current.participants.map((item, participantIndex) =>
                          participantIndex === index
                            ? {
                                ...item,
                                name: event.target.value,
                                id: item.id.startsWith('participant-new-') ? buildId('participant', event.target.value) : item.id,
                              }
                            : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Email">
                  <input
                    value={participant.email}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        participants: current.participants.map((item, participantIndex) =>
                          participantIndex === index ? { ...item, email: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                    placeholder="participant@beamthinktank.space"
                  />
                </Field>
                <Field label="Role">
                  <input
                    value={participant.role}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        participants: current.participants.map((item, participantIndex) =>
                          participantIndex === index ? { ...item, role: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                    placeholder="Frontend engineer"
                  />
                </Field>
                <Field label="Status">
                  <input
                    value={participant.status}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        participants: current.participants.map((item, participantIndex) =>
                          participantIndex === index ? { ...item, status: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                    placeholder="Active"
                  />
                </Field>
              </div>

              <div className="mt-4 grid gap-4">
                <Field label="Headline">
                  <input
                    value={participant.headline}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        participants: current.participants.map((item, participantIndex) =>
                          participantIndex === index ? { ...item, headline: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                    placeholder="Short public descriptor"
                  />
                </Field>
                <Field label="Notes">
                  <textarea
                    value={participant.notes}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        participants: current.participants.map((item, participantIndex) =>
                          participantIndex === index ? { ...item, notes: event.target.value } : item
                        ),
                      }))
                    }
                    className={`${inputClassName()} min-h-28`}
                    placeholder="Internal notes for admin use"
                  />
                </Field>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setUpdatedDraft((current) => ({
              ...current,
              participants: [...current.participants, createEmptyParticipant()],
            }))
          }
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/14 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Add participant
        </button>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <SectionTitle icon={Sparkles} label="Landing Slides" description="Edit the main public homepage panels and their CTAs." />
        <div className="space-y-4">
          {editorSnapshot.slides.map((slide, index) => (
            <article key={slide.id} className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/42">{slide.id}</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{slide.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setUpdatedDraft((current) => ({
                      ...current,
                      slides: current.slides.filter((_, slideIndex) => slideIndex !== index),
                    }))
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-medium text-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Field label="Eyebrow">
                  <input
                    value={slide.eyebrow}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        slides: current.slides.map((item, slideIndex) =>
                          slideIndex === index ? { ...item, eyebrow: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Metric">
                  <input
                    value={slide.metric}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        slides: current.slides.map((item, slideIndex) =>
                          slideIndex === index ? { ...item, metric: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Title">
                  <input
                    value={slide.title}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        slides: current.slides.map((item, slideIndex) =>
                          slideIndex === index ? { ...item, title: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="CTA Label">
                  <input
                    value={slide.ctaLabel}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        slides: current.slides.map((item, slideIndex) =>
                          slideIndex === index ? { ...item, ctaLabel: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="CTA Href">
                  <input
                    value={slide.ctaHref}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        slides: current.slides.map((item, slideIndex) =>
                          slideIndex === index ? { ...item, ctaHref: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Accent gradient">
                  <input
                    value={slide.accent}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        slides: current.slides.map((item, slideIndex) =>
                          slideIndex === index ? { ...item, accent: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Description">
                  <textarea
                    value={slide.description}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        slides: current.slides.map((item, slideIndex) =>
                          slideIndex === index ? { ...item, description: event.target.value } : item
                        ),
                      }))
                    }
                    className={`${inputClassName()} min-h-32`}
                  />
                </Field>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setUpdatedDraft((current) => ({
              ...current,
              slides: [...current.slides, createEmptySlide()],
            }))
          }
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/14 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Add slide
        </button>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <SectionTitle icon={FolderKanban} label="Tracks" description="Update the track cards and link participant records directly to each lane." />
        <div className="space-y-4">
          {editorSnapshot.tracks.map((track, index) => (
            <article key={track.id} className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.16em] text-white/42">{track.id}</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{track.title}</h2>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">Track is fixed</span>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Field label="Title">
                  <input
                    value={track.title}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        tracks: current.tracks.map((item, trackIndex) =>
                          trackIndex === index ? { ...item, title: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Cohort window">
                  <input
                    value={track.cohortWindow}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        tracks: current.tracks.map((item, trackIndex) =>
                          trackIndex === index ? { ...item, cohortWindow: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Tagline">
                  <input
                    value={track.tagline}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        tracks: current.tracks.map((item, trackIndex) =>
                          trackIndex === index ? { ...item, tagline: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Focus areas" description="One item per line.">
                  <textarea
                    value={arrayToLines(track.focusAreas)}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        tracks: current.tracks.map((item, trackIndex) =>
                          trackIndex === index ? { ...item, focusAreas: linesToArray(event.target.value) } : item
                        ),
                      }))
                    }
                    className={`${inputClassName()} min-h-28`}
                  />
                </Field>
                <Field label="Summary" description="Used on landing and track detail pages.">
                  <textarea
                    value={track.summary}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        tracks: current.tracks.map((item, trackIndex) =>
                          trackIndex === index ? { ...item, summary: event.target.value } : item
                        ),
                      }))
                    }
                    className={`${inputClassName()} min-h-28`}
                  />
                </Field>
                <Field label="Current openings" description="One item per line.">
                  <textarea
                    value={arrayToLines(track.openings)}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        tracks: current.tracks.map((item, trackIndex) =>
                          trackIndex === index ? { ...item, openings: linesToArray(event.target.value) } : item
                        ),
                      }))
                    }
                    className={`${inputClassName()} min-h-28`}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Linked participants">
                  <ParticipantLinkPicker
                    participants={editorSnapshot.participants}
                    linkedParticipantIds={track.linkedParticipantIds}
                    onToggle={(participantId) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        tracks: current.tracks.map((item, trackIndex) =>
                          trackIndex === index
                            ? {
                                ...item,
                                linkedParticipantIds: toggleLinkedParticipant(item.linkedParticipantIds, participantId),
                              }
                            : item
                        ),
                      }))
                    }
                  />
                </Field>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <SectionTitle icon={FolderKanban} label="Projects" description="Control the public project board and attach people to each project card." />
        <div className="space-y-4">
          {editorSnapshot.projects.map((project, index) => (
            <article key={project.id} className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/42">{project.id}</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{project.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setUpdatedDraft((current) => ({
                      ...current,
                      projects: current.projects.filter((_, projectIndex) => projectIndex !== index),
                    }))
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-medium text-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Field label="Title">
                  <input
                    value={project.title}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        projects: current.projects.map((item, projectIndex) =>
                          projectIndex === index
                            ? {
                                ...item,
                                title: event.target.value,
                                id: item.id.startsWith('project-new-') ? buildId('project', event.target.value) : item.id,
                              }
                            : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Partner">
                  <input
                    value={project.partner}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        projects: current.projects.map((item, projectIndex) =>
                          projectIndex === index ? { ...item, partner: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Track">
                  <select
                    value={project.track}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        projects: current.projects.map((item, projectIndex) =>
                          projectIndex === index ? { ...item, track: event.target.value as EditableForgeProject['track'] } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  >
                    {trackOptions.map((trackId) => (
                      <option key={trackId} value={trackId} className="bg-[#0c101c]">
                        {trackId}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Phase">
                  <select
                    value={project.phase}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        projects: current.projects.map((item, projectIndex) =>
                          projectIndex === index ? { ...item, phase: event.target.value as EditableForgeProject['phase'] } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  >
                    {projectPhases.map((phase) => (
                      <option key={phase} value={phase} className="bg-[#0c101c]">
                        {phase}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Compensation">
                  <input
                    value={project.compensation}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        projects: current.projects.map((item, projectIndex) =>
                          projectIndex === index ? { ...item, compensation: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Outcomes" description="One item per line.">
                  <textarea
                    value={arrayToLines(project.outcomes)}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        projects: current.projects.map((item, projectIndex) =>
                          projectIndex === index ? { ...item, outcomes: linesToArray(event.target.value) } : item
                        ),
                      }))
                    }
                    className={`${inputClassName()} min-h-28`}
                  />
                </Field>
              </div>

              <div className="mt-4 grid gap-4">
                <Field label="Summary">
                  <textarea
                    value={project.summary}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        projects: current.projects.map((item, projectIndex) =>
                          projectIndex === index ? { ...item, summary: event.target.value } : item
                        ),
                      }))
                    }
                    className={`${inputClassName()} min-h-28`}
                  />
                </Field>
                <Field label="Linked participants">
                  <ParticipantLinkPicker
                    participants={editorSnapshot.participants}
                    linkedParticipantIds={project.linkedParticipantIds}
                    onToggle={(participantId) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        projects: current.projects.map((item, projectIndex) =>
                          projectIndex === index
                            ? {
                                ...item,
                                linkedParticipantIds: toggleLinkedParticipant(item.linkedParticipantIds, participantId),
                              }
                            : item
                        ),
                      }))
                    }
                  />
                </Field>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setUpdatedDraft((current) => ({
              ...current,
              projects: [...current.projects, createEmptyProject()],
            }))
          }
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/14 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Add project
        </button>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <SectionTitle icon={Newspaper} label="Viewer Feed" description="Manage public updates and attach participants to each published panel set." />
        <div className="space-y-4">
          {editorSnapshot.feed.map((entry, index) => (
            <article key={entry.id} className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/42">{entry.id}</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{entry.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setUpdatedDraft((current) => ({
                      ...current,
                      feed: current.feed.filter((_, entryIndex) => entryIndex !== index),
                    }))
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-medium text-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Field label="Title">
                  <input
                    value={entry.title}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        feed: current.feed.map((item, entryIndex) =>
                          entryIndex === index
                            ? {
                                ...item,
                                title: event.target.value,
                                id: item.id.startsWith('feed-new-') ? buildId('feed', event.target.value) : item.id,
                              }
                            : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Author">
                  <input
                    value={entry.author}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        feed: current.feed.map((item, entryIndex) =>
                          entryIndex === index ? { ...item, author: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Track">
                  <select
                    value={entry.track}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        feed: current.feed.map((item, entryIndex) =>
                          entryIndex === index ? { ...item, track: event.target.value as EditableFeedEntry['track'] } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  >
                    {trackOptions.map((trackId) => (
                      <option key={trackId} value={trackId} className="bg-[#0c101c]">
                        {trackId}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Type">
                  <select
                    value={entry.type}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        feed: current.feed.map((item, entryIndex) =>
                          entryIndex === index ? { ...item, type: event.target.value as EditableFeedEntry['type'] } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  >
                    {feedTypes.map((type) => (
                      <option key={type} value={type} className="bg-[#0c101c]">
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Published date">
                  <input
                    type="date"
                    value={entry.publishedAt}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        feed: current.feed.map((item, entryIndex) =>
                          entryIndex === index ? { ...item, publishedAt: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Panels" description="One panel per line.">
                  <textarea
                    value={arrayToLines(entry.panels)}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        feed: current.feed.map((item, entryIndex) =>
                          entryIndex === index ? { ...item, panels: linesToArray(event.target.value) } : item
                        ),
                      }))
                    }
                    className={`${inputClassName()} min-h-28`}
                  />
                </Field>
              </div>

              <div className="mt-4 grid gap-4">
                <Field label="Summary">
                  <textarea
                    value={entry.summary}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        feed: current.feed.map((item, entryIndex) =>
                          entryIndex === index ? { ...item, summary: event.target.value } : item
                        ),
                      }))
                    }
                    className={`${inputClassName()} min-h-28`}
                  />
                </Field>
                <Field label="Linked participants">
                  <ParticipantLinkPicker
                    participants={editorSnapshot.participants}
                    linkedParticipantIds={entry.linkedParticipantIds}
                    onToggle={(participantId) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        feed: current.feed.map((item, entryIndex) =>
                          entryIndex === index
                            ? {
                                ...item,
                                linkedParticipantIds: toggleLinkedParticipant(item.linkedParticipantIds, participantId),
                              }
                            : item
                        ),
                      }))
                    }
                  />
                </Field>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setUpdatedDraft((current) => ({
              ...current,
              feed: [...current.feed, createEmptyFeedEntry()],
            }))
          }
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/14 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Add feed entry
        </button>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <SectionTitle icon={FolderKanban} label="Assignments" description="Keep the member dashboard assignments editable and optionally linked to the participant roster." />
        <div className="space-y-4">
          {editorSnapshot.assignments.map((assignment, index) => (
            <article key={assignment.id} className="rounded-[1.5rem] border border-white/10 bg-[#0c101c] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-white/42">{assignment.id}</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{assignment.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setUpdatedDraft((current) => ({
                      ...current,
                      assignments: current.assignments.filter((_, assignmentIndex) => assignmentIndex !== index),
                    }))
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-xs font-medium text-red-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <Field label="Title">
                  <input
                    value={assignment.title}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        assignments: current.assignments.map((item, assignmentIndex) =>
                          assignmentIndex === index
                            ? {
                                ...item,
                                title: event.target.value,
                                id: item.id.startsWith('assignment-new-') ? buildId('assignment', event.target.value) : item.id,
                              }
                            : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Owner">
                  <input
                    value={assignment.owner}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        assignments: current.assignments.map((item, assignmentIndex) =>
                          assignmentIndex === index ? { ...item, owner: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Status">
                  <input
                    value={assignment.status}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        assignments: current.assignments.map((item, assignmentIndex) =>
                          assignmentIndex === index ? { ...item, status: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
                <Field label="Payment">
                  <input
                    value={assignment.payment}
                    onChange={(event) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        assignments: current.assignments.map((item, assignmentIndex) =>
                          assignmentIndex === index ? { ...item, payment: event.target.value } : item
                        ),
                      }))
                    }
                    className={inputClassName()}
                  />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Linked participants">
                  <ParticipantLinkPicker
                    participants={editorSnapshot.participants}
                    linkedParticipantIds={assignment.linkedParticipantIds}
                    onToggle={(participantId) =>
                      setUpdatedDraft((current) => ({
                        ...current,
                        assignments: current.assignments.map((item, assignmentIndex) =>
                          assignmentIndex === index
                            ? {
                                ...item,
                                linkedParticipantIds: toggleLinkedParticipant(item.linkedParticipantIds, participantId),
                              }
                            : item
                        ),
                      }))
                    }
                  />
                </Field>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setUpdatedDraft((current) => ({
              ...current,
              assignments: [...current.assignments, createEmptyAssignment()],
            }))
          }
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/14 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Add assignment
        </button>
      </section>
    </div>
  )
}
