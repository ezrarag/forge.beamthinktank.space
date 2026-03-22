import {
  Anvil,
  CircuitBoard,
  TerminalSquare,
  Wrench,
} from 'lucide-react'
import type { FeedEntry, ForgeProject, ForgeSlide, ForgeTrack } from '@/lib/types'

export const forgeSlides: ForgeSlide[] = [
  {
    id: 'hero',
    eyebrow: 'BEAM Forge',
    title: 'Built here. Launched from here.',
    description:
      'Forge is the technology, fabrication, and fintech arm of the BEAM Think Tank ecosystem, where cohorts ship client work, internal R&D, and field-ready infrastructure.',
    ctaLabel: 'Open Forge Viewer',
    ctaHref: '/viewer',
    metric: '4 operating tracks',
    accent: 'from-[#f5a623]/30 via-[#f5a623]/8 to-transparent',
  },
  {
    id: 'about',
    eyebrow: 'Cohort Engine',
    title: 'Students, faculty, and community builders work in production cohorts.',
    description:
      'Teams alternate between partner-sourced delivery and internal BEAM venture building, with compensation that can blend cash, equity, and in-kind asset positions.',
    ctaLabel: 'Explore Tracks',
    ctaHref: '/tracks',
    metric: 'Hybrid payment model',
    accent: 'from-cyan-400/20 via-cyan-400/6 to-transparent',
  },
  {
    id: 'projects',
    eyebrow: 'Client + R&D',
    title: 'Forge spans product software, fabrication labs, and infrastructure operations.',
    description:
      'The same operating surface handles equity ledgers, NGO site delivery, maker-space repair clinics, and the networks that keep the BEAM ecosystem online.',
    ctaLabel: 'Review Projects',
    ctaHref: '/projects',
    metric: 'Public + member workstreams',
    accent: 'from-emerald-400/20 via-emerald-400/6 to-transparent',
  },
]

export const forgeTracks: ForgeTrack[] = [
  {
    id: 'fintech',
    title: 'Fintech Product Creation',
    tagline: 'Ledgers, wallets, and cohort finance tooling.',
    summary:
      'Design and ship the financial operating layer for cohort work, equity bookkeeping, payout visibility, and client-facing capital tools.',
    focusAreas: ['Equity ledgers', 'Wallet UX', 'Payment orchestration', 'Dashboards for cohorts'],
    openings: ['Product designer', 'Payments engineer', 'Ledger operations analyst'],
    cohortWindow: 'Spring intake open through April 18',
    icon: CircuitBoard,
  },
  {
    id: 'software',
    title: 'Web Dev & Software',
    tagline: 'NGO sites, client platforms, and internal BEAM tooling.',
    summary:
      'Build and maintain the delivery systems behind the BEAM network, from partner marketing sites to internal operations portals.',
    focusAreas: ['Next.js delivery', 'Platform integration', 'Content systems', 'Internal tooling'],
    openings: ['Frontend engineer', 'Full-stack engineer', 'Technical writer'],
    cohortWindow: 'Rolling placement for current semester teams',
    icon: TerminalSquare,
  },
  {
    id: 'fabrication',
    title: 'Hardware Fabrication & Repair',
    tagline: 'Repair clinics, prototypes, and maker-space R&D.',
    summary:
      'Operate hands-on fabrication workflows for repair, prototype iteration, and rapid physical experimentation tied to BEAM programs and clients.',
    focusAreas: ['Repair intake', 'Prototype sprints', 'Maker documentation', 'Bench testing'],
    openings: ['Fabrication technician', 'Repair clinic lead', 'Documentation fellow'],
    cohortWindow: 'Summer lab prep now accepting applicants',
    icon: Anvil,
  },
  {
    id: 'it',
    title: 'General IT & Infrastructure',
    tagline: 'Networks, device fleets, and internal systems administration.',
    summary:
      'Keep the BEAM operational backbone stable across NGO sites, shared workspaces, managed devices, and service integrations.',
    focusAreas: ['Network setup', 'Device fleet management', 'Workspace security', 'Systems administration'],
    openings: ['IT generalist', 'Device fleet coordinator', 'Systems operator'],
    cohortWindow: 'Immediate openings for infrastructure coverage',
    icon: Wrench,
  },
]

