'use client'

import { useMemo, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { ChevronDown, ChevronLeft, ChevronRight, Mail, Users } from 'lucide-react'
import { db } from '@/lib/firebase'
import { useRagLeads } from '@/lib/useRagLeads'
import type { ContentOwner, RagLead, RagLeadStatus } from '@/lib/types/ragLead'

const statuses: RagLeadStatus[] = ['NEW', 'INTERVIEWED', 'QUALIFIED', 'SUBSCRIBED', 'CLOSED']
const ownerLabels: Record<ContentOwner, string> = { me_personally: 'Me personally', one_staffer_many_hats: 'One staffer, many hats', paid_contractor: 'Paid contractor', nobody_sits_undone: 'Nobody; sits undone' }

export function RagLeadBoard() {
  const { leads, isLoading, error } = useRagLeads()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const grouped = useMemo(() => Object.fromEntries(statuses.map((status) => [status, leads.filter((lead) => lead.status === status)])) as Record<RagLeadStatus, RagLead[]>, [leads])

  async function updateLead(lead: RagLead, updates: Partial<Pick<RagLead, 'status' | 'notes'>>) {
    if (!db) return
    setSavingId(lead.id)
    try { await updateDoc(doc(db, 'ragLeads', lead.id), { ...updates, updatedAt: new Date().toISOString() }) }
    finally { setSavingId(null) }
  }

  function shiftStatus(lead: RagLead, direction: -1 | 1) {
    const next = statuses[statuses.indexOf(lead.status) + direction]
    if (next) void updateLead(lead, { status: next })
  }

  return (
    <div className="mx-auto max-w-[100rem] px-4 py-10 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8"><p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">RAG lead responses</p><h1 className="mt-3 font-serif text-5xl text-white sm:text-6xl">Forge services pipeline</h1><p className="mt-4 max-w-2xl leading-7 text-white/68">Move qualified organizations from first response through interview, qualification, and subscription.</p></section>
      {isLoading ? <p className="mt-8 text-sm text-white/48">Loading lead responses…</p> : null}
      {error ? <p className="mt-8 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">{error}</p> : null}
      <div className="mt-8 grid gap-4 xl:grid-cols-5">
        {statuses.map((status) => (
          <section key={status} className="min-w-0 rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-3">
            <div className="flex items-center justify-between px-2 py-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f5a623]">{status}</h2>
              <span className="text-xs text-white/38">{grouped[status].length}</span>
            </div>
            <div className="mt-2 space-y-3">
              {grouped[status].map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  expanded={expandedId === lead.id}
                  notes={draftNotes[lead.id] ?? lead.notes}
                  disabled={savingId === lead.id}
                  onToggle={() => setExpandedId((current) => current === lead.id ? null : lead.id)}
                  onNotes={(notes) => setDraftNotes((current) => ({ ...current, [lead.id]: notes }))}
                  onSaveNotes={() => void updateLead(lead, { notes: draftNotes[lead.id] ?? lead.notes })}
                  onBack={() => shiftStatus(lead, -1)}
                  onForward={() => shiftStatus(lead, 1)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function LeadCard({ lead, expanded, notes, disabled, onToggle, onNotes, onSaveNotes, onBack, onForward }: { lead: RagLead; expanded: boolean; notes: string; disabled: boolean; onToggle: () => void; onNotes: (value: string) => void; onSaveNotes: () => void; onBack: () => void; onForward: () => void }) {
  const statusIndex = statuses.indexOf(lead.status)
  return <article className="rounded-2xl border border-white/10 bg-[#0d111d] p-4"><button type="button" onClick={onToggle} aria-expanded={expanded} className="w-full text-left"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-white">{lead.orgName}</h3><p className="mt-1 text-xs text-white/45">{lead.contactName}</p></div><ChevronDown className={`h-4 w-4 text-white/42 transition ${expanded ? 'rotate-180' : ''}`} /></div><div className="mt-4 rounded-xl border border-[#f5a623]/20 bg-[#f5a623]/8 p-3"><p className="text-[0.65rem] uppercase tracking-[0.16em] text-[#f5a623]">Underused spend</p><p className="mt-2 text-sm leading-5 text-white/78">{lead.underusedSpend || 'No answer provided'}</p></div><div className="mt-3 flex flex-wrap gap-2 text-[0.68rem] text-white/48"><span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {lead.payrollCount} payroll</span><span>· {ownerLabels[lead.contentOwner]}</span></div></button>{expanded ? <div className="mt-4 space-y-4 border-t border-white/10 pt-4"><Response label="Mission" value={lead.mission} /><Response label="Current monthly spend" value={lead.currentSpend.join(' · ')} /><Response label="Last build" value={lead.lastBuildExperience} /><Response label="Undone roadmap" value={lead.undoneRoadmap} /><Response label="First priority" value={lead.firstThingTheydPointAt} /><a href={`mailto:${lead.contactEmail}`} className="inline-flex items-center gap-2 text-xs font-semibold text-white"><Mail className="h-3.5 w-3.5" /> {lead.contactEmail}</a><label className="block"><span className="text-[0.65rem] uppercase tracking-[0.16em] text-white/42">Internal notes</span><textarea value={notes} onChange={(event) => onNotes(event.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white outline-none focus:border-[#f5a623]/40" /></label><button type="button" disabled={disabled} onClick={onSaveNotes} className="rounded-full border border-white/14 px-3 py-2 text-xs text-white disabled:opacity-50">Save notes</button></div> : null}<div className="mt-4 flex justify-between"><button type="button" disabled={disabled || statusIndex === 0} onClick={onBack} aria-label={`Move ${lead.orgName} back`} className="rounded-full border border-white/10 p-2 text-white/62 disabled:opacity-20"><ChevronLeft className="h-4 w-4" /></button><button type="button" disabled={disabled || statusIndex === statuses.length - 1} onClick={onForward} aria-label={`Advance ${lead.orgName}`} className="rounded-full border border-[#f5a623]/25 bg-[#f5a623]/10 p-2 text-[#f5a623] disabled:opacity-20"><ChevronRight className="h-4 w-4" /></button></div></article>
}

function Response({ label, value }: { label: string; value: string }) { return <div><p className="text-[0.65rem] uppercase tracking-[0.16em] text-white/42">{label}</p><p className="mt-1 text-xs leading-5 text-white/68">{value || 'No answer provided'}</p></div> }
