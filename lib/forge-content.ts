import {
  Anvil,
  CircuitBoard,
  Clapperboard,
  TerminalSquare,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import type {
  AdminParticipant,
  EditableFeedEntry,
  EditableForgeProject,
  EditableForgeTrack,
  ForgeContentSnapshot,
  ForgeCategory,
  ForgeCategorySlug,
  ForgeProject,
  ForgeSlide,
  ForgeTrack,
  ForgeTrackId,
  MemberAssignment,
} from '@/lib/types'

export const forgeTrackIds: ForgeTrackId[] = ['fintech', 'software', 'fabrication', 'it', 'content-production']

export const forgeCategories: ForgeCategory[] = [
  {
    id: 'category-digital', slug: 'digital', label: 'Digital Delivery', colorAccent: '#f5a623', icon: TerminalSquare,
    description: 'Client websites, nonprofit IT overflow, and software delivery for the BEAM NGO network.',
    openRoles: ['Frontend engineer', 'Full-stack engineer', 'Technical writer'], trackIds: ['software'],
  },
  {
    id: 'category-fabrication', slug: 'fabrication', label: 'Fabrication & Repair', colorAccent: '#22d3ee', icon: Anvil,
    description: 'Repair clinics, building systems, makerspace buildouts, and hands-on hardware prototyping.',
    openRoles: ['Fabrication technician', 'Repair clinic lead', 'HVAC systems technician'], trackIds: ['fabrication'],
  },
  {
    id: 'category-ai-production', slug: 'ai-production', label: 'AI Production Pipeline', colorAccent: '#a78bfa', icon: CircuitBoard,
    description: 'GPU compute, ComfyUI video, transcription, and image generation for billed client deliverables.',
    openRoles: ['ComfyUI pipeline operator', 'AI media producer', 'Transcription specialist'], trackIds: [],
  },
  {
    id: 'category-fintech', slug: 'fintech', label: 'Fintech & Infrastructure', colorAccent: '#34d399', icon: Wrench,
    description: 'Participant payroll rails, payout tracking, equity ledgers, and the systems that keep BEAM online.',
    openRoles: ['Payments engineer', 'Ledger operations analyst', 'Systems operator'], trackIds: ['fintech', 'it'],
  },
  {
    id: 'category-content', slug: 'content', label: 'Content & Brand', colorAccent: '#fb7185', icon: Clapperboard,
    description: 'Identity clips, explainers, interviews, blueprint stills, and a durable social content pipeline.',
    openRoles: ['Video editor', 'Motion designer', 'Brand asset producer'], trackIds: ['content-production'],
  },
]

const projectCategoryOverrides: Record<string, ForgeCategorySlug> = {
  'ngo-site-fleet': 'digital',
  'mke-black-digital-platform': 'digital',
  'runpod-comfyui-pipeline': 'ai-production',
  'beam-identity-clips': 'content',
  'equity-ledger-core': 'fintech',
  'repair-clinic-pilot': 'fabrication',
  'beam-network-hardening': 'fintech',
  'wallet-launch-kit': 'fintech',
}

export function getProjectCategory(project: Pick<ForgeProject, 'id' | 'track'>): ForgeCategorySlug {
  return projectCategoryOverrides[project.id]
    ?? forgeCategories.find((category) => category.trackIds.includes(project.track))?.slug
    ?? 'digital'
}

export const forgeSlides: ForgeSlide[] = [
  {
    id: 'hero',
    eyebrow: 'BEAM Forge',
    title: 'Built here. Launched from here.',
    description:
      'Forge is the technology, fabrication, and fintech arm of the BEAM Think Tank ecosystem, where cohorts ship client work, internal R&D, and field-ready infrastructure.',
    ctaLabel: 'Open Forge Viewer',
    ctaHref: '/viewer',
    metric: '5 operating tracks',
    accent: 'from-[#f5a623]/30 via-[#f5a623]/8 to-transparent',
  },
  {
    id: 'about',
    eyebrow: 'Cohort Engine',
    title: 'Students, faculty, and community builders work in production cohorts.',
    description:
      'Teams alternate between partner-sourced delivery and internal BEAM venture building, with compensation that can blend cash, equity, and in-kind asset positions.',
    ctaLabel: 'Explore Tracks',
    ctaHref: '/tracks',
    metric: 'Hybrid payment model',
    accent: 'from-cyan-400/20 via-cyan-400/6 to-transparent',
  },
  {
    id: 'projects',
    eyebrow: 'Client + R&D',
    title: 'Forge spans product software, fabrication labs, and infrastructure operations.',
    description:
      'The same operating surface handles equity ledgers, NGO site delivery, maker-space repair clinics, and the networks that keep the BEAM ecosystem online.',
    ctaLabel: 'Review Projects',
    ctaHref: '/projects?category=digital',
    metric: 'Public + member workstreams',
    accent: 'from-emerald-400/20 via-emerald-400/6 to-transparent',
  },
]

export const forgeTracks: EditableForgeTrack[] = [
  {
    id: 'fintech',
    title: 'Fintech Product Creation',
    tagline: 'Ledgers, wallets, and cohort finance tooling.',
    summary:
      'Design and ship the financial operating layer for cohort work, equity bookkeeping, payout visibility, and client-facing capital tools.',
    focusAreas: ['Equity ledgers', 'Wallet UX', 'Payment orchestration', 'Dashboards for cohorts'],
    openings: ['Product designer', 'Payments engineer', 'Ledger operations analyst'],
    cohortWindow: 'Spring intake open through April 18',
    linkedParticipantIds: [],
  },
  {
    id: 'software',
    title: 'Web Dev & Software',
    tagline: 'NGO sites, client platforms, and internal BEAM tooling.',
    summary:
      'Build and maintain the delivery systems behind the BEAM network, from partner marketing sites to internal operations portals.',
    focusAreas: ['Next.js delivery', 'Platform integration', 'Content systems', 'Internal tooling'],
    openings: ['Frontend engineer', 'Full-stack engineer', 'Technical writer'],
    cohortWindow: 'Rolling placement for current semester teams',
    linkedParticipantIds: [],
  },
  {
    id: 'fabrication',
    title: 'Hardware Fabrication & Repair',
    tagline: 'Repair clinics, prototypes, and maker-space R&D.',
    summary:
      'Operate hands-on fabrication workflows for repair, prototype iteration, and rapid physical experimentation tied to BEAM programs and clients.',
    focusAreas: ['Repair intake', 'Prototype sprints', 'Maker documentation', 'Bench testing'],
    openings: ['Fabrication technician', 'Repair clinic lead', 'Documentation fellow'],
    cohortWindow: 'Summer lab prep now accepting applicants',
    linkedParticipantIds: [],
  },
  {
    id: 'it',
    title: 'General IT & Infrastructure',
    tagline: 'Networks, device fleets, and internal systems administration.',
    summary:
      'Keep the BEAM operational backbone stable across NGO sites, shared workspaces, managed devices, and service integrations.',
    focusAreas: ['Network setup', 'Device fleet management', 'Workspace security', 'Systems administration'],
    openings: ['IT generalist', 'Device fleet coordinator', 'Systems operator'],
    cohortWindow: 'Immediate openings for infrastructure coverage',
    linkedParticipantIds: [],
  },
  {
    id: 'content-production',
    label: 'Content Production & Marketing',
    slug: 'content',
    title: 'Content Production & Marketing',
    tagline: 'Video, brand systems, social media, and marketing deliverables.',
    summary:
      'Video production, brand assets, social content pipeline, and marketing materials for BEAM NGOs and external clients.',
    focus:
      'Short-form video (15-second NGO clips, social cuts), long-form documentary content (interview series), brand identity systems, and marketing deliverables for BEAM clients.',
    focusAreas: [
      'Short-form NGO video',
      'Documentary interviews',
      'Brand identity systems',
      'Client marketing assets',
    ],
    outcomes: [
      'NGO identity clips (15 seconds per NGO)',
      'BEAM video trilogy (What / How / Why)',
      'Client explainer videos (Hroshi, ClearTrace, RAG)',
      'Interview series (BEAM participant profiles)',
      'Blueprint stills and brand assets',
      'Social media content pipeline',
    ],
    tools: ['Midjourney', 'Veo3', 'CapCut Pro', 'ChatGPT image', 'Adobe suite'],
    equityFormula: {
      internalBEAM: 'Portfolio credit + solidarity fund share on completion',
      clientFacing: '60% participant / 20% BEAM ops / 10% solidarity fund / 10% client platform fee',
    },
    openings: ['Video editor', 'Motion designer', 'Brand asset producer', 'Social content coordinator'],
    cohortWindow: 'Content intake open now',
    linkedParticipantIds: [],
  },
]

export const forgeProjects: EditableForgeProject[] = [
  {
    id: 'mke-black-digital-platform',
    title: 'MKE Black Digital Platform',
    track: 'software',
    phase: 'Active',
    partner: 'MKE Black / RAG',
    compensation: 'Paid client milestones',
    summary: 'Website and application delivery for a RAG client, supported by a reusable Forge software workflow.',
    outcomes: ['Production website', 'Application workflow', 'Reusable delivery documentation'],
    linkedParticipantIds: [],
  },
  {
    id: 'runpod-comfyui-pipeline',
    title: 'RunPod ComfyUI Production Pipeline',
    track: 'it',
    phase: 'Active',
    partner: 'Jordan / RAG Compute Layer',
    compensation: 'Paid deliverable rate',
    summary: 'A repeatable GPU production layer for client video, image generation, transcription, and delivery packaging.',
    outcomes: ['RunPod environment', 'ComfyUI workflows', 'Billed deliverable handoff'],
    linkedParticipantIds: [],
  },
  {
    id: 'beam-identity-clips',
    title: 'BEAM NGO Identity Clips',
    track: 'content-production',
    phase: 'Active',
    partner: 'BEAM NGO Network',
    compensation: 'Portfolio credit + solidarity fund share',
    summary: 'A coordinated series of short identity clips that gives each BEAM NGO a clear, reusable public introduction.',
    outcomes: ['15-second NGO clips', 'Social-ready exports', 'Shared visual language'],
    linkedParticipantIds: [],
  },
  {
    id: 'equity-ledger-core',
    title: 'Equity Ledger Core',
    track: 'fintech',
    phase: 'Active',
    partner: 'Internal BEAM Venture Stack',
    compensation: 'Cash + in-kind IP participation',
    summary:
      'A cohort-facing ledger for mixed compensation, vesting snapshots, and asset-backed contribution accounting.',
    outcomes: ['Participant balance sheets', 'Role-based audit views', 'Export-ready cap table summaries'],
    linkedParticipantIds: [],
  },
  {
    id: 'ngo-site-fleet',
    title: 'NGO Site Fleet',
    track: 'software',
    phase: 'Active',
    partner: 'BEAM NGO Network',
    compensation: 'Stipend + portfolio credit',
    summary:
      'Shared website delivery system across BEAM subdomains with unified auth, registry, and reusable content blocks.',
    outcomes: ['Cross-site auth handoff', 'Design system reuse', 'Registry-connected deployment flow'],
    linkedParticipantIds: [],
  },
  {
    id: 'repair-clinic-pilot',
    title: 'Repair Clinic Pilot',
    track: 'fabrication',
    phase: 'Pipeline',
    partner: 'Community Device Access Program',
    compensation: 'Community stipend',
    summary:
      'A recurring clinic program for triage, repair, and refurbishment of essential devices in community settings.',
    outcomes: ['Intake workflow', 'Bench repair logs', 'Parts usage reporting'],
    linkedParticipantIds: [],
  },
  {
    id: 'beam-network-hardening',
    title: 'BEAM Network Hardening',
    track: 'it',
    phase: 'Active',
    partner: 'Home + NGO Infrastructure',
    compensation: 'Cash contract',
    summary:
      'Standardize network baselines, secure managed endpoints, and document recovery procedures across the ecosystem.',
    outcomes: ['Device inventory', 'Network diagrams', 'Incident response checklists'],
    linkedParticipantIds: [],
  },
  {
    id: 'wallet-launch-kit',
    title: 'Wallet Launch Kit',
    track: 'fintech',
    phase: 'Archived',
    partner: 'Partner Delivery Sprint',
    compensation: 'Paid milestone',
    summary:
      'Prototype toolkit for launching branded participant wallets tied to milestone payouts and contribution credits.',
    outcomes: ['Wallet onboarding flow', 'Launch documentation', 'Partner demo environment'],
    linkedParticipantIds: [],
  },
]

export const forgeFeed: EditableFeedEntry[] = [
  {
    id: 'fab-log-001',
    type: 'fabrication-log',
    title: 'Bench Log 01: Intake-To-Repair Flow',
    summary:
      'A first-pass repair clinic workflow covering intake triage, parts routing, and outcome labeling for reused devices.',
    publishedAt: '2026-03-18',
    track: 'fabrication',
    author: 'Forge Fabrication Cohort',
    panels: ['Intake checklist', 'Failure classification', 'Repair decision tree'],
    linkedParticipantIds: [],
  },
  {
    id: 'launch-002',
    type: 'launch',
    title: 'Forge Ledger Alpha Opened For Internal Testing',
    summary:
      'The first ledger alpha now tracks mixed cash and equity participation for current BEAM cohort exercises.',
    publishedAt: '2026-03-12',
    track: 'fintech',
    author: 'Forge Fintech Track',
    panels: ['Contribution snapshots', 'Equity placeholders', 'Cohort payout view'],
    linkedParticipantIds: [],
  },
  {
    id: 'cohort-output-003',
    type: 'cohort-output',
    title: 'Unified NGO Route Map Published',
    summary:
      'The software track documented a shared route and auth pattern for public, join, and protected member surfaces across BEAM NGOs.',
    publishedAt: '2026-03-07',
    track: 'software',
    author: 'Forge Web Systems',
    panels: ['Public browsing model', 'Home handoff rules', 'Protected dashboard shell'],
    linkedParticipantIds: [],
  },
  {
    id: 'delivery-004',
    type: 'client-delivery',
    title: 'Infrastructure Baseline Draft Sent To Partner',
    summary:
      'The IT track delivered a first operational baseline for managed devices, wifi segmentation, and admin recovery steps.',
    publishedAt: '2026-02-28',
    track: 'it',
    author: 'Forge Infrastructure Team',
    panels: ['Fleet naming standard', 'Recovery runbook', 'Network asset map'],
    linkedParticipantIds: [],
  },
]

export const memberAssignments: MemberAssignment[] = [
  {
    id: 'assignment-registry-sync',
    title: 'Forge Registry Sync',
    owner: 'NGO Site Fleet',
    status: 'In build',
    payment: 'Cash milestone',
    linkedParticipantIds: [],
  },
  {
    id: 'assignment-ledger-review',
    title: 'Mixed Compensation Ledger Review',
    owner: 'Equity Ledger Core',
    status: 'Needs sign-off',
    payment: 'In-kind equity credit',
    linkedParticipantIds: [],
  },
  {
    id: 'assignment-repair-sop',
    title: 'Repair Clinic SOP v2',
    owner: 'Repair Clinic Pilot',
    status: 'Drafting',
    payment: 'Community stipend',
    linkedParticipantIds: [],
  },
]

export const defaultParticipants: AdminParticipant[] = []

const trackIcons: Record<ForgeTrackId, LucideIcon> = {
  fintech: CircuitBoard,
  software: TerminalSquare,
  fabrication: Anvil,
  it: Wrench,
  'content-production': Clapperboard,
}

export function getForgeTrackIcon(trackId: ForgeTrackId) {
  return trackIcons[trackId] || TerminalSquare
}

export function withTrackIcons(tracks: EditableForgeTrack[]): ForgeTrack[] {
  return tracks.map((track) => ({
    ...track,
    icon: getForgeTrackIcon(track.id),
  }))
}

export function createDefaultForgeContentSnapshot(): ForgeContentSnapshot {
  return {
    slides: forgeSlides.map((slide) => ({ ...slide })),
    tracks: forgeTracks.map((track) => ({
      ...track,
      focusAreas: [...track.focusAreas],
      outcomes: track.outcomes ? [...track.outcomes] : undefined,
      tools: track.tools ? [...track.tools] : undefined,
      equityFormula: track.equityFormula ? { ...track.equityFormula } : undefined,
      openings: [...track.openings],
      linkedParticipantIds: [...track.linkedParticipantIds],
    })),
    projects: forgeProjects.map((project) => ({
      ...project,
      outcomes: [...project.outcomes],
      linkedParticipantIds: [...project.linkedParticipantIds],
    })),
    feed: forgeFeed.map((entry) => ({
      ...entry,
      panels: [...entry.panels],
      linkedParticipantIds: [...entry.linkedParticipantIds],
    })),
    assignments: memberAssignments.map((assignment) => ({
      ...assignment,
      linkedParticipantIds: [...assignment.linkedParticipantIds],
    })),
    participants: defaultParticipants.map((participant) => ({ ...participant })),
    updatedAt: new Date().toISOString(),
  }
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
}

function normalizeOptionalString(value: unknown, fallback?: string) {
  return typeof value === 'string' ? value : fallback
}

function normalizeOptionalStringArray(value: unknown, fallback?: string[]) {
  if (Array.isArray(value)) return normalizeStringArray(value)
  return fallback ? [...fallback] : undefined
}

function normalizeEquityFormula(value: unknown, fallback?: EditableForgeTrack['equityFormula']) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return fallback ? { ...fallback } : undefined
  }

  const candidate = value as Partial<NonNullable<EditableForgeTrack['equityFormula']>>
  return {
    internalBEAM: typeof candidate.internalBEAM === 'string' ? candidate.internalBEAM : fallback?.internalBEAM ?? '',
    clientFacing: typeof candidate.clientFacing === 'string' ? candidate.clientFacing : fallback?.clientFacing ?? '',
  }
}

