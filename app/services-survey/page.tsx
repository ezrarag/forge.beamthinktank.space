'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { addDoc, collection } from 'firebase/firestore'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Building2, Check, CircleDollarSign, ContactRound, Crosshair, History, ListTodo, Target, UsersRound, WalletCards, type LucideIcon } from 'lucide-react'
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
const stepMeta: Array<{ number: string; eyebrow: string; title: string; icon: LucideIcon }> = [
  { number: '00', eyebrow: 'Before we begin', title: 'Who should we follow up with?', icon: ContactRound },
  { number: '01', eyebrow: 'Your north star', title: "What is your organization's mission, in one sentence?", icon: Target },
  { number: '02', eyebrow: 'The people doing the work', title: 'Who currently does your website, content, and social media work?', icon: UsersRound },
  { number: '03', eyebrow: 'Monthly tools and support', title: 'What are you paying for monthly right now?', icon: WalletCards },
  { number: '04', eyebrow: 'The money question', title: 'Of those, which are you paying for but not fully using?', icon: CircleDollarSign },
  { number: '05', eyebrow: 'What happened last time', title: 'The last time you paid for a website or app build — what did it cost, and did it stick?', icon: History },
  { number: '06', eyebrow: 'The waiting list', title: "What's on your roadmap that's been sitting undone because nobody has time?", icon: ListTodo },
  { number: '07', eyebrow: 'The size of the team', title: 'How many people are on your payroll?', icon: Building2 },
  { number: '08', eyebrow: 'First priority', title: "If you had a team for a few hours a week, what's the FIRST thing you'd point them at?", icon: Crosshair },
]

