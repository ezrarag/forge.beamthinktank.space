import { AdminStudio } from '@/components/AdminStudio'
import { ProjectApplicationsAdmin } from '@/components/ProjectApplicationsAdmin'

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <AdminStudio />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pb-10">
        <ProjectApplicationsAdmin />
      </div>
    </div>
  )
}
