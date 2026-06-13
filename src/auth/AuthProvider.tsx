import { useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext } from './AuthContext'

// Traduz as mensagens mais comuns do Supabase para portugues.
function traduzErro(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email ou senha incorretos.'
  if (m.includes('email not confirmed')) return 'Confirme seu email antes de entrar.'
  if (m.includes('user already registered')) return 'Esse email já está cadastrado.'
  if (m.includes('password should be at least'))
    return 'A senha precisa ter pelo menos 6 caracteres.'
  if (m.includes('unable to validate email address')) return 'Email inválido.'
  return message
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? traduzErro(error.message) : null }
  }

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error ? traduzErro(error.message) : null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const user: User | null = session?.user ?? null

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
