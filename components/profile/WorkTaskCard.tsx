'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Coins,
  ExternalLink,
  FileCheck,
  Github,
  MapPin,
  XCircle,
} from 'lucide-react'
import type { ForgeWorkItem } from '@/lib/types'

interface WorkTaskCardProps {
  item: ForgeWorkItem
  isClaimedByMe: boolean
  onClaim: (item: ForgeWorkItem) => void
  isPipelineLane?: boolean
}

export function WorkTaskCard({
  item,
  isClaimedByMe,
  onClaim,
  isPipelineLane = false,
}: WorkTaskCardProps) {
  const statusBadgeColor =
    item.status === 'scoping'
      ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
      : item.status === 'discovery'
      ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
      : item.status === 'awaiting_assignment'
      ? 'border-purple-400/30 bg-purple-400/10 text-purple-300'
      : item.status === 'claimed'
      ? 'border-[#f5a623]/30 bg-[#f5a623]/10 text-[#f5a623]'
      : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'

  const statusLabel =
    item.status === 'scoping'
      ? 'Scoping'
      : item.status === 'discovery'
      ? 'Discovery'
      : item.status === 'awaiting_assignment'
      ? 'Awaiting Assignment'
      : item.status === 'claimed'
      ? 'Claimed & In Progress'
      : 'Open Deliverable'

  return (
    <div
      className={`flex flex-col justify-between rounded-3xl border p-5 transition backdrop-blur-xl ${
        isClaimedByMe
          ? 'border-emerald-400/40 bg-emerald-400/5 ring-1 ring-emerald-400/20'
          : isPipelineLane
          ? 'border-[#f5a623]/30 bg-[#f5a623]/[0.03] hover:border-[#f5a623]/50'
          : item.status === 'claimed'
          ? 'border-white/10 bg-black/20 opacity-80'
          : 'border-white/10 bg-black/40 hover:border-white/20'
      }`}
    >
      <div className="space-y-3.5">
        {/* Top Badges (Track, Status, Git Link) */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#f5a623]/30 bg-[#f5a623]/10 px-2.5 py-0.5 text-[10px] uppercase font-semibold text-[#f5a623]">
              {item.trackId}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase ${statusBadgeColor}`}>
              {statusLabel}
            </span>
          </div>

          {/* Git / Codebase Link */}
          {item.githubRepoUrl && (
            <a
              href={item.githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-300 hover:underline bg-cyan-950/40 border border-cyan-400/30 px-2.5 py-0.5 rounded-full"
            >
              <Github className="h-3 w-3" />
              <span>Git Repo</span>
              <ExternalLink className="h-2.5 w-2.5 opacity-60" />
            </a>
          )}
        </div>

        {/* Title & Summary */}
        <div>
          <h3 className="text-base font-bold text-white leading-snug">{item.title}</h3>
          <p className="mt-1.5 text-xs text-white/70 leading-relaxed">{item.summary}</p>
        </div>

        {/* CONTEXT PROFILE (Client Contacted & Contract Signed Status) */}
        {item.contextProfile && (
          <div className="rounded-2xl border border-white/10 bg-black/50 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/40 uppercase tracking-wider font-mono text-[10px]">Context Profile:</span>
              <span className="font-semibold text-white/90">{item.contextProfile.clientName || 'Client Project'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1">
                {item.contextProfile.clientContacted ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-200">Client Contacted</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 text-white/30" />
                    <span className="text-white/40">Contact Pending</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 rounded-xl border border-white/5 bg-white/[0.03] px-2.5 py-1">
                {item.contextProfile.contractSigned ? (
                  <>
                    <FileCheck className="h-3 w-3 text-cyan-400" />
                    <span className="text-cyan-200">Contract Signed</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 text-amber-400/60" />
                    <span className="text-amber-200/60">Scoping Phase</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Required Skills & Location / Entity Metadata */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {item.requiredSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-0.5 text-[10px] text-white/70"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/50 pt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-cyan-300" /> {item.locationNode.name}
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3 text-[#f5a623]" /> {item.entityAffiliation.name}
            </span>
          </div>
        </div>
      </div>

      {/* Compensation & Action CTA */}
      <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase text-white/40 font-mono">Compensation</p>
          <div className="flex items-center gap-2">
            {item.compensation.cashUsd && (
              <span className="text-xs font-bold text-emerald-300">
                ${item.compensation.cashUsd} USD
              </span>
            )}
            {item.compensation.beamCoins && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#f5a623]">
                <Coins className="h-3 w-3" /> {item.compensation.beamCoins} BEAM
              </span>
            )}
          </div>
        </div>

        {isPipelineLane ? (
          <button
            type="button"
            onClick={() => onClaim(item)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#f5a623] px-4 py-2 text-xs font-bold text-[#11131d] hover:bg-[#f5a623]/90 transition shadow-md"
          >
            Review &amp; Claim <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : isClaimedByMe ? (
          <Link
            href="/content/submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-4 py-2 text-xs font-bold text-[#0c101c] hover:bg-emerald-300 transition"
          >
            Submit Work <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : item.status === 'claimed' ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 font-medium">
            Assigned ({item.claimedByName?.split(' ')[0]})
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onClaim(item)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition"
          >
            Claim Task <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
