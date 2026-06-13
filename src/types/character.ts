// Estrutura completa da ficha 5e vive aqui. Por enquanto so o esqueleto;
// os campos detalhados (atributos, pericias, magias...) entram no passo 4.

export interface CharacterRow {
  id: string
  user_id: string
  name: string
  char_class: string | null
  level: number
  race: string | null
  avatar_url: string | null
  data: CharacterData
  created_at: string
  updated_at: string
}

// Dados detalhados da ficha (JSONB "data" no banco). Vai crescer no passo 4.
export interface CharacterData {
  background?: string
  alignment?: string
  // ...campos completos da ficha 5e entram no passo 4
}
