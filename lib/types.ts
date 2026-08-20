import type { Timestamp } from 'firebase/firestore'
import type { LucideIcon } from 'lucide-react'

export type ForgeTrackId = 'fintech' | 'software' | 'fabrication' | 'it' | 'content-production'
export type ForgeCategorySlug = 'digital' | 'fabrication' | 'ai-production' | 'fintech' | 'content'

export interface ForgeCategory {
  id: string
  slug: ForgeCategorySlug
  label: string
  description: string
  colorAccent: string
  icon: LucideIcon
  openRoles: string[]
  trackIds: ForgeTrackId[]
}

export interface ForgeTrackEquityFormula {
  internalBEAM: string
  clientFacing: string
}

export type MembershipRole = 'student' | 'business' | 'community'

export interface ForgeSlide {
  id: string
  eyebrow: string
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
  metric: string
  accent: string
}

export interface ForgeTrack {
  id: ForgeTrackId
  label?: string
  slug?: string
  title: string
  tagline: string
  summary: string
  focus?: string
  focusAreas: string[]
  outcomes?: string[]
  tools?: string[]
  equityFormula?: ForgeTrackEquityFormula
  openings: string[]
  cohortWindow: string
  linkedParticipantIds: string[]
  icon: LucideIcon
}

export interface EditableForgeTrack {
  id: ForgeTrackId
  label?: string
  slug?: string
  title: string
  tagline: string
  summary: string
  focus?: string
  focusAreas: string[]
  outcomes?: string[]
  tools?: string[]
  equityFormula?: ForgeTrackEquityFormula
  openings: string[]
  cohortWindow: string
  linkedParticipantIds: string[]
}

export interface ForgeProject {
  id: string
  title: string
  track: ForgeTrackId
  phase: 'Active' | 'Pipeline' | 'Archived'
  partner: string
  compensation: string
  summary: string
  outcomes: string[]
}

export interface EditableForgeProject extends ForgeProject {
  linkedParticipantIds: string[]
}

export interface FeedEntry {
  id: string
  type: 'fabrication-log' | 'launch' | 'cohort-output' | 'client-delivery'
  title: string
  summary: string
  publishedAt: string
  track: ForgeTrackId
  author: string
  panels: string[]
}

export interface EditableFeedEntry extends FeedEntry {
  linkedParticipantIds: string[]
}

export interface MemberAssignment {
  id: string
  title: string
  owner: string
  status: string
  payment: string
  linkedParticipantIds: string[]
}

export interface AdminParticipant {
  id: string
  name: string
  email: string
  role: string
  status: string
  headline: string
  notes: string
}

export interface ForgeContentSnapshot {
  slides: ForgeSlide[]
  tracks: EditableForgeTrack[]
  projects: EditableForgeProject[]
  feed: EditableFeedEntry[]
  assignments: MemberAssignment[]
  participants: AdminParticipant[]
  updatedAt: string
}

export interface BeamRoleTask {
  id?: string
  title?: string
  description?: string
  status?: string
  dueAt?: string
}

export interface BeamRole {
  id?: string
  roleId?: string
  clientId?: string
  clientName?: string
  roleTitle?: string
  summary?: string
  cityHint?: string
  requirements?: string[]
  requirementTags?: string[]
  timebox?: string
  tasks?: BeamRoleTask[]
  status?: string
  publishedAt?: string
}

export interface BeamHandoffRecord {
  uid: string
  email: string | null
  displayName: string | null
  completedAt: string
  scenarioLabel: string
  role: MembershipRole
  sourceType: string
  sourceSystem: string
  entryChannel: string
  sourceDocumentId: string
  sourceStoryId: string
  organizationId: string
  organizationName: string
  cohortId: string
  cohortName: string
  siteUrl: string
  landingPageUrl: string
  referrerUrl: string
  redirectTarget: 'dashboard' | 'role_onboarding'
}

export interface ParticipantOnboardingProfile {
  role?: string
  interests?: string[]
  focus?: string[]
  engagement?: string
  completedAt?: string
}

export interface ParticipantArea {
  id: string
  name: string
  shortName?: string
  description: string
  href?: string
  kind: 'organization' | 'work_context'
  tags: string[]
  linkedOrganizationIds?: string[]
  source: 'catalog' | 'handoff' | 'readyaimgo'
}

