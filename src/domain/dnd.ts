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

// Mapeia o nome PT da classe para o nome em ingles usado nas regras importadas.
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
  'Artífice': 'Artificer',
}

// Inverso: nome em ingles (das regras) -> nome PT.
export const CLASS_EN_TO_PT: Record<string, string> = Object.fromEntries(
  Object.entries(CLASS_PT_TO_EN).map(([pt, en]) => [en, pt]),
)

// Converte um nome exibido (PT ou ingles) para o ingles usado nas regras.
export function toEnglishClass(name: string): string {
  return CLASS_PT_TO_EN[name] ?? name
}

// Converte um nome em ingles (das regras) para o nome a exibir (PT se houver).
export function toDisplayClass(enName: string): string {
  return CLASS_EN_TO_PT[enName] ?? enName
}

// Racas: nome PT -> nome em ingles usado nas regras importadas.
export const RACE_PT_TO_EN: Record<string, string> = {
  'Humano': 'Human',
  'Anão': 'Dwarf',
  'Elfo': 'Elf',
  'Gnomo': 'Gnome',
  'Meio-elfo': 'Half-Elf',
  'Halfling': 'Halfling',
  'Meio-orc': 'Half-Orc',
  'Tiefling': 'Tiefling',
  'Draconato': 'Dragonborn',
}

export const RACE_EN_TO_PT: Record<string, string> = Object.fromEntries(
  Object.entries(RACE_PT_TO_EN).map(([pt, en]) => [en, pt]),
)

export function toEnglishRace(name: string): string {
  return RACE_PT_TO_EN[name] ?? name
}

export function toDisplayRace(enName: string): string {
  return RACE_EN_TO_PT[enName] ?? enName
}

// Antecedentes: nome em ingles (das regras) -> nome PT.
export const BACKGROUND_EN_TO_PT: Record<string, string> = {
  Acolyte: 'Acólito',
  Charlatan: 'Charlatão',
  Criminal: 'Criminoso',
  Entertainer: 'Artista',
  'Folk Hero': 'Herói do Povo',
  'Guild Artisan': 'Artesão de Guilda',
  Hermit: 'Eremita',
  Noble: 'Nobre',
  Outlander: 'Forasteiro',
  Sage: 'Sábio',
  Sailor: 'Marinheiro',
  Soldier: 'Soldado',
  Urchin: 'Órfão',
}

const BACKGROUND_PT_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(BACKGROUND_EN_TO_PT).map(([en, pt]) => [pt, en]),
)

export function toDisplayBackground(enName: string): string {
  return BACKGROUND_EN_TO_PT[enName] ?? enName
}

export function toEnglishBackground(name: string): string {
  return BACKGROUND_PT_TO_EN[name] ?? name
}

// Conjunto padrao de valores de atributo (Standard Array) do 5e.
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8] as const

// Idiomas comuns para escolha (em PT), sem o Comum (que ja vem por padrao).
export const LANGUAGES_PT = [
  'Anão',
  'Élfico',
  'Gigante',
  'Gnômico',
  'Goblin',
  'Halfling',
  'Orc',
  'Abissal',
  'Celestial',
  'Dracônico',
  'Fala Profunda',
  'Infernal',
  'Primordial',
  'Silvestre',
  'Subcomum',
] as const

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
