import type { User } from 'firebase/auth'
import { arrayUnion, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getForgeOrganizationContext } from '@/lib/beam-home'
import { db } from '@/lib/firebase'

const BEAM_RETURN_HASH_FLAG = 'beamAuthReturn'
const BEAM_RETURN_ID_TOKEN_HASH_KEY = 'beamIdToken'
const BEAM_RETURN_ID_TOKEN_STORAGE_KEY = 'beam-return-id-token'

interface FirebaseIdTokenClaims {
  exp?: number
  sub?: string
  user_id?: string
  email?: string
  name?: string
  picture?: string
}

interface FirestoreValue {
  stringValue?: string
  integerValue?: string
  doubleValue?: number
  booleanValue?: boolean
  nullValue?: null
  timestampValue?: string
  mapValue?: {
    fields?: Record<string, FirestoreValue>
  }
  arrayValue?: {
    values?: FirestoreValue[]
  }
}

interface FirestoreDocument {
  fields?: Record<string, FirestoreValue>
}

export interface BeamReturnSession {
  idToken: string
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  expiresAt: number | null
}

export type BeamReturnSessionStatus = 'none' | 'connected' | 'stored' | 'invalid' | 'expired'

export interface ForgeMembershipRecord {
  id: 'forge'
  site: 'forge'
  label: string
  organizationId: string
  organizationName: string
  entryChannel: string
  siteUrl: string
  status: 'active'
}

function decodeBase64Url(value: string) {
  if (typeof window === 'undefined') return null

  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const decoded = window.atob(padded)
    const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

function parseBeamReturnSession(idToken: string): BeamReturnSession | null {
  const [, payload] = idToken.split('.')
  if (!payload) return null

  const decodedPayload = decodeBase64Url(payload)
  if (!decodedPayload) return null

  try {
    const claims = JSON.parse(decodedPayload) as FirebaseIdTokenClaims
    const uid = claims.user_id?.trim() || claims.sub?.trim() || ''

    if (!uid) return null

    return {
      idToken,
      uid,
      email: claims.email ?? null,
      displayName: claims.name ?? null,
      photoURL: claims.picture ?? null,
      expiresAt: typeof claims.exp === 'number' ? claims.exp * 1000 : null,
    }
  } catch {
    return null
  }
}

function isExpired(session: BeamReturnSession) {
  return session.expiresAt !== null && session.expiresAt <= Date.now()
}

export function clearBeamReturnSession() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(BEAM_RETURN_ID_TOKEN_STORAGE_KEY)
}

function clearStoredBeamReturnToken() {
  clearBeamReturnSession()
}

function readStoredBeamReturnToken() {
  if (typeof window === 'undefined') return null
  return window.sessionStorage.getItem(BEAM_RETURN_ID_TOKEN_STORAGE_KEY)?.trim() || null
}

function decodeFirestoreValue(value: FirestoreValue): unknown {
  if ('stringValue' in value) return value.stringValue ?? ''
  if ('integerValue' in value) return Number(value.integerValue ?? '0')
  if ('doubleValue' in value) return value.doubleValue ?? 0
  if ('booleanValue' in value) return Boolean(value.booleanValue)
  if ('timestampValue' in value) return value.timestampValue ?? null
  if ('nullValue' in value) return null

  if (value.arrayValue) {
    return (value.arrayValue.values ?? []).map((entry) => decodeFirestoreValue(entry))
  }

  if (value.mapValue) {
    return decodeFirestoreFields(value.mapValue.fields)
  }

  return null
}

function decodeFirestoreFields(fields?: Record<string, FirestoreValue>) {
  return Object.fromEntries(
    Object.entries(fields ?? {}).map(([key, value]) => [key, decodeFirestoreValue(value)])
  )
}

function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null }
  if (typeof value === 'string') return { stringValue: value }
  if (typeof value === 'boolean') return { booleanValue: value }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value }
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((entry) => toFirestoreValue(entry)),
      },
    }
  }

  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: toFirestoreFields(value as Record<string, unknown>),
      },
    }
  }

  return { stringValue: String(value) }
}

function toFirestoreFields(value: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, toFirestoreValue(entry)]))
}

function getProjectId() {
  return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || ''
}

function getFirestoreDocumentUrl(documentPath: string) {
  const projectId = getProjectId()
  if (!projectId) return null
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${documentPath}`
}

function getFirestoreCommitUrl() {
  const projectId = getProjectId()
  if (!projectId) return null
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`
}

