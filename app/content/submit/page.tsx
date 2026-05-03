'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import {
  contentProjectAssetOptions,
  contentProjectBudgetOptions,
  contentProjectTypeOptions,
  type ForgeContentProjectWrite,
} from '@/lib/forge-content-projects'
import { db } from '@/lib/firebase'
import type { ForgeContentProjectType } from '@/lib/types'

interface FormState {
  title: string
  projectType: ForgeContentProjectType
  ngoOrClient: string
  brief: string
  assetsAvailable: string[]
  budget: string
  submitterName: string
  submitterEmail: string
}

const initialFormState: FormState = {
  title: '',
  projectType: 'ngo_clip',
  ngoOrClient: '',
  brief: '',
  assetsAvailable: [],
  budget: '$0 internal',
  submitterName: '',
  submitterEmail: '',
}

function toggleAsset(currentAssets: string[], asset: string) {
  if (asset === 'None yet') {
    return currentAssets.includes(asset) ? [] : [asset]
  }

  const withoutNone = currentAssets.filter((item) => item !== 'None yet')
  return withoutNone.includes(asset) ? withoutNone.filter((item) => item !== asset) : [...withoutNone, asset]
}

export default function ContentProjectSubmitPage() {
  const [form, setForm] = useState<FormState>(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!db) {
      setNotice({ tone: 'error', message: 'Firestore is not configured for this environment.' })
      return
    }

    setIsSubmitting(true)
    setNotice(null)

    try {
      const projectRef = doc(collection(db, 'forgeContentProjects'))
      const payload: ForgeContentProjectWrite = {
        id: projectRef.id,
        title: form.title.trim(),
        projectType: form.projectType,
        ngoOrClient: form.ngoOrClient.trim(),
        brief: form.brief.trim(),
        assetsAvailable: form.assetsAvailable,
        budget: form.budget,
        submitterName: form.submitterName.trim(),
        submitterEmail: form.submitterEmail.trim().toLowerCase(),
        status: 'submitted',
        assignedTo: [],
        deliverableUrls: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await setDoc(projectRef, payload)
      setForm(initialFormState)
      setNotice({ tone: 'success', message: 'Content project submitted to the Forge content track.' })
    } catch (error) {
      setNotice({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Unable to submit this content project.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Content Project Intake</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
          Submit a content project to the BEAM Forge track.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
          Use this lightweight intake for NGO identity clips, client explainers, interviews, social cuts, blueprint stills, and related marketing assets.
        </p>
      </section>

      <form className="mt-8 space-y-5 rounded-[2rem] border border-white/10 bg-[#0d111d] p-6 sm:p-8" onSubmit={handleSubmit}>
        <div className="grid gap-5 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-white">Project title</span>
            <input
              required
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f5a623]/40"
              placeholder="Hroshi explainer cut"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-white">Project type</span>
            <select
              value={form.projectType}
              onChange={(event) => setForm((current) => ({ ...current, projectType: event.target.value as ForgeContentProjectType }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition focus:border-[#f5a623]/40"
            >
              {contentProjectTypeOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-[#0d111d] text-white">
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-white">NGO or client</span>
            <input
              required
              value={form.ngoOrClient}
              onChange={(event) => setForm((current) => ({ ...current, ngoOrClient: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f5a623]/40"
              placeholder="BEAM Forge, Hroshi, ClearTrace, RAG"
            />
          </label>

          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-white">Brief (3–5 sentences)</span>
            <textarea
              required
              value={form.brief}
              onChange={(event) => setForm((current) => ({ ...current, brief: event.target.value }))}
              className="mt-2 min-h-36 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f5a623]/40"
              placeholder="Describe the audience, message, assets, delivery format, and deadline."
            />
          </label>
        </div>

        <fieldset className="rounded-[1.5rem] border border-white/10 bg-white/[0.02] p-4">
          <legend className="px-1 text-sm font-medium text-white">Assets available</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {contentProjectAssetOptions.map((asset) => (
              <label key={asset} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72">
                <input
                  type="checkbox"
                  checked={form.assetsAvailable.includes(asset)}
                  onChange={() =>
                    setForm((current) => ({
                      ...current,
                      assetsAvailable: toggleAsset(current.assetsAvailable, asset),
                    }))
                  }
                  className="h-4 w-4 rounded border-white/10 bg-transparent accent-[#f5a623]"
                />
                {asset}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 lg:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-white">Budget</span>
            <select
              value={form.budget}
              onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition focus:border-[#f5a623]/40"
            >
              {contentProjectBudgetOptions.map((budget) => (
                <option key={budget} value={budget} className="bg-[#0d111d] text-white">
                  {budget}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-white">Submitter name</span>
            <input
              required
              value={form.submitterName}
              onChange={(event) => setForm((current) => ({ ...current, submitterName: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f5a623]/40"
              placeholder="Name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-white">Submitter email</span>
            <input
              required
              type="email"
              value={form.submitterEmail}
              onChange={(event) => setForm((current) => ({ ...current, submitterEmail: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f5a623]/40"
              placeholder="name@example.com"
            />
          </label>
        </div>

        {notice ? (
          <p className={`rounded-2xl border px-4 py-3 text-sm ${notice.tone === 'success' ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : 'border-rose-300/20 bg-rose-300/10 text-rose-100'}`}>
            {notice.message}
          </p>
        ) : null}

        {!db ? (
          <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            Add the public Firebase environment variables before submissions can write to Firestore.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || !db}
            className="rounded-full bg-[#f5a623] px-5 py-3 text-sm font-semibold text-[#11131d] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <Link href="/portal/content" className="rounded-full border border-white/14 px-5 py-3 text-sm font-medium text-white">
            Back to content portal
          </Link>
        </div>
      </form>
    </div>
  )
}
