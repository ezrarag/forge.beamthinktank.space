import type {
  BeamHandoffRecord,
  BeamRole,
  ParticipantArea,
  ParticipantCohortCard,
  ParticipantDashboardPreferences,
  WorkContextResolutionState,
} from '@/lib/types'

const defaultBeamHomeUrl = process.env.NEXT_PUBLIC_BEAM_HOME_URL?.trim() || 'https://home.beamthinktank.space'
const defaultSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'http://localhost:3000'
const forgeOrganizationId = process.env.NEXT_PUBLIC_FORGE_ORGANIZATION_ID?.trim() || 'org_beam_forge'
const forgeOrganizationName = process.env.NEXT_PUBLIC_FORGE_ORGANIZATION_NAME?.trim() || 'BEAM Forge'
const forgeCohortId = process.env.NEXT_PUBLIC_FORGE_COHORT_ID?.trim() || 'cohort_beam_forge_launch'
const forgeCohortName = process.env.NEXT_PUBLIC_FORGE_COHORT_NAME?.trim() || 'Forge Launch Cohort'
const forgeEntryChannel = process.env.NEXT_PUBLIC_FORGE_ENTRY_CHANNEL?.trim() || 'forge.beamthinktank.space'

const ORGANIZATION_CATALOG: ParticipantArea[] = [
  {
    id: 'org_beam_home',
    name: 'BEAM Home',
    shortName: 'BEAM Home',
    description: 'Central participant entry point for navigation across the BEAM ecosystem.',
    href: 'https://home.beamthinktank.space',
    kind: 'organization',
    tags: ['entry', 'network', 'community'],
    source: 'catalog',
  },
  {
    id: 'org_beam_forge',
    name: 'BEAM Forge',
    shortName: 'Forge',
    description: 'Technology, fabrication, fintech, and infrastructure delivery inside the BEAM network.',
    href: 'https://forge.beamthinktank.space',
    kind: 'organization',
    tags: ['technology', 'fabrication', 'fintech'],
    source: 'catalog',
  },
  {
    id: 'org_beam_orchestra',
    name: 'BEAM Orchestra',
    shortName: 'Orchestra',
    description: 'Music, performance, and cultural learning pathways inside BEAM.',
    href: 'https://orchestra.beamthinktank.space',
    kind: 'organization',
    tags: ['music', 'arts', 'performance'],
    source: 'catalog',
  },
]

const WORK_CONTEXT_CATALOG: ParticipantArea[] = [
  {
    id: 'work_beam_forge_delivery',
    name: 'Forge Delivery',
    shortName: 'Forge Delivery',
    description: 'Current BEAM Forge client delivery and R&D work context.',
    href: 'https://forge.beamthinktank.space/projects',
    kind: 'work_context',
    tags: ['delivery', 'r-and-d', 'forge'],
    linkedOrganizationIds: ['org_beam_forge'],
    source: 'catalog',
  },
]

const COHORT_SEED: ParticipantCohortCard[] = [
  {
    id: forgeCohortId,
    name: forgeCohortName,
    description: 'Initial Forge cohort seeded from the BEAM Home handoff contract.',
    status: 'active',
    organizationIds: [forgeOrganizationId],
    source: 'seed',
  },
]

function uniqueById<T extends { id: string }>(items: T[]) {
  const map = new Map<string, T>()
  items.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item)
    }
  })
  return [...map.values()]
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getBeamHomeUrl(path = '') {
  return `${defaultBeamHomeUrl.replace(/\/+$/, '')}${path}`
}

export function buildForgeHandoffUrl(params?: { role?: 'student' | 'business' | 'community'; returnPath?: string }) {
  const endpoint = new URL(getBeamHomeUrl('/onboard/handoff'))
  endpoint.searchParams.set('role', params?.role ?? 'community')
  endpoint.searchParams.set('sourceType', 'ngo_site')
  endpoint.searchParams.set('sourceSystem', 'beam')
  endpoint.searchParams.set('entryChannel', forgeEntryChannel)
  endpoint.searchParams.set('organizationId', forgeOrganizationId)
  endpoint.searchParams.set('organizationName', forgeOrganizationName)
  endpoint.searchParams.set('cohortId', forgeCohortId)
  endpoint.searchParams.set('cohortName', forgeCohortName)
  endpoint.searchParams.set('siteUrl', defaultSiteUrl)
  endpoint.searchParams.set('landingPageUrl', `${defaultSiteUrl}${params?.returnPath ?? '/member'}`)
  endpoint.searchParams.set('referrerUrl', defaultSiteUrl)
  endpoint.searchParams.set('redirectTarget', 'dashboard')
  endpoint.searchParams.set('scenarioLabel', 'BEAM Forge')
  endpoint.searchParams.set('returnTo', `${defaultSiteUrl}${params?.returnPath ?? '/member'}`)
  return endpoint.toString()
}

export async function fetchPublishedRoles(): Promise<BeamRole[]> {
  try {
    const response = await fetch(getBeamHomeUrl('/api/roles'), { cache: 'no-store' })
    if (!response.ok) return []
    const payload = (await response.json()) as { roles?: BeamRole[] }
    return Array.isArray(payload.roles) ? payload.roles : []
  } catch {
    return []
  }
}

