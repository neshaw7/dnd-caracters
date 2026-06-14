import { RULES_REPO_BASE } from './sources'
import { parseRulesXml } from './parse'
import { saveRulesFile, saveRuleElement } from './rulesStore'

export interface ImportProgress {
  phase: 'resolvendo' | 'importando' | 'concluido' | 'erro'
  message: string
  done: number
  total: number
  classes: number
  races: number
}

type OnProgress = (p: ImportProgress) => void

// Le um indice e retorna as URLs de arquivos XML (resolvendo sub-indices).
async function resolveIndex(
  url: string,
  visited: Set<string>,
  onProgress: OnProgress,
  acc: string[],
): Promise<void> {
  if (visited.has(url)) return
  visited.add(url)

  const res = await fetch(url)
  if (!res.ok) return
  const xml = await res.text()
  const doc = new DOMParser().parseFromString(xml, 'application/xml')

  const files = Array.from(doc.querySelectorAll('files > file[url]'))
  for (const f of files) {
    const fileUrl = f.getAttribute('url') ?? ''
    if (!fileUrl) continue
    if (fileUrl.endsWith('.index')) {
      onProgress({
        phase: 'resolvendo',
        message: `Lendo índice ${fileUrl.split('/').pop()}`,
        done: 0,
        total: 0,
        classes: 0,
        races: 0,
      })
      await resolveIndex(fileUrl, visited, onProgress, acc)
    } else if (fileUrl.endsWith('.xml')) {
      acc.push(fileUrl)
    }
  }
}

function pathFromUrl(url: string): string {
  return url.startsWith(RULES_REPO_BASE) ? url.slice(RULES_REPO_BASE.length + 1) : url
}

// Importa um indice inteiro: baixa todos os XML, salva o cru e o parseado.
export async function importIndex(indexUrl: string, onProgress: OnProgress): Promise<void> {
  try {
    const fileUrls: string[] = []
    await resolveIndex(indexUrl, new Set(), onProgress, fileUrls)

    // Remove duplicatas mantendo a ordem.
    const unique = Array.from(new Set(fileUrls))
    let classes = 0
    let races = 0

    for (let i = 0; i < unique.length; i++) {
      const url = unique[i]
      onProgress({
        phase: 'importando',
        message: url.split('/').pop() ?? url,
        done: i,
        total: unique.length,
        classes,
        races,
      })
      try {
        const res = await fetch(url)
        if (!res.ok) continue
        const content = await res.text()
        const parsed = parseRulesXml(content)

        // Salva o cru so de arquivos com conteudo util.
        if (
          parsed.classes.length ||
          parsed.races.length ||
          parsed.backgrounds.length ||
          parsed.spells.length
        ) {
          await saveRulesFile({ path: pathFromUrl(url), url, content })
        }

        for (const c of parsed.classes) {
          if (!c.id) continue
          await saveRuleElement({ id: c.id, kind: 'class', name: c.name, source: c.source, data: c })
          classes++
        }
        for (const r of parsed.races) {
          if (!r.id) continue
          await saveRuleElement({ id: r.id, kind: 'race', name: r.name, source: r.source, data: r })
          races++
        }
        for (const b of parsed.backgrounds) {
          if (!b.id) continue
          await saveRuleElement({ id: b.id, kind: 'background', name: b.name, source: b.source, data: b })
        }
        for (const sp of parsed.spells) {
          if (!sp.id) continue
          await saveRuleElement({ id: sp.id, kind: 'spell', name: sp.name, source: 'spell', data: sp })
        }
      } catch {
        // Ignora arquivos que falharem e segue.
      }
    }

    onProgress({
      phase: 'concluido',
      message: `Importação concluída: ${classes} classes, ${races} raças.`,
      done: unique.length,
      total: unique.length,
      classes,
      races,
    })
  } catch (e) {
    onProgress({
      phase: 'erro',
      message: e instanceof Error ? e.message : 'Erro na importação.',
      done: 0,
      total: 0,
      classes: 0,
      races: 0,
    })
  }
}
