import Link from 'next/link'
import type { ForgeCategory } from '@/lib/types'

interface CategoryCardProps {
  category: ForgeCategory
  activeProjectCount: number
  selected?: boolean
}

export function CategoryCard({ category, activeProjectCount, selected = false }: CategoryCardProps) {
  const Icon = category.icon
  const trackLabel = category.trackIds.length
    ? category.trackIds.map((track) => track.replace('content-production', 'content')).join(' · ')
    : 'new production track'

  return (
    <Link
      href={`/projects?category=${category.slug}#category-projects`}
      aria-label={`Explore ${category.label}`}
      aria-current={selected ? 'page' : undefined}
      className="group flex min-h-[31rem] flex-col overflow-hidden rounded-[1.75rem] border bg-[#0d111d] shadow-forge transition duration-300 hover:-translate-y-1 hover:shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
      style={{ borderColor: selected ? category.colorAccent : `${category.colorAccent}4d`, outlineColor: category.colorAccent }}
    >
      <div className="relative flex min-h-64 flex-col overflow-hidden px-6 pb-14 pt-6 sm:px-7">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(circle at 12% 0%, ${category.colorAccent}, transparent 52%)` }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <p className="text-[0.68rem] uppercase tracking-[0.24em]" style={{ color: category.colorAccent }}>
            {category.slug.replace('-', ' ')} · Forge
          </p>
          <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/44">
            {activeProjectCount} active
          </p>
        </div>
        <div className="relative mt-10 flex items-start gap-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border"
            style={{ color: category.colorAccent, borderColor: `${category.colorAccent}66`, backgroundColor: `${category.colorAccent}18` }}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="font-serif text-[2.35rem] leading-[0.95] tracking-[-0.035em] text-white sm:text-[2.7rem]">
            {category.label}
          </h3>
        </div>
        <p className="relative mt-6 max-w-xl text-sm leading-6 text-white/66">{category.description}</p>
      </div>

      <div className="relative -mt-9 flex flex-1 flex-col bg-[#f1f1e9] px-6 pb-6 pt-16 text-[#111a18] [clip-path:polygon(0_11%,100%_0,100%_100%,0_100%)] sm:px-7">
        <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#45534f]">Open roles</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {category.openRoles.slice(0, 3).map((role) => (
            <span key={role} className="rounded-full border border-black/10 bg-white/75 px-3 py-1.5 text-xs text-[#1b2724] shadow-sm">
              {role}
            </span>
          ))}
        </div>
        <p className="mt-6 text-[0.68rem] uppercase tracking-[0.2em] text-[#56625f]">
          In relation with: {trackLabel}
        </p>
        <span
          className="mt-auto inline-flex w-fit rounded-full px-5 py-3 text-sm font-semibold text-[#101512] transition group-hover:brightness-105"
          style={{ backgroundColor: category.colorAccent }}
        >
          Explore this category
        </span>
      </div>
    </Link>
  )
}
