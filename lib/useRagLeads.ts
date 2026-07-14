'use client'

import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ContentOwner, RagLead, RagLeadStatus } from '@/lib/types/ragLead'

const statuses: RagLeadStatus[] = ['NEW', 'INTERVIEWED', 'QUALIFIED', 'SUBSCRIBED', 'CLOSED']
const contentOwners: ContentOwner[] = ['me_personally', 'one_staffer_many_hats', 'paid_contractor', 'nobody_sits_undone']

function normalizeLead(id: string, data: Record<string, unknown>): RagLead {
  const status = statuses.includes(data.status as RagLeadStatus) ? data.status as RagLeadStatus : 'NEW'
  const contentOwner = contentOwners.includes(data.contentOwner as ContentOwner) ? data.contentOwner as ContentOwner : 'nobody_sits_undone'
  const text = (value: unknown) => typeof value === 'string' ? value : ''
  return {
    id,
    domain: 'forge',
    orgName: text(data.orgName),
    contactName: text(data.contactName),
    contactEmail: text(data.contactEmail),
    mission: text(data.mission),
    contentOwner,
    currentSpend: Array.isArray(data.currentSpend) ? data.currentSpend.filter((item): item is string => typeof item === 'string') : [],
    underusedSpend: text(data.underusedSpend),
    lastBuildExperience: text(data.lastBuildExperience),
    undoneRoadmap: text(data.undoneRoadmap),
    payrollCount: typeof data.payrollCount === 'number' ? data.payrollCount : 0,
    firstThingTheydPointAt: text(data.firstThingTheydPointAt),
    status,
    notes: text(data.notes),
    createdAt: text(data.createdAt),
    updatedAt: text(data.updatedAt),
  }
}

export function useRagLeads() {
  const [leads, setLeads] = useState<RagLead[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(db))
  const [error, setError] = useState<string | null>(db ? null : 'Firestore is not configured for this environment.')

  useEffect(() => {
    if (!db) return
    const leadsQuery = query(collection(db, 'ragLeads'), where('domain', '==', 'forge'))
    return onSnapshot(leadsQuery, (snapshot) => {
      const nextLeads = snapshot.docs.map((leadDoc) => normalizeLead(leadDoc.id, leadDoc.data() as Record<string, unknown>))
      nextLeads.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      setLeads(nextLeads); setIsLoading(false); setError(null)
    }, (snapshotError) => { setLeads([]); setIsLoading(false); setError(snapshotError.message) })
  }, [])

  return { leads, isLoading, error }
}
