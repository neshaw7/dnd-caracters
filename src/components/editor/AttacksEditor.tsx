import type { Attack } from '../../types/character'
import { uid } from '../../lib/characters'

export function AttacksEditor({
  attacks,
  onChange,
}: {
  attacks: Attack[]
  onChange: (next: Attack[]) => void
}) {
  function update(id: string, patch: Partial<Attack>) {
    onChange(attacks.map((a) => (a.id === id ? { ...a, ...patch } : a)))
  }
  function remove(id: string) {
    onChange(attacks.filter((a) => a.id !== id))
  }
  function add() {
    onChange([...attacks, { id: uid(), name: '', bonus: '', damage: '' }])
  }

  return (
    <div>
      <div className="mb-1 grid grid-cols-[1fr_70px_1.2fr_32px] gap-2 px-1 text-xs text-parchment/50">
        <span>Nome</span>
        <span>Bônus</span>
        <span>Dano / tipo</span>
        <span />
      </div>
      <div className="space-y-2">
        {attacks.map((a) => (
          <div key={a.id} className="grid grid-cols-[1fr_70px_1.2fr_32px] gap-2">
            <input
              className="rounded-lg border border-gold/20 bg-night px-2 py-1.5 text-sm text-parchment outline-none focus:border-gold/60"
              value={a.name}
              placeholder="Espada longa"
              onChange={(e) => update(a.id, { name: e.target.value })}
            />
            <input
              className="rounded-lg border border-gold/20 bg-night px-2 py-1.5 text-center text-sm text-parchment outline-none focus:border-gold/60"
              value={a.bonus}
              placeholder="+5"
              onChange={(e) => update(a.id, { bonus: e.target.value })}
            />
            <input
              className="rounded-lg border border-gold/20 bg-night px-2 py-1.5 text-sm text-parchment outline-none focus:border-gold/60"
              value={a.damage}
              placeholder="1d8+3 cortante"
              onChange={(e) => update(a.id, { damage: e.target.value })}
            />
            <button
              type="button"
              onClick={() => remove(a.id)}
              className="rounded-lg border border-gold/20 text-red-300/70 transition hover:bg-wine/30 hover:text-red-200"
              title="Remover"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-3 w-full rounded-lg border border-dashed border-gold/30 py-2 text-sm text-parchment/70 transition hover:border-gold/60 hover:text-parchment"
      >
        + Adicionar ataque
      </button>
    </div>
  )
}
