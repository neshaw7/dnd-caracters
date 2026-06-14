import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CORE_SOURCE,
  EXTRA_SOURCES,
  fetchSupplementBooks,
  type RuleSource,
} from '../lib/rules/sources'
import { importIndex, type ImportProgress } from '../lib/rules/importer'
import { countRuleElements, countSpells } from '../lib/rules/rulesStore'

const LS_KEY = 'regras_importadas'

function loadImported(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function RuleRow({
  src,
  done,
  thisBusy,
  busy,
  onImport,
}: {
  src: RuleSource
  done: boolean
  thisBusy: boolean
  busy: boolean
  onImport: (src: RuleSource) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gold/20 bg-night-soft p-4">
      <span className="text-parchment/90">
        {src.label}
        {done && <span className="ml-2 text-xs text-emerald-300/80">✓ importado</span>}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() => onImport(src)}
        className={`font-display shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
          done
            ? 'border border-gold/40 text-gold-light hover:bg-gold/10'
            : 'bg-gold text-night hover:bg-gold-light'
        }`}
      >
        {thisBusy ? 'Importando...' : done ? 'Reimportar' : 'Importar'}
      </button>
    </div>
  )
}

export function Rules() {
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [counts, setCounts] = useState<{ classes: number; races: number; spells: number } | null>(
    null,
  )
  const [books, setBooks] = useState<RuleSource[]>([])
  const [imported, setImported] = useState<string[]>(loadImported())

  useEffect(() => {
    let active = true
    Promise.all([countRuleElements(), countSpells()])
      .then(([c, s]) => active && setCounts({ ...c, spells: s }))
      .catch(() => active && setCounts(null))
    fetchSupplementBooks()
      .then((b) => active && setBooks(b))
      .catch(() => active && setBooks([]))
    return () => {
      active = false
    }
  }, [])

  async function handleImport(src: RuleSource) {
    setBusyKey(src.key)
    setProgress(null)
    await importIndex(src.url, setProgress)
    try {
      const [c, s] = await Promise.all([countRuleElements(), countSpells()])
      setCounts({ ...c, spells: s })
    } catch {
      /* mantem contagem anterior */
    }
    setImported((prev) => {
      const next = prev.includes(src.key) ? prev : [...prev, src.key]
      localStorage.setItem(LS_KEY, JSON.stringify(next))
      return next
    })
    setBusyKey(null)
  }

  const pct =
    progress && progress.total > 0
      ? Math.round((progress.done / progress.total) * 100)
      : 0
  const busy = busyKey !== null

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
        nosso banco. Depois de importar, o preenchimento automático fica salvo
        aqui e funciona de forma independente. Importe só os livros que você usa.
      </p>

      {counts && (
        <p className="mt-3 text-sm text-parchment/60">
          No banco agora: <strong className="text-gold-light">{counts.classes}</strong> classes,{' '}
          <strong className="text-gold-light">{counts.races}</strong> raças e{' '}
          <strong className="text-gold-light">{counts.spells}</strong> magias.
        </p>
      )}

      <h2 className="font-display mt-6 mb-2 text-sm uppercase tracking-wide text-gold/70">
        Essenciais
      </h2>
      <div className="space-y-3">
        <RuleRow
          src={CORE_SOURCE}
          done={imported.includes(CORE_SOURCE.key)}
          thisBusy={busyKey === CORE_SOURCE.key}
          busy={busy}
          onImport={handleImport}
        />
        {EXTRA_SOURCES.map((s) => (
          <RuleRow
            key={s.key}
            src={s}
            done={imported.includes(s.key)}
            thisBusy={busyKey === s.key}
            busy={busy}
            onImport={handleImport}
          />
        ))}
      </div>

      <h2 className="font-display mt-8 mb-2 text-sm uppercase tracking-wide text-gold/70">
        Suplementos {books.length > 0 && `(${books.length})`}
      </h2>
      <div className="space-y-3">
        {books.length === 0 && (
          <p className="text-sm text-parchment/50">Carregando lista de livros...</p>
        )}
        {books.map((s) => (
          <RuleRow
            key={s.key}
            src={s}
            done={imported.includes(s.key)}
            thisBusy={busyKey === s.key}
            busy={busy}
            onImport={handleImport}
          />
        ))}
      </div>

      {progress && (
        <div className="sticky bottom-4 mt-6 rounded-xl border border-gold/30 bg-night-soft p-4 shadow-lg">
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
