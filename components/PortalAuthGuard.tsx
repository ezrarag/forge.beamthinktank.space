'use client'

import { useEffect, type ReactNode } from 'react'
import { useForgeAuth } from '@/components/AuthBootstrapper'

export function PortalAuthGuard({ children }: { children: ReactNode }) {
  const { activeSession, isReady } = useForgeAuth()

  useEffect(() => {
    if (!isReady || activeSession?.uid) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      window.location.replace('/?signin=true')
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeSession?.uid, isReady])

  if (!isReady || !activeSession?.uid) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-sm text-white/70 shadow-forge">
          <p>
            {!isReady
              ? 'Checking your Forge session...'
              : 'Redirecting you to Forge sign-in...'}
          </p>
        </section>
      </div>
    )
  }

  return <>{children}</>
}
