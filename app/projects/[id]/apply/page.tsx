import { ProjectApplicationForm } from '@/components/ProjectApplicationForm'

export default async function ProjectApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProjectApplicationForm projectId={id} />
}
