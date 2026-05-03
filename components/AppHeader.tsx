'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Anvil, ArrowUpRight, CircuitBoard, TerminalSquare, Wrench } from 'lucide-react'
import { ensureForgeMembership } from '@/lib/beam-auth'
import { auth, GoogleAuthProvider, signInWithPopup } from '@/lib/firebase'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Overview' },
  { href: '/viewer', label: 'Viewer' },
  { href: '/tracks', label: 'Tracks' },
  { href: '/portal/content', label: 'Content' },
  { href: '/projects', label: 'Projects' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/admin', label: 'Admin' },
]

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
      />
    </svg>
  )
}

function getGoogleSignInError(error: unknown) {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : ''

  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Google sign-in was closed before completion.'
  }

  return 'Google sign-in failed. Try again.'
}

export function AppHeader({ className }: { className?: string }) {
  const router = useRouter()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)
  const hasOpenedSigninQuery = useRef(false)

  const handleGoogleSignIn = useCallback(async () => {
    if (!auth) {
      setSignInError('Firebase Auth is not configured for this environment.')
      return
    }

    setIsSigningIn(true)
    setSignInError(null)

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(auth, provider)

      await ensureForgeMembership({ authUser: result.user })
      router.push('/dashboard')
    } catch (error) {
      setSignInError(getGoogleSignInError(error))
    } finally {
      setIsSigningIn(false)
    }
  }, [router])

  useEffect(() => {
    if (hasOpenedSigninQuery.current) {
      return
    }

    const searchParams = new URLSearchParams(window.location.search)
    if (searchParams.get('signin') !== 'true') {
      return
    }

    hasOpenedSigninQuery.current = true
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const timeoutId = window.setTimeout(() => {
      void handleGoogleSignIn()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [handleGoogleSignIn])

  return (
    <header className={cn('sticky top-0 z-50 border-b border-white/10 bg-[#090b14]/85 backdrop-blur-xl', className)}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f5a623]/40 bg-[#f5a623]/12 text-[#f5a623] shadow-forge">
            <Anvil className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.26em] text-[#f5a623]">BEAM Forge</p>
            <p className="truncate text-sm text-white/72">Technology, fabrication, fintech, content, infrastructure</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-white/76 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-white/70 xl:flex">
            <CircuitBoard className="h-4 w-4" />
            <TerminalSquare className="h-4 w-4" />
            <Wrench className="h-4 w-4" />
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={() => {
                void handleGoogleSignIn()
              }}
              disabled={isSigningIn}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-white/68 transition hover:border-white/30 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleIcon className="h-4 w-4" />
              {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
            </button>
            {signInError ? (
              <p role="alert" className="max-w-[15rem] text-right text-xs leading-5 text-rose-200">
                {signInError}
              </p>
            ) : null}
          </div>
          <Link
            href="/join"
            className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-4 py-2 text-sm font-semibold text-[#11131d] transition hover:brightness-105"
          >
            Join Forge
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}
