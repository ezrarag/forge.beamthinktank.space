'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Building2,
  ChevronDown,
  ChevronUp,
  HardHat,
  LogOut,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, signOut } from '@/lib/firebase'
import { clearBeamReturnSession, readBeamReturnSession } from '@/lib/beam-auth'
import { useForgeAuth } from '@/components/AuthBootstrapper'
import {
  buildInitialParticipantProfile,
  seedWorkItems,
} from '@/lib/forge-content'
import { SiteWorkRosterModal } from '@/components/profile/SiteWorkRosterModal'
import { WorkItemClaimModal } from '@/components/profile/WorkItemClaimModal'
import { WorkTaskCard } from '@/components/profile/WorkTaskCard'
import type {
  ForgeParticipantProfile,
  ForgeWorkItem,
  ForgeWorkSiteAttachment,
} from '@/lib/types'

export function ForgeParticipantWorkspace() {
  const { activeSession, authUser } = useForgeAuth()
  const [profile, setProfile] = useState<ForgeParticipantProfile | null>(null)
  const [workItems, setWorkItems] = useState<ForgeWorkItem[]>(seedWorkItems)
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('All')
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const [rosterModalOpen, setRosterModalOpen] = useState(false)
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [selectedWorkItem, setSelectedWorkItem] = useState<ForgeWorkItem | null>(null)
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false)

  const googlePhoto = authUser?.photoURL || activeSession?.photoURL || null
  const googleName = activeSession?.displayName || authUser?.displayName || 'Ezra Haugabrooks'
  const googleEmail = activeSession?.email || authUser?.email || 'ezra@readyaimgo.biz'

  const handleLogout = useCallback(async () => {
    if (auth) {
      await signOut(auth)
    }
    clearBeamReturnSession()
    window.location.href = '/'
  }, [])

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
          // Fall back
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

  // Filter work items
  const filteredWorkItems = workItems.filter((item) => {
    const matchesTrack = selectedTrackFilter === 'All' || item.trackId === selectedTrackFilter.toLowerCase()
    const matchesLocation =
      selectedLocationFilter === 'All' ||
      item.locationNode.city.toLowerCase().includes(selectedLocationFilter.toLowerCase()) ||
      item.locationNode.id === selectedLocationFilter
    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesTrack && matchesLocation && matchesSearch
  })

  // Separate into TWO DISTINCT LANES:
  // Lane 1: Up and Coming (Project Pipeline) -> scoping, discovery, awaiting_assignment
  const pipelineLaneItems = filteredWorkItems.filter((item) =>
    ['scoping', 'discovery', 'awaiting_assignment'].includes(item.status)
  )

  // Lane 2: Active Execution -> open, claimed, in_review, completed
  const activeExecutionItems = filteredWorkItems.filter(
    (item) => !['scoping', 'discovery', 'awaiting_assignment'].includes(item.status)
  )

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
      {/* Background Mood & Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-sky-900/20 via-amber-900/10 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-96 -left-40 h-[350px] w-[350px] rounded-full bg-cyan-900/15 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-10 space-y-6">
        
        {/* 1. CONDENSED TOP-ROW DASHBOARD HEADER (Identity, Status & Telemetry) */}
        <header className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          
          {/* Verified User Identity Badge */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-11 w-11 shrink-0">
              <img
                src={avatarUrl}
                alt={googleName}
                className="h-11 w-11 rounded-full object-cover border border-white/20 shadow-md"
              />
              <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#07090e] ring-1 ring-[#f5a623] text-[#f5a623]">
                <ShieldCheck className="h-2.5 w-2.5" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate">{googleName}</span>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                  Verified
                </span>
              </div>
              <p className="text-xs text-white/50 truncate font-mono">{googleEmail}</p>
            </div>
          </div>

          {/* Compact Telemetry & Active Nodes Summary */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-300" />
              <span className="font-semibold text-white">72h Logged</span>
              <span className="text-white/40 font-mono">|</span>
              <span className="text-emerald-300 font-bold">Optimal ↑</span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-3.5 py-1.5 text-xs">
              <MapPin className="h-3.5 w-3.5 text-[#f5a623]" />
              <span className="text-white/80">Milwaukee Fab Lab</span>
              <span className="text-white/40 font-mono">•</span>
              <span className="text-cyan-300">RunPod GPU</span>
            </div>
          </div>

          {/* Quick Controls & Navigation */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full bg-white/10 hover:bg-white/20 border border-white/14 px-3.5 py-1.5 text-xs font-semibold text-white transition"
            >
              Home
            </Link>

            <Link
              href="/content/submit"
              className="rounded-full bg-[#f5a623] hover:bg-[#f5a623]/90 px-4 py-1.5 text-xs font-bold text-[#11131d] transition shadow-md"
            >
              Submit Deliverable
            </Link>

            <button
              type="button"
              onClick={() => setShowTelemetryDrawer((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white transition"
            >
              {showTelemetryDrawer ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Telemetry</span>
            </button>

            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/30 bg-rose-400/10 px-3.5 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-400/20 transition"
            >
              <LogOut className="h-3.5 w-3.5" /> Log Out
            </button>
          </div>
        </header>

        {/* OPTIONAL COLLAPSIBLE TELEMETRY DRAWER */}
        {showTelemetryDrawer && (
          <section className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-5 space-y-4 animate-in fade-in duration-200">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase font-mono tracking-wider text-white/40">Sweat Equity HUD</p>
                <p className="text-2xl font-bold text-white mt-1">72 Hours</p>
                <p className="text-xs text-emerald-300 mt-0.5">$30/hr HUD Match ($2,160 Value)</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase font-mono tracking-wider text-white/40">Ledger Compensation</p>
                <p className="text-2xl font-bold text-white mt-1">$1,450 Cash</p>
                <p className="text-xs text-[#f5a623] mt-0.5">+ 26 BEAM Coins Earned</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-[10px] uppercase font-mono tracking-wider text-white/40">Lab Attachments</p>
                <p className="text-2xl font-bold text-white mt-1">Milwaukee Fab</p>
                <p className="text-xs text-cyan-300 mt-0.5">Alerts Active • Bench Triage</p>
              </div>
            </div>
          </section>
        )}

        {/* 2. ELEVATED WORK MATRIX (Top Center Priority Experience) */}
        <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          {/* Header & Global Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#f5a623]" />
                <h1 className="text-2xl font-bold text-white uppercase tracking-wide">
                  Upcoming Work &amp; Pipeline Matrix
                </h1>
              </div>
              <p className="text-xs text-white/60 mt-1">
                Explore project pipeline opportunities in scoping, discovery, and active execution across Software, Fabrication, Fintech, IT, and Content.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter pipeline tasks..."
                  className="w-40 sm:w-52 rounded-full border border-white/10 bg-black/40 pl-8 pr-4 py-1.5 text-xs text-white placeholder:text-white/30 outline-none focus:border-[#f5a623]/50"
                />
              </div>

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
                  <option value="All" className="bg-[#0c101c]">All Nodes</option>
                  <option value="Milwaukee" className="bg-[#0c101c]">Milwaukee Lab</option>
                  <option value="Atlanta" className="bg-[#0c101c]">Atlanta Hub</option>
                  <option value="Cloud" className="bg-[#0c101c]">Remote GPU / Cloud</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. SPLIT FEED INTO TWO DISTINCT LANES */}
          <div className="grid gap-8 lg:grid-cols-2 items-start">
            
            {/* LANE 1: UP AND COMING (PROJECT PIPELINE) */}
            <div className="space-y-4 rounded-3xl border border-[#f5a623]/20 bg-black/30 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#f5a623] animate-pulse" />
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    Up &amp; Coming (Project Pipeline)
                  </h2>
                </div>
                <span className="rounded-full border border-[#f5a623]/40 bg-[#f5a623]/10 px-3 py-0.5 text-xs font-bold text-[#f5a623]">
                  {pipelineLaneItems.length} Scoping / Discovery
                </span>
              </div>

              <p className="text-xs text-white/60">
                Priority client workstreams in discovery, scoping, or awaiting assignment. Claim early to lead technical execution.
              </p>

              <div className="grid gap-4">
                {pipelineLaneItems.length > 0 ? (
                  pipelineLaneItems.map((item) => {
                    const isClaimedByMe =
                      currentProfile.claimedWorkItemIds.includes(item.id) ||
                      item.claimedByUid === currentProfile.uid

                    return (
                      <WorkTaskCard
                        key={item.id}
                        item={item}
                        isClaimedByMe={isClaimedByMe}
                        onClaim={handleClaimWorkItem}
                        isPipelineLane={true}
                      />
                    )
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-xs text-white/50">
                    No pipeline items matching current filter criteria.
                  </div>
                )}
              </div>
            </div>

            {/* LANE 2: ACTIVE EXECUTION */}
            <div className="space-y-4 rounded-3xl border border-cyan-400/20 bg-black/30 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-cyan-400" />
                  <h2 className="text-base font-bold text-white uppercase tracking-wider">
                    Active Execution &amp; Open Tasks
                  </h2>
                </div>
                <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-0.5 text-xs font-bold text-cyan-300">
                  {activeExecutionItems.length} Active Tasks
                </span>
              </div>

              <p className="text-xs text-white/60">
                Open deliverable tasks and active workstreams in progress across Software, Fabrication, Fintech, IT, and Content.
              </p>

              <div className="grid gap-4">
                {activeExecutionItems.length > 0 ? (
                  activeExecutionItems.map((item) => {
                    const isClaimedByMe =
                      currentProfile.claimedWorkItemIds.includes(item.id) ||
                      item.claimedByUid === currentProfile.uid

                    return (
                      <WorkTaskCard
                        key={item.id}
                        item={item}
                        isClaimedByMe={isClaimedByMe}
                        onClaim={handleClaimWorkItem}
                        isPipelineLane={false}
                      />
                    )
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-xs text-white/50">
                    No active execution tasks matching current filter criteria.
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* 4. ATTACHED SITE WORK ROSTERS & FACILITY ATTACHMENTS */}
        <section className="rounded-[2.5rem] border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-6 sm:p-8 space-y-4 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <HardHat className="h-5 w-5 text-[#f5a623]" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wide">
                  Attached Site Work Rosters &amp; Facility Capacities
                </h2>
              </div>
              <p className="text-xs text-white/60">
                Physical fabrication labs and software hubs where your profile is attached to offer skilled labor and receive shift alerts.
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
                        <Bell className="h-3 w-3" /> Shift Alerts Active
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 border-t border-white/10 pt-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                      Technical Offerings &amp; Labor Capacities:
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