function isForgeTrackId(value: unknown): value is ForgeTrackId {
  return typeof value === 'string' && forgeTrackIds.includes(value as ForgeTrackId)
}

function normalizeSlide(slide: Partial<ForgeSlide> | undefined, fallback: ForgeSlide): ForgeSlide {
  return {
    id: typeof slide?.id === 'string' && slide.id.trim() ? slide.id : fallback.id,
    eyebrow: typeof slide?.eyebrow === 'string' ? slide.eyebrow : fallback.eyebrow,
    title: typeof slide?.title === 'string' ? slide.title : fallback.title,
    description: typeof slide?.description === 'string' ? slide.description : fallback.description,
    ctaLabel: typeof slide?.ctaLabel === 'string' ? slide.ctaLabel : fallback.ctaLabel,
    ctaHref: typeof slide?.ctaHref === 'string' ? slide.ctaHref : fallback.ctaHref,
    metric: typeof slide?.metric === 'string' ? slide.metric : fallback.metric,
    accent: typeof slide?.accent === 'string' ? slide.accent : fallback.accent,
  }
}

function normalizeTrack(track: Partial<EditableForgeTrack> | undefined, fallback: EditableForgeTrack): EditableForgeTrack {
  return {
    id: fallback.id,
    label: normalizeOptionalString(track?.label, fallback.label),
    slug: normalizeOptionalString(track?.slug, fallback.slug),
    title: typeof track?.title === 'string' ? track.title : fallback.title,
    tagline: typeof track?.tagline === 'string' ? track.tagline : fallback.tagline,
    summary: typeof track?.summary === 'string' ? track.summary : fallback.summary,
    focus: normalizeOptionalString(track?.focus, fallback.focus),
    focusAreas: track?.focusAreas ? normalizeStringArray(track.focusAreas) : [...fallback.focusAreas],
    outcomes: normalizeOptionalStringArray(track?.outcomes, fallback.outcomes),
    tools: normalizeOptionalStringArray(track?.tools, fallback.tools),
    equityFormula: normalizeEquityFormula(track?.equityFormula, fallback.equityFormula),
    openings: track?.openings ? normalizeStringArray(track.openings) : [...fallback.openings],
    cohortWindow: typeof track?.cohortWindow === 'string' ? track.cohortWindow : fallback.cohortWindow,
    linkedParticipantIds: track?.linkedParticipantIds ? normalizeStringArray(track.linkedParticipantIds) : [...fallback.linkedParticipantIds],
  }
}