export const forgeProjects: ForgeProject[] = [
  {
    id: 'equity-ledger-core',
    title: 'Equity Ledger Core',
    track: 'fintech',
    phase: 'Active',
    partner: 'Internal BEAM Venture Stack',
    compensation: 'Cash + in-kind IP participation',
    summary:
      'A cohort-facing ledger for mixed compensation, vesting snapshots, and asset-backed contribution accounting.',
    outcomes: ['Participant balance sheets', 'Role-based audit views', 'Export-ready cap table summaries'],
  },
  {
    id: 'ngo-site-fleet',
    title: 'NGO Site Fleet',
    track: 'software',
    phase: 'Active',
    partner: 'BEAM NGO Network',
    compensation: 'Stipend + portfolio credit',
    summary:
      'Shared website delivery system across BEAM subdomains with unified auth, registry, and reusable content blocks.',
    outcomes: ['Cross-site auth handoff', 'Design system reuse', 'Registry-connected deployment flow'],
  },
  {
    id: 'repair-clinic-pilot',
    title: 'Repair Clinic Pilot',
    track: 'fabrication',
    phase: 'Pipeline',
    partner: 'Community Device Access Program',
    compensation: 'Community stipend',
    summary:
      'A recurring clinic program for triage, repair, and refurbishment of essential devices in community settings.',
    outcomes: ['Intake workflow', 'Bench repair logs', 'Parts usage reporting'],
  },
  {
    id: 'beam-network-hardening',
    title: 'BEAM Network Hardening',
    track: 'it',
    phase: 'Active',
    partner: 'Home + NGO Infrastructure',
    compensation: 'Cash contract',
    summary:
      'Standardize network baselines, secure managed endpoints, and document recovery procedures across the ecosystem.',
    outcomes: ['Device inventory', 'Network diagrams', 'Incident response checklists'],
  },
  {
    id: 'wallet-launch-kit',
    title: 'Wallet Launch Kit',
    track: 'fintech',
    phase: 'Archived',
    partner: 'Partner Delivery Sprint',
    compensation: 'Paid milestone',
    summary:
      'Prototype toolkit for launching branded participant wallets tied to milestone payouts and contribution credits.',
    outcomes: ['Wallet onboarding flow', 'Launch documentation', 'Partner demo environment'],
  },
]

export const forgeFeed: FeedEntry[] = [
  {
    id: 'fab-log-001',
    type: 'fabrication-log',
    title: 'Bench Log 01: Intake-To-Repair Flow',
    summary:
      'A first-pass repair clinic workflow covering intake triage, parts routing, and outcome labeling for reused devices.',
    publishedAt: '2026-03-18',
    track: 'fabrication',
    author: 'Forge Fabrication Cohort',
    panels: ['Intake checklist', 'Failure classification', 'Repair decision tree'],
  },
  {
    id: 'launch-002',
    type: 'launch',
    title: 'Forge Ledger Alpha Opened For Internal Testing',
    summary:
      'The first ledger alpha now tracks mixed cash and equity participation for current BEAM cohort exercises.',
    publishedAt: '2026-03-12',
    track: 'fintech',
    author: 'Forge Fintech Track',
    panels: ['Contribution snapshots', 'Equity placeholders', 'Cohort payout view'],
  },
  {
    id: 'cohort-output-003',
    type: 'cohort-output',
    title: 'Unified NGO Route Map Published',
    summary:
      'The software track documented a shared route and auth pattern for public, join, and protected member surfaces across BEAM NGOs.',
    publishedAt: '2026-03-07',
    track: 'software',
    author: 'Forge Web Systems',
    panels: ['Public browsing model', 'Home handoff rules', 'Protected dashboard shell'],
  },
  {
    id: 'delivery-004',
    type: 'client-delivery',
    title: 'Infrastructure Baseline Draft Sent To Partner',
    summary:
      'The IT track delivered a first operational baseline for managed devices, wifi segmentation, and admin recovery steps.',
    publishedAt: '2026-02-28',
    track: 'it',
    author: 'Forge Infrastructure Team',
    panels: ['Fleet naming standard', 'Recovery runbook', 'Network asset map'],
  },
]

export const memberAssignments = [
  {
    title: 'Forge Registry Sync',
    owner: 'NGO Site Fleet',
    status: 'In build',
    payment: 'Cash milestone',
  },
  {
    title: 'Mixed Compensation Ledger Review',
    owner: 'Equity Ledger Core',
    status: 'Needs sign-off',
    payment: 'In-kind equity credit',
  },
  {
    title: 'Repair Clinic SOP v2',
    owner: 'Repair Clinic Pilot',
    status: 'Drafting',
    payment: 'Community stipend',
  },
]

