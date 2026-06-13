// Parser do formato XML do Aurora Builder.
// Extrai classes (com subclasses), racas, caracteristicas (com texto) e a
// conjuracao de subclasses. Foca nos campos que dao pra mapear com seguranca.

import type { AbilityKey, SkillKey } from '../../domain/dnd'

export interface ParsedFeature {
  id: string
  level: number
  name: string
  text: string
}

export interface ParsedArchetype {
  id: string
  name: string
  source: string
  spellcastingAbility: AbilityKey | null
  features: ParsedFeature[]
}

export interface ParsedClass {
  id: string
  name: string
  source: string
  hitDie: number
  savingThrows: AbilityKey[]
  armor: string[]
  weapons: string[]
  tools: string[]
  skillChoose: number
  skillOptions: SkillKey[]
  features: ParsedFeature[]
  archetypes: ParsedArchetype[]
}

export interface ParsedRace {
  id: string
  name: string
  source: string
  abilityBonuses: Partial<Record<AbilityKey, number>>
  speedFt: number
  size: string
  languages: string[]
  traits: { name: string; text: string }[]
}

export interface ParsedFile {
  classes: ParsedClass[]
  races: ParsedRace[]
}

// ----------------------------- mapeamentos -----------------------------

const STAT_TO_ABILITY: Record<string, AbilityKey> = {
  strength: 'str',
  dexterity: 'dex',
  constitution: 'con',
  intelligence: 'int',
  wisdom: 'wis',
  charisma: 'cha',
}

const ABILITY_NAME_TO_KEY: Record<string, AbilityKey> = {
  strength: 'str',
  dexterity: 'dex',
  constitution: 'con',
  intelligence: 'int',
  wisdom: 'wis',
  charisma: 'cha',
}

const SAVE_ID_TO_ABILITY: Record<string, AbilityKey> = {
  ID_PROFICIENCY_SAVINGTHROW_STRENGTH: 'str',
  ID_PROFICIENCY_SAVINGTHROW_DEXTERITY: 'dex',
  ID_PROFICIENCY_SAVINGTHROW_CONSTITUTION: 'con',
  ID_PROFICIENCY_SAVINGTHROW_INTELLIGENCE: 'int',
  ID_PROFICIENCY_SAVINGTHROW_WISDOM: 'wis',
  ID_PROFICIENCY_SAVINGTHROW_CHARISMA: 'cha',
}

const ARMOR_ID_TO_LABEL: Record<string, string> = {
  ID_PROFICIENCY_ARMOR_PROFICIENCY_LIGHT_ARMOR: 'Armadura leve',
  ID_PROFICIENCY_ARMOR_PROFICIENCY_MEDIUM_ARMOR: 'Armadura média',
  ID_PROFICIENCY_ARMOR_PROFICIENCY_HEAVY_ARMOR: 'Armadura pesada',
  ID_PROFICIENCY_ARMOR_PROFICIENCY_SHIELDS: 'Escudos',
}

const WEAPON_ID_TO_LABEL: Record<string, string> = {
  ID_PROFICIENCY_WEAPON_PROFICIENCY_SIMPLE_WEAPONS: 'Armas simples',
  ID_PROFICIENCY_WEAPON_PROFICIENCY_MARTIAL_WEAPONS: 'Armas marciais',
}

const SKILL_EN_TO_KEY: Record<string, SkillKey> = {
  acrobatics: 'acrobacia',
  'animal handling': 'lidarComAnimais',
  arcana: 'arcanismo',
  athletics: 'atletismo',
  deception: 'enganacao',
  history: 'historia',
  insight: 'intuicao',
  intimidation: 'intimidacao',
  investigation: 'investigacao',
  medicine: 'medicina',
  nature: 'natureza',
  perception: 'percepcao',
  performance: 'atuacao',
  persuasion: 'persuasao',
  religion: 'religiao',
  'sleight of hand': 'prestidigitacao',
  stealth: 'furtividade',
  survival: 'sobrevivencia',
}

const LANGUAGE_ID_TO_PT: Record<string, string> = {
  ID_LANGUAGE_COMMON: 'Comum',
  ID_LANGUAGE_DWARVISH: 'Anão',
  ID_LANGUAGE_ELVISH: 'Élfico',
  ID_LANGUAGE_GIANT: 'Gigante',
  ID_LANGUAGE_GNOMISH: 'Gnômico',
  ID_LANGUAGE_GOBLIN: 'Goblin',
  ID_LANGUAGE_HALFLING: 'Halfling',
  ID_LANGUAGE_ORC: 'Orc',
  ID_LANGUAGE_ABYSSAL: 'Abissal',
  ID_LANGUAGE_CELESTIAL: 'Celestial',
  ID_LANGUAGE_DRACONIC: 'Dracônico',
  ID_LANGUAGE_DEEP_SPEECH: 'Fala Profunda',
  ID_LANGUAGE_INFERNAL: 'Infernal',
  ID_LANGUAGE_PRIMORDIAL: 'Primordial',
  ID_LANGUAGE_SYLVAN: 'Silvestre',
  ID_LANGUAGE_UNDERCOMMON: 'Subcomum',
}

