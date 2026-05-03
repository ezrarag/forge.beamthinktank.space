import type { FieldValue } from 'firebase/firestore'
import type { ForgeContentProject, ForgeContentProjectType } from '@/lib/types'

export const contentTrackInviteUrl =
  'https://home.beamthinktank.space/onboard/handoff?role=community&sourceType=ngo_site&sourceSystem=beam&entryChannel=forge.beamthinktank.space&organizationId=org_beam_forge&organizationName=BEAM+Forge&cohortId=cohort_beam_forge_launch&cohortName=Forge+Launch+Cohort&siteUrl=https%3A%2F%2Fforge.beamthinktank.space&landingPageUrl=https%3A%2F%2Fforge.beamthinktank.space%2Fdashboard&redirectTarget=dashboard&scenarioLabel=BEAM+Forge'

export const contentProjectTypeOptions: Array<{ value: ForgeContentProjectType; label: string }> = [
  { value: 'ngo_clip', label: 'NGO identity clip' },
  { value: 'client_explainer', label: 'Client explainer' },
  { value: 'interview', label: 'Interview' },
  { value: 'social_cut', label: 'Social cut' },
  { value: 'blueprint_still', label: 'Blueprint still' },
  { value: 'other', label: 'Other' },
]

export const contentProjectAssetOptions = ['Archive photos', 'Real footage', 'Scripts written', 'None yet']

export const contentProjectBudgetOptions = ['$0 internal', '$100–500', '$500–2000', 'Custom']

export const fallbackContentProjects: Array<Pick<ForgeContentProject, 'id' | 'title' | 'status'>> = [
  { id: 'ngo-clip-orchestra', title: 'Orchestra clip', status: 'in_production' },
  { id: 'ngo-clip-band', title: 'Band clip', status: 'in_production' },
  { id: 'ngo-clip-choir', title: 'Choir clip', status: 'in_production' },
  { id: 'ngo-clip-forge', title: 'Forge clip', status: 'in_production' },
  { id: 'ngo-clip-finance', title: 'Finance clip', status: 'in_production' },
  { id: 'ngo-clip-architecture', title: 'Architecture clip', status: 'in_production' },
]

export type ForgeContentProjectWrite = Omit<ForgeContentProject, 'createdAt' | 'updatedAt'> & {
  createdAt: FieldValue
  updatedAt: FieldValue
}

/*
Manual Firestore seed data for forgeContentProjects. Create these documents directly in Firestore;
the app must not auto-seed them on page load.

ngo-clip-orchestra: title "Orchestra clip", projectType "ngo_clip", ngoOrClient "BEAM Orchestra",
brief "Seed project for a 15-second identity clip supporting the BEAM Orchestra NGO presence.",
assetsAvailable ["Archive photos", "Scripts written"], budget "$0 internal", submitterName "BEAM Forge",
submitterEmail "forge@beamthinktank.space", status "in_production", assignedTo [], deliverableUrls [].

ngo-clip-band: title "Band clip", projectType "ngo_clip", ngoOrClient "BEAM Band",
brief "Seed project for a 15-second identity clip supporting the BEAM Band NGO presence.",
assetsAvailable ["Archive photos", "Scripts written"], budget "$0 internal", submitterName "BEAM Forge",
submitterEmail "forge@beamthinktank.space", status "in_production", assignedTo [], deliverableUrls [].

ngo-clip-choir: title "Choir clip", projectType "ngo_clip", ngoOrClient "BEAM Choir",
brief "Seed project for a 15-second identity clip supporting the BEAM Choir NGO presence.",
assetsAvailable ["Archive photos", "Scripts written"], budget "$0 internal", submitterName "BEAM Forge",
submitterEmail "forge@beamthinktank.space", status "in_production", assignedTo [], deliverableUrls [].

ngo-clip-forge: title "Forge clip", projectType "ngo_clip", ngoOrClient "BEAM Forge",
brief "Seed project for a 15-second identity clip supporting the BEAM Forge NGO presence.",
assetsAvailable ["Archive photos", "Scripts written"], budget "$0 internal", submitterName "BEAM Forge",
submitterEmail "forge@beamthinktank.space", status "in_production", assignedTo [], deliverableUrls [].

ngo-clip-finance: title "Finance clip", projectType "ngo_clip", ngoOrClient "BEAM Finance",
brief "Seed project for a 15-second identity clip supporting the BEAM Finance NGO presence.",
assetsAvailable ["Archive photos", "Scripts written"], budget "$0 internal", submitterName "BEAM Forge",
submitterEmail "forge@beamthinktank.space", status "in_production", assignedTo [], deliverableUrls [].

ngo-clip-architecture: title "Architecture clip", projectType "ngo_clip", ngoOrClient "BEAM Architecture",
brief "Seed project for a 15-second identity clip supporting the BEAM Architecture NGO presence.",
assetsAvailable ["Archive photos", "Scripts written"], budget "$0 internal", submitterName "BEAM Forge",
submitterEmail "forge@beamthinktank.space", status "in_production", assignedTo [], deliverableUrls [].
*/
