'use client'

import { useState } from 'react'
import { Bell, CheckCircle2, HardHat, X } from 'lucide-react'
import { seedLocationNodes } from '@/lib/forge-content'
import type { ForgeLocationNode, ForgeWorkSiteAttachment } from '@/lib/types'

interface SiteWorkRosterModalProps {
  isOpen: boolean
  targetNode?: ForgeLocationNode | null
  onClose: () => void
  onAttached: (attachment: ForgeWorkSiteAttachment) => void
}

const AVAILABLE_CAPACITIES = [
  'Soldering & PCB Assembly',
  '3D Printing & CAD Modeling',
  'Hardware Triage & Repair',
  'Next.js & Frontend Delivery',
  'ComfyUI AI Video Pipelines',
  'Fintech Ledger Bookkeeping',
  'Network & Device Hardening',
  'Acoustics & Media Rigging',
  'Site Stewardship & Logistics',
]

export function SiteWorkRosterModal({
  isOpen,
  targetNode,
  onClose,
  onAttached,
}: SiteWorkRosterModalProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(targetNode?.id || seedLocationNodes[0]!.id)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Next.js & Frontend Delivery',
    'Hardware Triage & Repair',
  ])
  const [notifyOnWork, setNotifyOnWork] = useState(true)

  if (!isOpen) return null

  const activeNode = seedLocationNodes.find((node) => node.id === selectedNodeId) || seedLocationNodes[0]!

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((item) => item !== skill) : [...prev, skill]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!activeNode) return

    const attachment: ForgeWorkSiteAttachment = {
      siteId: activeNode.id,
      siteName: activeNode.name,
      city: activeNode.city,
      state: activeNode.state,
      attachedAt: new Date().toISOString().slice(0, 10),
      skillsOrCapacities: selectedSkills,
      notifyOnWorkAvailable: notifyOnWork,
    }

    onAttached(attachment)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-[2rem] border border-white/14 bg-[#0c101c] p-6 shadow-2xl sm:p-8 text-white">
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[#f5a623]/30 bg-[#f5a623]/10 p-2.5 text-[#f5a623]">
              <HardHat className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#f5a623]">Site Work Roster</p>
              <h2 className="text-xl font-bold text-white">Attach Profile to Work Facility</h2>
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/60 mb-2">
              Select Target Work Facility / Node
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {seedLocationNodes.map((node) => {
                const isSelected = node.id === selectedNodeId
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`flex flex-col justify-between rounded-2xl border p-3.5 text-left transition ${
                      isSelected
                        ? 'border-[#f5a623] bg-[#f5a623]/10 ring-1 ring-[#f5a623]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20'
                    }`}
                  >
                    <div>
                      <span className="inline-block rounded-full bg-white/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/80">
                        {node.facilityType.replace('_', ' ')}
                      </span>
                      <p className="mt-1.5 text-sm font-semibold text-white">{node.name}</p>
                      <p className="text-xs text-white/50">{node.city}, {node.state}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/60 mb-2">
              Your Technical Capacities &amp; Skilled Labor Offerings
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CAPACITIES.map((capacity) => {
                const isChecked = selectedSkills.includes(capacity)
                return (
                  <button
                    key={capacity}
                    type="button"
                    onClick={() => toggleSkill(capacity)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                      isChecked
                        ? 'border-[#f5a623] bg-[#f5a623]/20 text-[#f5a623]'
                        : 'border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}{capacity}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-[#f5a623]" />
              <div>
                <p className="text-sm font-medium text-white">Work Shift &amp; Deliverable Alerts</p>
                <p className="text-xs text-white/50">Notify me when open shifts or tasks are posted for this facility.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifyOnWork}
              onChange={(e) => setNotifyOnWork(e.target.checked)}
              className="h-5 w-5 rounded border-white/20 bg-black/40 accent-[#f5a623]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/14 px-5 py-2.5 text-xs font-medium text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-6 py-2.5 text-xs font-bold text-[#11131d] hover:bg-[#f5a623]/90 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              Attach Profile to Roster
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