function normalizeProject(project: Partial<EditableForgeProject>): EditableForgeProject {
  return {
    id: typeof project.id === 'string' && project.id.trim() ? project.id : `project-${Math.random().toString(36).slice(2, 8)}`,
    title: typeof project.title === 'string' ? project.title : '',
    track: isForgeTrackId(project.track) ? project.track : 'software',
    phase: project.phase === 'Active' || project.phase === 'Pipeline' || project.phase === 'Archived' ? project.phase : 'Active',
    partner: typeof project.partner === 'string' ? project.partner : '',
    compensation: typeof project.compensation === 'string' ? project.compensation : '',
    summary: typeof project.summary === 'string' ? project.summary : '',
    outcomes: normalizeStringArray(project.outcomes),
    linkedParticipantIds: normalizeStringArray(project.linkedParticipantIds),
  }
}

function normalizeFeedEntry(entry: Partial<EditableFeedEntry>): EditableFeedEntry {
  return {
    id: typeof entry.id === 'string' && entry.id.trim() ? entry.id : `feed-${Math.random().toString(36).slice(2, 8)}`,
    type:
      entry.type === 'fabrication-log' ||
      entry.type === 'launch' ||
      entry.type === 'cohort-output' ||
      entry.type === 'client-delivery'
        ? entry.type
        : 'launch',
    title: typeof entry.title === 'string' ? entry.title : '',
    summary: typeof entry.summary === 'string' ? entry.summary : '',
    publishedAt: typeof entry.publishedAt === 'string' ? entry.publishedAt : '',
    track: isForgeTrackId(entry.track) ? entry.track : 'software',
    author: typeof entry.author === 'string' ? entry.author : '',
    panels: normalizeStringArray(entry.panels),
    linkedParticipantIds: normalizeStringArray(entry.linkedParticipantIds),
  }
}

