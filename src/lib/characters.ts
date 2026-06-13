import { supabase } from './supabase'
import type { CharacterData, CharacterRow } from '../types/character'
import { emptyCharacterData } from '../types/character'

// Campos "soltos" usados na galeria, separados da ficha completa (JSONB data).
export interface CharacterListItem {
  id: string
  name: string
  char_class: string | null
  level: number
  race: string | null
  avatar_url: string | null
  updated_at: string
}

export interface NewCharacterInput {
  name: string
  char_class?: string
  level?: number
  race?: string
}

// Gera um id curto para itens aninhados (ataques, magias).
export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// Lista os personagens do usuario logado (campos resumidos para os cards).
export async function listCharacters(): Promise<CharacterListItem[]> {
  const { data, error } = await supabase
    .from('characters')
    .select('id, name, char_class, level, race, avatar_url, updated_at')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as CharacterListItem[]
}

// Busca a ficha completa de um personagem.
export async function getCharacter(id: string): Promise<CharacterRow> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  // Garante que campos novos da ficha existam mesmo em registros antigos.
  const row = data as CharacterRow
  row.data = { ...emptyCharacterData(), ...(row.data ?? {}) }
  return row
}

// Cria um personagem novo com a ficha vazia padrao.
export async function createCharacter(input: NewCharacterInput): Promise<string> {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id

  const { data, error } = await supabase
    .from('characters')
    .insert({
      user_id: userId,
      name: input.name,
      char_class: input.char_class ?? null,
      level: input.level ?? 1,
      race: input.race ?? null,
      data: emptyCharacterData(),
    })
    .select('id')
    .single()

  if (error) throw error
  return (data as { id: string }).id
}

// Salva alteracoes da ficha. Mantem as colunas "soltas" em sincronia com a galeria.
export async function updateCharacter(
  id: string,
  fields: {
    name: string
    char_class: string | null
    level: number
    race: string | null
    avatar_url: string | null
    data: CharacterData
  },
): Promise<void> {
  const { error } = await supabase
    .from('characters')
    .update({
      name: fields.name,
      char_class: fields.char_class,
      level: fields.level,
      race: fields.race,
      avatar_url: fields.avatar_url,
      data: fields.data,
    })
    .eq('id', id)

  if (error) throw error
}

// Apaga um personagem.
export async function deleteCharacter(id: string): Promise<void> {
  const { error } = await supabase.from('characters').delete().eq('id', id)
  if (error) throw error
}
