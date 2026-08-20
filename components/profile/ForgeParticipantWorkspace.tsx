'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Anvil,
  ArrowUpRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Globe,
  HardHat,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  UserCheck,
} from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, GoogleAuthProvider, signInWithPopup } from '@/lib/firebase'
import { ensureForgeMembership, readBeamReturnSession } from '@/lib/beam-auth'
import { useForgeAuth } from '@/components/AuthBootstrapper'
import {
  buildInitialParticipantProfile,
  seedWorkItems,
} from '@/lib/forge-content'
import { SiteWorkRosterModal } from '@/components/profile/SiteWorkRosterModal'
import { WorkItemClaimModal } from '@/components/profile/WorkItemClaimModal'
import type {
  ForgeParticipantProfile,
  ForgeWorkItem,
  ForgeWorkSiteAttachment,
} from '@/lib/types'

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

export function ForgeParticipantWorkspace() {
  const router = useRouter()
  const { activeSession, authUser } = useForgeAuth()
  const [profile, setProfile] = useState<ForgeParticipantProfile | null>(null)
  const [workItems, setWorkItems] = useState<ForgeWorkItem[]>(seedWorkItems)
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('All')
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('All')
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const [rosterModalOpen, setRosterModalOpen] = useState(false)
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [selectedWorkItem, setSelectedWorkItem] = useState<ForgeWorkItem | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

  const googlePhoto = authUser?.photoURL || activeSession?.photoURL || null
  const googleName = activeSession?.displayName || authUser?.displayName || 'Ezra Haugabrooks'
  const googleEmail = activeSession?.email || authUser?.email || 'ezra@beamthinktank.space'

  // Handle Google Sign In
  const handleGoogleSignIn = useCallback(async () => {
    if (!auth) return
    setIsSigningIn(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await signInWithPopup(auth, provider)
      await ensureForgeMembership({ authUser: result.user })
      router.refresh()
    } catch (err) {
      console.error('Google Sign-In Error:', err)
    } finally {
      setIsSigningIn(false)
    }
  }, [router])

  useEffect(() => {
    let isCancelled = false

    async function loadParticipantProfile() {
      const beamSession = readBeamReturnSession()
      const uid = activeSession?.uid || beamSession?.uid || 'forge-demo-user'

      if (db && uid !== 'forge-demo-user') {
        try {
          const snap = await getDoc(doc(db, 'users', uid, 'profiles', 'forgeProfile'))
            .catch(() => getDoc(doc(db!, 'users', uid)))
          if (snap.exists() && !isCancelled) {
            const data = snap.data() as Partial<ForgeParticipantProfile>
            setProfile({
              uid,
              displayName: data.displayName || googleName,
              email: data.email || googleEmail,
              role: data.role || 'Software & Hardware Fabrication Fellow',
              bio: data.bio || 'Active participant building software, hardware fabrication, and fintech infrastructure in the BEAM network.',
              avatarUrl: googlePhoto || data.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              isVerified: true,
              targetLocations: data.targetLocations || [
                { id: 'node-mke-fab', name: 'Milwaukee Fabrication & Repair Lab', city: 'Milwaukee', state: 'WI', facilityType: 'fab_lab' },
                { id: 'node-atl-innovation', name: 'Atlanta Fintech & Hardware Hub', city: 'Atlanta', state: 'GA', facilityType: 'software_hub' },
              ],
              attachedWorkSites: data.attachedWorkSites || [
                {
                  siteId: 'node-mke-fab',
                  siteName: 'Milwaukee Fabrication & Repair Lab',
                  city: 'Milwaukee',
                  state: 'WI',
                  attachedAt: '2026-03-01',
                  skillsOrCapacities: ['Soldering', 'Next.js Delivery', 'Component Triage'],
                  notifyOnWorkAvailable: true,
                },
              ],
              skills: data.skills || ['Next.js', 'TypeScript', 'Hardware Triage', 'ComfyUI Video', 'Fintech Ledgers'],
              tools: data.tools || ['VS Code', 'RunPod', 'Soldering Station', 'CapCut Pro'],
              sweatEquityHours: data.sweatEquityHours || 72,
              earnedCashUsd: data.earnedCashUsd || 1450,
              earnedBeamCoins: data.earnedBeamCoins || 26,
              claimedWorkItemIds: data.claimedWorkItemIds || ['work-mke-black-app'],
            })
            return
          }
        } catch {
          // Fall back to initial profile
        }
      }

      if (!isCancelled) {
        setProfile(
          buildInitialParticipantProfile({
            uid,
            displayName: googleName,
            email: googleEmail,
            role: 'Software & Hardware Fabrication Fellow',
          })
        )
      }
    }

    void loadParticipantProfile()

    return () => {
      isCancelled = true
    }
  }, [activeSession?.uid, googleEmail, googleName, googlePhoto])

  const currentProfile =
    profile ||
    buildInitialParticipantProfile({
      uid: activeSession?.uid || 'forge-demo-user',
      displayName: googleName,
      email: googleEmail,
      role: 'Software & Hardware Fabrication Fellow',
    })

  const avatarUrl = googlePhoto || currentProfile.avatarUrl

  // Filter work items by Track, Location, Entity, and Search Query
  const filteredWorkItems = workItems.filter((item) => {
    const matchesTrack = selectedTrackFilter === 'All' || item.trackId === selectedTrackFilter.toLowerCase()
    const matchesLocation =
      selectedLocationFilter === 'All' ||
      item.locationNode.city.toLowerCase().includes(selectedLocationFilter.toLowerCase()) ||
      item.locationNode.id === selectedLocationFilter
    const matchesEntity =
      selectedEntityFilter === 'All' ||
      item.entityAffiliation.id === selectedEntityFilter ||
      item.entityAffiliation.shortName.toLowerCase().includes(selectedEntityFilter.toLowerCase())
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesTrack && matchesLocation && matchesEntity && matchesSearch
  })

  function handleClaimWorkItem(workItem: ForgeWorkItem) {
    setSelectedWorkItem(workItem)
    setClaimModalOpen(true)
  }

  function handleWorkItemClaimed(workItemId: string) {
    setWorkItems((prev) =>
      prev.map((item) =>
        item.id === workItemId
          ? {
              ...item,
              status: 'claimed',
              claimedByUid: currentProfile.uid,
              claimedByName: currentProfile.displayName,
              claimedAt: new Date().toISOString().slice(0, 10),
            }
          : item
      )
    )

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            claimedWorkItemIds: Array.from(new Set([...prev.claimedWorkItemIds, workItemId])),
            sweatEquityHours: prev.sweatEquityHours + 12,
            earnedBeamCoins: prev.earnedBeamCoins + 8,
          }
        : null
    )
  }

  function handleSiteAttached(attachment: ForgeWorkSiteAttachment) {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            attachedWorkSites: [
              ...prev.attachedWorkSites.filter((site) => site.siteId !== attachment.siteId),
              attachment,
            ],
          }
        : null
    )
  }

  return (
    <div className="relative min-h-screen bg-[#07090e] text-white selection:bg-[#f5a623]/30 font-sans pb-16">
      {/* Background Mood & Glow Gradients */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-900/20 via-amber-900/10 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-96 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-900/15 blur-3xl" />
        <div className="absolute bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-900/15 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10 space-y-8">
        {/* WeatherWise Glassmorphic Main Layout Grid */}
        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          
          {/* LEFT FLOATING GLASS PANEL / SIDEBAR (3.5 cols) */}
          <aside className="lg:col-span-4 flex flex-col justify-between rounded-[2.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 sm:p-7 shadow-2xl space-y-6">
            
            {/* Top Branding & Google Profile Header */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5a623]/15 border border-[#f5a623]/30 text-[#f5a623]">
                    <Anvil className="h-4 w-4" />
                  </div>
                  <span className="text-base font-bold tracking-tight text-white font-serif italic">
                    BEAM Forge
                  </span>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-white/50">
                  Telemetry
                </span>
              </div>

              {/* Status Curve Card (WeatherWise Status Widget) */}
              <div className="rounded-3xl border border-white/10 bg-black/40 p-4 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40 uppercase tracking-wider font-mono text-[10px]">Cohort Status</span>
                  <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                    <TrendingUp className="h-3 w-3" /> ↑ 23.8%
                  </span>
                </div>

                <div className="relative flex items-center justify-between pt-1">
                  <div className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-bold text-white shadow-sm">
                    Optimal
                  </div>
                  {/* SVG mini curve graph */}
                  <svg className="h-10 w-24 text-[#f5a623]" viewBox="0 0 100 40" fill="none">
                    <path
                      d="M5 30 Q 35 35, 65 15 T 95 10"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="95" cy="10" r="4" fill="#ffffff" />
                  </svg>
                </div>
                <div className="pt-1 text-right">
                  <span className="text-[10px] text-white/40 font-medium">Active Delivery Rate &gt;</span>
                </div>
              </div>

              {/* Google Profile Account Integration Widget */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#f5a623]">
                  Participant Identity
                </p>

                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0">
                    <img
                      src={avatarUrl}
                      alt={googleName}
                      className="h-14 w-14 rounded-full object-cover border-2 border-white/20 shadow-md"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#07090e] ring-1 ring-[#f5a623] text-[#f5a623]">
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{googleName}</p>
                    <p className="text-[11px] text-white/50 truncate">{googleEmail}</p>
                    <p className="text-[10px] text-[#f5a623] font-medium pt-0.5">{currentProfile.role}</p>
                  </div>
                </div>

                {!activeSession?.uid ? (
                  <button
                    type="button"
                    onClick={() => void handleGoogleSignIn()}
                    disabled={isSigningIn}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-white/14 bg-white/[0.06] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/12 transition"
                  >
                    <GoogleIcon className="h-4 w-4" />
                    {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
                  </button>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-xl font-medium">
                    <span className="flex items-center gap-1.5">
                      <GoogleIcon className="h-3.5 w-3.5" /> Google Profile Connected
                    </span>
                    <span className="text-white/40">✓</span>
                  </div>
                )}
              </div>

              {/* Select Area / Vector Globe Widget (WeatherWise Globe Component) */}
              <div className="rounded-3xl border border-white/10 bg-black/40 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50 uppercase tracking-wider font-mono text-[10px]">Select Area</span>
                  <Globe className="h-3.5 w-3.5 text-cyan-300" />
                </div>

                <div className="relative h-32 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0c101c] flex items-center justify-center">
                  {/* Vector map graphic */}
                  <svg className="h-full w-full opacity-35" viewBox="0 0 200 120" fill="none">
                    <path
                      d="M10 20 C 40 10, 80 30, 120 15 C 160 0, 190 25, 195 60 C 200 95, 160 110, 110 105 C 60 100, 20 85, 10 20 Z"
                      fill="#334155"
                      stroke="#64748b"
                      strokeWidth="1"
                    />
                  </svg>
                  {/* Glowing pins */}
                  <div className="absolute left-[35%] top-[30%] flex items-center gap-1 bg-[#f5a623] px-1.5 py-0.5 rounded-md text-[8px] font-bold text-[#07090e] shadow-md">
                    <MapPin className="h-2 w-2" /> MKE
                  </div>
                  <div className="absolute right-[25%] bottom-[25%] flex items-center gap-1 bg-cyan-400 px-1.5 py-0.5 rounded-md text-[8px] font-bold text-[#07090e] shadow-md">
                    <MapPin className="h-2 w-2" /> ATL
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-center text-xs font-semibold text-white/80">
                  Milwaukee, Wisconsin, USA
                </div>
              </div>
            </div>

            <div className="pt-2 text-center text-[10px] text-white/30 font-mono">
              BEAM Forge Telemetry v2.4 • Node ID: mke-fab-01
            </div>
          </aside>

          {/* RIGHT MAIN HERO & WEATHER-STYLE DASHBOARD SURFACE (8.5 cols) */}
          <section className="lg:col-span-8 flex flex-col justify-between rounded-[2.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-8">
            
            {/* Top Bar (Location, Search, Action Pill) */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-white/80 bg-white/[0.05] border border-white/10 px-3.5 py-1.5 rounded-full">
                <MapPin className="h-3.5 w-3.5 text-[#f5a623]" />
                <span>Milwaukee, New York, USA (Friday, August 20)</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search deliverables &amp; nodes..."
                    className="w-44 sm:w-56 rounded-full border border-white/10 bg-black/40 pl-8 pr-4 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#f5a623]/50"
                  />
                </div>

                <Link
                  href="/content/submit"
                  className="rounded-full bg-white/10 hover:bg-white/20 border border-white/14 px-4 py-1.5 text-xs font-semibold text-white transition"
                >
                  Submit Deliverable
                </Link>
              </div>
            </div>

            {/* Giant WeatherWise Style Hero Temperature Stat & Statement */}
            <div className="grid gap-6 md:grid-cols-12 items-end">
              <div className="md:col-span-7 space-y-3">
                {/* Hero Stat equivalent to 18° */}
                <div className="flex items-baseline gap-3">
                  <span className="text-6xl sm:text-7xl font-extrabold tracking-tight text-white font-serif">
                    72°
                  </span>
                  <div className="flex flex-col gap-1 text-[11px] font-mono text-white/60">
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5">
                      H: 120h Target
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5">
                      L: 0h Base
                    </span>
                  </div>
                </div>

                {/* Hero Headline equivalent to "Stormy with partly cloudy" */}
                <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight font-sans">
                  Active in 3 Fabrication &amp; Software Workstreams
                </h1>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-lg">
                  With real time telemetry and cohort tracking, we provide reliable fabrication, software, and fintech delivery for the BEAM network.
                </p>
              </div>

              {/* Right Side Recently Attached Cards (Liverpool / Palermo equivalent) */}
              <div className="md:col-span-5 grid gap-3">
                <p className="text-[10px] uppercase font-mono tracking-wider text-white/40 text-right">
                  Recently Attached Nodes
                </p>

                {/* Card 1: Milwaukee Fab Lab */}
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-400/10 p-2 text-amber-300 border border-amber-400/20">
                      <Sun className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Milwaukee Fab Lab</p>
                      <p className="text-[10px] text-white/50">Bench Triage &amp; Hardware</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white font-serif">16°</span>
                </div>

                {/* Card 2: RunPod GPU Cluster */}
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300 border border-cyan-400/20">
                      <Cloud className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">RunPod GPU Cluster</p>
                      <p className="text-[10px] text-white/50">ComfyUI &amp; Transcribe</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-white font-serif">-2°</span>
                </div>
              </div>
            </div>

            {/* Bottom Sine-Wave Timeline Graph (WeatherWise Daily Temperature Curve) */}
            <div className="rounded-3xl border border-white/10 bg-black/30 p-5 space-y-4">
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
                <span className="text-white/50 uppercase tracking-wider font-mono text-[10px]">Weekly Contribution Curve</span>
                <span className="text-xs font-semibold text-[#f5a623]">Peak Activity: Wednesday (23h)</span>
              </div>

              {/* Glowing Wave Chart SVG */}
              <div className="relative pt-4 pb-2">
                <svg className="w-full h-16 text-white" viewBox="0 0 600 60" fill="none">
                  {/* Wave curve line */}
                  <path
                    d="M 10 40 Q 100 50, 200 35 T 380 15 T 590 35"
                    stroke="rgba(255, 255, 255, 0.4)"
                    strokeWidth="2"
                    fill="none"
                  />
                  {/* Glowing active point on Wednesday */}
                  <circle cx="380" cy="15" r="6" fill="#ffffff" className="animate-pulse" />
                  <circle cx="380" cy="15" r="12" stroke="#f5a623" strokeWidth="1.5" fill="none" />
                  {/* Dotted vertical drop line */}
                  <line x1="380" y1="15" x2="380" y2="55" stroke="rgba(245, 166, 35, 0.5)" strokeDasharray="3 3" />
                </svg>

                {/* Days Row */}
                <div className="grid grid-cols-6 text-center text-xs font-medium text-white/60">
                  <div>Sunday</div>
                  <div>Monday</div>
                  <div>Tuesday</div>
                  <div className="font-bold text-white">Wednesday</div>
                  <div>Thursday</div>
                  <div>Friday</div>
                </div>

                {/* Temperature / Hour Readings Row */}
                <div className="grid grid-cols-6 text-center text-lg font-bold font-serif text-white/80 pt-2">
                  <div>28°</div>
                  <div>26°</div>
                  <div>27°</div>
                  <div className="text-xl text-[#f5a623]">23°</div>
                  <div>30°</div>
                  <div>25°</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* WORK-TO-BE-DONE DELIVERABLE FEED & TASK MATRIX */}
        <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#f5a623]" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wide">
                  Work-to-be-Done Deliverable Feed
                </h2>
              </div>
              <p className="text-xs text-white/60 mt-1">
                Browse open tasks across Software, Hardware Fabrication, IT Infrastructure, Fintech, and Content. Filter by What, Where, and Who.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {/* Track Filter */}
              <div className="flex items-center gap-1 bg-black/40 rounded-full border border-white/10 px-3 py-1">
                <span className="text-white/40 uppercase tracking-wider text-[10px]">Track:</span>
                <select
                  value={selectedTrackFilter}
                  onChange={(e) => setSelectedTrackFilter(e.target.value)}
                  className="bg-transparent text-white font-semibold outline-none cursor-pointer"
                >
                  <option value="All" className="bg-[#0c101c]">All Tracks</option>
                  <option value="software" className="bg-[#0c101c]">Software</option>
                  <option value="fabrication" className="bg-[#0c101c]">Fabrication</option>
                  <option value="fintech" className="bg-[#0c101c]">Fintech</option>
                  <option value="it" className="bg-[#0c101c]">IT</option>
                  <option value="content-production" className="bg-[#0c101c]">Content</option>
                </select>
              </div>

              {/* Location Node Filter */}
              <div className="flex items-center gap-1 bg-black/40 rounded-full border border-white/10 px-3 py-1">
                <span className="text-white/40 uppercase tracking-wider text-[10px]">Where:</span>
                <select
                  value={selectedLocationFilter}
                  onChange={(e) => setSelectedLocationFilter(e.target.value)}
                  className="bg-transparent text-white font-semibold outline-none cursor-pointer"
                >
                  <option value="All" className="bg-[#0c101c]">All Locations</option>
                  <option value="Milwaukee" className="bg-[#0c101c]">Milwaukee Lab</option>
                  <option value="Atlanta" className="bg-[#0c101c]">Atlanta Hub</option>
                  <option value="Cloud" className="bg-[#0c101c]">Remote GPU / Cloud</option>
                </select>
              </div>

              {/* Entity Filter */}
              <div className="flex items-center gap-1 bg-black/40 rounded-full border border-white/10 px-3 py-1">
                <span className="text-white/40 uppercase tracking-wider text-[10px]">Who (Entity):</span>
                <select
                  value={selectedEntityFilter}
                  onChange={(e) => setSelectedEntityFilter(e.target.value)}
                  className="bg-transparent text-white font-semibold outline-none cursor-pointer"
                >
                  <option value="All" className="bg-[#0c101c]">All Entities</option>
                  <option value="entity-beam" className="bg-[#0c101c]">BEAM Core Stack</option>
                  <option value="entity-readyaimgo" className="bg-[#0c101c]">Readyaimgo</option>
                  <option value="entity-mke-black" className="bg-[#0c101c]">MKE Black</option>
                  <option value="entity-community-device" className="bg-[#0c101c]">Device Access Program</option>
                </select>
              </div>
            </div>
          </div>

          {/* Work Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {filteredWorkItems.map((item) => {
              const isClaimedByMe = currentProfile.claimedWorkItemIds.includes(item.id) || item.claimedByUid === currentProfile.uid

              return (
                <div
                  key={item.id}
                  className={`flex flex-col justify-between rounded-3xl border p-5 transition ${
                    isClaimedByMe
                      ? 'border-emerald-400/40 bg-emerald-400/5 ring-1 ring-emerald-400/20'
                      : item.status === 'claimed'
                      ? 'border-white/10 bg-black/20 opacity-75'
                      : 'border-white/10 bg-black/40 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-2.5 py-0.5 text-[10px] uppercase font-semibold text-[#f5a623]">
                          {item.trackId}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10px] uppercase text-white/70">
                          {item.deliverableType.replace('_', ' ')}
                        </span>
                      </div>

                      {isClaimedByMe ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                          <CheckCircle2 className="h-3 w-3" /> Claimed by You
                        </span>
                      ) : item.status === 'claimed' ? (
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] text-white/50">
                          Claimed ({item.claimedByName?.split(' ')[0]})
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                          Open for Claim
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-white">{item.title}</h3>
                    <p className="mt-1.5 text-xs text-white/65 leading-relaxed">{item.summary}</p>

                    {/* Required Skills & Tools */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {item.requiredSkills.map((skill) => (
                        <span key={skill} className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/70">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* WHAT, WHERE, WHO Metadata Box */}
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/50 p-3 text-xs space-y-2">
                      <div className="flex items-center justify-between text-white/70">
                        <span className="flex items-center gap-1.5 text-white/50">
                          <MapPin className="h-3.5 w-3.5 text-cyan-300" /> WHERE (Node):
                        </span>
                        <span className="font-medium text-white">{item.locationNode.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-white/70">
                        <span className="flex items-center gap-1.5 text-white/50">
                          <Building2 className="h-3.5 w-3.5 text-[#f5a623]" /> WHO (Entity):
                        </span>
                        <span className="font-medium text-white">{item.entityAffiliation.name}</span>
                      </div>
                      {item.assignedParticipants.length > 0 && (
                        <div className="flex items-center justify-between text-white/70">
                          <span className="flex items-center gap-1.5 text-white/50">
                            <UserCheck className="h-3.5 w-3.5 text-emerald-300" /> WHO (Roster):
                          </span>
                          <span className="font-medium text-white">
                            {item.assignedParticipants.map((p) => p.name).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase text-white/40 font-mono">Compensation</p>
                      <p className="text-xs font-bold text-emerald-300">{item.compensation.label}</p>
                    </div>

                    {isClaimedByMe ? (
                      <Link
                        href="/content/submit"
                        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-4 py-2 text-xs font-bold text-[#0c101c] hover:bg-emerald-300 transition"
                      >
                        Submit Work <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : item.status === 'claimed' ? (
                      <button
                        disabled
                        type="button"
                        className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/40 cursor-not-allowed"
                      >
                        Assigned
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleClaimWorkItem(item)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#f5a623] px-4 py-2 text-xs font-bold text-[#11131d] hover:bg-[#f5a623]/90 transition"
                      >
                        Claim Item <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ATTACHED SITE WORK ROSTERS */}
        <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-[#f5a623]" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                  My Attached Site Work Rosters &amp; Capacities
                </h2>
              </div>
              <p className="text-xs text-white/60">
                Facilities and work sites where your profile is attached to receive shift alerts and offer skilled fabrication, repair, software, or media work.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRosterModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <Plus className="h-3.5 w-3.5" /> Attach New Facility Roster
            </button>
          </div>

          {currentProfile.attachedWorkSites.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {currentProfile.attachedWorkSites.map((site) => (
                <div key={site.siteId} className="rounded-3xl border border-white/10 bg-black/40 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-white/80">
                        {site.city}, {site.state}
                      </span>
                      <h3 className="mt-1.5 text-base font-bold text-white">{site.siteName}</h3>
                    </div>
                    {site.notifyOnWorkAvailable && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#f5a623]/10 border border-[#f5a623]/30 px-2.5 py-0.5 text-[9px] font-bold text-[#f5a623]">
                        <Bell className="h-3 w-3" /> Alerts Active
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 border-t border-white/10 pt-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                      Your Selected Technical Offerings:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {site.skillsOrCapacities.map((capacity) => (
                        <span key={capacity} className="rounded-md bg-white/[0.05] border border-white/10 px-2.5 py-0.5 text-[10px] text-white/80">
                          {capacity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/20 bg-black/20 p-6 text-center">
              <Building2 className="mx-auto h-8 w-8 text-white/40" />
              <p className="mt-2 text-sm font-semibold text-white">No Attached Site Rosters Yet</p>
              <p className="mt-1 text-xs text-white/50 max-w-md mx-auto">
                Attach your profile to physical fabrication labs or client hubs to receive shift notifications and contribute skilled labor.
              </p>
            </div>
          )}
        </section>

      </main>

      {/* MODALS */}
      <SiteWorkRosterModal
        isOpen={rosterModalOpen}
        onClose={() => setRosterModalOpen(false)}
        onAttached={handleSiteAttached}
      />

      <WorkItemClaimModal
        isOpen={claimModalOpen}
        workItem={selectedWorkItem}
        participantName={currentProfile.displayName}
        onClose={() => setClaimModalOpen(false)}
        onClaimed={handleWorkItemClaimed}
      />
    </div>
  )
}
