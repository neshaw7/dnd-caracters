import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Flag usada pelas telas para mostrar um aviso amigavel quando o .env ainda
// nao foi preenchido (em vez de quebrar o app com tela branca).
export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase nao configurado: preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env',
  )
}

// Quando nao configurado, criamos um cliente com valores placeholder so para
// o app montar. As chamadas reais so acontecem depois do login, que fica
// bloqueado pela tela de aviso enquanto o .env estiver vazio.
// Usamos || (e nao ??) de proposito: no .env os valores vazios chegam como
// string vazia "", que o ?? nao trataria como ausente e faria o createClient
// lancar "supabaseUrl is required" ao carregar o modulo.
export const supabase = createClient(
  url || 'http://localhost',
  anonKey || 'public-anon-key-placeholder',
)
