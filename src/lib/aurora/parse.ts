// Parser do formato XML do Aurora Builder.
// Extrai os campos mecanicos confiaveis de classes e racas. O texto descritivo
// completo pode vir depois; aqui focamos no que da pra mapear com seguranca.

import type { AbilityKey, SkillKey } from '../../domain/dnd'

export interface ParsedFeatureRow {
  level: number
  names: string[]
}

export interface ParsedClass {
  id: string
  name: string
  source: string
  hitDie: number // ex: 12
  savingThrows: AbilityKey[]
  armor: string[]
  weapons: string[]
  tools: string[]
  skillChoose: number
  skillOptions: SkillKey[]
  featuresByLevel: ParsedFeatureRow[]
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

// Nomes das pericias em ingles (como vem no texto) -> nossas chaves.
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

// Idiomas (ID -> nome PT) para os mais comuns; o resto cai no fallback.
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
  // Fallback: ID_LANGUAGE_FOO -> "Foo"
  const raw = id.replace(/^ID_LANGUAGE_/, '').replace(/_/g, ' ').toLowerCase()
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

// ----------------------------- parser -----------------------------

function parseXml(xml: string): Document {
  return new DOMParser().parseFromString(xml, 'application/xml')
}

function parseHitDie(el: Element): number {
  const set = el.querySelector('setters > set[name="hd"]')
  const txt = set?.textContent?.trim() ?? '' // ex: "d12"
  const n = parseInt(txt.replace(/[^0-9]/g, ''), 10)
  return Number.isNaN(n) ? 0 : n
}

function parseClass(el: Element): ParsedClass {
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
    // Numero de pericias: <select type="Proficiency" ... number="2">
    rules.querySelectorAll('select[type="Proficiency"]').forEach((s) => {
      const supports = (s.getAttribute('supports') ?? '').toLowerCase()
      const name = (s.getAttribute('name') ?? '').toLowerCase()
      if (supports.includes('skill') || name.includes('skill')) {
        skillChoose = parseInt(s.getAttribute('number') ?? '0', 10) || 0
      }
    })
  }

  // Opcoes de pericia: parse do texto "Choose two from X, Y, and Z".
  const descText = el.querySelector('description')?.textContent ?? ''
  const skillOptions = parseSkillOptions(descText)

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
    skillOptions,
    featuresByLevel: parseFeatureTable(el),
  }
}

function parseSkillOptions(descText: string): SkillKey[] {
  // Procura "Skills: Choose ... from <lista>" ou "Choose ... from <lista>".
  const m = descText.match(/Choose\s+\w+\s+from\s+([^.]+)/i)
  if (!m) return []
  const found: SkillKey[] = []
  const chunk = m[1].toLowerCase()
  for (const [en, key] of Object.entries(SKILL_EN_TO_KEY)) {
    if (chunk.includes(en) && !found.includes(key)) found.push(key)
  }
  return found
}

function parseFeatureTable(el: Element): ParsedFeatureRow[] {
  // A tabela class-features tem linhas com nivel e a coluna de features (.left).
  const rows: ParsedFeatureRow[] = []
  const table = el.querySelector('table.class-features')
  if (!table) return rows
  table.querySelectorAll('tr').forEach((tr) => {
    const cells = tr.querySelectorAll('td')
    if (cells.length < 2) return
    const levelTxt = cells[0].textContent?.trim() ?? ''
    const level = parseInt(levelTxt.replace(/[^0-9]/g, ''), 10)
    if (Number.isNaN(level)) return // pula o cabecalho
    const featureCell = tr.querySelector('td.left')
    const names = (featureCell?.textContent ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s !== '—' && !/^Path feature$/i.test(s))
    if (names.length) rows.push({ level, names })
  })
  return rows
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
      size = (sizeGrant.getAttribute('id') ?? '')
        .replace(/^ID_SIZE_/, '')
        .toLowerCase()
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

function parseRaceTraits(el: Element): { name: string; text: string }[] {
  // Tracos no formato <span class="feature">Nome.</span>texto<br/>
  const traits: { name: string; text: string }[] = []
  el.querySelectorAll('description span.feature').forEach((span) => {
    const rawName = (span.textContent ?? '').trim()
    // Ignora listas de nomes ("Calishite Names:", etc.) e flavor: tracos
    // reais terminam com ponto, nao com dois-pontos.
    if (rawName.endsWith(':')) return
    const name = rawName.replace(/\.\s*$/, '').trim()
    // Texto = irmaos ate o proximo <br>
    let text = ''
    let node = span.nextSibling
    while (
      node &&
      !(node.nodeType === 1 && (node as Element).tagName.toLowerCase() === 'br')
    ) {
      text += node.textContent ?? ''
      node = node.nextSibling
    }
    if (name) traits.push({ name, text: text.trim() })
  })
  return traits
}

// Parseia um arquivo XML inteiro, retornando todas as classes e racas nele.
export function parseAuroraFile(xml: string): ParsedFile {
  const doc = parseXml(xml)
  const classes: ParsedClass[] = []
  const races: ParsedRace[] = []

  doc.querySelectorAll('element[type="Class"]').forEach((el) => {
    classes.push(parseClass(el))
  })
  doc.querySelectorAll('element[type="Race"]').forEach((el) => {
    races.push(parseRace(el))
  })

  return { classes, races }
}
