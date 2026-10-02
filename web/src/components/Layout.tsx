import { Calculator, Heart, House, Search, Siren } from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useMyFundis } from '../lib/myFundis'
import InstallButton from './InstallButton'
import ShortlistTray from './ShortlistTray'
import ThemeToggle from './ThemeToggle'
import { Logo } from './Logo'

const YEAR = new Date().getFullYear()

const TABS = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/services', label: 'Find', icon: Search },
  { to: '/check', label: 'Check quote', icon: Calculator },
  { to: '/saved', label: 'My Fundis', icon: Heart },
]

export default function Layout() {
  const { pathname } = useLocation()
  const { saved, shortlist } = useMyFundis()
  const trayVisible = shortlist.length > 0 && pathname !== '/compare' && pathname !== '/request'

  useEffect(() => window.scrollTo(0, 0), [pathname])

  return (
    <div
      className={`flex min-h-screen flex-col print:pb-0 ${
        trayVisible
          ? 'pb-[calc(10rem+env(safe-area-inset-bottom))] md:pb-24'
          : 'pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0'
      }`}
    >
      <header className="sticky top-0 z-30 border-b border-line print:hidden bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" aria-label="Fundi home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {TABS.slice(1).map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-muted hover:text-ink'
                  }`
                }
              >
                <t.icon className="size-4" aria-hidden />
                {t.label}
                {t.to === '/saved' && saved.length > 0 && (
                  <span className="rounded-full bg-alert-500 px-1.5 text-xs font-bold text-white">{saved.length}</span>
                )}
              </NavLink>
            ))}
            <NavLink to="/join" className="btn-ghost text-sm">
              List your business
            </NavLink>
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />
            <InstallButton />
            <Link
              to="/emergency"
              className="btn animate-pulse-ring bg-alert-500 px-3 py-2 text-sm text-white hover:bg-alert-600"
            >
              <Siren className="size-4" aria-hidden />
              Help now
            </Link>
          </div>
        </div>
      </header>

      <main key={pathname} className="flex-1 animate-rise">
        <Outlet />
      </main>

      <footer className="hidden border-t border-line bg-surface md:block print:hidden">
        <div className="mx-auto flex max-w-6xl justify-between gap-4 px-4 py-6 text-sm text-muted">
          <p>© {YEAR} Fundi · Trusted local services across South Africa</p>
          <div className="flex gap-4">
            <Link to="/prices" className="hover:text-ink">
              Price guide
            </Link>
            <Link to="/join" className="hover:text-ink">
              List your business
            </Link>
            <span>Prototype · sample data</span>
          </div>
        </div>
      </footer>

      <ShortlistTray />

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden print:hidden"
        aria-label="Main"
      >
        <div className="grid grid-cols-4">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                  isActive ? 'text-brand-700' : 'text-faint'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`rounded-full px-4 py-1 transition ${isActive ? 'bg-brand-100' : ''}`}>
                    <t.icon className="size-5" aria-hidden />
                  </span>
                  {t.label}
                  {t.to === '/saved' && saved.length > 0 && (
                    <span className="absolute right-[calc(50%-1.4rem)] top-1.5 grid size-4 place-items-center rounded-full bg-alert-500 text-[10px] font-bold text-white">
                      {saved.length}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
