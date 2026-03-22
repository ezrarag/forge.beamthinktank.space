import { NextRequest, NextResponse } from 'next/server'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as { email?: string; source?: string } | null
  const email = payload?.email?.trim().toLowerCase() || ''
  const source = payload?.source?.trim() || 'forge-public-subscribe'

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  const webhookUrl = process.env.BEAM_SUBSCRIBE_WEBHOOK_URL?.trim()
  const webhookBearer = process.env.BEAM_SUBSCRIBE_WEBHOOK_BEARER?.trim()

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookBearer ? { Authorization: `Bearer ${webhookBearer}` } : {}),
        },
        body: JSON.stringify({
          email,
          source,
          site: 'forge.beamthinktank.space',
          subscribedAt: new Date().toISOString(),
        }),
        cache: 'no-store',
      })

      if (!response.ok) {
        const text = await response.text()
        return NextResponse.json({ error: `Webhook rejected subscription: ${text}` }, { status: 502 })
      }
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unable to reach subscription webhook.' },
        { status: 502 }
      )
    }
  }

  return NextResponse.json({
    ok: true,
    message: webhookUrl
      ? 'Subscription captured and forwarded to the configured BEAM email system.'
      : 'Subscription captured in stub mode. Configure BEAM_SUBSCRIBE_WEBHOOK_URL to forward this to the BEAM email system.',
  })
}

