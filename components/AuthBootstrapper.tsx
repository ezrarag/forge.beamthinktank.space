'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { User } from 'firebase/auth'
import {
  ensureForgeMembership,
  readBeamReturnSession,
  syncBeamReturnSessionFromUrl,
  type BeamReturnSession,
  type BeamReturnSessionStatus,
} from '@/lib/beam-auth'
import { subscribeToAuth } from '@/lib/firebase'

type ForgeAuthSession =
  | {
      source: 'firebase'
      uid: string
      email: string | null
      displayName: string | null
      photoURL: string | null
      idToken: null
    }
  | {
      source: 'beam_return'
      uid: string
      email: string | null
      displayName: string | null
      photoURL: string | null
      idToken: string
    }

interface ForgeAuthContextValue {
  activeSession: ForgeAuthSession | null
  authUser: User | null
  beamReturnSession: BeamReturnSession | null
  beamReturnStatus: BeamReturnSessionStatus
  hasResolvedAuth: boolean
  hasResolvedBeamReturn: boolean
  isReady: boolean
}

const ForgeAuthContext = createContext<ForgeAuthContextValue | null>(null)

export function AuthBootstrapper({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [hasResolvedAuth, setHasResolvedAuth] = useState(false)
  const [beamReturnBridge] = useState<{
    session: BeamReturnSession | null
    status: BeamReturnSessionStatus
    hasResolved: boolean
  }>(() => {
    if (typeof window === 'undefined') {
      return {
        session: null,
        status: 'none',
        hasResolved: false,
      }
    }

    const status = syncBeamReturnSessionFromUrl()

    return {
      session: readBeamReturnSession(),
      status,
      hasResolved: true,
    }
  })
  const ensuredMembershipKeys = useRef<Set<string>>(new Set())
  const beamReturnSession = beamReturnBridge.session
  const beamReturnStatus = beamReturnBridge.status
  const hasResolvedBeamReturn = beamReturnBridge.hasResolved

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setAuthUser(user)
      setHasResolvedAuth(true)
    })

    return unsubscribe
  }, [])

  const activeSession = useMemo<ForgeAuthSession | null>(() => {
    if (authUser?.uid) {
      return {
        source: 'firebase',
        uid: authUser.uid,
        email: authUser.email ?? null,
        displayName: authUser.displayName ?? null,
        photoURL: authUser.photoURL ?? null,
        idToken: null,
      }
    }

    if (beamReturnSession?.uid) {
      return {
        source: 'beam_return',
        uid: beamReturnSession.uid,
        email: beamReturnSession.email,
        displayName: beamReturnSession.displayName,
        photoURL: beamReturnSession.photoURL ?? null,
        idToken: beamReturnSession.idToken,
      }
    }

    return null
  }, [authUser, beamReturnSession])

  useEffect(() => {
    if (!hasResolvedAuth || !hasResolvedBeamReturn || !activeSession?.uid) {
      return
    }

    const membershipKey = `${activeSession.source}:${activeSession.uid}`
    if (ensuredMembershipKeys.current.has(membershipKey)) {
      return
    }

    ensuredMembershipKeys.current.add(membershipKey)

    void ensureForgeMembership({
      authUser,
      beamSession: activeSession.source === 'beam_return' ? beamReturnSession : null,
    }).catch(() => {
      ensuredMembershipKeys.current.delete(membershipKey)
    })
  }, [activeSession, authUser, beamReturnSession, hasResolvedAuth, hasResolvedBeamReturn])

  const value = useMemo<ForgeAuthContextValue>(
    () => ({
      activeSession,
      authUser,
      beamReturnSession,
      beamReturnStatus,
      hasResolvedAuth,
      hasResolvedBeamReturn,
      isReady: hasResolvedAuth && hasResolvedBeamReturn,
    }),
    [activeSession, authUser, beamReturnSession, beamReturnStatus, hasResolvedAuth, hasResolvedBeamReturn]
  )

  return <ForgeAuthContext.Provider value={value}>{children}</ForgeAuthContext.Provider>
}

export function useForgeAuth() {
  const context = useContext(ForgeAuthContext)

  if (!context) {
    throw new Error('useForgeAuth must be used within AuthBootstrapper')
  }

  return context
}
