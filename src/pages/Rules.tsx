import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RULE_SOURCES } from '../lib/rules/sources'
import { importIndex, type ImportProgress } from '../lib/rules/importer'
import { countRuleElements } from '../lib/rules/rulesStore'

export function Rules() {
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [busy, setBusy] = useState(false)
  const [counts, setCounts] = useState<{ classes: number; races: number } | null>(null)

  async function refreshCounts() {
    try {
      setCounts(await countRuleElements())
    } catch {
      setCounts(null)
    }
  }

  useEffect(() => {
    let active = true
    countRuleElements()
      .then((c) => active && setCounts(c))
      .catch(() => active && setCounts(null))
    return () => {
      active = false
    }
  }, [])

  async function handleImport(url: string) {
    setBusy(true)
    setProgress(null)
    await importIndex(url, setProgress)
    await refreshCounts()
    setBusy(false)
  }

  const pct =
    progress && progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : 0

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between border-b border-gold/20 pb-4">
        <h1 className="font-display text-2xl font-bold text-gold-light">
          Regras (D&amp;D 5e)
        </h1>
        <Link to="/" className="text-sm text-parchment/60 transition hover:text-gold-light">
          ← Galeria
        </Link>
      </header>

      <p className="text-parchment/70">
        Importa as regras de D&amp;D 5e (classes, subclasses e raças) para o
        nosso banco. Depois de importar, o preenchimento automático de
        classe/raça fica salvo aqui e funciona de forma independente.
      </p>

      {counts && (
        <p className="mt-3 text-sm text-parchment/60">
          No banco agora: <strong className="text-gold-light">{counts.classes}</strong> classes
          e <strong className="text-gold-light">{counts.races}</strong> raças.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {RULE_SOURCES.map((src) => (
          <div
            key={src.key}
            className="flex items-center justify-between rounded-xl border border-gold/20 bg-night-soft p-4"
          >
            <span className="text-parchment/90">{src.label}</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleImport(src.url)}
              className="font-display rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-night transition hover:bg-gold-light disabled:opacity-50"
            >
              Importar
            </button>
          </div>
        ))}
      </div>

      {progress && (
        <div className="mt-6 rounded-xl border border-gold/20 bg-night-soft p-4">
          <div className="mb-2 flex justify-between text-sm text-parchment/70">
            <span>
              {progress.phase === 'resolvendo' && 'Lendo índices...'}
              {progress.phase === 'importando' && `Importando: ${progress.message}`}
              {progress.phase === 'concluido' && progress.message}
              {progress.phase === 'erro' && `Erro: ${progress.message}`}
            </span>
            {progress.total > 0 && <span>{pct}%</span>}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-night">
            <div
              className="h-full bg-gold transition-all"
              style={{ width: `${progress.phase === 'concluido' ? 100 : pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-parchment/50">
            {progress.classes} classes · {progress.races} raças processadas
          </p>
        </div>
      )}
    </div>
  )
}
