// Indices de regras de D&D 5e (fonte publica servida pelo raw.githubusercontent.com,
// com CORS liberado, entao o navegador baixa direto). Os indices podem apontar
// para outros indices (resolucao recursiva no importador).

export const RULES_REPO_BASE =
  'https://raw.githubusercontent.com/aurorabuilder/elements/master'

export interface RuleSource {
  key: string
  label: string
  url: string
}

// Indices que o importador pode baixar para o nosso banco. O "core" puxa a PHB
// (12 classes + 9 racas base, regras 2014). Os demais sao opcionais.
export const RULE_SOURCES: RuleSource[] = [
  { key: 'core', label: 'Núcleo (PHB 2014, classes e raças base)', url: `${RULES_REPO_BASE}/core/players-handbook.index` },
  { key: 'supplements', label: 'Suplementos (Xanathar, Volo, Eberron...)', url: `${RULES_REPO_BASE}/supplements.index` },
  { key: 'unearthed-arcana', label: 'Unearthed Arcana (playtest)', url: `${RULES_REPO_BASE}/unearthed-arcana.index` },
]
