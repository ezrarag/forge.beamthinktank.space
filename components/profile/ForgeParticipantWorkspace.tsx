'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  HardHat,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
} from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { readBeamReturnSession } from '@/lib/beam-auth'
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

export function ForgeParticipantWorkspace() {
  const [profile, setProfile] = useState<ForgeParticipantProfile | null>(null)
  const [workItems, setWorkItems] = useState<ForgeWorkItem[]>(seedWorkItems)
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('All')
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('All')
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('All')

  const [rosterModalOpen, setRosterModalOpen] = useState(false)
  const [claimModalOpen, setClaimModalOpen] = useState(false)
  const [selectedWorkItem, setSelectedWorkItem] = useState<ForgeWorkItem | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function loadParticipantProfile() {
      const beamSession = readBeamReturnSession()
      const uid = beamSession?.uid || 'forge-demo-user'

      if (db && uid !== 'forge-demo-user') {
        try {
          const snap = await getDoc(doc(db, 'users', uid, 'profiles', 'forgeProfile'))
          if (snap.exists() && !isCancelled) {
            setProfile(snap.data() as ForgeParticipantProfile)
            return
          }
        } catch {
          // Fall back to seeded initial profile
        }
      }

      if (!isCancelled) {
        setProfile(
          buildInitialParticipantProfile({
            uid,
            displayName: beamSession?.displayName || 'Ezra Haugabrooks',
            email: beamSession?.email || 'ezra@beamthinktank.space',
            role: 'Software & Hardware Fabrication Fellow',
          })
        )
      }
    }

    void loadParticipantProfile()

    return () => {
      isCancelled = true
    }
  }, [])

  const currentProfile =
    profile ||
    buildInitialParticipantProfile({
      uid: 'forge-demo-user',
      displayName: 'Ezra Haugabrooks',
      email: 'ezra@beamthinktank.space',
      role: 'Software & Hardware Fabrication Fellow',
    })

  // Filter work items by Track, Location, and Entity
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

    return matchesTrack && matchesLocation && matchesEntity
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
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-10 text-white">
      {/* Profile Header & Verified Identity Card */}
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-28 w-28 shrink-0">
              <img
                src={currentProfile.avatarUrl}
                alt={currentProfile.displayName}
                className="h-28 w-28 rounded-full border-2 border-white/20 object-cover shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#0c101c] ring-2 ring-[#f5a623] shadow-md text-[#f5a623]">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {currentProfile.displayName}
                </h1>
                <span className="rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-3 py-1 text-xs font-semibold text-[#f5a623]">
                  Verified Participant
                </span>
              </div>
              <p className="text-sm text-white/50">{currentProfile.email}</p>
              <p className="text-sm font-semibold text-[#f5a623]">{currentProfile.role}</p>
              <p className="max-w-2xl text-xs leading-relaxed text-white/70 pt-1">{currentProfile.bio}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={() => setRosterModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <HardHat className="h-4 w-4 text-[#f5a623]" />
              Attach Fab/Work Site Roster
            </button>
            <Link
              href="/content/submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-5 py-2.5 text-xs font-bold text-[#11131d] hover:bg-[#f5a623]/90 transition"
            >
              <Upload className="h-4 w-4" />
              Submit Deliverable
            </Link>
          </div>
        </div>
      </section>

      {/* Metric Cards (Sweat Equity, Compensation Ledger, Target Nodes) */}
      <section className="grid gap-6 sm:grid-cols-3">
        {/* CARD 1: SWEAT EQUITY */}
        <div className="flex flex-col items-center justify-between rounded-[2rem] border border-white/10 bg-[#0c101c] p-6 text-center shadow-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f5a623]">Sweat Equity Contribution</p>
          <div className="relative my-4 flex items-center justify-center">
            <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#f5a623]"
                strokeDasharray="72, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white">{currentProfile.sweatEquityHours}</span>
              <span className="text-[10px] uppercase text-white/50">Hours Logged</span>
            </div>
          </div>
          <p className="text-[11px] text-white/40">$30/hr HUD match equivalent</p>
        </div>

        {/* CARD 2: DUAL-CURRENCY LEDGER */}
        <div className="flex flex-col items-center justify-between rounded-[2rem] border border-white/10 bg-[#0c101c] p-6 text-center shadow-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Earned Compensation Ledger</p>
          <div className="my-4 flex items-center justify-center gap-4">
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-center">
              <span className="text-xs uppercase text-emerald-300 font-medium">Cash Milestones</span>
              <p className="text-2xl font-extrabold text-white mt-1">${currentProfile.earnedCashUsd.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-center">
              <span className="text-xs uppercase text-amber-300 font-medium">BEAM Coins</span>
              <p className="text-2xl font-extrabold text-white mt-1">{currentProfile.earnedBeamCoins} BEAM</p>
            </div>
          </div>
          <p className="text-[11px] text-white/40">Includes cash milestones + equity credits</p>
        </div>

        {/* CARD 3: TARGET WORK NODES */}
        <div className="flex flex-col items-center justify-between rounded-[2rem] border border-white/10 bg-[#0c101c] p-6 text-center shadow-md">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Target Facility Nodes</p>
          <div className="my-4 flex flex-wrap justify-center gap-2">
            {currentProfile.targetLocations.map((loc) => (
              <div key={loc.id} className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-left">
                <p className="text-xs font-bold text-white">{loc.city}</p>
                <p className="text-[10px] text-cyan-200">{loc.name}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-white/40">MKE Lab • ATL Hub • Remote GPU</p>
        </div>
      </section>

      {/* "WORK TO BE DONE" FEED & TASK MATRIX */}
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8 space-y-6">
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
                className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
                  isClaimedByMe
                    ? 'border-emerald-400/40 bg-emerald-400/5 ring-1 ring-emerald-400/20'
                    : item.status === 'claimed'
                    ? 'border-white/10 bg-black/20 opacity-75'
                    : 'border-white/10 bg-[#0c101c] hover:border-white/20'
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
                  <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-xs space-y-2">
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
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8 space-y-4">
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
              <div key={site.siteId} className="rounded-2xl border border-white/10 bg-[#0c101c] p-4 space-y-3">
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
          <div className="rounded-2xl border border-dashed border-white/20 bg-black/20 p-6 text-center">
            <Building2 className="mx-auto h-8 w-8 text-white/40" />
            <p className="mt-2 text-sm font-semibold text-white">No Attached Site Rosters Yet</p>
            <p className="mt-1 text-xs text-white/50 max-w-md mx-auto">
              Attach your profile to physical fabrication labs or client hubs to receive shift notifications and contribute skilled labor.
            </p>
          </div>
        )}
      </section>

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
