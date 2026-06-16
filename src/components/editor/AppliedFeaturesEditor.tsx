import type { AppliedFeature } from '../../types/character'

// Edita as caracteristicas aplicadas (classe/subclasse/antecedente).
// Sao preenchidas automaticamente, mas o jogador pode ajustar nome/texto/origem
// ou remover. (Clicar em "Preencher das regras" regenera tudo.)
export function AppliedFeaturesEditor({
  features,
  onChange,
}: {
  features: AppliedFeature[]
  onChange: (next: AppliedFeature[]) => void
}) {
  function update(i: number, patch: Partial<AppliedFeature>) {
    onChange(features.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))
  }
  function remove(i: number) {
    onChange(features.filter((_, idx) => idx !== i))
  }
  function add() {
    onChange([...features, { source: 'Personalizado', level: 1, name: '', text: '' }])
  }

  return (
    <div className="space-y-3">
      {features.length === 0 && (
        <p className="text-sm text-parchment/50">
          Nenhuma característica. Elas são preenchidas automaticamente ao escolher
          a classe; você também pode adicionar uma manualmente.
        </p>
      )}
      {features.map((f, i) => (
        <div key={i} className="rounded-xl border border-gold/15 bg-night p-3">
          <div className="mb-2 flex gap-2">
            <input
              className="flex-1 rounded-lg border border-gold/20 bg-night-soft px-2 py-1 text-sm font-semibold text-gold-light outline-none focus:border-gold/60"
              value={f.name}
              placeholder="Nome da característica"
              onChange={(e) => update(i, { name: e.target.value })}
            />
            <input
              className="w-32 rounded-lg border border-gold/20 bg-night-soft px-2 py-1 text-xs text-parchment outline-none focus:border-gold/60"
              value={f.source}
              placeholder="Origem"
              onChange={(e) => update(i, { source: e.target.value })}
            />
            <input
              type="number"
              min={0}
              max={20}
              className="w-14 rounded-lg border border-gold/20 bg-night-soft px-2 py-1 text-center text-xs text-parchment outline-none focus:border-gold/60"
              value={f.level}
              title="Nível"
              onChange={(e) => update(i, { level: parseInt(e.target.value, 10) || 0 })}
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded-lg border border-gold/20 px-2 text-red-300/70 transition hover:bg-wine/30 hover:text-red-200"
              title="Excluir"
            >
              ×
            </button>
          </div>
          <textarea
            className="w-full resize-y rounded-lg border border-gold/15 bg-night-soft px-2 py-1 text-xs text-parchment/90 outline-none focus:border-gold/60"
            rows={3}
            value={f.text}
            placeholder="Texto da característica"
            onChange={(e) => update(i, { text: e.target.value })}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full rounded-lg border border-dashed border-gold/30 py-2 text-sm text-parchment/70 transition hover:border-gold/60 hover:text-parchment"
      >
        + Adicionar característica
      </button>
    </div>
  )
}
