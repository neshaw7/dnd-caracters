import { useAuth } from '../auth/AuthContext'

export function Gallery() {
  const { user, signOut } = useAuth()

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="flex items-center justify-between border-b border-gold/20 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-light">
            Meus Personagens
          </h1>
          <p className="text-sm text-parchment/60">{user?.email}</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="rounded-lg border border-gold/30 px-4 py-2 text-sm text-parchment/80 transition hover:border-gold/60 hover:text-parchment"
        >
          Sair
        </button>
      </header>

      <div className="mt-10 rounded-2xl border border-dashed border-gold/30 bg-night-soft p-10 text-center">
        <p className="font-display text-lg text-gold-light">
          Login funcionando! 🎉
        </p>
        <p className="mt-2 text-parchment/70">
          No próximo passo, seus personagens aparecem aqui (criar, ver, editar e
          apagar).
        </p>
      </div>
    </div>
  )
}