function normalizeAssignment(assignment: Partial<MemberAssignment>): MemberAssignment {
  return {
    id: typeof assignment.id === 'string' && assignment.id.trim() ? assignment.id : `assignment-${Math.random().toString(36).slice(2, 8)}`,
    title: typeof assignment.title === 'string' ? assignment.title : '',
    owner: typeof assignment.owner === 'string' ? assignment.owner : '',
    status: typeof assignment.status === 'string' ? assignment.status : '',
    payment: typeof assignment.payment === 'string' ? assignment.payment : '',
    linkedParticipantIds: normalizeStringArray(assignment.linkedParticipantIds),
  }
}

function normalizeParticipant(participant: Partial<AdminParticipant>): AdminParticipant {
  return {
    id: typeof participant.id === 'string' && participant.id.trim() ? participant.id : `participant-${Math.random().toString(36).slice(2, 8)}`,
    name: typeof participant.name === 'string' ? participant.name : '',
    email: typeof participant.email === 'string' ? participant.email : '',
    role: typeof participant.role === 'string' ? participant.role : '',
    status: typeof participant.status === 'string' ? participant.status : '',
    headline: typeof participant.headline === 'string' ? participant.headline : '',
    notes: typeof participant.notes === 'string' ? participant.notes : '',
  }
}

