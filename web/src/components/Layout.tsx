import { Link, NavLink, Outlet } from 'react-router-dom'

const YEAR = new Date().getFullYear()

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900'
  }`

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-brand-700">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-base text-white">F</span>
            Fundi
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/services" className={navClass}>
              Find
            </NavLink>
            <NavLink to="/prices" className={navClass}>
              Prices
            </NavLink>
            <NavLink
              to="/join"
              className="ml-1 whitespace-nowrap rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              <span className="sm:hidden">Join</span>
              <span className="hidden sm:inline">List your business</span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:justify-between">
          <p>© {YEAR} Fundi · Trusted local services across South Africa</p>
          <p>Prototype · sample data only</p>
        </div>
      </footer>
    </div>
  )
}
