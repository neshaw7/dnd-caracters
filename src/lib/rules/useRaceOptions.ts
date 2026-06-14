import { useEffect, useState } from 'react'
import { toDisplayRace } from '../../domain/dnd'
import { listRuleRaces } from './rulesStore'

// Opcoes de raca para os seletores: usa as racas importadas no banco
// (mostrando o nome PT quando houver traducao). Vazio se nada foi importado.
export function useRaceOptions(): string[] {
  const [options, setOptions] = useState<string[]>([])

  useEffect(() => {
    let active = true
    listRuleRaces()
      .then((rows) => {
        if (!active) return
        const names = rows.map((r) => toDisplayRace(r.name))
        setOptions(Array.from(new Set(names)).sort((a, b) => a.localeCompare(b)))
      })
      .catch(() => {
        /* sem racas importadas */
      })
    return () => {
      active = false
    }
  }, [])

  return options
}
