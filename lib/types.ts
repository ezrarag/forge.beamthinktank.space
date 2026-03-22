import type { LucideIcon } from 'lucide-react'

export type ForgeTrackId = 'fintech' | 'software' | 'fabrication' | 'it'

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
  title: string
  tagline: string
  summary: string
  focusAreas: string[]
  openings: string[]
  cohortWindow: string
  icon: LucideIcon
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

