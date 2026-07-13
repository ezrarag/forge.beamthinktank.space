export type RagLeadStatus = 'NEW' | 'INTERVIEWED' | 'QUALIFIED' | 'SUBSCRIBED' | 'CLOSED'

export type ContentOwner =
  | 'me_personally'
  | 'one_staffer_many_hats'
  | 'paid_contractor'
  | 'nobody_sits_undone'

export interface RagLead {
  id: string
  domain: 'forge'
  orgName: string
  contactName: string
  contactEmail: string
  mission: string
  contentOwner: ContentOwner
  currentSpend: string[]
  underusedSpend: string
  lastBuildExperience: string
  undoneRoadmap: string
  payrollCount: number
  firstThingTheydPointAt: string
  status: RagLeadStatus
  notes: string
  createdAt: string
  updatedAt: string
}
