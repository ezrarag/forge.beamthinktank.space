import { Suspense } from 'react'
import { ForgeParticipantWorkspace } from '@/components/profile/ForgeParticipantWorkspace'
import { PortalAuthGuard } from '@/components/PortalAuthGuard'

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <PortalAuthGuard>
        <ForgeParticipantWorkspace />
      </PortalAuthGuard>
    </Suspense>
  )
}