export function normalizeForgeContentSnapshot(value: Partial<ForgeContentSnapshot> | null | undefined): ForgeContentSnapshot {
  const fallback = createDefaultForgeContentSnapshot()

  if (!value) {
    return fallback
  }

  const incomingSlides = Array.isArray(value.slides) ? value.slides : []
  const incomingTracks = Array.isArray(value.tracks) ? value.tracks : []

  const slideFallbackById = new Map(fallback.slides.map((slide) => [slide.id, slide]))
  return {
    slides:
      incomingSlides.length > 0
        ? incomingSlides.map((slide, index) => normalizeSlide(slide, slideFallbackById.get(slide?.id || '') || fallback.slides[index] || fallback.slides[0]))
        : fallback.slides,
    tracks: fallback.tracks.map((track) => normalizeTrack(incomingTracks.find((candidate) => candidate?.id === track.id), track)),
    projects:
      Array.isArray(value.projects) && value.projects.length > 0
        ? value.projects.map((project) => normalizeProject(project))
        : fallback.projects,
    feed:
      Array.isArray(value.feed) && value.feed.length > 0
        ? value.feed.map((entry) => normalizeFeedEntry(entry))
        : fallback.feed,
    assignments:
      Array.isArray(value.assignments) && value.assignments.length > 0
        ? value.assignments.map((assignment) => normalizeAssignment(assignment))
        : fallback.assignments,
    participants:
      Array.isArray(value.participants) && value.participants.length > 0
        ? value.participants.map((participant) => normalizeParticipant(participant))
        : fallback.participants,
    updatedAt: typeof value.updatedAt === 'string' && value.updatedAt ? value.updatedAt : fallback.updatedAt,
  }
}

export function getLinkedParticipantNames(participants: AdminParticipant[], linkedParticipantIds: string[]) {
  if (!linkedParticipantIds.length) return []

  const participantMap = new Map(participants.map((participant) => [participant.id, participant]))
  return linkedParticipantIds
    .map((participantId) => participantMap.get(participantId)?.name || null)
    .filter((name): name is string => Boolean(name))
}