export default function ServicesSurveyPage() {
  const [form, setForm] = useState<SurveyForm>(emptyForm)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const current = stepMeta[step]
  const BackdropIcon = current.icon

  function toggleSpend(value: string) { setForm((currentForm) => ({ ...currentForm, currentSpend: currentForm.currentSpend.includes(value) ? currentForm.currentSpend.filter((item) => item !== value) : [...currentForm.currentSpend, value] })) }
  function validationError() {
    if (step === 0 && (!form.orgName.trim() || !form.contactName.trim() || !/^\S+@\S+\.\S+$/.test(form.contactEmail))) return 'Add your organization, contact name, and a valid email to continue.'
    if (step === 1 && !form.mission.trim()) return 'Add a one-sentence mission to continue.'
    if (step === 3 && form.currentSpend.length === 0) return 'Choose at least one monthly expense to continue.'
    if (step === 4 && !form.underusedSpend.trim()) return 'Tell us what is not being fully used.'
    if (step === 5 && !form.lastBuildExperience.trim()) return 'Tell us briefly about the last build.'
    if (step === 6 && !form.undoneRoadmap.trim()) return 'Add one thing that has been sitting undone.'
    if (step === 8 && !form.firstThingTheydPointAt.trim()) return 'Tell us the first thing you would point a team toward.'
    return null
  }
  function goNext() { const message = validationError(); if (message) { setError(message); return }; setError(null); setDirection(1); setStep((value) => Math.min(value + 1, stepMeta.length - 1)) }
  function goBack() { setError(null); setDirection(-1); setStep((value) => Math.max(value - 1, 0)) }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = validationError(); if (message) { setError(message); return }
    if (!db) { setError('The survey is temporarily unavailable. Please try again later.'); return }
    setIsSubmitting(true); setError(null)
    const now = new Date().toISOString()
    try {
      await addDoc(collection(db, 'ragLeads'), { ...form, orgName: form.orgName.trim(), contactName: form.contactName.trim(), contactEmail: form.contactEmail.trim().toLowerCase(), mission: form.mission.trim(), underusedSpend: form.underusedSpend.trim(), lastBuildExperience: form.lastBuildExperience.trim(), undoneRoadmap: form.undoneRoadmap.trim(), firstThingTheydPointAt: form.firstThingTheydPointAt.trim(), domain: 'forge', status: 'NEW', notes: '', createdAt: now, updatedAt: now })
      setSubmitted(true)
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'We could not save your response. Please try again.') }
    finally { setIsSubmitting(false) }
  }

  if (submitted) return <div className="flex h-[calc(100dvh-4.5rem)] items-center overflow-hidden px-4"><section className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-8 sm:p-12"><Check className="h-8 w-8 text-emerald-200" /><h1 className="mt-5 font-serif text-5xl text-white">Thank you.</h1><p className="mt-4 max-w-xl leading-7 text-white/68">Your answers are with the Forge team. We’ll use them to understand where useful work and underused spending overlap.</p><Link href="/projects" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-5 py-3 text-sm font-semibold text-[#11131d]">Explore Forge projects <ArrowRight className="h-4 w-4" /></Link></section></div>

  return (
    <div className="relative h-[calc(100dvh-4.5rem)] overflow-hidden bg-[#070912]">
      <div className="pointer-events-none absolute inset-0 bg-forge-grid bg-[size:64px_64px] opacity-[0.09]" />
      <div className="relative mx-auto flex h-full max-w-6xl flex-col px-4 py-4 sm:px-8 sm:py-6 lg:px-12">
        <div className="mb-3 flex shrink-0 items-center justify-between gap-4 text-[0.62rem] uppercase tracking-[0.22em] text-white/42">
          <span>Public services survey · under 3 minutes</span><span><b className="font-medium text-white">{String(step + 1).padStart(2, '0')}</b> / {String(stepMeta.length).padStart(2, '0')}</span>
        </div>
        <div className="mb-4 h-px shrink-0 overflow-hidden bg-white/10"><motion.div className="h-full bg-[#f5a623]" animate={{ width: `${((step + 1) / stepMeta.length) * 100}%` }} /></div>
        <form onSubmit={submit} className="relative min-h-0 flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d111d]/95 shadow-forge">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.fieldset key={step} custom={direction} initial={prefersReducedMotion ? false : { opacity: 0, x: direction * 36 }} animate={{ opacity: 1, x: 0 }} exit={prefersReducedMotion ? undefined : { opacity: 0, x: direction * -24 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="absolute inset-0 flex min-h-0 flex-col p-5 sm:p-8 lg:p-10">
              <legend className="sr-only">{current.number}. {current.title}</legend>
              <BackdropIcon aria-hidden="true" strokeWidth={0.55} className="pointer-events-none absolute -bottom-[8%] -right-[4%] h-[55%] w-[55%] text-[#f5a623] opacity-[0.045]" />
              <div className="pointer-events-none absolute inset-0 bg-forge-grid bg-[size:44px_44px] opacity-[0.06]" />
              <div className="relative z-10 shrink-0"><p className="text-xs uppercase tracking-[0.24em] text-[#f5a623]">{current.number} · {current.eyebrow}</p><h1 className="mt-3 max-w-4xl font-serif text-3xl leading-[1.02] text-white sm:text-5xl lg:text-6xl">{current.title}</h1></div>
              <div className="relative z-10 mt-5 min-h-0 flex-1 overflow-y-auto pr-1 sm:mt-7">{step === 0 && <div className="grid max-w-3xl gap-4 md:grid-cols-2"><TextInput label="Organization name" value={form.orgName} onChange={(value) => setForm((f) => ({ ...f, orgName: value }))} /><TextInput label="Contact name" value={form.contactName} onChange={(value) => setForm((f) => ({ ...f, contactName: value }))} /><TextInput type="email" label="Contact email" value={form.contactEmail} onChange={(value) => setForm((f) => ({ ...f, contactEmail: value }))} /></div>}{step === 1 && <Textarea value={form.mission} onChange={(value) => setForm((f) => ({ ...f, mission: value }))} />}{step === 2 && <div className="grid max-w-4xl gap-3 sm:grid-cols-2">{ownerOptions.map((option) => <Choice key={option.value} checked={form.contentOwner === option.value} type="radio" name="contentOwner" onChange={() => setForm((f) => ({ ...f, contentOwner: option.value }))}>{option.label}</Choice>)}</div>}{step === 3 && <div className="grid max-w-4xl gap-3 sm:grid-cols-2">{spendOptions.map((option) => <Choice key={option} checked={form.currentSpend.includes(option)} type="checkbox" onChange={() => toggleSpend(option)}>{option}</Choice>)}</div>}{step === 4 && <Textarea value={form.underusedSpend} onChange={(value) => setForm((f) => ({ ...f, underusedSpend: value }))} />}{step === 5 && <Textarea value={form.lastBuildExperience} onChange={(value) => setForm((f) => ({ ...f, lastBuildExperience: value }))} />}{step === 6 && <Textarea value={form.undoneRoadmap} onChange={(value) => setForm((f) => ({ ...f, undoneRoadmap: value }))} />}{step === 7 && <input min={0} type="number" value={form.payrollCount} onChange={(event) => setForm((f) => ({ ...f, payrollCount: Number(event.target.value) }))} className={`${inputClass} max-w-xs text-2xl`} />}{step === 8 && <Textarea value={form.firstThingTheydPointAt} onChange={(value) => setForm((f) => ({ ...f, firstThingTheydPointAt: value }))} />}</div>
              <div className="relative z-10 mt-4 flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.08] pt-4"><button type="button" onClick={goBack} disabled={step === 0} className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white/60 transition hover:text-white disabled:invisible"><ArrowLeft className="h-4 w-4" /> Back</button><div className="text-right">{error ? <p role="alert" className="mb-2 text-xs text-rose-200">{error}</p> : null}{step < stepMeta.length - 1 ? <button type="button" onClick={goNext} className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-6 py-3 text-sm font-semibold text-[#11131d]">Continue <ArrowRight className="h-4 w-4" /></button> : <button disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-full bg-[#f5a623] px-6 py-3 text-sm font-semibold text-[#11131d] disabled:opacity-50">{isSubmitting ? 'Sending…' : 'Send my answers'} <ArrowRight className="h-4 w-4" /></button>}</div></div>
            </motion.fieldset>
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}

const inputClass = 'w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition focus:border-[#f5a623]/60 focus:ring-2 focus:ring-[#f5a623]/10'
function TextInput({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <label className="block text-sm font-medium text-white/80">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={`${inputClass} mt-2`} /></label> }
function Textarea({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <textarea autoFocus value={value} onChange={(event) => onChange(event.target.value)} rows={5} className={`${inputClass} max-w-3xl resize-none text-base leading-7`} /> }
function Choice({ children, ...props }: { children: React.ReactNode; type: 'radio' | 'checkbox'; checked: boolean; name?: string; onChange: () => void }) { return <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/72 transition hover:border-[#f5a623]/35 hover:bg-white/[0.04]"><input {...props} className="accent-[#f5a623]" />{children}</label> }
