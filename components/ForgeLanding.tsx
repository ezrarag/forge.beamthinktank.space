'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { forgeCategories } from '@/lib/forge-content'

const AUTO_ADVANCE_MS = 6500

export function ForgeLanding() {
  const [activeIndex, setActiveIndex] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const activeCategory = forgeCategories[activeIndex]
  const ActiveIcon = activeCategory.icon

  useEffect(() => {
    if (prefersReducedMotion) return

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % forgeCategories.length)
    }, AUTO_ADVANCE_MS)

    return () => window.clearInterval(intervalId)
  }, [prefersReducedMotion])

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + forgeCategories.length) % forgeCategories.length)
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % forgeCategories.length)
  }

  return (
    <section className="relative isolate min-h-[calc(100dvh-5rem)] overflow-hidden bg-[#070912]" aria-roledescription="carousel" aria-label="Forge project categories">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeCategory.slug}
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0"
          aria-live="polite"
        >
          <div
            className="absolute inset-0 opacity-55"
            style={{
              background: `radial-gradient(circle at 72% 30%, ${activeCategory.colorAccent}70, transparent 26%), radial-gradient(circle at 18% 78%, ${activeCategory.colorAccent}38, transparent 31%), linear-gradient(135deg, #090b14 0%, #0d111d 48%, ${activeCategory.colorAccent}20 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-forge-grid bg-[size:64px_64px] opacity-[0.11]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,5,10,.88)_0%,rgba(4,5,10,.38)_58%,rgba(4,5,10,.68)_100%)]" />
          <div
            className="absolute right-[8%] top-1/2 flex h-[42vw] max-h-[35rem] min-h-72 w-[42vw] min-w-72 -translate-y-1/2 items-center justify-center rounded-full border opacity-20 blur-[0.5px]"
            style={{ borderColor: activeCategory.colorAccent, boxShadow: `0 0 150px ${activeCategory.colorAccent}33` }}
          >
            <ActiveIcon className="h-1/2 w-1/2" style={{ color: activeCategory.colorAccent }} strokeWidth={0.65} aria-hidden="true" />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] max-w-7xl flex-col justify-between px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        <div className="flex items-center justify-between gap-5 text-[0.68rem] uppercase tracking-[0.28em] text-white/58">
          <p><span className="text-white">BEAM</span><span className="mx-4 text-white/30">·</span>Forge</p>
          <p aria-label={`Slide ${activeIndex + 1} of ${forgeCategories.length}`}>
            <span className="text-white">{String(activeIndex + 1).padStart(2, '0')}</span>
            <span className="mx-2 text-white/28">/</span>
            {String(forgeCategories.length).padStart(2, '0')}
          </p>
        </div>

        <div className="my-auto max-w-5xl py-16 sm:py-24">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`copy-${activeCategory.slug}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: activeCategory.colorAccent }}>
                Door {String(activeIndex + 1).padStart(2, '0')} · Project category
              </p>
              <h1 className="mt-6 max-w-5xl font-serif text-5xl leading-[0.92] tracking-[-0.045em] text-white sm:text-7xl lg:text-[7.25rem]">
                {activeCategory.label}
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                {activeCategory.description}
              </p>
              <Link
                href={`/projects?category=${activeCategory.slug}#category-projects`}
                className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#f1f1e9] px-6 py-3.5 text-sm font-semibold text-[#101512] shadow-2xl transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Explore projects
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-end justify-between gap-6">
          <div className="flex items-center gap-3">
            {forgeCategories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Show ${category.label}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                className="flex h-8 items-center"
              >
                <span
                  className={`block h-1 rounded-full transition-all ${index === activeIndex ? 'w-8' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                  style={index === activeIndex ? { backgroundColor: activeCategory.colorAccent } : undefined}
                />
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={showPrevious} aria-label="Previous category" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/24 bg-black/20 text-white transition hover:border-white/55 hover:bg-white/10">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={showNext} aria-label="Next category" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/24 bg-black/20 text-white transition hover:border-white/55 hover:bg-white/10">
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
