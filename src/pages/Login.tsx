import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { SupabaseNotConfigured } from '../components/SupabaseNotConfigured'

type Modo = 'login' | 'cadastro'

export function Login() {
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [modo, setModo] = useState<Modo>('login')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (!isSupabaseConfigured) return <SupabaseNotConfigured />

  // Ja logado: manda para a galeria.
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setAviso(null)
    setEnviando(true)

    if (modo === 'login') {
      const { error } = await signIn(email, senha)
      if (error) setErro(error)
      else navigate('/')
    } else {
      const { error } = await signUp(email, senha)
      if (error) {
        setErro(error)
      } else {
        // Dependendo da config do Supabase, pode exigir confirmar email.
        setAviso(
          'Conta criada! Se o seu projeto exigir confirmação por email, verifique sua caixa de entrada. Caso contrário, já pode entrar.',
        )
        setModo('login')
      }
    }
    setEnviando(false)
  }

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-xs uppercase tracking-[0.3em] text-gold/70">
            Dungeons &amp; Dragons 5e
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold text-gold-light">
            Grimório de Personagens
          </h1>
        </div>

        <div className="rounded-2xl border border-gold/30 bg-night-soft p-6 shadow-xl">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-night p-1">
            <button
              type="button"
              onClick={() => {
                setModo('login')
                setErro(null)
              }}
              className={`rounded-md py-2 text-sm font-medium transition ${
                modo === 'login'
                  ? 'bg-gold/20 text-gold-light'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setModo('cadastro')
                setErro(null)
              }}
              className={`rounded-md py-2 text-sm font-medium transition ${
                modo === 'cadastro'
                  ? 'bg-gold/20 text-gold-light'
                  : 'text-parchment/60 hover:text-parchment'
              }`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-parchment/80">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gold/20 bg-night px-3 py-2 text-parchment outline-none focus:border-gold/60"
                placeholder="voce@exemplo.com"
              />
            </div>

            <div>
              <label htmlFor="senha" className="mb-1 block text-sm text-parchment/80">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg border border-gold/20 bg-night px-3 py-2 text-parchment outline-none focus:border-gold/60"
                placeholder="mínimo 6 caracteres"
              />
            </div>

            {erro && (
              <p className="rounded-lg bg-wine/30 px-3 py-2 text-sm text-red-200">
                {erro}
              </p>
            )}
            {aviso && (
              <p className="rounded-lg bg-emerald-900/40 px-3 py-2 text-sm text-emerald-200">
                {aviso}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-lg bg-gold py-2.5 font-display font-semibold text-night transition hover:bg-gold-light disabled:opacity-50"
            >
              {enviando
                ? 'Aguarde...'
                : modo === 'login'
                  ? 'Entrar'
                  : 'Criar conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
