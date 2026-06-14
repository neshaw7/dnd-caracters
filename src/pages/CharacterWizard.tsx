import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ABILITIES,
  SKILLS,
  STANDARD_ARRAY,
  LANGUAGES_PT,
  abilityModifier,
  formatModifier,
  proficiencyBonus as calcProfBonus,
  toEnglishClass,
  toEnglishRace,
  type AbilityKey,
  type SkillKey,
} from '../domain/dnd'
import { getCharacter, updateCharacter } from '../lib/characters'
import { getRuleClassByName, getRuleRaceByName } from '../lib/rules/rulesStore'
import { applyRules } from '../lib/rules/autofill'
import type { ParsedClass, ParsedRace } from '../lib/rules/parse'
import type { AbilityScores, CharacterData } from '../types/character'
import { emptyCharacterData } from '../types/character'

type AbilityMode = 'array' | 'manual'

export function CharacterWizard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Dados base do personagem
  const [name, setName] = useState('')
  const [charClass, setCharClass] = useState('')
  const [race, setRace] = useState('')
  const [level, setLevel] = useState(1)
  const [data, setData] = useState<CharacterData>(emptyCharacterData())

  // Regras
  const [cls, setCls] = useState<ParsedClass | null>(null)
  const [ruleRace, setRuleRace] = useState<ParsedRace | null>(null)

  // Escolhas
  const [mode, setMode] = useState<AbilityMode>('array')
  const [assign, setAssign] = useState<Record<AbilityKey, number | null>>({
    str: null, dex: null, con: null, int: null, wis: null, cha: null,
  })
  const [manual, setManual] = useState<AbilityScores>({
    str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
  })
  const [skills, setSkills] = useState<SkillKey[]>([])
  const [expertise, setExpertise] = useState<SkillKey[]>([])
  const [language, setLanguage] = useState('')
  const [subclass, setSubclass] = useState('')

  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (!id) return
    let active = true
    Promise.resolve()
      .then(() => getCharacter(id))
      .then(async (row) => {
        if (!active) return
        setName(row.name)
        setCharClass(row.char_class ?? '')
        setRace(row.race ?? '')
        setLevel(row.level)
        setData(row.data)
        const [rc, rr] = await Promise.all([
          row.char_class ? getRuleClassByName(toEnglishClass(row.char_class)) : null,
          row.race ? getRuleRaceByName(toEnglishRace(row.race)) : null,
        ])
        if (!active) return
        setCls(rc)
        setRuleRace(rr)
      })
      .catch((e) => active && setErro(e instanceof Error ? e.message : 'Erro ao carregar.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  const isRogue = toEnglishClass(charClass) === 'Rogue'
  const isHuman = toEnglishRace(race) === 'Human'

  // Passos dinamicos
  const steps = useMemo(() => {
    const s = ['Atributos', 'Perícias']
    if (isRogue) s.push('Especialização')
    if (isHuman) s.push('Idioma')
    if (level >= 3 && (cls?.archetypes.length ?? 0) > 0) s.push('Subclasse')
    s.push('Revisão')
    return s
  }, [isRogue, isHuman, level, cls])

  // Atributos finais = base (array/manual) + bonus racial
  const baseAbilities: AbilityScores = useMemo(() => {
    if (mode === 'manual') return manual
    return {
      str: assign.str ?? 10, dex: assign.dex ?? 10, con: assign.con ?? 10,
      int: assign.int ?? 10, wis: assign.wis ?? 10, cha: assign.cha ?? 10,
    }
  }, [mode, manual, assign])

  const finalAbilities: AbilityScores = useMemo(() => {
    const b = ruleRace?.abilityBonuses ?? {}
    return {
      str: baseAbilities.str + (b.str ?? 0),
      dex: baseAbilities.dex + (b.dex ?? 0),
      con: baseAbilities.con + (b.con ?? 0),
      int: baseAbilities.int + (b.int ?? 0),
      wis: baseAbilities.wis + (b.wis ?? 0),
      cha: baseAbilities.cha + (b.cha ?? 0),
    }
  }, [baseAbilities, ruleRace])

  if (loading) return <p className="py-20 text-center text-parchment/60">Carregando...</p>

  // Por enquanto o assistente cobre apenas Ladino + Humano.
  if (!isRogue || !isHuman) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-gold-light">
          Assistente guiado
        </h1>
        <p className="mt-4 text-parchment/80">
          Por enquanto o assistente passo a passo cobre apenas a classe{' '}
          <strong>Ladino</strong> e a raça <strong>Humano</strong>. Para esta
          combinação, use o editor completo.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to={`/personagem/${id}/editar`}
            className="font-display rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-night transition hover:bg-gold-light"
          >
            Ir para o editor
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-gold/30 px-5 py-2 text-sm text-parchment/80 transition hover:border-gold/60"
          >
            Galeria
          </Link>
        </div>
      </div>
    )
  }

  const currentStep = steps[stepIndex]
  const profBonus = calcProfBonus(level)

  // Valores ja usados no Standard Array (para evitar repeticao).
  const usedValues = Object.values(assign).filter((v): v is number => v !== null)

  function toggleSkill(k: SkillKey) {
    setSkills((prev) => {
      if (prev.includes(k)) {
        setExpertise((e) => e.filter((x) => x !== k))
        return prev.filter((x) => x !== k)
      }
      if (prev.length >= (cls?.skillChoose ?? 4)) return prev
      return [...prev, k]
    })
  }

  function toggleExpertise(k: SkillKey) {
    setExpertise((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : prev.length >= 2 ? prev : [...prev, k],
    )
  }

  // Validacao por passo (libera o "Avançar")
  function canAdvance(): boolean {
    if (currentStep === 'Atributos') {
      return mode === 'manual' || usedValues.length === 6
    }
    if (currentStep === 'Perícias') return skills.length === (cls?.skillChoose ?? 4)
    if (currentStep === 'Especialização') return expertise.length === 2
    if (currentStep === 'Idioma') return language !== ''
    if (currentStep === 'Subclasse') return subclass !== ''
    return true
  }

  async function finish() {
    if (!id || !cls) return
    setSaving(true)
    setErro(null)
    try {
      const archetype = cls.archetypes.find((a) => a.name === subclass) ?? null
      // Monta a ficha: atributos finais primeiro, depois aplica regras.
      let next: CharacterData = { ...data, abilities: finalAbilities }
      next = applyRules(next, { cls, archetype, race: ruleRace, level })
      next.abilities = finalAbilities
      next.skillProficiencies = skills
      next.skillExpertise = expertise
      next.subclass = subclass
      // Idioma escolhido (Humano): acrescenta ao "Comum".
      if (language) {
        next.otherProficiencies = next.otherProficiencies.replace(
          /Idiomas:\s*Comum/,
          `Idiomas: Comum, ${language}`,
        )
        if (!/Idiomas:/.test(next.otherProficiencies)) {
          next.otherProficiencies =
            `Idiomas: Comum, ${language}\n` + next.otherProficiencies
        }
      }
      await updateCharacter(id, {
        name,
        char_class: charClass || null,
        level,
        race: race || null,
        avatar_url: null,
        data: next,
      })
      navigate(`/personagem/${id}`)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.')
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {/* Cabecalho + progresso */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-gold-light">
            Criar {name} · Ladino {level} {isHuman && '· Humano'}
          </h1>
          <Link to="/" className="text-sm text-parchment/60 hover:text-gold-light">
            Sair
          </Link>
        </div>
        <div className="flex flex-wrap gap-1">
          {steps.map((s, i) => (
            <span
              key={s}
              className={`rounded-full px-3 py-1 text-xs ${
                i === stepIndex
                  ? 'bg-gold text-night'
                  : i < stepIndex
                    ? 'bg-gold/20 text-gold-light'
                    : 'border border-gold/20 text-parchment/50'
              }`}
            >
              {i + 1}. {s}
            </span>
          ))}
        </div>
      </div>

      {erro && (
        <p className="mb-4 rounded-lg bg-wine/30 px-4 py-2 text-sm text-red-200">{erro}</p>
      )}

      <div className="rounded-2xl border border-gold/20 bg-night-soft p-5">
        {/* ---------------- Atributos ---------------- */}
        {currentStep === 'Atributos' && (
          <div>
            <h2 className="font-display mb-1 text-lg font-semibold text-gold-light">
              Atributos
            </h2>
            <p className="mb-4 text-sm text-parchment/60">
              Distribua os valores. O Humano dá <strong>+1 em todos</strong>.
            </p>
            <div className="mb-4 inline-flex rounded-lg bg-night p-1 text-sm">
              <button
                type="button"
                onClick={() => setMode('array')}
                className={`rounded-md px-3 py-1 ${mode === 'array' ? 'bg-gold/20 text-gold-light' : 'text-parchment/60'}`}
              >
                Valores padrão (15,14,13,12,10,8)
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`rounded-md px-3 py-1 ${mode === 'manual' ? 'bg-gold/20 text-gold-light' : 'text-parchment/60'}`}
              >
                Manual
              </button>
            </div>
            <div className="space-y-2">
              {ABILITIES.map((ab) => {
                const bonus = ruleRace?.abilityBonuses?.[ab.key] ?? 0
                const finalScore = finalAbilities[ab.key]
                return (
                  <div key={ab.key} className="flex items-center gap-3">
                    <span className="w-28 text-parchment/80">{ab.label}</span>
                    {mode === 'array' ? (
                      <select
                        value={assign[ab.key] ?? ''}
                        onChange={(e) =>
                          setAssign((p) => ({
                            ...p,
                            [ab.key]: e.target.value ? parseInt(e.target.value, 10) : null,
                          }))
                        }
                        className="rounded-lg border border-gold/20 bg-night px-3 py-1.5 text-parchment outline-none focus:border-gold/60"
                      >
                        <option value="">—</option>
                        {STANDARD_ARRAY.map((v) => (
                          <option
                            key={v}
                            value={v}
                            disabled={usedValues.includes(v) && assign[ab.key] !== v}
                          >
                            {v}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={manual[ab.key]}
                        onChange={(e) =>
                          setManual((p) => ({ ...p, [ab.key]: parseInt(e.target.value, 10) || 0 }))
                        }
                        className="w-20 rounded-lg border border-gold/20 bg-night px-3 py-1.5 text-center text-parchment outline-none focus:border-gold/60"
                      />
                    )}
                    <span className="text-sm text-parchment/50">+{bonus} racial</span>
                    <span className="ml-auto text-right">
                      <span className="text-lg font-bold text-gold-light">{finalScore}</span>
                      <span className="ml-2 text-sm text-parchment/60">
                        ({formatModifier(abilityModifier(finalScore))})
                      </span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ---------------- Pericias ---------------- */}
        {currentStep === 'Perícias' && (
          <div>
            <h2 className="font-display mb-1 text-lg font-semibold text-gold-light">
              Perícias
            </h2>
            <p className="mb-4 text-sm text-parchment/60">
              Escolha {cls?.skillChoose ?? 4} perícias ({skills.length} selecionadas).
            </p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {(cls?.skillOptions ?? []).map((k) => {
                const sk = SKILLS.find((s) => s.key === k)!
                const checked = skills.includes(k)
                const full = skills.length >= (cls?.skillChoose ?? 4)
                return (
                  <label
                    key={k}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 ${checked ? 'bg-gold/10' : 'hover:bg-gold/5'} ${!checked && full ? 'opacity-40' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && full}
                      onChange={() => toggleSkill(k)}
                      className="h-4 w-4 accent-gold"
                    />
                    <span className="text-parchment/90">{sk.label}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* ---------------- Especializacao ---------------- */}
        {currentStep === 'Especialização' && (
          <div>
            <h2 className="font-display mb-1 text-lg font-semibold text-gold-light">
              Especialização (Expertise)
            </h2>
            <p className="mb-4 text-sm text-parchment/60">
              Escolha 2 perícias proficientes para dobrar o bônus ({expertise.length}/2).
            </p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {skills.map((k) => {
                const sk = SKILLS.find((s) => s.key === k)!
                const checked = expertise.includes(k)
                const full = expertise.length >= 2
                return (
                  <label
                    key={k}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 ${checked ? 'bg-gold/10' : 'hover:bg-gold/5'} ${!checked && full ? 'opacity-40' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && full}
                      onChange={() => toggleExpertise(k)}
                      className="h-4 w-4 accent-gold-light"
                    />
                    <span className="text-parchment/90">{sk.label}</span>
                  </label>
                )
              })}
              {skills.length === 0 && (
                <p className="text-sm text-parchment/50">
                  Volte e escolha as perícias primeiro.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ---------------- Idioma ---------------- */}
        {currentStep === 'Idioma' && (
          <div>
            <h2 className="font-display mb-1 text-lg font-semibold text-gold-light">
              Idioma extra (Humano)
            </h2>
            <p className="mb-4 text-sm text-parchment/60">
              Você fala Comum e mais um idioma à escolha.
            </p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-gold/20 bg-night px-3 py-2 text-parchment outline-none focus:border-gold/60"
            >
              <option value="">Selecione...</option>
              {LANGUAGES_PT.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ---------------- Subclasse ---------------- */}
        {currentStep === 'Subclasse' && (
          <div>
            <h2 className="font-display mb-1 text-lg font-semibold text-gold-light">
              Arquétipo de Ladino
            </h2>
            <p className="mb-4 text-sm text-parchment/60">
              No 3º nível você escolhe seu arquétipo.
            </p>
            <select
              value={subclass}
              onChange={(e) => setSubclass(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-gold/20 bg-night px-3 py-2 text-parchment outline-none focus:border-gold/60"
            >
              <option value="">Selecione...</option>
              {(cls?.archetypes ?? []).map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
            {subclass && (
              <p className="mt-3 text-sm text-parchment/60">
                As magias do arquétipo (se houver) você adiciona no editor depois.
              </p>
            )}
          </div>
        )}

        {/* ---------------- Revisao ---------------- */}
        {currentStep === 'Revisão' && (
          <div>
            <h2 className="font-display mb-3 text-lg font-semibold text-gold-light">
              Revisão
            </h2>
            <ul className="space-y-2 text-sm text-parchment/90">
              <li>
                <strong>Atributos:</strong>{' '}
                {ABILITIES.map(
                  (ab) =>
                    `${ab.abbr} ${finalAbilities[ab.key]} (${formatModifier(abilityModifier(finalAbilities[ab.key]))})`,
                ).join(' · ')}
              </li>
              <li>
                <strong>Perícias:</strong>{' '}
                {skills.map((k) => SKILLS.find((s) => s.key === k)?.label).join(', ')}
              </li>
              <li>
                <strong>Especialização:</strong>{' '}
                {expertise.map((k) => SKILLS.find((s) => s.key === k)?.label).join(', ')}
              </li>
              <li>
                <strong>Idiomas:</strong> Comum, {language}
              </li>
              {subclass && (
                <li>
                  <strong>Arquétipo:</strong> {subclass}
                </li>
              )}
              <li>
                <strong>Bônus de proficiência:</strong> {formatModifier(profBonus)}
              </li>
            </ul>
            <p className="mt-4 text-xs text-parchment/50">
              Ao concluir, a ficha é montada (PV, dado de vida, características da
              classe e espaços de magia entram automaticamente) e você vai para a
              visualização.
            </p>
          </div>
        )}

        {/* Navegacao */}
        <div className="mt-6 flex justify-between border-t border-gold/15 pt-4">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="rounded-lg border border-gold/30 px-4 py-2 text-sm text-parchment/80 transition hover:border-gold/60 disabled:opacity-40"
          >
            ← Voltar
          </button>
          {stepIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStepIndex((i) => i + 1)}
              disabled={!canAdvance()}
              className="font-display rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-night transition hover:bg-gold-light disabled:opacity-40"
            >
              Avançar →
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={saving}
              className="font-display rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-night transition hover:bg-gold-light disabled:opacity-50"
            >
              {saving ? 'Criando...' : 'Concluir ficha'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
