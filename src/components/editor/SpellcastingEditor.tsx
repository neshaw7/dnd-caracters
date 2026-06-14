import {
  ABILITIES,
  abilityModifier,
  formatModifier,
  type AbilityKey,
} from '../../domain/dnd'
import type { AbilityScores, Spellcasting } from '../../types/character'
import { uid } from '../../lib/characters'

const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

function levelLabel(level: number): string {
  return level === 0 ? 'Truques' : `${level}º círculo`
}

export function SpellcastingEditor({
  spellcasting,
  abilities,
  proficiencyBonus,
  onChange,
}: {
  spellcasting: Spellcasting
  abilities: AbilityScores
  proficiencyBonus: number
  onChange: (next: Spellcasting) => void
}) {
  const abilityMod =
    spellcasting.ability !== ''
      ? abilityModifier(abilities[spellcasting.ability])
      : 0
  const saveDc = spellcasting.ability !== '' ? 8 + proficiencyBonus + abilityMod : null
  const attackBonus =
    spellcasting.ability !== '' ? proficiencyBonus + abilityMod : null

  function setAbility(value: string) {
    onChange({ ...spellcasting, ability: (value as AbilityKey) || '' })
  }

  function setSlot(level: number, patch: { total?: number; expended?: number }) {
    const slots = spellcasting.slots.map((s, i) =>
      i === level ? { ...s, ...patch } : s,
    )
    onChange({ ...spellcasting, slots })
  }

  function addSpell(level: number) {
    onChange({
      ...spellcasting,
      spells: [
        ...spellcasting.spells,
        { id: uid(), level, name: '', prepared: false, description: '' },
      ],
    })
  }
  function updateSpell(
    id: string,
    patch: Partial<{ name: string; prepared: boolean; description: string }>,
  ) {
    onChange({
      ...spellcasting,
      spells: spellcasting.spells.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })
  }
  function removeSpell(id: string) {
    onChange({
      ...spellcasting,
      spells: spellcasting.spells.filter((s) => s.id !== id),
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm text-parchment/70">
            Atributo de conjuração
          </span>
          <select
            value={spellcasting.ability}
            onChange={(e) => setAbility(e.target.value)}
            className="w-full rounded-lg border border-gold/20 bg-night px-3 py-2 text-parchment outline-none focus:border-gold/60"
          >
            <option value="">Nenhum</option>
            {ABILITIES.map((ab) => (
              <option key={ab.key} value={ab.key}>
                {ab.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col items-center justify-center rounded-lg border border-gold/20 bg-night p-2">
          <span className="text-xs text-parchment/60">CD da magia</span>
          <span className="text-xl font-bold text-gold-light">
            {saveDc ?? '—'}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-gold/20 bg-night p-2">
          <span className="text-xs text-parchment/60">Bônus de ataque</span>
          <span className="text-xl font-bold text-gold-light">
            {attackBonus !== null ? formatModifier(attackBonus) : '—'}
          </span>
        </div>
      </div>

      {SPELL_LEVELS.map((level) => {
        const spellsHere = spellcasting.spells.filter((s) => s.level === level)
        const slot = spellcasting.slots[level]
        return (
          <div key={level} className="rounded-xl border border-gold/15 bg-night p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-display text-sm font-semibold text-gold-light">
                {levelLabel(level)}
              </h3>
              {level > 0 && (
                <div className="flex items-center gap-2 text-xs text-parchment/60">
                  <span>Espaços:</span>
                  <input
                    type="number"
                    min={0}
                    value={slot?.total ?? 0}
                    onChange={(e) =>
                      setSlot(level, { total: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-14 rounded border border-gold/20 bg-night-soft px-1 py-0.5 text-center text-parchment"
                    title="Total"
                  />
                  <span>/ gastos</span>
                  <input
                    type="number"
                    min={0}
                    value={slot?.expended ?? 0}
                    onChange={(e) =>
                      setSlot(level, { expended: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-14 rounded border border-gold/20 bg-night-soft px-1 py-0.5 text-center text-parchment"
                    title="Gastos"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              {spellsHere.map((s) => (
                <div key={s.id} className="rounded-lg border border-gold/10 bg-night/40 p-2">
                  <div className="flex items-center gap-2">
                    {level > 0 && (
                      <input
                        type="checkbox"
                        checked={s.prepared}
                        onChange={(e) => updateSpell(s.id, { prepared: e.target.checked })}
                        title="Preparada"
                        className="h-4 w-4 accent-gold"
                      />
                    )}
                    <input
                      className="flex-1 rounded-lg border border-gold/20 bg-night-soft px-2 py-1 text-sm text-parchment outline-none focus:border-gold/60"
                      value={s.name}
                      placeholder="Nome da magia"
                      onChange={(e) => updateSpell(s.id, { name: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => removeSpell(s.id)}
                      className="px-2 text-red-300/70 transition hover:text-red-200"
                      title="Remover"
                    >
                      ×
                    </button>
                  </div>
                  <textarea
                    className="mt-1.5 w-full resize-y rounded-lg border border-gold/15 bg-night-soft px-2 py-1 text-xs text-parchment/90 outline-none focus:border-gold/60"
                    rows={2}
                    value={s.description ?? ''}
                    placeholder="Descrição da magia (opcional) — aparece na impressão"
                    onChange={(e) => updateSpell(s.id, { description: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addSpell(level)}
              className="mt-2 text-xs text-parchment/60 transition hover:text-gold-light"
            >
              + adicionar
            </button>
          </div>
        )
      })}
    </div>
  )
}
