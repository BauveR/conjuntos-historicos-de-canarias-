import { useAuth } from '../contexts/AuthContext'

const labelStyle = { fontFamily: "'Open Sans', sans-serif" }

export function ProfilePage() {
  const { user, signOut } = useAuth()

  return (
    <main className="min-h-screen bg-white pt-16 flex items-center justify-center" style={labelStyle}>
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-xs tracking-widest uppercase text-stone-400">Mi cuenta</p>
        <p className="text-sm text-stone-700">{user?.displayName ?? user?.email}</p>
        <button
          onClick={signOut}
          className="mt-4 px-6 py-2.5 rounded-xl border border-stone-200 text-[11px] tracking-widest uppercase text-stone-500 hover:bg-stone-50 transition-colors cursor-pointer"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}
