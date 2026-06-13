import {
  ABILITIES,
  abilityModifier,
  formatModifier,
  type AbilityKey,
} from '../../domain/dnd'
import type { AbilityScores } from '../../types/character'

export function SavingThrowsEditor({
  abilities,
  proficiencies,
  proficiencyBonus,
  onToggle,
}: {
  abilities: AbilityScores
  proficiencies: AbilityKey[]
  proficiencyBonus: number
  onToggle: (key: AbilityKey) => void
}) {
  return (
    <ul className="space-y-1">
      {ABILITIES.map((ab) => {
        const proficient = proficiencies.includes(ab.key)
        const total = abilityModifier(abilities[ab.key]) + (proficient ? proficiencyBonus : 0)
        return (
          <li key={ab.key}>
            <label className="flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-gold/5">
              <input
                type="checkbox"
                checked={proficient}
                onChange={() => onToggle(ab.key)}
                className="h-4 w-4 accent-gold"
              />
              <span className="w-10 text-right font-semibold text-gold-light">
                {formatModifier(total)}
              </span>
              <span className="text-parchment/80">{ab.label}</span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}