function getFirestoreDocumentName(documentPath: string) {
  const projectId = getProjectId()
  if (!projectId) return null
  return `projects/${projectId}/databases/(default)/documents/${documentPath}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isForgeMembershipEntry(value: unknown) {
  const { organizationId, entryChannel } = getForgeOrganizationContext()

  if (typeof value === 'string') {
    return value === 'forge' || value === organizationId || value === entryChannel
  }

  if (!isRecord(value)) return false

  return (
    value.id === 'forge' ||
    value.site === 'forge' ||
    value.organizationId === organizationId ||
    value.entryChannel === entryChannel
  )
}

function hasForgeMembership(memberships: unknown) {
  return Array.isArray(memberships) && memberships.some((membership) => isForgeMembershipEntry(membership))
}

async function readFirestoreDocumentWithBeamToken<T>(idToken: string, documentPath: string): Promise<T | null> {
  const endpoint = getFirestoreDocumentUrl(documentPath)
  if (!endpoint) return null

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as FirestoreDocument
    return decodeFirestoreFields(payload.fields) as T
  } catch {
    return null
  }
}

async function commitFirestoreWritesWithBeamToken(idToken: string, writes: unknown[]) {
  const endpoint = getFirestoreCommitUrl()
  if (!endpoint) return

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ writes }),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Firestore write failed with status ${response.status}`)
  }
}

async function ensureForgeMembershipWithFirebaseUser(user: User) {
  if (!db) return

  const userRef = doc(db, 'users', user.uid)
  const snapshot = await getDoc(userRef)
  const existingData = snapshot.data() || {}

  const payload: Record<string, unknown> = {
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    memberships: arrayUnion('forge'),
    lastLoginAt: serverTimestamp(),
    bio: existingData.bio ?? '',
    skills: existingData.skills ?? [],
    availability: existingData.availability ?? 'project-basis',
    preferredRoles: existingData.preferredRoles ?? [],
    workStyle: existingData.workStyle ?? '',
    portfolioUrl: existingData.portfolioUrl ?? '',
    githubHandle: existingData.githubHandle ?? '',
    contactPreference: existingData.contactPreference ?? 'email',
    activeProjectIds: existingData.activeProjectIds ?? [],
  }

  if (!Array.isArray(existingData.roles) || existingData.roles.length === 0) {
    payload.roles = ['participant']
  }

  await setDoc(userRef, payload, { merge: true })
}

async function ensureForgeMembershipWithBeamReturn(session: BeamReturnSession) {
  const currentUserDoc = await readFirestoreDocumentWithBeamToken<{ memberships?: unknown[] }>(
    session.idToken,
    `users/${session.uid}`
  )

  if (hasForgeMembership(currentUserDoc?.memberships)) {
    return
  }

  const document = getFirestoreDocumentName(`users/${session.uid}`)
  if (!document) return

  await commitFirestoreWritesWithBeamToken(session.idToken, [
    {
      update: {
        name: document,
        fields: toFirestoreFields({
          memberships: [...(Array.isArray(currentUserDoc?.memberships) ? currentUserDoc.memberships : []), buildForgeMembershipRecord()],
        }),
      },
      updateMask: {
        fieldPaths: ['memberships'],
      },
    },
  ])
}

export function buildForgeMembershipRecord(): ForgeMembershipRecord {
  const { organizationId, organizationName, entryChannel, siteUrl } = getForgeOrganizationContext()

  return {
    id: 'forge',
    site: 'forge',
    label: organizationName,
    organizationId,
    organizationName,
    entryChannel,
    siteUrl,
    status: 'active',
  }
}

export async function ensureForgeMembership(params: {
  authUser?: User | null
  beamSession?: BeamReturnSession | null
}) {
  if (params.authUser?.uid) {
    await ensureForgeMembershipWithFirebaseUser(params.authUser)
    return
  }

  if (params.beamSession?.uid) {
    await ensureForgeMembershipWithBeamReturn(params.beamSession)
  }
}

export function syncBeamReturnSessionFromUrl(): BeamReturnSessionStatus {
  if (typeof window === 'undefined') return 'none'

  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash
  if (!hash) {
    return readBeamReturnSession() ? 'stored' : 'none'
  }

  const hashParams = new URLSearchParams(hash)
  if (hashParams.get(BEAM_RETURN_HASH_FLAG) !== '1') {
    return readBeamReturnSession() ? 'stored' : 'none'
  }

  const idToken = hashParams.get(BEAM_RETURN_ID_TOKEN_HASH_KEY)?.trim() || ''
  window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`)

  if (!idToken) {
    clearStoredBeamReturnToken()
    return 'invalid'
  }

  const session = parseBeamReturnSession(idToken)
  if (!session) {
    clearStoredBeamReturnToken()
    return 'invalid'
  }

  if (isExpired(session)) {
    clearStoredBeamReturnToken()
    return 'expired'
  }

  window.sessionStorage.setItem(BEAM_RETURN_ID_TOKEN_STORAGE_KEY, idToken)
  return 'connected'
}

export function readBeamReturnSession() {
  const idToken = readStoredBeamReturnToken()
  if (!idToken) return null

  const session = parseBeamReturnSession(idToken)
  if (!session || isExpired(session)) {
    clearStoredBeamReturnToken()
    return null
  }

  return session
}

export async function readProfileDocWithBeamToken<T>(idToken: string, uid: string, docId: string): Promise<T | null> {
  return readFirestoreDocumentWithBeamToken<T>(idToken, `users/${uid}/profiles/${docId}`)
}
