import { supabase } from '../supabase'
import type { ParsedClass, ParsedRace, ParsedBackground } from './parse'

// Acesso as tabelas de regras (espelho no nosso Supabase).
// rules_files = XML cru (backup); rules_elements = parseado e pronto pra uso.

export type RuleKind = 'class' | 'race' | 'background'

export interface RuleElementRow {
  id: string
  kind: RuleKind
  name: string
  name_pt: string | null
  source: string | null
  data: ParsedClass | ParsedRace | ParsedBackground
}

export async function saveRulesFile(file: {
  path: string
  url: string
  content: string
  source?: string
}): Promise<void> {
  const { error } = await supabase.from('rules_files').upsert(
    {
      path: file.path,
      url: file.url,
      content: file.content,
      source: file.source ?? null,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: 'path' },
  )
  if (error) throw error
}

export async function saveRuleElement(el: {
  id: string
  kind: RuleKind
  name: string
  source?: string
  data: ParsedClass | ParsedRace | ParsedBackground
}): Promise<void> {
  const { error } = await supabase.from('rules_elements').upsert(
    {
      id: el.id,
      kind: el.kind,
      name: el.name,
      source: el.source ?? null,
      data: el.data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )
  if (error) throw error
}

export async function countRuleElements(): Promise<{ classes: number; races: number }> {
  const [{ count: classes }, { count: races }] = await Promise.all([
    supabase.from('rules_elements').select('id', { count: 'exact', head: true }).eq('kind', 'class'),
    supabase.from('rules_elements').select('id', { count: 'exact', head: true }).eq('kind', 'race'),
  ])
  return { classes: classes ?? 0, races: races ?? 0 }
}

// Lista resumida (sem o data pesado) para seletores.
export async function listRuleClasses(): Promise<{ id: string; name: string; source: string | null }[]> {
  const { data, error } = await supabase
    .from('rules_elements')
    .select('id, name, source')
    .eq('kind', 'class')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getRuleClassByName(name: string): Promise<ParsedClass | null> {
  const { data, error } = await supabase
    .from('rules_elements')
    .select('data')
    .eq('kind', 'class')
    .eq('name', name)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data?.data as ParsedClass) ?? null
}

export async function getRuleRaceByName(name: string): Promise<ParsedRace | null> {
  const { data, error } = await supabase
    .from('rules_elements')
    .select('data')
    .eq('kind', 'race')
    .eq('name', name)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data?.data as ParsedRace) ?? null
}

export async function listRuleRaces(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from('rules_elements')
    .select('id, name')
    .eq('kind', 'race')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function listRuleBackgrounds(): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from('rules_elements')
    .select('id, name')
    .eq('kind', 'background')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getRuleBackgroundByName(
  name: string,
): Promise<ParsedBackground | null> {
  const { data, error } = await supabase
    .from('rules_elements')
    .select('data')
    .eq('kind', 'background')
    .eq('name', name)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data?.data as ParsedBackground) ?? null
}