export function stripTrackIcons(tracks: ForgeTrack[]): EditableForgeTrack[] {
  return tracks.map((track) => ({
    id: track.id,
    label: track.label,
    slug: track.slug,
    title: track.title,
    tagline: track.tagline,
    summary: track.summary,
    focus: track.focus,
    focusAreas: [...track.focusAreas],
    outcomes: track.outcomes ? [...track.outcomes] : undefined,
    tools: track.tools ? [...track.tools] : undefined,
    equityFormula: track.equityFormula ? { ...track.equityFormula } : undefined,
    openings: [...track.openings],
    cohortWindow: track.cohortWindow,
    linkedParticipantIds: [...track.linkedParticipantIds],
  }))
}

export function cloneProject(project: ForgeProject): EditableForgeProject {
  return {
    ...project,
    outcomes: [...project.outcomes],
    linkedParticipantIds: [],
  }
}

import type {
  ForgeEntityAffiliation,
  ForgeLocationNode,
  ForgeParticipantProfile,
  ForgeWorkItem,
} from '@/lib/types'

export const seedLocationNodes: ForgeLocationNode[] = [
  {
    id: 'node-mke-fab',
    name: 'Milwaukee Fabrication & Repair Lab',
    city: 'Milwaukee',
    state: 'WI',
    facilityType: 'fab_lab',
    address: '1920 W Wells St, Milwaukee, WI 53233',
    lat: 43.0389,
    lng: -87.9275,
    isUniversityProximity: true,
    universityName: 'Marquette University & UW-Milwaukee',
  },
  {
    id: 'node-atl-innovation',
    name: 'Atlanta Fintech & Hardware Hub',
    city: 'Atlanta',
    state: 'GA',
    facilityType: 'software_hub',
    address: 'North Ave NW, Atlanta, GA 30332',
    lat: 33.7756,
    lng: -84.3963,
    isUniversityProximity: true,
    universityName: 'Georgia Tech',
  },
  {
    id: 'node-runpod-gpu',
    name: 'Remote GPU AI Production Cluster',
    city: 'Cloud / Remote',
    state: 'Global',
    facilityType: 'gpu_cluster',
    address: 'RunPod Serverless Compute Layer',
  },
  {
    id: 'node-beam-cloud',
    name: 'BEAM Network Operations Center',
    city: 'Cloud Fleet',
    state: 'Multi-Site',
    facilityType: 'software_hub',
    address: 'Vercel / Firebase Multi-Subdomain Infrastructure',
  },
]

export const seedEntityAffiliations: ForgeEntityAffiliation[] = [
  {
    id: 'entity-beam',
    name: 'BEAM Think Tank Core Stack',
    shortName: 'BEAM Core',
    kind: 'beam_core',
    description: 'Internal BEAM NGO ecosystem development, venture stack, and equity ledger engine.',
    websiteUrl: 'https://beamthinktank.space',
  },
  {
    id: 'entity-readyaimgo',
    name: 'Readyaimgo Business Services',
    shortName: 'Readyaimgo',
    kind: 'corporate_client',
    description: 'Client delivery partner managing AI pipelines, media automation, and external software contracts.',
    websiteUrl: 'https://readyaimgo.biz',
  },
  {
    id: 'entity-mke-black',
    name: 'MKE Black Digital Platform',
    shortName: 'MKE Black',
    kind: 'ngo_partner',
    description: 'Community NGO business directory and application platform operating in Milwaukee.',
    websiteUrl: 'https://mkeblack.org',
  },
  {
    id: 'entity-bdo',
    name: 'Black Diaspora Symphony Orchestra Network',
    shortName: 'BDSO / Orchestra',
    kind: 'ngo_partner',
    description: 'Cultural arts & music partner organization collaborating on media production and contract projects.',
  },
  {
    id: 'entity-community-device',
    name: 'Community Device Access Program',
    shortName: 'Device Access Program',
    kind: 'ngo_partner',
    description: 'Grassroots hardware recycling and refurbishment initiative providing low-cost devices.',
  },
]

