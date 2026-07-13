import { PortalAuthGuard } from '@/components/PortalAuthGuard'
import { RagLeadBoard } from '@/components/RagLeadBoard'

export default function LeadsPortalPage() {
  return <PortalAuthGuard><RagLeadBoard /></PortalAuthGuard>
}
