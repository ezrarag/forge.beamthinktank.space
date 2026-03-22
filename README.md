# BEAM Forge

BEAM Forge is the technology, fabrication, and fintech NGO site for the BEAM Think Tank ecosystem. This scaffold mirrors the orchestra site stack where practical, uses Tailwind CSS with the Next.js App Router, and routes participant registration through `home.beamthinktank.space` instead of creating a local auth system.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 3
- Firebase client SDK for the shared BEAM identity/project surface
- Framer Motion and Lucide React for UI motion and iconography

## Routes

- `/`: public landing page with slide/panel sequencing
- `/viewer`: public content feed using a viewer-style panel layout
- `/tracks`: the four Forge tracks with openings and cohort windows
- `/projects`: active and archived BEAM/client work
- `/join`: handoff page into `home.beamthinktank.space`
- `/member`: protected member dashboard backed by BEAM Home profile documents
- `/api/subscribe`: public subscriber capture endpoint

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.local.example .env.local
```

3. Fill in the Firebase variables with the same project configuration used by `home.beamthinktank.space`.

4. Start development:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

### Public

- `NEXT_PUBLIC_SITE_URL`: absolute Forge site URL, used to seed the BEAM Home handoff.
- `NEXT_PUBLIC_BEAM_HOME_URL`: base URL for the BEAM Home app. Defaults to `https://home.beamthinktank.space`.
- `NEXT_PUBLIC_HOME_SESSION_COOKIE_NAME`: optional future shared session cookie name if BEAM Home adds one.
- `NEXT_PUBLIC_FORGE_ORGANIZATION_ID`: default `org_beam_forge`.
- `NEXT_PUBLIC_FORGE_ORGANIZATION_NAME`: default `BEAM Forge`.
- `NEXT_PUBLIC_FORGE_COHORT_ID`: default `cohort_beam_forge_launch`.
- `NEXT_PUBLIC_FORGE_COHORT_NAME`: default `Forge Launch Cohort`.
- `NEXT_PUBLIC_FORGE_ENTRY_CHANNEL`: default `forge.beamthinktank.space`.
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Server only

- `BEAM_SUBSCRIBE_WEBHOOK_URL`: optional POST target for public subscriber capture.
- `BEAM_SUBSCRIBE_WEBHOOK_BEARER`: optional bearer token for that webhook.

## BEAM Home Auth Handoff

Forge does not implement its own registration or sign-in. The join flow constructs a BEAM Home handoff URL under `/onboard/handoff` with the same field names used in the current Home codebase:

- `role`
- `sourceType=ngo_site`
- `sourceSystem=beam`
- `entryChannel=forge.beamthinktank.space`
- `organizationId=org_beam_forge`
- `organizationName=BEAM Forge`
- `cohortId=cohort_beam_forge_launch`
- `cohortName=Forge Launch Cohort`
- `siteUrl`
- `landingPageUrl`
- `referrerUrl`
- `redirectTarget=dashboard`

This matches the BEAM Home handoff model defined in:

- `../home.beamthinktank.space/src/lib/beamHandoff.ts`
- `../home.beamthinktank.space/src/app/onboard/handoff/page.tsx`

### What Forge Reads Back

The member page reads the same Firebase-backed profile documents that Home uses:

- `users/<uid>/profiles/beamHandoff`
- `users/<uid>/profiles/onboarding`

It also calls these public Home endpoints:

- `GET /api/roles`
- `GET /api/participant/work-contexts`

### Important Current Limitation

The current local `home.beamthinktank.space` codebase does not expose a documented cross-subdomain session exchange endpoint or cookie contract for Forge to consume directly. Home currently relies on:

- Firebase client auth state
- local profile documents in Firestore
- local browser storage such as `beam-auth` and `beam-handoff` on the Home origin

Because browser storage is origin-scoped, Forge can only populate the member view automatically when the Firebase session is already available on the Forge origin. The scaffold still checks an optional cookie name via `NEXT_PUBLIC_HOME_SESSION_COOKIE_NAME` so a future shared cookie/token contract can plug in without changing the route structure.

## Participant Identity / Role Context Sourced From Home

Home’s participant identity model currently defines:

- organizations
- cohorts
- participant profiles
- organization memberships
- cohort memberships
- participant source attribution

Those types were read from:

- `../home.beamthinktank.space/src/types/participantIdentity.ts`
- `../home.beamthinktank.space/src/lib/participantIdentity.ts`

Published role definitions are sourced through Home’s public roles endpoint, which itself proxies the Readyaimgo BEAM roles feed:

- `../home.beamthinktank.space/src/app/api/roles/route.ts`
- `../home.beamthinktank.space/src/lib/beamRolesApi.ts`

## Subscriber Capture

`/api/subscribe` is intentionally safe in two modes:

- Stub mode: validates the email and returns success without external delivery.
- Forward mode: POSTs to `BEAM_SUBSCRIBE_WEBHOOK_URL` if configured.

If you already have a BEAM email ingestion endpoint, point `BEAM_SUBSCRIBE_WEBHOOK_URL` at it.

## Registering Forge In The BEAM NGO Registry

The public BEAM NGO registry is the `beamWebsiteDirectory` collection managed by `home.beamthinktank.space`.

Relevant source files:

- `../home.beamthinktank.space/src/lib/websiteDirectory.ts`
- `../home.beamthinktank.space/src/app/api/website-directory/route.ts`
- `../home.beamthinktank.space/docs/WEBSITE_DIRECTORY_ADMIN.md`

### Manual admin flow

1. Sign in to `home.beamthinktank.space` with a Firebase account that has the custom claim `admin: true`.
2. Open `/admin/website-directory`.
3. Create or update an entry with:
   - `label`: `Forge`
   - `title`: `BEAM Forge`
   - `subtitle`: short Forge description
   - `url`: `https://forge.beamthinktank.space`
   - `previewImageUrl`: optional
   - `sortOrder`: choose the desired placement
   - `isActive`: `true`

### API flow

Home’s admin API requires a Firebase ID token in the `Authorization: Bearer <token>` header and only accepts admin users. The seed route shown in the Home codebase is:

- `POST /api/admin/website-directory/seed`

For Forge specifically, use the admin UI or extend Home’s admin API to accept a custom payload for the Forge entry.

