import {
  abilityModifier,
  ABILITY_LABEL,
  SKILLS,
  toDisplayClass,
  toDisplayBackground,
  type AbilityKey,
} from '../../domain/dnd'
import type { AppliedFeature, CharacterData } from '../../types/character'
import type {
  ParsedClass,
  ParsedRace,
  ParsedArchetype,
  ParsedBackground,
  ParsedFeature,
} from './parse'
import { FEATURE_PT, SUBCLASS_PT } from './translations'

// Marcador que separa o texto do usuario do conteudo gerado automaticamente.
export const AUTO_MARK = '——— preenchido automaticamente das regras (não editar abaixo) ———'

// Remove qualquer bloco automatico antigo (versoes anteriores marcavam com AUTO_MARK).
function stripAuto(text: string): string {
  const i = text.indexOf(AUTO_MARK)
  return i === -1 ? text : text.slice(0, i).trimEnd()
}

// PV maximo sugerido: 1o nivel cheio + media nos demais, somando o mod de CON.
function suggestedMaxHp(hitDie: number, level: number, conMod: number): number {
  if (!hitDie) return 0
  const perLevelAvg = Math.floor(hitDie / 2) + 1
  return hitDie + conMod + Math.max(0, level - 1) * (perLevelAvg + conMod)
}

function ftToMeters(ft: number): number {
  return Math.round(ft * 0.3)
}

// Aplica a traducao PT a uma feature (se houver) e devolve {name, text}.
function translateFeature(f: ParsedFeature): { name: string; text: string } {
  const pt = FEATURE_PT[f.id]
  return pt ? { name: pt.name, text: pt.text } : { name: f.name, text: f.text }
}

export interface AutofillInput {
  cls: ParsedClass | null
  archetype: ParsedArchetype | null
  race: ParsedRace | null
  background?: ParsedBackground | null
  level: number
}

// Aplica os dados das regras sobre a ficha atual.
export function applyRules(data: CharacterData, input: AutofillInput): CharacterData {
  const { cls, archetype, race, background, level } = input
  const next: CharacterData = structuredClone(data)
  const conMod = abilityModifier(next.abilities.con)

  if (cls) {
    next.savingThrowProficiencies = [...cls.savingThrows]
    next.hitDice = `${level}d${cls.hitDie}`
    const hp = suggestedMaxHp(cls.hitDie, level, conMod)
    next.maxHp = hp
    if (!next.currentHp) next.currentHp = hp
  }

  if (archetype?.spellcastingAbility) {
    next.spellcasting.ability = archetype.spellcastingAbility
  }

  if (race?.speedFt) next.speed = ftToMeters(race.speedFt)

  // --- Caracteristicas estruturadas (viram cards na ficha) ---
  const features: AppliedFeature[] = []
  if (cls) {
    const clsLabel = toDisplayClass(cls.name)
    cls.features
      .filter((f) => f.level <= level)
      .forEach((f) => {
        const t = translateFeature(f)
        features.push({ source: clsLabel, level: f.level, name: t.name, text: t.text })
      })
  }
  if (archetype) {
    const subLabel = SUBCLASS_PT[archetype.name] ?? archetype.name
    archetype.features
      .filter((f) => f.level <= level)
      .forEach((f) => {
        const t = translateFeature(f)
        features.push({ source: subLabel, level: f.level, name: t.name, text: t.text })
      })
  }
  if (background?.feature) {
    const pt = FEATURE_PT[background.feature.id]
    features.push({
      source: toDisplayBackground(background.name),
      level: 1,
      name: pt?.name ?? background.feature.name,
      text: pt?.text ?? background.feature.text,
    })
  }
  next.appliedFeatures = features
  // Remove bloco automatico antigo que ficava no texto livre (versoes anteriores).
  next.featuresAndTraits = stripAuto(next.featuresAndTraits)

  // --- Espacos de magia: soma cumulativa dos stats ate o nivel do personagem ---
  const slotStats = [...(cls?.spellSlots ?? []), ...(archetype?.spellSlots ?? [])]
  if (slotStats.length) {
    const totals = Array(10).fill(0) as number[]
    for (const s of slotStats) {
      if (s.atLevel <= level && s.circle >= 1 && s.circle <= 9) {
        totals[s.circle] += s.value
      }
    }
    next.spellcasting.slots = next.spellcasting.slots.map((slot, i) => ({
      total: totals[i],
      expended: totals[i] ? Math.min(slot.expended, totals[i]) : 0,
    }))
  }

  // --- Bloco de proficiencias e idiomas (texto gerado, sem marcador) ---
  const profLines: string[] = []
  if (cls) {
    if (cls.armor.length) profLines.push(`Armaduras: ${cls.armor.join(', ')}`)
    if (cls.weapons.length) profLines.push(`Armas: ${cls.weapons.join(', ')}`)
    if (cls.skillChoose) {
      const opts = cls.skillOptions
        .map((k) => SKILLS.find((s) => s.key === k)?.label ?? k)
        .join(', ')
      profLines.push(`Perícias da classe: escolha ${cls.skillChoose} entre: ${opts}`)
    }
  }
  if (background?.tools.length) {
    profLines.push(`Ferramentas: ${background.tools.join(', ')}`)
  }
  if (race) {
    if (race.languages.length) profLines.push(`Idiomas: ${race.languages.join(', ')}`)
    const bonuses = Object.entries(race.abilityBonuses)
      .map(([k, v]) => `+${v} ${ABILITY_LABEL[k as AbilityKey]}`)
      .join(', ')
    if (bonuses) profLines.push(`Bônus racial de atributo: ${bonuses}`)
  }
  if (profLines.length) {
    next.otherProficiencies = profLines.join('\n')
  }

  return next
}
