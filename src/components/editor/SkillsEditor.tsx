import {
  SKILLS,
  ABILITY_LABEL,
  abilityModifier,
  formatModifier,
  type SkillKey,
} from '../../domain/dnd'
import type { AbilityScores } from '../../types/character'

export function SkillsEditor({
  abilities,
  proficiencyBonus,
  skillProficiencies,
  skillExpertise,
  onToggleProficiency,
  onToggleExpertise,
}: {
  abilities: AbilityScores
  proficiencyBonus: number
  skillProficiencies: SkillKey[]
  skillExpertise: SkillKey[]
  onToggleProficiency: (key: SkillKey) => void
  onToggleExpertise: (key: SkillKey) => void
}) {
  return (
    <ul className="space-y-0.5">
      {SKILLS.map((sk) => {
        const proficient = skillProficiencies.includes(sk.key)
        const expert = skillExpertise.includes(sk.key)
        const base = abilityModifier(abilities[sk.ability])
        const bonus = expert ? proficiencyBonus * 2 : proficient ? proficiencyBonus : 0
        const total = base + bonus
        return (
          <li
            key={sk.key}
            className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-gold/5"
          >
            <input
              type="checkbox"
              checked={proficient}
              onChange={() => onToggleProficiency(sk.key)}
              title="Proficiente"
              className="h-4 w-4 accent-gold"
            />
            <input
              type="checkbox"
              checked={expert}
              onChange={() => onToggleExpertise(sk.key)}
              title="Especialização (dobra a proficiência)"
              className="h-3.5 w-3.5 accent-gold-light"
            />
            <span className="w-9 text-right font-semibold text-gold-light">
              {formatModifier(total)}
            </span>
            <span className="flex-1 text-parchment/80">{sk.label}</span>
            <span className="text-xs text-parchment/40">
              {ABILITY_LABEL[sk.ability].slice(0, 3)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
