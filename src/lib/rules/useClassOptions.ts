import { useEffect, useState } from 'react'
import { CLASSES, toDisplayClass } from '../../domain/dnd'
import { listRuleClasses } from './rulesStore'

// Opcoes de classe para os seletores: usa as classes importadas no banco
// (mostrando o nome PT quando houver traducao). Se nada foi importado ainda,
// cai nas 12 classes base estaticas.
export function useClassOptions(): string[] {
  const [options, setOptions] = useState<string[]>([...CLASSES])

  useEffect(() => {
    let active = true
    listRuleClasses()
      .then((rows) => {
        if (!active || rows.length === 0) return
        const names = rows.map((r) => toDisplayClass(r.name))
        setOptions(Array.from(new Set(names)).sort((a, b) => a.localeCompare(b)))
      })
      .catch(() => {
        /* mantem a lista estatica */
      })
    return () => {
      active = false
    }
  }, [])

  return options
}