export async function fetchParticipantWorkContexts(
  handoff: BeamHandoffRecord
): Promise<{ contexts: ParticipantArea[]; matchedClientName: string | null; resolution: WorkContextResolutionState | null }> {
  const endpoint = new URL(getBeamHomeUrl('/api/participant/work-contexts'))
  const input: Record<string, string> = {
    sourceType: handoff.sourceType,
    sourceSystem: handoff.sourceSystem,
    scenarioLabel: handoff.scenarioLabel,
    entryChannel: handoff.entryChannel,
    sourceDocumentId: handoff.sourceDocumentId,
    sourceStoryId: handoff.sourceStoryId,
    organizationId: handoff.organizationId,
    organizationName: handoff.organizationName,
    siteUrl: handoff.siteUrl,
    landingPageUrl: handoff.landingPageUrl,
    referrerUrl: handoff.referrerUrl,
  }

  Object.entries(input).forEach(([key, value]) => {
    if (value?.trim()) {
      endpoint.searchParams.set(key, value)
    }
  })

  try {
    const response = await fetch(endpoint.toString(), { cache: 'no-store' })
    if (!response.ok) {
      return { contexts: [], matchedClientName: null, resolution: null }
    }
    const payload = (await response.json()) as {
      contexts?: ParticipantArea[]
      matchedClient?: { name?: string } | null
      resolution?: WorkContextResolutionState | null
    }
    return {
      contexts: Array.isArray(payload.contexts) ? payload.contexts : [],
      matchedClientName: payload.matchedClient?.name ?? null,
      resolution: payload.resolution ?? null,
    }
  } catch {
    return { contexts: [], matchedClientName: null, resolution: null }
  }
}

function buildDerivedOrganization(handoff: BeamHandoffRecord | null) {
  if (!handoff) return null
  if (handoff.organizationId && ORGANIZATION_CATALOG.some((item) => item.id === handoff.organizationId)) {
    return null
  }

  const name = handoff.organizationName.trim() || handoff.scenarioLabel.trim()
  if (!name) return null

  return {
    id: handoff.organizationId.trim() || `org_handoff_${slugify(handoff.entryChannel || name)}`,
    name,
    shortName: name,
    description: 'Organization context derived from the current BEAM Home handoff payload.',
    href: handoff.siteUrl || undefined,
    kind: 'organization' as const,
    tags: ['handoff', 'current'],
    source: 'handoff' as const,
  }
}

function buildDerivedWorkContext(handoff: BeamHandoffRecord | null) {
  if (!handoff) return null

  const label = handoff.organizationName.trim() || handoff.scenarioLabel.trim() || 'Current Forge Work Context'
  return {
    id: `work_handoff_${slugify(handoff.organizationId || handoff.entryChannel || label)}`,
    name: label,
    shortName: label,
    description: 'Work context derived from the BEAM Home entry payload.',
    href: handoff.landingPageUrl || handoff.siteUrl || undefined,
    kind: 'work_context' as const,
    tags: ['handoff', 'current'],
    linkedOrganizationIds: handoff.organizationId ? [handoff.organizationId] : [],
    source: 'handoff' as const,
  }
}

function buildDerivedCohort(handoff: BeamHandoffRecord | null) {
  if (!handoff || (!handoff.cohortId.trim() && !handoff.cohortName.trim())) return null
  if (COHORT_SEED.some((item) => item.id === handoff.cohortId.trim())) return null
  return {
    id: handoff.cohortId.trim() || `cohort_handoff_${slugify(handoff.cohortName || handoff.entryChannel)}`,
    name: handoff.cohortName.trim() || 'Current Cohort',
    description: 'Cohort context derived from the BEAM Home handoff payload.',
    status: 'current',
    organizationIds: handoff.organizationId ? [handoff.organizationId] : [],
    source: 'handoff' as const,
  }
}

export function getParticipantOrganizations(handoff: BeamHandoffRecord | null) {
  return uniqueById([
    ...ORGANIZATION_CATALOG,
    ...(buildDerivedOrganization(handoff) ? [buildDerivedOrganization(handoff)!] : []),
  ])
}

export function getParticipantWorkContexts(handoff: BeamHandoffRecord | null, upstream: ParticipantArea[] = []) {
  return uniqueById([
    ...WORK_CONTEXT_CATALOG,
    ...upstream,
    ...(buildDerivedWorkContext(handoff) ? [buildDerivedWorkContext(handoff)!] : []),
  ])
}

export function getParticipantCohorts(handoff: BeamHandoffRecord | null) {
  return uniqueById([
    ...COHORT_SEED,
    ...(buildDerivedCohort(handoff) ? [buildDerivedCohort(handoff)!] : []),
  ])
}

export function deriveDefaultDashboardPreferences(handoff: BeamHandoffRecord | null): ParticipantDashboardPreferences {
  return {
    activeOrganizationId: handoff?.organizationId || forgeOrganizationId,
    activeWorkContextId: handoff ? `work_handoff_${slugify(handoff.organizationId || handoff.entryChannel || 'forge')}` : 'work_beam_forge_delivery',
    interestedOrganizationIds: [],
    interestedWorkContextIds: [],
  }
}

export function getKnownSessionCookieName() {
  return process.env.NEXT_PUBLIC_HOME_SESSION_COOKIE_NAME?.trim() || ''
}

