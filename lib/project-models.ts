import type { Timestamp } from 'firebase/firestore'

export interface ProjectDeliverable {
  label: string
  done: boolean
}

export interface LiveForgeProject {
  id: string
  clientName: string
  status: string
  sourceNgo: string
  techStack: string[]
  openRoles: string[]
  cohort: string[]
  githubRepoUrl: string
  deliverables: ProjectDeliverable[]
}

export interface ProjectApplication {
  id: string
  projectId: string
  projectName: string
  applicantUid: string
  applicantEmail: string
  proposedRole: string
  buildProposal: string
  availableHours: number
  portfolioUrl: string
  githubHandle: string
  contactPreference: 'email' | 'in-app' | 'both'
  status: 'pending' | 'accepted' | 'declined'
  createdAt?: Timestamp | null
}

export interface ParticipantProfileData {
  displayName: string
  photoURL: string
  email: string
  bio: string
  skills: string[]
  availability: string
  preferredRoles: string[]
  workStyle: string
  portfolioUrl: string
  githubHandle: string
  activeProjectIds: string[]
  roles: string[]
}

function stringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

export function stringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())) : []
}

export function normalizeDeliverables(value: unknown): ProjectDeliverable[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (typeof item === 'string') return [{ label: item, done: false }]
    if (!item || typeof item !== 'object' || Array.isArray(item)) return []

    const data = item as Record<string, unknown>
    const label = stringValue(data.label) || stringValue(data.title) || stringValue(data.name)
    if (!label) return []
    const status = stringValue(data.status).toLowerCase()
    return [{ label, done: data.done === true || status === 'done' || status === 'complete' || status === 'completed' }]
  })
}

export function normalizeLiveProject(id: string, value: Record<string, unknown>): LiveForgeProject {
  return {
    id,
    clientName: stringValue(value.clientName) || stringValue(value.title) || 'Untitled Forge project',
    status: stringValue(value.status, 'unknown'),
    sourceNgo: stringValue(value.sourceNgo, 'forge'),
    techStack: stringArray(value.techStack),
    openRoles: stringArray(value.openRoles),
    cohort: stringArray(value.cohort),
    githubRepoUrl: stringValue(value.githubRepoUrl),
    deliverables: normalizeDeliverables(value.deliverables),
  }
}

export function mergeParticipantProfile(user: Record<string, unknown>, profile: Record<string, unknown>): ParticipantProfileData {
  return {
    displayName: stringValue(profile.displayName) || stringValue(user.displayName) || 'Forge participant',
    photoURL: stringValue(profile.photoURL) || stringValue(user.photoURL),
    email: stringValue(profile.email) || stringValue(user.email),
    bio: stringValue(profile.bio) || stringValue(user.bio),
    skills: stringArray(profile.skills).length ? stringArray(profile.skills) : stringArray(user.skills),
    availability: stringValue(profile.availability) || stringValue(user.availability, 'project-basis'),
    preferredRoles: stringArray(profile.preferredRoles).length ? stringArray(profile.preferredRoles) : stringArray(user.preferredRoles),
    workStyle: stringValue(profile.workStyle) || stringValue(user.workStyle),
    portfolioUrl: stringValue(profile.portfolioUrl) || stringValue(user.portfolioUrl),
    githubHandle: stringValue(profile.githubHandle) || stringValue(user.githubHandle),
    activeProjectIds: stringArray(user.activeProjectIds),
    roles: stringArray(user.roles).map((role) => role.toLowerCase()),
  }
}
