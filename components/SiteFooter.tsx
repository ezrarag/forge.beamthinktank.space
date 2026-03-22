import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#070912]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-white/68 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr] lg:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#f5a623]">BEAM Forge</p>
          <p className="mt-3 max-w-xl text-white/78">
            Built inside the BEAM Think Tank ecosystem for student, professor, and community cohorts shipping fintech,
            software, fabrication, and infrastructure work.
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">Routes</p>
          <div className="mt-3 space-y-2">
            <Link href="/viewer" className="block hover:text-white">
              Viewer
            </Link>
            <Link href="/tracks" className="block hover:text-white">
              Tracks
            </Link>
            <Link href="/projects" className="block hover:text-white">
              Projects
            </Link>
            <Link href="/member" className="block hover:text-white">
              Member
            </Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-white">Network</p>
          <div className="mt-3 space-y-2">
            <a href="https://home.beamthinktank.space" target="_blank" rel="noreferrer" className="block hover:text-white">
              home.beamthinktank.space
            </a>
            <a href="https://orchestra.beamthinktank.space" target="_blank" rel="noreferrer" className="block hover:text-white">
              orchestra.beamthinktank.space
            </a>
            <a href="https://www.readyaimgo.biz" target="_blank" rel="noreferrer" className="block hover:text-white">
              ReadyAimGo
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

