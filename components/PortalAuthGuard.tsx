'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useForgeAuth } from '@/components/AuthBootstrapper'
import { buildForgeHandoffUrl } from '@/lib/beam-home'

export function PortalAuthGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { activeSession, isReady } = useForgeAuth()
  const [requiresTopLevelLaunch, setRequiresTopLevelLaunch] = useState(false)

  const returnPath = useMemo(() => {
    const normalizedPathname = pathname === '/member' ? '/dashboard' : pathname
    const query = searchParams.toString()
    return `${normalizedPathname}${query ? `?${query}` : ''}`
  }, [pathname, searchParams])

  const handoffUrl = useMemo(() => buildForgeHandoffUrl({ returnPath }), [returnPath])

  useEffect(() => {
    if (!isReady || activeSession?.uid) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      let isEmbedded = false
      try {
        isEmbedded = window.self !== window.top
      } catch {
        isEmbedded = true
      }

      if (isEmbedded) {
        setRequiresTopLevelLaunch(true)
        return
      }

      window.location.replace(handoffUrl)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [activeSession?.uid, handoffUrl, isReady])

  if (!isReady || !activeSession?.uid) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-sm text-white/70 shadow-forge">
          <p>
            {!isReady
              ? 'Checking your Forge session...'
              : requiresTopLevelLaunch
                ? 'This Forge workspace is open inside an embedded frame. Continue in the top window to sign in through BEAM Home.'
                : 'Redirecting you to BEAM Home sign-in...'}
          </p>
          {requiresTopLevelLaunch ? (
            <div className="mt-6">
              <a
                href={handoffUrl}
                target="_top"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-5 py-3 text-sm font-semibold text-[#11131d]"
              >
                Continue in BEAM Home
              </a>
            </div>
          ) : null}
        </section>
      </div>
    )
  }

  return <>{children}</>
}
