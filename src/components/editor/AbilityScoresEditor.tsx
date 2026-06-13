import { ABILITIES, abilityModifier, formatModifier } from '../../domain/dnd'
import type { AbilityScores } from '../../types/character'

export function AbilityScoresEditor({
  abilities,
  onChange,
}: {
  abilities: AbilityScores
  onChange: (next: AbilityScores) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {ABILITIES.map((ab) => {
        const score = abilities[ab.key]
        const mod = abilityModifier(score)
        return (
          <div
            key={ab.key}
            className="flex flex-col items-center rounded-xl border border-gold/20 bg-night p-3"
          >
            <span className="font-display text-xs uppercase tracking-wide text-gold/70">
              {ab.abbr}
            </span>
            <span className="mt-1 text-2xl font-bold text-gold-light">
              {formatModifier(mod)}
            </span>
            <input
              type="number"
              min={1}
              max={30}
              value={score}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10)
                onChange({ ...abilities, [ab.key]: Number.isNaN(n) ? 0 : n })
              }}
              className="mt-2 w-16 rounded-lg border border-gold/20 bg-night-soft px-2 py-1 text-center text-parchment outline-none focus:border-gold/60"
            />
            <span className="mt-1 text-[11px] text-parchment/50">{ab.label}</span>
          </div>
        )
      })}
    </div>
  )
}
