'use client'

import { useState } from 'react'
import { CheckCircle2, ShieldCheck, Sparkles, X } from 'lucide-react'
import type { ForgeWorkItem } from '@/lib/types'

interface WorkItemClaimModalProps {
  isOpen: boolean
  workItem: ForgeWorkItem | null
  participantName: string
  onClose: () => void
  onClaimed: (workItemId: string) => void
}

export function WorkItemClaimModal({
  isOpen,
  workItem,
  participantName,
  onClose,
  onClaimed,
}: WorkItemClaimModalProps) {
  const [roleNote, setRoleNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !workItem) return null

  function handleConfirmClaim(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    setTimeout(() => {
      onClaimed(workItem!.id)
      setIsSubmitting(false)
      onClose()
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-[2rem] border border-white/14 bg-[#0c101c] p-6 shadow-2xl sm:p-8 text-white">
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-2.5 text-emerald-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Claim Work Deliverable</p>
              <h2 className="text-xl font-bold text-white">Confirm Work Item Assignment</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-white/60 hover:border-white/30 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <span className="inline-block rounded-full bg-[#f5a623]/10 border border-[#f5a623]/24 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[#f5a623]">
              {workItem.trackId} Track
            </span>
            <h3 className="mt-2 text-lg font-bold text-white">{workItem.title}</h3>
            <p className="mt-1 text-xs text-white/60 leading-relaxed">{workItem.summary}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="uppercase tracking-wider text-white/40">Location (Where)</p>
              <p className="mt-1 font-semibold text-white">{workItem.locationNode.name}</p>
              <p className="text-white/50">{workItem.locationNode.city}, {workItem.locationNode.state}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="uppercase tracking-wider text-white/40">Entity (Who)</p>
              <p className="mt-1 font-semibold text-white">{workItem.entityAffiliation.name}</p>
              <p className="text-white/50">{workItem.entityAffiliation.kind.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 flex items-center justify-between text-xs">
            <div>
              <p className="uppercase tracking-wider text-emerald-300">Compensation Package</p>
              <p className="mt-1 text-sm font-bold text-white">{workItem.compensation.label}</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-300" />
          </div>

          <form onSubmit={handleConfirmClaim} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/60 mb-1.5">
                Participant Claiming Work
              </label>
              <input
                type="text"
                disabled
                value={participantName}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white/80"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/60 mb-1.5">
                Optional Capacity / Contribution Note
              </label>
              <input
                type="text"
                value={roleNote}
                onChange={(e) => setRoleNote(e.target.value)}
                placeholder="e.g., Leading frontend components and Mapbox setup"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#f5a623]/40 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/14 px-5 py-2.5 text-xs font-medium text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-2.5 text-xs font-bold text-[#0c101c] hover:bg-emerald-300 transition disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isSubmitting ? 'Claiming...' : 'Confirm & Claim Work Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
