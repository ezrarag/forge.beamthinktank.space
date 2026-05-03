import { Suspense } from 'react'
import { MemberDashboard } from '@/components/MemberDashboard'
import { PortalAuthGuard } from '@/components/PortalAuthGuard'

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <PortalAuthGuard>
        <MemberDashboard />
      </PortalAuthGuard>
    </Suspense>
  )
}
