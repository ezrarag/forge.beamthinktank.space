import { Suspense } from 'react'
import { ContentPortal } from '@/components/ContentPortal'
import { PortalAuthGuard } from '@/components/PortalAuthGuard'

export default function ContentPortalPage() {
  return (
    <Suspense fallback={null}>
      <PortalAuthGuard>
        <ContentPortal />
      </PortalAuthGuard>
    </Suspense>
  )
}
