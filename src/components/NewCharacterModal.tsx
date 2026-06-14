import { useState, type FormEvent } from 'react'
import { TextField, NumberField, SelectField } from './form'
import { useClassOptions } from '../lib/rules/useClassOptions'
import { useRaceOptions } from '../lib/rules/useRaceOptions'

export interface NewCharacterValues {
  name: string
  char_class: string
  level: number
  race: string
}

export function NewCharacterModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (values: NewCharacterValues) => Promise<void>
}) {
  const [name, setName] = useState('')
  const [charClass, setCharClass] = useState('')
  const [level, setLevel] = useState(1)
  const [race, setRace] = useState('')
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const classOptions = useClassOptions()
  const raceOptions = useRaceOptions()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setErro('Dê um nome ao personagem.')
      return
    }
    setErro(null)
    setSaving(true)
    try {
      await onCreate({ name: name.trim(), char_class: charClass, level, race })
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar personagem.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gold/30 bg-night-soft p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display mb-5 text-xl font-semibold text-gold-light">
          Novo personagem
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Nome"
            value={name}
            onChange={setName}
            placeholder="Ex: Lira Vento-Sombrio"
          />
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Classe"
              value={charClass}
              onChange={setCharClass}
              options={classOptions}
            />
            <NumberField label="Nível" value={level} onChange={setLevel} min={1} max={20} />
          </div>
          {raceOptions.length > 0 ? (
            <SelectField
              label="Raça"
              value={race}
              onChange={setRace}
              options={raceOptions}
              placeholder="Selecione a raça..."
            />
          ) : (
            <TextField
              label="Raça"
              value={race}
              onChange={setRace}
              placeholder="Importe as regras para escolher a raça"
            />
          )}

          {erro && (
            <p className="rounded-lg bg-wine/30 px-3 py-2 text-sm text-red-200">
              {erro}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gold/30 py-2.5 text-parchment/80 transition hover:border-gold/60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="font-display flex-1 rounded-lg bg-gold py-2.5 font-semibold text-night transition hover:bg-gold-light disabled:opacity-50"
            >
              {saving ? 'Criando...' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