export const seedWorkItems: ForgeWorkItem[] = [
  {
    id: 'work-condesa-coffee-app',
    title: 'Condesa Coffee Mobile Ordering & Loyalty App',
    summary: 'Discovery, UX wireframing, and initial mobile ordering API scoping for Condesa Coffee client engagement.',
    trackId: 'software',
    projectId: 'condesa-coffee-app',
    githubRepoUrl: 'https://github.com/ezrarag/condesa-coffee-app',
    contextProfile: {
      clientContacted: true,
      contractSigned: true,
      statusLabel: 'Discovery & Scoping',
      clientName: 'Condesa Coffee',
    },
    deliverableType: 'code',
    status: 'scoping',
    locationNode: seedLocationNodes[1]!,
    entityAffiliation: seedEntityAffiliations[1]!,
    assignedParticipants: [],
    requiredSkills: ['React Native / Next.js', 'Mobile Payment APIs', 'UX Scoping', 'Tailwind'],
    toolsRequired: ['Figma', 'VS Code', 'Stripe SDK'],
    compensation: {
      cashUsd: 650,
      beamCoins: 15,
      label: '$650 Cash + 15 BEAM Coins',
    },
    dueDate: '2026-05-01',
  },
  {
    id: 'work-mke-vendor-directory',
    title: 'MKE Black Vendor Directory & Map API',
    summary: 'Backend geo-json lookup endpoints and React map view awaiting assigned developer.',
    trackId: 'software',
    projectId: 'mke-black-digital-platform',
    githubRepoUrl: 'https://github.com/ezrarag/mke-black-platform',
    contextProfile: {
      clientContacted: true,
      contractSigned: true,
      statusLabel: 'Contract Signed',
      clientName: 'MKE Black',
    },
    deliverableType: 'code',
    status: 'awaiting_assignment',
    locationNode: seedLocationNodes[0]!,
    entityAffiliation: seedEntityAffiliations[2]!,
    assignedParticipants: [],
    requiredSkills: ['Next.js', 'TypeScript', 'Mapbox GEO JSON', 'REST API'],
    toolsRequired: ['VS Code', 'GitHub', 'Mapbox GL'],
    compensation: {
      cashUsd: 450,
      beamCoins: 10,
      label: '$450 Cash + 10 BEAM Coins',
    },
    dueDate: '2026-04-20',
  },
  {
    id: 'work-rag-kiosk-firmware',
    title: 'Readyaimgo Self-Service Kiosk Hardware Firmware',
    summary: 'Hardware controller wiring and micro-controller code for community kiosk hardware.',
    trackId: 'fabrication',
    projectId: 'rag-kiosk-hardware',
    githubRepoUrl: 'https://github.com/ezrarag/rag-kiosk-firmware',
    contextProfile: {
      clientContacted: true,
      contractSigned: false,
      statusLabel: 'Client Contacted',
      clientName: 'Readyaimgo Biz',
    },
    deliverableType: 'hardware_prototype',
    status: 'discovery',
    locationNode: seedLocationNodes[0]!,
    entityAffiliation: seedEntityAffiliations[1]!,
    assignedParticipants: [],
    requiredSkills: ['Microcontroller C++', 'Circuit Soldering', 'Hardware Specs'],
    toolsRequired: ['Soldering Station', 'Arduino IDE', 'Multimeter'],
    compensation: {
      cashUsd: 350,
      beamCoins: 8,
      label: '$350 Cash + 8 BEAM Coins',
    },
    dueDate: '2026-05-15',
  },
  {
    id: 'work-mke-black-app',
    title: 'MKE Black App Directory & API Integration',
    summary: 'Build and optimize the business directory lookup, filtering, and map components for the MKE Black platform.',
    trackId: 'software',
    projectId: 'mke-black-digital-platform',
    githubRepoUrl: 'https://github.com/ezrarag/mke-black-app',
    contextProfile: {
      clientContacted: true,
      contractSigned: true,
      statusLabel: 'In Execution',
      clientName: 'MKE Black',
    },
    deliverableType: 'code',
    status: 'claimed',
    locationNode: seedLocationNodes[0]!,
    entityAffiliation: seedEntityAffiliations[2]!,
    assignedParticipants: [
      { id: 'p-ezra', name: 'Ezra Haugabrooks', email: 'ezra@readyaimgo.biz', role: 'Full-stack Lead', status: 'Active', headline: 'BEAM Ecosystem Steward', notes: '' },
    ],
    requiredSkills: ['React', 'Next.js', 'TypeScript', 'Mapbox / Geo JSON'],
    toolsRequired: ['VS Code', 'GitHub', 'Tailwind CSS'],
    compensation: {
      cashUsd: 450,
      beamCoins: 12,
      label: '$450 Paid Milestone + 12 BEAM Coins',
    },
    dueDate: '2026-04-15',
    claimedByUid: 'demo-ezra',
    claimedByName: 'Ezra Haugabrooks',
    claimedAt: '2026-03-10',
  },
  {
    id: 'work-runpod-comfyui-pipeline',
    title: 'ComfyUI Video & Transcribe Production Pipeline',
    summary: 'Deploy GPU serverless workflows on RunPod for video generation, transcription, and social cut outputs.',
    trackId: 'content-production',
    projectId: 'runpod-comfyui-pipeline',
    githubRepoUrl: 'https://github.com/ezrarag/comfyui-pipeline',
    contextProfile: {
      clientContacted: true,
      contractSigned: true,
      statusLabel: 'Active Pipeline',
      clientName: 'Readyaimgo',
    },
    deliverableType: 'content_video',
    status: 'open',
    locationNode: seedLocationNodes[2]!,
    entityAffiliation: seedEntityAffiliations[1]!,
    assignedParticipants: [],
    requiredSkills: ['ComfyUI', 'RunPod GPU', 'Veo3', 'CapCut Pro'],
    toolsRequired: ['RunPod', 'Python', 'CapCut Pro'],
    compensation: {
      cashUsd: 300,
      beamCoins: 8,
      label: '$300 Billed Rate + 8 BEAM Coins',
    },
    dueDate: '2026-04-30',
  },
  {
    id: 'work-repair-clinic-intake',
    title: 'Refurbished Device Triage & Bench Repair SOP',
    summary: 'Establish physical intake checklist, component testing benchmarks, and repair logging for community hardware.',
    trackId: 'fabrication',
    projectId: 'repair-clinic-pilot',
    githubRepoUrl: 'https://github.com/ezrarag/community-device-triage',
    contextProfile: {
      clientContacted: true,
      contractSigned: false,
      statusLabel: 'Active Intake',
      clientName: 'Community Access',
    },
    deliverableType: 'repair',
    status: 'open',
    locationNode: seedLocationNodes[0]!,
    entityAffiliation: seedEntityAffiliations[4]!,
    assignedParticipants: [],
    requiredSkills: ['Hardware Triage', 'Soldering', 'Bench Diagnostics', 'Technical Writing'],
    toolsRequired: ['Soldering Station', 'Multimeter', 'iFixit Toolkit'],
    compensation: {
      cashUsd: 250,
      beamCoins: 6,
      label: '$250 Stipend + 6 BEAM Coins',
    },
    dueDate: '2026-05-10',
  },
  {
    id: 'work-equity-ledger-module',
    title: 'Equity Ledger Cap Table Export Module',
    summary: 'Implement participant equity distribution calculations and cap table summary exports in the Fintech ledger.',
    trackId: 'fintech',
    projectId: 'equity-ledger-core',
    githubRepoUrl: 'https://github.com/ezrarag/equity-ledger',
    contextProfile: {
      clientContacted: true,
      contractSigned: true,
      statusLabel: 'Core Dev',
      clientName: 'BEAM Core',
    },
    deliverableType: 'fintech_ledger',
    status: 'open',
    locationNode: seedLocationNodes[1]!,
    entityAffiliation: seedEntityAffiliations[0]!,
    assignedParticipants: [],
    requiredSkills: ['Cap Table Accounting', 'TypeScript', 'Firestore Rules', 'Fintech Security'],
    toolsRequired: ['Next.js', 'Firebase Admin', 'Stripe API'],
    compensation: {
      cashUsd: 500,
      beamCoins: 10,
      equityCredits: 25,
      label: '$500 Cash + 10 BEAM Coins',
    },
    dueDate: '2026-04-22',
  },
  {
    id: 'work-beam-network-hardening',
    title: 'BEAM Fleet Endpoint Security & Segmentation',
    summary: 'Configure wifi VLAN segmentation, device recovery runbooks, and admin key rotation across NGO endpoints.',
    trackId: 'it',
    projectId: 'beam-network-hardening',
    githubRepoUrl: 'https://github.com/ezrarag/beam-fleet-security',
    contextProfile: {
      clientContacted: true,
      contractSigned: true,
      statusLabel: 'Active Hardening',
      clientName: 'BEAM Infrastructure',
    },
    deliverableType: 'it_spec',
    status: 'claimed',
    locationNode: seedLocationNodes[3]!,
    entityAffiliation: seedEntityAffiliations[0]!,
    assignedParticipants: [
      { id: 'p-jordan', name: 'Jordan / Infrastructure Ops', email: 'jordan@readyaimgo.biz', role: 'IT Lead', status: 'Active', headline: 'Systems Admin', notes: '' },
    ],
    requiredSkills: ['Network Hardening', 'UniFi / Router Config', 'Device Fleet Management'],
    toolsRequired: ['SSH', 'WireGuard', '1Password'],
    compensation: {
      cashUsd: 350,
      beamCoins: 4,
      label: '$350 Cash + 4 BEAM Coins',
    },
    dueDate: '2026-04-05',
    claimedByUid: 'demo-it-lead',
    claimedByName: 'Jordan / Infrastructure Ops',
    claimedAt: '2026-03-15',
  },
]