export interface ParticipantCohortCard {
  id: string
  name: string
  description: string
  status: string
  organizationIds: string[]
  source: 'seed' | 'handoff'
}

export interface ParticipantDashboardPreferences {
  activeOrganizationId: string | null
  activeWorkContextId: string | null
  interestedOrganizationIds: string[]
  interestedWorkContextIds: string[]
}

export interface WorkContextResolutionState {
  method: string
  usedFallback: boolean
  reason?: string
}

export interface ForgeMemberSnapshot {
  handoff: BeamHandoffRecord | null
  onboarding: ParticipantOnboardingProfile | null
  roles: BeamRole[]
  organizations: ParticipantArea[]
  workContexts: ParticipantArea[]
  cohorts: ParticipantCohortCard[]
  preferences: ParticipantDashboardPreferences
  matchedClientName: string | null
  workContextResolution: WorkContextResolutionState | null
}

export type ForgeContentProjectType =
  | 'ngo_clip'
  | 'client_explainer'
  | 'interview'
  | 'social_cut'
  | 'blueprint_still'
  | 'other'

export type ForgeContentProjectStatus = 'submitted' | 'in_production' | 'review' | 'delivered' | 'archived'

export interface ForgeContentProject {
  id: string
  title: string
  projectType: ForgeContentProjectType
  ngoOrClient: string
  brief: string
  assetsAvailable: string[]
  budget: string
  submitterName: string
  submitterEmail: string
  status: ForgeContentProjectStatus
  assignedTo?: string[]
  deliverableUrls?: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ForgeLocationNode {
  id: string
  name: string
  city: string
  state: string
  facilityType: 'fab_lab' | 'software_hub' | 'gpu_cluster' | 'client_site' | 'remote'
  address?: string
  lat?: number
  lng?: number
  isUniversityProximity?: boolean
  universityName?: string
}

export interface ForgeEntityAffiliation {
  id: string
  name: string
  shortName: string
  kind: 'beam_core' | 'ngo_partner' | 'corporate_client' | 'academic_institution'
  logoUrl?: string
  description?: string
  websiteUrl?: string
}

export interface ForgeWorkSiteAttachment {
  siteId: string
  siteName: string
  city: string
  state: string
  attachedAt: string
  skillsOrCapacities: string[]
  notifyOnWorkAvailable: boolean
}

export type ForgeWorkItemStatus =
  | 'scoping'
  | 'discovery'
  | 'awaiting_assignment'
  | 'open'
  | 'claimed'
  | 'in_review'
  | 'completed'

export type ForgeDeliverableType = 'code' | 'hardware_prototype' | 'repair' | 'content_video' | 'fintech_ledger' | 'it_spec'

export interface ForgeWorkItemCompensation {
  cashUsd?: number
  equityCredits?: number
  beamCoins?: number
  label: string
}

export interface ForgeWorkItemContextProfile {
  clientContacted: boolean
  contractSigned: boolean
  statusLabel?: string
  clientName?: string
}

export interface ForgeWorkItem {
  id: string
  title: string
  summary: string
  trackId: ForgeTrackId
  projectId?: string
  githubRepoUrl?: string
  contextProfile?: ForgeWorkItemContextProfile
  deliverableType: ForgeDeliverableType
  status: ForgeWorkItemStatus
  locationNode: ForgeLocationNode
  entityAffiliation: ForgeEntityAffiliation
  assignedParticipants: AdminParticipant[]
  requiredSkills: string[]
  toolsRequired?: string[]
  compensation: ForgeWorkItemCompensation
  dueDate?: string
  claimedByUid?: string
  claimedByName?: string
  claimedAt?: string
}

export interface ForgeParticipantProfile {
  uid: string
  displayName: string
  email: string
  role: string
  bio: string
  avatarUrl: string
  isVerified: boolean
  targetLocations: ForgeLocationNode[]
  attachedWorkSites: ForgeWorkSiteAttachment[]
  skills: string[]
  tools: string[]
  sweatEquityHours: number
  earnedCashUsd: number
  earnedBeamCoins: number
  claimedWorkItemIds: string[]
}

