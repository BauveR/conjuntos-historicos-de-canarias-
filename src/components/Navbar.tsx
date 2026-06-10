import { useState } from 'react'
import { useScrollDirection } from '../hooks/useScrollDirection'

const NAV_LINKS = [
  { label: 'Inicio',                href: '#' },
  { label: 'Conjuntos',             href: '#' },
  { label: 'Rutas y Eventos',       href: '#' },
  { label: 'Pasaporte Patrimonial', href: '#' },
  { label: 'Contacto',              href: '#' },
]

const linkClass =
  'relative text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900 transition-colors duration-200 whitespace-nowrap ' +
  'after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-stone-900 after:transition-all after:duration-300 hover:after:w-full'

const mobileLinkClass =
  'block text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900 transition-colors duration-200 py-4 border-b border-stone-100'

const linkStyle = { fontFamily: "'Open Sans', sans-serif" }

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
        <span
          className="text-[11px] sm:text-sm tracking-widest uppercase text-stone-900 whitespace-nowrap"
          style={{ fontFamily: "'Google Sans Flex', sans-serif", fontVariationSettings: "'wght' 100" }}
        >
          Conjuntos Históricos de Canarias
        </span>

        {/* Links — solo desktop */}
        <nav className="hidden lg:flex items-center gap-8 flex-1 ml-10">
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} className={linkClass} style={linkStyle}>
              {label}
            </a>
          ))}
        </nav>

        {/* Login — solo desktop */}
        <a href="#" className={`hidden lg:block ${linkClass}`} style={linkStyle}>
          Login / Mi Cuenta
        </a>

        {/* Burger — tablet y mobile */}
        <button
          className="lg:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8 ml-auto"
          onClick={() => setOpen(prev => !prev)}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span
            className={`block h-px w-6 bg-stone-800 transition-all duration-300 origin-center ${
              open ? 'translate-y-[6px] rotate-45' : ''
            }`}
          />
          <span
            className={`block h-px w-6 bg-stone-800 transition-all duration-300 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-px w-6 bg-stone-800 transition-all duration-300 origin-center ${
              open ? '-translate-y-[6px] -rotate-45' : ''
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
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={mobileLinkClass}
              style={linkStyle}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <a
            href="#"
            className={mobileLinkClass}
            style={linkStyle}
            onClick={() => setOpen(false)}
          >
            Login / Mi Cuenta
          </a>
        </nav>
      </div>
    </header>
  )
}