function languageName(id: string): string {
  if (LANGUAGE_ID_TO_PT[id]) return LANGUAGE_ID_TO_PT[id]
  const raw = id.replace(/^ID_LANGUAGE_/, '').replace(/_/g, ' ').toLowerCase()
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

// ----------------------------- helpers -----------------------------

function parseXml(xml: string): Document {
  return new DOMParser().parseFromString(xml, 'application/xml')
}

function collapse(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

// Texto de uma feature: prefere o <sheet><description> (resumido), senao o
// <description> completo.
function featureText(el: Element): string {
  const sheetDesc = el.querySelector('sheet > description')
  if (sheetDesc?.textContent) return collapse(sheetDesc.textContent)
  const desc = el.querySelector('description')
  return collapse(desc?.textContent ?? '')
}

// Detecta o atributo de conjuracao dentro de uma feature (<spellcasting ability="..">).
function spellcastingAbilityOf(el: Element): AbilityKey | null {
  const sc = el.querySelector('spellcasting')
  const ability = (sc?.getAttribute('ability') ?? '').toLowerCase()
  return ABILITY_NAME_TO_KEY[ability] ?? null
}

// ----------------------------- parser -----------------------------

function parseHitDie(el: Element): number {
  const set = el.querySelector('setters > set[name="hd"]')
  const n = parseInt((set?.textContent ?? '').replace(/[^0-9]/g, ''), 10)
  return Number.isNaN(n) ? 0 : n
}

function parseSkillOptions(descText: string): SkillKey[] {
  const m = descText.match(/Choose\s+\w+\s+from\s+([^.]+)/i)
  if (!m) return []
  const found: SkillKey[] = []
  const chunk = m[1].toLowerCase()
  for (const [en, key] of Object.entries(SKILL_EN_TO_KEY)) {
    if (chunk.includes(en) && !found.includes(key)) found.push(key)
  }
  return found
}

// Resolve uma lista de grants (id+level) usando o mapa de features (id -> nome/texto).
function resolveFeatures(
  grants: { id: string; level: number }[],
  featureMap: Map<string, { name: string; text: string }>,
): ParsedFeature[] {
  return grants
    .map((g) => {
      const f = featureMap.get(g.id)
      return f ? { id: g.id, level: g.level, name: f.name, text: f.text } : null
    })
    .filter((f): f is ParsedFeature => f !== null)
    .sort((a, b) => a.level - b.level)
}

function grantsOf(el: Element, grantType: string): { id: string; level: number }[] {
  const rules = el.querySelector('rules')
  if (!rules) return []
  return Array.from(rules.querySelectorAll(`grant[type="${grantType}"]`)).map((g) => ({
    id: g.getAttribute('id') ?? '',
    level: parseInt(g.getAttribute('level') ?? '1', 10) || 1,
  }))
}

function parseClass(
  el: Element,
  featureMap: Map<string, { name: string; text: string }>,
  archetypes: ParsedArchetype[],
): ParsedClass {
  const rules = el.querySelector('rules')
  const savingThrows: AbilityKey[] = []
  const armor: string[] = []
  const weapons: string[] = []
  const tools: string[] = []
  let skillChoose = 0

  if (rules) {
    rules.querySelectorAll('grant[type="Proficiency"]').forEach((g) => {
      const id = g.getAttribute('id') ?? ''
      if (SAVE_ID_TO_ABILITY[id]) savingThrows.push(SAVE_ID_TO_ABILITY[id])
      else if (ARMOR_ID_TO_LABEL[id]) armor.push(ARMOR_ID_TO_LABEL[id])
      else if (WEAPON_ID_TO_LABEL[id]) weapons.push(WEAPON_ID_TO_LABEL[id])
    })
    rules.querySelectorAll('select[type="Proficiency"]').forEach((s) => {
      const supports = (s.getAttribute('supports') ?? '').toLowerCase()
      const name = (s.getAttribute('name') ?? '').toLowerCase()
      const num = parseInt(s.getAttribute('number') ?? '0', 10) || 0
      if ((supports.includes('skill') || name.includes('skill')) && num > skillChoose) {
        skillChoose = num
      }
    })
  }

  const descText = el.querySelector('description')?.textContent ?? ''

  return {
    id: el.getAttribute('id') ?? '',
    name: el.getAttribute('name') ?? '',
    source: el.getAttribute('source') ?? '',
    hitDie: parseHitDie(el),
    savingThrows,
    armor,
    weapons,
    tools,
    skillChoose,
    skillOptions: parseSkillOptions(descText),
    features: resolveFeatures(grantsOf(el, 'Class Feature'), featureMap),
    archetypes,
  }
}

function parseArchetype(
  el: Element,
  featureMap: Map<string, { name: string; text: string }>,
  spellcastingByFeatureId: Map<string, AbilityKey>,
): ParsedArchetype {
  const grants = grantsOf(el, 'Archetype Feature')
  let spellcastingAbility: AbilityKey | null = null
  for (const g of grants) {
    if (spellcastingByFeatureId.has(g.id)) {
      spellcastingAbility = spellcastingByFeatureId.get(g.id)!
      break
    }
  }
  return {
    id: el.getAttribute('id') ?? '',
    name: el.getAttribute('name') ?? '',
    source: el.getAttribute('source') ?? '',
    spellcastingAbility,
    features: resolveFeatures(grants, featureMap),
  }
}

function parseRaceTraits(el: Element): { name: string; text: string }[] {
  const traits: { name: string; text: string }[] = []
  el.querySelectorAll('description span.feature').forEach((span) => {
    const rawName = (span.textContent ?? '').trim()
    if (rawName.endsWith(':')) return
    const name = rawName.replace(/\.\s*$/, '').trim()
    let text = ''
    let node = span.nextSibling
    while (
      node &&
      !(node.nodeType === 1 && (node as Element).tagName.toLowerCase() === 'br')
    ) {
      text += node.textContent ?? ''
      node = node.nextSibling
    }
    if (name) traits.push({ name, text: collapse(text) })
  })
  return traits
}

function parseRace(el: Element): ParsedRace {
  const abilityBonuses: Partial<Record<AbilityKey, number>> = {}
  let speedFt = 0
  let size = ''
  const languages: string[] = []

  const rules = el.querySelector('rules')
  if (rules) {
    rules.querySelectorAll('stat').forEach((st) => {
      const name = (st.getAttribute('name') ?? '').toLowerCase()
      const value = parseInt(st.getAttribute('value') ?? '0', 10) || 0
      if (STAT_TO_ABILITY[name]) {
        abilityBonuses[STAT_TO_ABILITY[name]] =
          (abilityBonuses[STAT_TO_ABILITY[name]] ?? 0) + value
      } else if (name === 'innate speed') {
        speedFt = value
      }
    })
    rules.querySelectorAll('grant[type="Language"]').forEach((g) => {
      const id = g.getAttribute('id') ?? ''
      if (id) languages.push(languageName(id))
    })
    const sizeGrant = rules.querySelector('grant[type="Size"]')
    if (sizeGrant) {
      size = (sizeGrant.getAttribute('id') ?? '').replace(/^ID_SIZE_/, '').toLowerCase()
    }
  }

  return {
    id: el.getAttribute('id') ?? '',
    name: el.getAttribute('name') ?? '',
    source: el.getAttribute('source') ?? '',
    abilityBonuses,
    speedFt,
    size,
    languages,
    traits: parseRaceTraits(el),
  }
}

// Parseia um arquivo XML inteiro (classe + subclasses + features, ou racas).
export function parseAuroraFile(xml: string): ParsedFile {
  const doc = parseXml(xml)

  // Mapa de features (Class Feature + Archetype Feature) id -> {nome, texto}
  // e mapa de conjuracao por feature.
  const featureMap = new Map<string, { name: string; text: string }>()
  const spellcastingByFeatureId = new Map<string, AbilityKey>()
  doc
    .querySelectorAll('element[type="Class Feature"], element[type="Archetype Feature"]')
    .forEach((el) => {
      const id = el.getAttribute('id') ?? ''
      if (!id) return
      featureMap.set(id, { name: el.getAttribute('name') ?? '', text: featureText(el) })
      const ability = spellcastingAbilityOf(el)
      if (ability) spellcastingByFeatureId.set(id, ability)
    })

  // Arquetipos (subclasses) do arquivo.
  const archetypes: ParsedArchetype[] = []
  doc.querySelectorAll('element[type="Archetype"]').forEach((el) => {
    archetypes.push(parseArchetype(el, featureMap, spellcastingByFeatureId))
  })

  // Classes (associa todos os arquetipos do arquivo a classe, ja que cada
  // arquivo de classe contem so uma classe + suas subclasses).
  const classes: ParsedClass[] = []
  doc.querySelectorAll('element[type="Class"]').forEach((el) => {
    classes.push(parseClass(el, featureMap, archetypes))
  })

  const races: ParsedRace[] = []
  doc.querySelectorAll('element[type="Race"]').forEach((el) => {
    races.push(parseRace(el))
  })

  return { classes, races }
}