export function buildInitialParticipantProfile(params: {
  uid: string
  email?: string | null
  displayName?: string | null
  role?: string | null
}): ForgeParticipantProfile {
  return {
    uid: params.uid,
    displayName: params.displayName || 'BEAM Forge Member',
    email: params.email || '',
    role: params.role || 'Community Builder & Fabricator',
    bio: 'Active participant building software, hardware fabrication, and fintech infrastructure in the BEAM network.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    isVerified: true,
    targetLocations: [seedLocationNodes[0]!, seedLocationNodes[1]!],
    attachedWorkSites: [
      {
        siteId: seedLocationNodes[0]!.id,
        siteName: seedLocationNodes[0]!.name,
        city: seedLocationNodes[0]!.city,
        state: seedLocationNodes[0]!.state,
        attachedAt: '2026-03-01',
        skillsOrCapacities: ['Soldering', 'Next.js Delivery', 'Component Triage'],
        notifyOnWorkAvailable: true,
      },
    ],
    skills: ['Next.js', 'TypeScript', 'Hardware Triage', 'ComfyUI Video', 'Fintech Ledgers'],
    tools: ['VS Code', 'RunPod', 'Soldering Station', 'CapCut Pro'],
    sweatEquityHours: 72,
    earnedCashUsd: 1450,
    earnedBeamCoins: 26,
    claimedWorkItemIds: ['work-mke-black-app'],
  }
}

