'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { createDefaultForgeContentSnapshot, normalizeForgeContentSnapshot, withTrackIcons } from '@/lib/forge-content'
import { db } from '@/lib/firebase'
import type {
  AdminParticipant,
  EditableFeedEntry,
  EditableForgeProject,
  ForgeContentSnapshot,
  ForgeSlide,
  ForgeTrack,
  MemberAssignment,
} from '@/lib/types'

type ForgeContentSource = 'seed' | 'local' | 'firestore'

interface ForgeContentContextValue {
  snapshot: ForgeContentSnapshot
  slides: ForgeSlide[]
  tracks: ForgeTrack[]
  projects: EditableForgeProject[]
  feed: EditableFeedEntry[]
  assignments: MemberAssignment[]
  participants: AdminParticipant[]
  source: ForgeContentSource
  isReady: boolean
  saveSnapshot: (nextSnapshot: ForgeContentSnapshot) => Promise<{ persistedTo: ForgeContentSource; snapshot: ForgeContentSnapshot; error?: string }>
  resetToDefault: () => Promise<{ persistedTo: ForgeContentSource; snapshot: ForgeContentSnapshot; error?: string }>
}

const STORAGE_KEY = 'forge-admin-content'
const ForgeContentContext = createContext<ForgeContentContextValue | null>(null)

function readLocalSnapshot() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? normalizeForgeContentSnapshot(JSON.parse(raw) as ForgeContentSnapshot) : null
  } catch {
    return null
  }
}

function writeLocalSnapshot(snapshot: ForgeContentSnapshot) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {}
}

function getInitialForgeContentState() {
  const localSnapshot = readLocalSnapshot()

  return {
    snapshot: localSnapshot ?? createDefaultForgeContentSnapshot(),
    source: (localSnapshot ? 'local' : 'seed') as ForgeContentSource,
  }
}

export function ForgeContentProvider({ children }: { children: ReactNode }) {
  const [bootstrap] = useState(getInitialForgeContentState)
  const [snapshot, setSnapshot] = useState<ForgeContentSnapshot>(bootstrap.snapshot)
  const [source, setSource] = useState<ForgeContentSource>(bootstrap.source)
  const [isReady, setIsReady] = useState(!db)

  useEffect(() => {
    if (!db) {
      return
    }

    const contentDoc = doc(db, 'forgeAdmin', 'siteContent')

    const unsubscribe = onSnapshot(
      contentDoc,
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          setIsReady(true)
          return
        }

        const nextSnapshot = normalizeForgeContentSnapshot(docSnapshot.data() as ForgeContentSnapshot)
        writeLocalSnapshot(nextSnapshot)
        setSnapshot(nextSnapshot)
        setSource('firestore')
        setIsReady(true)
      },
      () => {
        setIsReady(true)
      }
    )

    return unsubscribe
  }, [])

  async function persistSnapshot(nextSnapshot: ForgeContentSnapshot) {
    const normalizedSnapshot = normalizeForgeContentSnapshot({
      ...nextSnapshot,
      updatedAt: new Date().toISOString(),
    })

    writeLocalSnapshot(normalizedSnapshot)
    setSnapshot(normalizedSnapshot)
    setSource('local')

    if (!db) {
      return { persistedTo: 'local' as const, snapshot: normalizedSnapshot }
    }

    try {
      await setDoc(doc(db, 'forgeAdmin', 'siteContent'), normalizedSnapshot)
      setSource('firestore')
      return { persistedTo: 'firestore' as const, snapshot: normalizedSnapshot }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to write Forge admin data to Firestore.'
      return { persistedTo: 'local' as const, snapshot: normalizedSnapshot, error: message }
    }
  }

  async function resetToDefault() {
    return persistSnapshot(createDefaultForgeContentSnapshot())
  }

  const value: ForgeContentContextValue = {
    snapshot,
    slides: snapshot.slides,
    tracks: withTrackIcons(snapshot.tracks),
    projects: snapshot.projects,
    feed: snapshot.feed,
    assignments: snapshot.assignments,
    participants: snapshot.participants,
    source,
    isReady,
    saveSnapshot: persistSnapshot,
    resetToDefault,
  }

  return <ForgeContentContext.Provider value={value}>{children}</ForgeContentContext.Provider>
}

export function useForgeContent() {
  const context = useContext(ForgeContentContext)

  if (!context) {
    throw new Error('useForgeContent must be used within ForgeContentProvider')
  }

  return context
}
