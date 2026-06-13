// Indices de regras do Aurora Builder (repositorio publico aurorabuilder/elements).
// Os arquivos sao servidos pelo raw.githubusercontent.com com CORS liberado,
// entao o navegador consegue baixar direto. Esses indices podem apontar para
// outros indices (resolucao recursiva no importador).

export const AURORA_BASE =
  'https://raw.githubusercontent.com/aurorabuilder/elements/master'

export interface AuroraIndexSource {
  key: string
  label: string
  url: string
}

// Indices que o importador pode baixar. O "core" puxa a PHB (12 classes +
// 9 racas base, regras 2014). Os demais sao opcionais.
export const AURORA_INDEXES: AuroraIndexSource[] = [
  { key: 'core', label: 'Núcleo (PHB 2014, classes e raças base)', url: `${AURORA_BASE}/core/players-handbook.index` },
  { key: 'supplements', label: 'Suplementos (Xanathar, Volo, Eberron...)', url: `${AURORA_BASE}/supplements.index` },
  { key: 'unearthed-arcana', label: 'Unearthed Arcana (playtest)', url: `${AURORA_BASE}/unearthed-arcana.index` },
]
