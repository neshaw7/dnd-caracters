import type { AbilityKey, SkillKey } from '../domain/dnd'

// Linha da tabela "characters" no Supabase.
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

export interface AbilityScores {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export interface Attack {
  id: string
  name: string
  bonus: string // ex: "+5"
  damage: string // ex: "1d8+3 cortante"
}

export interface Coins {
  cp: number // peças de cobre
  sp: number // prata
  ep: number // electro
  gp: number // ouro
  pp: number // platina
}

export interface DeathSaves {
  successes: number
  failures: number
}

export interface Personality {
  traits: string // traços de personalidade
  ideals: string // ideais
  bonds: string // vínculos
  flaws: string // fraquezas
}

export interface Appearance {
  age: string
  height: string
  weight: string
  eyes: string
  skin: string
  hair: string
}

export interface SpellSlot {
  total: number
  expended: number
}

export interface Spell {
  id: string
  level: number // 0 = truque (cantrip)
  name: string
  prepared: boolean
}

export interface Spellcasting {
  ability: AbilityKey | ''
  slots: SpellSlot[] // indices 1..9 usados (indice 0 ignorado)
  spells: Spell[]
}

// Ficha completa guardada na coluna JSONB "data".
export interface CharacterData {
  // Identidade
  background: string // antecedente
  alignment: string // alinhamento
  playerName: string // nome do jogador
  xp: number // pontos de experiência
  inspiration: boolean

  // Atributos
  abilities: AbilityScores
  savingThrowProficiencies: AbilityKey[]
  skillProficiencies: SkillKey[]
  skillExpertise: SkillKey[]

  // Combate
  armorClass: number
  speed: number
  maxHp: number
  currentHp: number
  tempHp: number
  hitDice: string // ex: "3d8"
  deathSaves: DeathSaves
  attacks: Attack[]

  // Recursos
  equipment: string
  coins: Coins

  // Texto descritivo
  personality: Personality
  featuresAndTraits: string // características e traços
  otherProficiencies: string // outras proficiências e idiomas
  backstory: string // história do personagem

  // Aparência
  appearance: Appearance

  // Magia
  spellcasting: Spellcasting
}

// Ficha vazia padrao para um novo personagem.
export function emptyCharacterData(): CharacterData {
  return {
    background: '',
    alignment: '',
    playerName: '',
    xp: 0,
    inspiration: false,
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    savingThrowProficiencies: [],
    skillProficiencies: [],
    skillExpertise: [],
    armorClass: 10,
    speed: 9, // metros (9m = 30ft)
    maxHp: 0,
    currentHp: 0,
    tempHp: 0,
    hitDice: '',
    deathSaves: { successes: 0, failures: 0 },
    attacks: [],
    equipment: '',
    coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    personality: { traits: '', ideals: '', bonds: '', flaws: '' },
    featuresAndTraits: '',
    otherProficiencies: '',
    backstory: '',
    appearance: { age: '', height: '', weight: '', eyes: '', skin: '', hair: '' },
    spellcasting: {
      ability: '',
      slots: Array.from({ length: 10 }, () => ({ total: 0, expended: 0 })),
      spells: [],
    },
  }
}
