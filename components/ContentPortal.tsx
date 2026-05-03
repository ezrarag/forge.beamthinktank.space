'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { ArrowUpRight, Clapperboard, Sparkles, Users } from 'lucide-react'
import { useForgeContent } from '@/components/ForgeContentProvider'
import {
  contentTrackInviteUrl,
  fallbackContentProjects,
} from '@/lib/forge-content-projects'
import { forgeTracks, getLinkedParticipantNames } from '@/lib/forge-content'
import { db } from '@/lib/firebase'
import type { ForgeContentProjectStatus } from '@/lib/types'

interface ContentProjectCard {
  id: string
  title: string
  status: ForgeContentProjectStatus
}

const contentProjectStatuses: ForgeContentProjectStatus[] = [
  'submitted',
  'in_production',
  'review',
  'delivered',
  'archived',
]

const fallbackProjectOrder = new Map(fallbackContentProjects.map((project, index) => [project.id, index]))

function readString(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim()
  return normalized || null
}

function readProjectStatus(value: unknown): ForgeContentProjectStatus {
  const normalized = readString(value)

  if (normalized && contentProjectStatuses.includes(normalized as ForgeContentProjectStatus)) {
    return normalized as ForgeContentProjectStatus
  }

  return 'submitted'
}

function normalizeContentProject(id: string, data: Record<string, unknown>): ContentProjectCard | null {
  const title = readString(data.title)

  if (!title) {
    return null
  }

  return {
    id,
    title,
    status: readProjectStatus(data.status),
  }
}

function sortContentProjects(left: ContentProjectCard, right: ContentProjectCard) {
  const leftOrder = fallbackProjectOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER
  const rightOrder = fallbackProjectOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder
  }

  return left.title.localeCompare(right.title)
}

export function ContentPortal() {
  const [liveProjects, setLiveProjects] = useState<ContentProjectCard[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(Boolean(db))
  const [projectsError, setProjectsError] = useState<string | null>(null)
  const { participants, tracks } = useForgeContent()
  const contentTrack = forgeTracks.find((track) => track.id === 'content-production')
  const editableContentTrack = tracks.find((track) => track.id === 'content-production')
  const linkedParticipants = editableContentTrack
    ? getLinkedParticipantNames(participants, editableContentTrack.linkedParticipantIds)
    : []
  const displayedProjects = useMemo(
    () => (liveProjects.length ? liveProjects : fallbackContentProjects).slice().sort(sortContentProjects),
    [liveProjects]
  )

  useEffect(() => {
    if (!db) {
      return
    }

    const unsubscribe = onSnapshot(
      query(collection(db, 'forgeContentProjects')),
      (snapshot) => {
        const nextProjects = snapshot.docs
          .map((projectDoc) => normalizeContentProject(projectDoc.id, projectDoc.data() as Record<string, unknown>))
          .filter((project): project is ContentProjectCard => Boolean(project))

        setLiveProjects(nextProjects)
        setIsLoadingProjects(false)
      },
      (error) => {
        setLiveProjects([])
        setIsLoadingProjects(false)
        setProjectsError(error instanceof Error ? error.message : 'Unable to load content projects.')
      }
    )

    return unsubscribe
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Content Track Portal</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
              {contentTrack?.title ?? 'Content Production & Marketing'}
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
              {contentTrack?.summary ??
                'Video production, brand assets, social content pipeline, and marketing materials for BEAM NGOs and external clients.'}
            </p>
            <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
              {contentTrack?.focus ??
                'Short-form video, long-form documentary content, brand identity systems, and marketing deliverables for BEAM clients.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={contentTrackInviteUrl}
                target="_top"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-5 py-3 text-sm font-semibold text-[#11131d]"
              >
                Apply to this track
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link
                href="/content/submit"
                className="inline-flex items-center gap-2 rounded-full border border-white/14 px-5 py-3 text-sm font-medium text-white transition hover:border-[#f5a623]/45"
              >
                Submit a project
              </Link>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-[#f5a623]/24 bg-[#f5a623]/10 p-5 text-[#ffe4b3] lg:max-w-sm">
            <div className="flex items-start gap-3">
              <Clapperboard className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm leading-6">
                This portal collects the active content queue for BEAM NGO identity clips, client explainers, interviews, and social cuts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-[#f5a623]" />
              <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Active Projects</p>
            </div>
            {isLoadingProjects ? <p className="text-xs text-white/45">Loading live queue...</p> : null}
          </div>
          <div className="mt-5 space-y-3">
            {displayedProjects.map((project) => (
              <div key={project.id} className="rounded-[1.25rem] border border-white/10 bg-[#0d111d] p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-lg font-semibold text-white">{project.title}</p>
                  <span className="rounded-full border border-[#f5a623]/24 bg-[#f5a623]/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-[#f5a623]">
                    {project.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {projectsError ? <p className="mt-4 text-sm text-rose-100">{projectsError}</p> : null}
        </div>

        <div className="space-y-5">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-[#f5a623]" />
              <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Participants</p>
            </div>
            <div className="mt-5 space-y-3">
              {linkedParticipants.length ? (
                linkedParticipants.map((participant) => (
                  <div key={participant} className="rounded-[1.25rem] border border-white/10 bg-[#0d111d] px-4 py-3 text-sm text-white/72">
                    {participant}
                  </div>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-white/10 bg-[#0d111d] px-4 py-3 text-sm text-white/72">
                  Abdullah — onboarding
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Deliverables</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(contentTrack?.outcomes ?? []).map((outcome) => (
                <span key={outcome} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/66">
                  {outcome}
                </span>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
