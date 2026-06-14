// Indices de regras de D&D 5e (fontes publicas servidas pelo raw.githubusercontent.com,
// com CORS liberado, entao o navegador baixa direto). Os indices podem apontar
// para outros indices (resolucao recursiva no importador).

export const RULES_REPO_BASE =
  'https://raw.githubusercontent.com/aurorabuilder/elements/master'

// Fork da comunidade que mantem livros mais novos (ex: Tasha's, com o Artifice).
export const RULES_LEGACY_BASE =
  'https://raw.githubusercontent.com/AuroraLegacy/elements/master'

export interface RuleSource {
  key: string
  label: string
  url: string
}

// Fontes fixas: o nucleo (PHB), o playtest e livros que so existem no fork.
export const CORE_SOURCE: RuleSource = {
  key: 'core',
  label: 'Núcleo (PHB 2014, classes e raças base)',
  url: `${RULES_REPO_BASE}/core/players-handbook.index`,
}

export const EXTRA_SOURCES: RuleSource[] = [
  {
    key: 'tashas',
    label: "Tasha's Cauldron of Everything (Artífice + subclasses)",
    url: `${RULES_LEGACY_BASE}/supplements/tashas-cauldron-of-everything.index`,
  },
  {
    key: 'unearthed-arcana',
    label: 'Unearthed Arcana (playtest)',
    url: `${RULES_REPO_BASE}/unearthed-arcana.index`,
  },
]

// Deixa um nome de arquivo de indice mais legivel.
// "xanathars-guide-to-everything.index" -> "Xanathars Guide To Everything"
function prettify(fileName: string): string {
  return fileName
    .replace(/\.index$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Busca a lista de suplementos (cada livro vira uma fonte separada).
export async function fetchSupplementBooks(): Promise<RuleSource[]> {
  const res = await fetch(`${RULES_REPO_BASE}/supplements.index`)
  if (!res.ok) return []
  const xml = await res.text()
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const books: RuleSource[] = []
  doc.querySelectorAll('files > file[url]').forEach((f) => {
    const url = f.getAttribute('url') ?? ''
    const name = f.getAttribute('name') ?? ''
    // So os livros (sub-indices); ignora arquivos soltos.
    if (!url.endsWith('.index')) return
    books.push({ key: name, label: prettify(name), url })
  })
  return books.sort((a, b) => a.label.localeCompare(b.label))
}
