// Constantes e calculos do sistema D&D 5e (rotulos em portugues).

export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export interface Ability {
  key: AbilityKey
  label: string // nome completo
  abbr: string // abreviacao de 3 letras
}

export const ABILITIES: Ability[] = [
  { key: 'str', label: 'Força', abbr: 'FOR' },
  { key: 'dex', label: 'Destreza', abbr: 'DES' },
  { key: 'con', label: 'Constituição', abbr: 'CON' },
  { key: 'int', label: 'Inteligência', abbr: 'INT' },
  { key: 'wis', label: 'Sabedoria', abbr: 'SAB' },
  { key: 'cha', label: 'Carisma', abbr: 'CAR' },
]

export const ABILITY_LABEL: Record<AbilityKey, string> = {
  str: 'Força',
  dex: 'Destreza',
  con: 'Constituição',
  int: 'Inteligência',
  wis: 'Sabedoria',
  cha: 'Carisma',
}

export type SkillKey =
  | 'acrobacia'
  | 'arcanismo'
  | 'atletismo'
  | 'atuacao'
  | 'enganacao'
  | 'furtividade'
  | 'historia'
  | 'intimidacao'
  | 'intuicao'
  | 'investigacao'
  | 'lidarComAnimais'
  | 'medicina'
  | 'natureza'
  | 'percepcao'
  | 'persuasao'
  | 'prestidigitacao'
  | 'religiao'
  | 'sobrevivencia'

export interface Skill {
  key: SkillKey
  label: string
  ability: AbilityKey
}

// As 18 pericias do 5e, em ordem alfabetica, com o atributo associado.
export const SKILLS: Skill[] = [
  { key: 'acrobacia', label: 'Acrobacia', ability: 'dex' },
  { key: 'arcanismo', label: 'Arcanismo', ability: 'int' },
  { key: 'atletismo', label: 'Atletismo', ability: 'str' },
  { key: 'atuacao', label: 'Atuação', ability: 'cha' },
  { key: 'enganacao', label: 'Enganação', ability: 'cha' },
  { key: 'furtividade', label: 'Furtividade', ability: 'dex' },
  { key: 'historia', label: 'História', ability: 'int' },
  { key: 'intimidacao', label: 'Intimidação', ability: 'cha' },
  { key: 'intuicao', label: 'Intuição', ability: 'wis' },
  { key: 'investigacao', label: 'Investigação', ability: 'int' },
  { key: 'lidarComAnimais', label: 'Lidar com Animais', ability: 'wis' },
  { key: 'medicina', label: 'Medicina', ability: 'wis' },
  { key: 'natureza', label: 'Natureza', ability: 'int' },
  { key: 'percepcao', label: 'Percepção', ability: 'wis' },
  { key: 'persuasao', label: 'Persuasão', ability: 'cha' },
  { key: 'prestidigitacao', label: 'Prestidigitação', ability: 'dex' },
  { key: 'religiao', label: 'Religião', ability: 'int' },
  { key: 'sobrevivencia', label: 'Sobrevivência', ability: 'wis' },
]

// Classes de D&D 5e (para o seletor).
export const CLASSES = [
  'Bárbaro',
  'Bardo',
  'Bruxo',
  'Clérigo',
  'Druida',
  'Feiticeiro',
  'Guerreiro',
  'Ladino',
  'Mago',
  'Monge',
  'Paladino',
  'Patrulheiro',
] as const

// Mapeia o nome PT da classe para o nome em ingles usado nas regras do Aurora.
export const CLASS_PT_TO_EN: Record<string, string> = {
  'Bárbaro': 'Barbarian',
  'Bardo': 'Bard',
  'Bruxo': 'Warlock',
  'Clérigo': 'Cleric',
  'Druida': 'Druid',
  'Feiticeiro': 'Sorcerer',
  'Guerreiro': 'Fighter',
  'Ladino': 'Rogue',
  'Mago': 'Wizard',
  'Monge': 'Monk',
  'Paladino': 'Paladin',
  'Patrulheiro': 'Ranger',
}

export const ALIGNMENTS = [
  'Leal e Bom',
  'Neutro e Bom',
  'Caótico e Bom',
  'Leal e Neutro',
  'Neutro',
  'Caótico e Neutro',
  'Leal e Mau',
  'Neutro e Mau',
  'Caótico e Mau',
] as const

// ----------------------------- calculos -----------------------------

// Modificador de atributo: (valor - 10) / 2 arredondado para baixo.
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

// Bonus de proficiencia conforme o nivel (1-20).
export function proficiencyBonus(level: number): number {
  const lvl = Math.max(1, Math.min(20, level || 1))
  return Math.floor((lvl - 1) / 4) + 2
}

// Formata um numero como modificador: 3 -> "+3", -1 -> "-1".
export function formatModifier(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`
}
