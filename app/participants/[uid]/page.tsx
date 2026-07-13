import { ParticipantProfile } from '@/components/ParticipantProfile'

export default async function ParticipantProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params
  return <ParticipantProfile participantUid={uid} />
}
