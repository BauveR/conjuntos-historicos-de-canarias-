import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useScrollDirection } from '../hooks/useScrollDirection'

const labelStyle = { fontFamily: "'Open Sans', sans-serif" }

type NavEntry = { label: string; to?: string; href?: string }

const NAV_LINKS: NavEntry[] = [
  { label: 'Inicio',                to: '/' },
  { label: 'Conjuntos',             to: '/#conjuntos' },
  { label: 'Rutas y Eventos',       to: '/#actividades' },
  { label: 'Pasaporte Patrimonial', href: '#' },
  { label: 'Contacto',              href: '#' },
]

const linkClass =
  'relative text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900 transition-colors duration-200 whitespace-nowrap ' +
  'after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-stone-900 after:transition-all after:duration-300 hover:after:w-full'

const mobileLinkClass =
  'block text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900 transition-colors duration-200 py-4 border-b border-stone-100'

function NavLink({ entry, mobile, onClick }: { entry: NavEntry; mobile?: boolean; onClick?: () => void }) {
  const cls = mobile ? mobileLinkClass : linkClass
  if (entry.to) {
    return <Link to={entry.to} className={cls} style={labelStyle} onClick={onClick}>{entry.label}</Link>
  }
  return <a href={entry.href ?? '#'} className={cls} style={labelStyle} onClick={onClick}>{entry.label}</a>
}

export function Navbar() {
  const hidden = useScrollDirection()
  const [open, setOpen] = useState(false)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-transform duration-300 ease-in-out ${
        hidden && !open ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Barra principal */}
      <div className="flex items-center px-6 sm:px-8 h-16 border-b border-stone-100">
        {/* Logo */}
        <Link
          to="/"
          className="text-[11px] sm:text-sm tracking-widest uppercase text-stone-900 whitespace-nowrap"
          style={{ fontFamily: "'Google Sans Flex', sans-serif", fontVariationSettings: "'wght' 100" }}
        >
          Conjuntos Históricos de Canarias
        </Link>

        {/* Links — solo desktop */}
        <nav className="hidden lg:flex items-center gap-8 flex-1 ml-10">
          {NAV_LINKS.map(entry => (
            <NavLink key={entry.label} entry={entry} />
          ))}
        </nav>

        {/* Login — solo desktop */}
        <a href="#" className={`hidden lg:block ${linkClass}`} style={labelStyle}>
          Login / Mi Cuenta
        </a>

        {/* Burger — tablet y mobile */}
        <button
          className="lg:hidden flex flex-col justify-center items-center gap-1.25 w-8 h-8 ml-auto"
          onClick={() => setOpen(prev => !prev)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span
            className={`block h-px w-6 bg-stone-800 transition-all duration-300 origin-center ${
              open ? 'translate-y-1.5 rotate-45' : ''
            }`}
          />
          <span
            className={`block h-px w-6 bg-stone-800 transition-all duration-300 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-px w-6 bg-stone-800 transition-all duration-300 origin-center ${
              open ? '-translate-y-1.5 -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* Menú móvil */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white ${
          open ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <nav className="flex flex-col px-6 sm:px-8 pb-2">
          {NAV_LINKS.map(entry => (
            <NavLink key={entry.label} entry={entry} mobile onClick={() => setOpen(false)} />
          ))}
          <a
            href="#"
            className={mobileLinkClass}
            style={labelStyle}
            onClick={() => setOpen(false)}
          >
            Login / Mi Cuenta
          </a>
        </nav>
      </div>
    </header>
  )
}
