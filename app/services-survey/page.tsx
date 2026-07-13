'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { addDoc, collection } from 'firebase/firestore'
import { ArrowRight, Check } from 'lucide-react'
import { db } from '@/lib/firebase'
import type { ContentOwner, RagLead } from '@/lib/types/ragLead'

const spendOptions = ['website platform (Wix, Squarespace, etc.)', 'app hosting', 'email/marketing tools', 'accounting software', 'Apple/Google developer fees', 'a designer or contractor', 'other']
const ownerOptions: Array<{ value: ContentOwner; label: string }> = [
  { value: 'me_personally', label: 'Me personally' },
  { value: 'one_staffer_many_hats', label: 'One staff member who wears many hats' },
  { value: 'paid_contractor', label: 'A paid contractor' },
  { value: 'nobody_sits_undone', label: 'Nobody, it sits undone' },
]

type SurveyForm = Omit<RagLead, 'id' | 'domain' | 'status' | 'notes' | 'createdAt' | 'updatedAt'>
const emptyForm: SurveyForm = { orgName: '', contactName: '', contactEmail: '', mission: '', contentOwner: 'me_personally', currentSpend: [], underusedSpend: '', lastBuildExperience: '', undoneRoadmap: '', payrollCount: 0, firstThingTheydPointAt: '' }

export default function ServicesSurveyPage() {
  const [form, setForm] = useState<SurveyForm>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleSpend(value: string) { setForm((current) => ({ ...current, currentSpend: current.currentSpend.includes(value) ? current.currentSpend.filter((item) => item !== value) : [...current.currentSpend, value] })) }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!db) { setError('The survey is temporarily unavailable. Please try again later.'); return }
    setIsSubmitting(true); setError(null)
    const now = new Date().toISOString()
    try {
      await addDoc(collection(db, 'ragLeads'), { ...form, orgName: form.orgName.trim(), contactName: form.contactName.trim(), contactEmail: form.contactEmail.trim().toLowerCase(), mission: form.mission.trim(), underusedSpend: form.underusedSpend.trim(), lastBuildExperience: form.lastBuildExperience.trim(), undoneRoadmap: form.undoneRoadmap.trim(), firstThingTheydPointAt: form.firstThingTheydPointAt.trim(), domain: 'forge', status: 'NEW', notes: '', createdAt: now, updatedAt: now })
      setSubmitted(true)
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'We could not save your response. Please try again.') }
    finally { setIsSubmitting(false) }
  }

  if (submitted) return <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-12"><section className="w-full rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-8"><Check className="h-8 w-8 text-emerald-200" /><h1 className="mt-5 font-serif text-5xl text-white">Thank you.</h1><p className="mt-4 max-w-xl leading-7 text-white/68">Your answers are with the Forge team. We’ll use them to understand where useful work and underused spending overlap.</p><Link href="/projects" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-5 py-3 text-sm font-semibold text-[#11131d]">Explore Forge projects <ArrowRight className="h-4 w-4" /></Link></section></div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-forge sm:p-8"><p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">Public services survey · under 3 minutes</p><h1 className="mt-3 font-serif text-5xl leading-none text-white sm:text-6xl">What keeps getting left undone?</h1><p className="mt-4 max-w-2xl leading-7 text-white/68">Eight plain questions to help Forge understand where a few focused hours could make the biggest difference.</p></section>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <SurveySection number="Start" title="Who should we follow up with?"><div className="grid gap-4 md:grid-cols-2"><TextInput required label="Organization name" value={form.orgName} onChange={(value) => setForm((current) => ({ ...current, orgName: value }))} /><TextInput required label="Contact name" value={form.contactName} onChange={(value) => setForm((current) => ({ ...current, contactName: value }))} /><TextInput required type="email" label="Contact email" value={form.contactEmail} onChange={(value) => setForm((current) => ({ ...current, contactEmail: value }))} /></div></SurveySection>
        <SurveySection number="01" title="What is your organization's mission, in one sentence?"><Textarea required value={form.mission} onChange={(value) => setForm((current) => ({ ...current, mission: value }))} /></SurveySection>
        <SurveySection number="02" title="Who currently does your website, content, and social media work?"><div className="grid gap-3 sm:grid-cols-2">{ownerOptions.map((option) => <label key={option.value} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/72"><input type="radio" name="contentOwner" checked={form.contentOwner === option.value} onChange={() => setForm((current) => ({ ...current, contentOwner: option.value }))} className="accent-[#f5a623]" />{option.label}</label>)}</div></SurveySection>
        <SurveySection number="03" title="What are you paying for monthly right now?"><div className="grid gap-3 sm:grid-cols-2">{spendOptions.map((option) => <label key={option} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/72"><input type="checkbox" checked={form.currentSpend.includes(option)} onChange={() => toggleSpend(option)} className="accent-[#f5a623]" />{option}</label>)}</div></SurveySection>
        <SurveySection number="04" title="Of those, which are you paying for but not fully using?"><Textarea required value={form.underusedSpend} onChange={(value) => setForm((current) => ({ ...current, underusedSpend: value }))} /></SurveySection>
        <SurveySection number="05" title="The last time you paid for a website or app build — what did it cost, and did it stick?"><Textarea required value={form.lastBuildExperience} onChange={(value) => setForm((current) => ({ ...current, lastBuildExperience: value }))} /></SurveySection>
        <SurveySection number="06" title="What's on your roadmap that's been sitting undone because nobody has time?"><Textarea required value={form.undoneRoadmap} onChange={(value) => setForm((current) => ({ ...current, undoneRoadmap: value }))} /></SurveySection>
        <SurveySection number="07" title="How many people are on your payroll?"><input required min={0} type="number" value={form.payrollCount} onChange={(event) => setForm((current) => ({ ...current, payrollCount: Number(event.target.value) }))} className={`${inputClass} max-w-xs`} /></SurveySection>
        <SurveySection number="08" title="If you had a team for a few hours a week, what's the FIRST thing you'd point them at?"><Textarea required value={form.firstThingTheydPointAt} onChange={(value) => setForm((current) => ({ ...current, firstThingTheydPointAt: value }))} /></SurveySection>
        {error ? <p role="alert" className="rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">{error}</p> : null}
        <button disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-6 py-3.5 text-sm font-semibold text-[#11131d] disabled:opacity-50">{isSubmitting ? 'Sending…' : 'Send my answers'} <ArrowRight className="h-4 w-4" /></button>
      </form>
    </div>
  )
}

const inputClass = 'mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-[#f5a623]/50'
function SurveySection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) { return <fieldset className="rounded-[2rem] border border-white/10 bg-[#0d111d] p-6 sm:p-8"><legend className="sr-only">{number}. {title}</legend><p className="text-xs uppercase tracking-[0.22em] text-[#f5a623]">{number}</p><h2 className="mt-3 text-2xl font-semibold leading-tight text-white">{title}</h2><div className="mt-5">{children}</div></fieldset> }
function TextInput({ label, value, onChange, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="block text-sm font-medium text-white">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} /></label> }
function Textarea({ value, onChange, required = false }: { value: string; onChange: (value: string) => void; required?: boolean }) { return <textarea required={required} value={value} onChange={(event) => onChange(event.target.value)} rows={4} className={inputClass} /> }
