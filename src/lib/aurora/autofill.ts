import { abilityModifier, ABILITY_LABEL, SKILLS, type AbilityKey } from '../../domain/dnd'
import type { CharacterData } from '../../types/character'
import type { ParsedClass, ParsedRace, ParsedArchetype } from './parse'

// Marcador que separa o texto do usuario do conteudo gerado automaticamente.
// Tudo abaixo dele e regenerado a cada preenchimento; o que esta acima e preservado.
export const AUTO_MARK = '——— preenchido automaticamente das regras (não editar abaixo) ———'

function stripAuto(text: string): string {
  const i = text.indexOf(AUTO_MARK)
  return i === -1 ? text : text.slice(0, i).trimEnd()
}

function withAuto(userText: string, generated: string): string {
  const base = stripAuto(userText).trim()
  const block = `${AUTO_MARK}\n${generated.trim()}`
  return base ? `${base}\n\n${block}` : block
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

export interface AutofillInput {
  cls: ParsedClass | null
  archetype: ParsedArchetype | null
  race: ParsedRace | null
  level: number
}

// Aplica os dados das regras sobre a ficha atual, preservando o texto do
// usuario (acima do marcador) e regenerando o bloco automatico.
export function applyRules(data: CharacterData, input: AutofillInput): CharacterData {
  const { cls, archetype, race, level } = input
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

  if (race) {
    if (race.speedFt) next.speed = ftToMeters(race.speedFt)
  }

  // --- Bloco automatico de caracteristicas (classe + subclasse, ate o nivel) ---
  const featLines: string[] = []
  if (cls) {
    featLines.push(`### ${cls.name} (nível ${level})`)
    cls.features
      .filter((f) => f.level <= level)
      .forEach((f) => featLines.push(`• [N${f.level}] ${f.name}: ${f.text}`))
  }
  if (archetype) {
    featLines.push('', `### ${archetype.name}`)
    archetype.features
      .filter((f) => f.level <= level)
      .forEach((f) => featLines.push(`• [N${f.level}] ${f.name}: ${f.text}`))
  }
  if (race?.traits.length) {
    featLines.push('', `### Traços de ${race.name}`)
    race.traits.forEach((t) => featLines.push(`• ${t.name}: ${t.text}`))
  }
  if (featLines.length) {
    next.featuresAndTraits = withAuto(next.featuresAndTraits, featLines.join('\n'))
  }

  // --- Bloco automatico de proficiencias e idiomas ---
  const profLines: string[] = []
  if (cls) {
    if (cls.armor.length) profLines.push(`Armaduras: ${cls.armor.join(', ')}`)
    if (cls.weapons.length) profLines.push(`Armas: ${cls.weapons.join(', ')}`)
    if (cls.skillChoose) {
      const opts = cls.skillOptions
        .map((k) => SKILLS.find((s) => s.key === k)?.label ?? k)
        .join(', ')
      profLines.push(`Perícias: escolha ${cls.skillChoose} entre: ${opts}`)
    }
  }
  if (race) {
    if (race.languages.length) profLines.push(`Idiomas: ${race.languages.join(', ')}`)
    const bonuses = Object.entries(race.abilityBonuses)
      .map(([k, v]) => `+${v} ${ABILITY_LABEL[k as AbilityKey]}`)
      .join(', ')
    if (bonuses) profLines.push(`Bônus racial de atributo: ${bonuses}`)
  }
  if (profLines.length) {
    next.otherProficiencies = withAuto(next.otherProficiencies, profLines.join('\n'))
  }

  return next
}
