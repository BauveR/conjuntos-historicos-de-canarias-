import { Link } from 'react-router-dom'

const labelStyle = { fontFamily: "'Open Sans', sans-serif" }

export function Footer() {
  return (
    <footer className="border-t border-stone-100 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-stone-400" style={labelStyle}>
          © {new Date().getFullYear()} Conjuntos Históricos de Canarias
        </p>
        <nav className="flex items-center gap-4">
          <Link to="/privacidad" className="text-[11px] tracking-wide uppercase text-stone-500 hover:text-stone-900 transition-colors" style={labelStyle}>
            Política de privacidad
          </Link>
          <Link to="/aviso-legal" className="text-[11px] tracking-wide uppercase text-stone-500 hover:text-stone-900 transition-colors" style={labelStyle}>
            Aviso legal
          </Link>
        </nav>
      </div>
    </footer>
  )
}
