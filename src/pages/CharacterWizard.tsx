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
  toDisplayBackground,
  toEnglishBackground,
  type AbilityKey,
  type SkillKey,
} from '../domain/dnd'
import { getCharacter, updateCharacter } from '../lib/characters'
import {
  getRuleClassByName,
  getRuleRaceByName,
  getRuleBackgroundByName,
  listRuleBackgrounds,
} from '../lib/rules/rulesStore'
import { applyRules } from '../lib/rules/autofill'
import { CLASS_EQUIPMENT, BACKGROUND_EQUIPMENT } from '../lib/rules/equipment'
import { GuideAvatar, type GuideMood } from '../components/wizard/GuideAvatar'
import { Typewriter } from '../components/wizard/Typewriter'
import type { ParsedClass, ParsedRace, ParsedBackground } from '../lib/rules/parse'
import type { AbilityScores, CharacterData } from '../types/character'
import { emptyCharacterData } from '../types/character'

type AbilityMode = 'array' | 'manual'

function skillLabel(k: SkillKey): string {
  return SKILLS.find((s) => s.key === k)?.label ?? k
}

export function CharacterWizard() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [charClass, setCharClass] = useState('')
  const [race, setRace] = useState('')
  const [level, setLevel] = useState(1)
  const [data, setData] = useState<CharacterData>(emptyCharacterData())

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
  const [bgOptions, setBgOptions] = useState<string[]>([]) // nomes em ingles
  const [background, setBackground] = useState('') // nome PT exibido
  const [bgData, setBgData] = useState<ParsedBackground | null>(null)
  const [classSkills, setClassSkills] = useState<SkillKey[]>([])
  const [expertiseSkills, setExpertiseSkills] = useState<SkillKey[]>([])
  const [expertiseTools, setExpertiseTools] = useState(false)
  const [languages, setLanguages] = useState<string[]>([])
  const [subclass, setSubclass] = useState('')
  const [equipMode, setEquipMode] = useState<'itens' | 'ouro'>('itens')
  const [equipChoices, setEquipChoices] = useState<number[]>([])

  const [stepIndex, setStepIndex] = useState(0)

  // Carrega personagem + regras
  useEffect(() => {
    if (!id) return
    let active = true
    getCharacter(id)
      .then(async (row) => {
        if (!active) return
        setName(row.name)
        setCharClass(row.char_class ?? '')
        setRace(row.race ?? '')
        setLevel(row.level)
        setData(row.data)
        const [rc, rr, bgs] = await Promise.all([
          row.char_class ? getRuleClassByName(toEnglishClass(row.char_class)) : null,
          row.race ? getRuleRaceByName(toEnglishRace(row.race)) : null,
          listRuleBackgrounds(),
        ])
        if (!active) return
        setCls(rc)
        setRuleRace(rr)
        setBgOptions(bgs.map((b) => b.name))
      })
      .catch((e) => active && setErro(e instanceof Error ? e.message : 'Erro ao carregar.'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  const isRogue = toEnglishClass(charClass) === 'Rogue'
  const isHuman = toEnglishRace(race) === 'Human'

  // Carrega os dados do antecedente escolhido
  useEffect(() => {
    if (!background) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBgData(null)
      return
    }
    let active = true
    getRuleBackgroundByName(toEnglishBackground(background))
      .then((b) => {
        if (!active) return
        setBgData(b)
        // Remove das pericias de classe as que o antecedente ja concede
        if (b) setClassSkills((prev) => prev.filter((k) => !b.skills.includes(k)))
      })
      .catch(() => active && setBgData(null))
    return () => {
      active = false
    }
  }, [background])

  const bgSkills = bgData?.skills ?? []
  const totalLangPicks = (isHuman ? 1 : 0) + (bgData?.languageChoices ?? 0)

  const clsEquip = CLASS_EQUIPMENT[toEnglishClass(charClass)] ?? null
  const bgEquip = BACKGROUND_EQUIPMENT[toEnglishBackground(background)] ?? null

  const steps = useMemo(() => {
    const s = ['Atributos', 'Antecedente', 'Perícias']
    if (isRogue) s.push('Especialização')
    if (totalLangPicks > 0) s.push('Idiomas')
    s.push('Equipamento')
    if (level >= 3 && (cls?.archetypes.length ?? 0) > 0) s.push('Subclasse')
    s.push('Revisão')
    return s
  }, [isRogue, totalLangPicks, level, cls])

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

  if (!isRogue || !isHuman) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-gold-light">Assistente guiado</h1>
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
  const heroName = name || 'viajante'
  const guideLines: Record<string, string> = {
    Atributos: `${heroName}... toda lenda começa com o barro de que é feita. Diga-me: do que você é feito? Distribua seus dons.`,
    Antecedente: 'Antes da glória, houve um passado. De que sombra você emergiu?',
    Perícias: 'Onde sua mão é mais firme? Mostre-me em que seu talento brilha.',
    Especialização: 'E onde você é... excepcional? Poucos dominam algo de verdade.',
    Idiomas: 'As palavras abrem portas que a lâmina não alcança. Que línguas você carrega?',
    Equipamento: 'Ninguém parte de mãos vazias. O que você leva para a estrada?',
    Subclasse: 'Há um caminho mais profundo na sua arte. Que trilha você seguirá?',
    Revisão: 'Então está decidido. Deixe-me contemplar no que você se tornou...',
  }
  const guideLine = guideLines[currentStep] ?? '...'
  const guideMoods: Record<string, GuideMood> = {
    Atributos: 'neutro',
    Antecedente: 'pensativo',
    Perícias: 'neutro',
    Especialização: 'instigante',
    Idiomas: 'neutro',
    Equipamento: 'serio',
    Subclasse: 'instigante',
    Revisão: 'satisfeito',
  }
  const guideMood = guideMoods[currentStep] ?? 'neutro'
  const profBonus = calcProfBonus(level)
  const usedValues = Object.values(assign).filter((v): v is number => v !== null)
  const classSkillOptions = (cls?.skillOptions ?? []).filter((k) => !bgSkills.includes(k))
  const proficientSkills = Array.from(new Set([...classSkills, ...bgSkills]))
  const expertiseCount = expertiseSkills.length + (expertiseTools ? 1 : 0)

  function toggleClassSkill(k: SkillKey) {
    setClassSkills((prev) => {
      if (prev.includes(k)) {
        setExpertiseSkills((e) => e.filter((x) => x !== k))
        return prev.filter((x) => x !== k)
      }
      if (prev.length >= (cls?.skillChoose ?? 4)) return prev
      return [...prev, k]
    })
  }

  function toggleExpertiseSkill(k: SkillKey) {
    setExpertiseSkills((prev) =>
      prev.includes(k)
        ? prev.filter((x) => x !== k)
        : expertiseCount >= 2
          ? prev
          : [...prev, k],
    )
  }

  function setLanguageAt(i: number, value: string) {
    setLanguages((prev) => {
      const next = [...prev]
      while (next.length < totalLangPicks) next.push('')
      next[i] = value
      return next.slice(0, totalLangPicks)
    })
  }

  // Idiomas escolhidos, sempre com o tamanho certo (preenchendo vazios).
  const langPicks = Array.from({ length: totalLangPicks }, (_, i) => languages[i] ?? '')

  function canAdvance(): boolean {
    if (currentStep === 'Atributos') return mode === 'manual' || usedValues.length === 6
    if (currentStep === 'Antecedente') return background !== '' && bgData !== null
    if (currentStep === 'Perícias') return classSkills.length === (cls?.skillChoose ?? 4)
    if (currentStep === 'Especialização') return expertiseCount === 2
    if (currentStep === 'Idiomas') {
      return langPicks.every((l) => l) && new Set(langPicks).size === langPicks.length
    }
    if (currentStep === 'Equipamento') {
      if (equipMode === 'ouro' || !clsEquip) return true
      return clsEquip.choices.every((_, i) => (equipChoices[i] ?? -1) >= 0)
    }
    if (currentStep === 'Subclasse') return subclass !== ''
    return true
  }

  function setEquipChoice(i: number, optIdx: number) {
    setEquipChoices((prev) => {
      const next = [...prev]
      next[i] = optIdx
      return next
    })
  }

  async function finish() {
    if (!id || !cls) return
    setSaving(true)
    setErro(null)
    try {
      const archetype = cls.archetypes.find((a) => a.name === subclass) ?? null
      let next: CharacterData = { ...data, abilities: finalAbilities }
      next = applyRules(next, { cls, archetype, race: ruleRace, background: bgData, level })
      next.abilities = finalAbilities
      next.skillProficiencies = proficientSkills
      next.skillExpertise = expertiseSkills
      next.subclass = subclass
      next.background = background

      // Idiomas: junta Comum + escolhidos na linha de idiomas do bloco automatico.
      const langLine = ['Comum', ...langPicks.filter(Boolean)].join(', ')
      if (/Idiomas:/.test(next.otherProficiencies)) {
        next.otherProficiencies = next.otherProficiencies.replace(
          /Idiomas:[^\n]*/,
          `Idiomas: ${langLine}`,
        )
      }
      // Especializacao em ferramentas de ladrao (as ferramentas do antecedente
      // ja entram pelo applyRules).
      if (expertiseTools) {
        next.otherProficiencies =
          `${next.otherProficiencies}\nEspecialização: Ferramentas de ladrão`.trim()
      }

      // Equipamento inicial (classe + antecedente) ou ouro.
      const equipItems: string[] = []
      if (equipMode === 'itens' && clsEquip) {
        clsEquip.choices.forEach((c, i) => {
          const opt = c.options[equipChoices[i] ?? -1]
          if (opt) equipItems.push(opt)
        })
        equipItems.push(...clsEquip.fixed)
      }
      if (bgEquip) equipItems.push(...bgEquip.fixed)
      next.equipment = equipItems.map((it) => `• ${it}`).join('\n')
      let gp = bgEquip?.gp ?? 0
      if (equipMode === 'ouro' && clsEquip) {
        gp += clsEquip.goldAverage
        next.equipment =
          `${next.equipment}\n• Ouro inicial da classe: ${clsEquip.goldText} (≈ ${clsEquip.goldAverage} po)`.trim()
      }
      next.coins = { ...next.coins, gp: (next.coins.gp || 0) + gp }

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
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-gold-light">
            Criar {name} · Ladino {level} · Humano
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

      {/* Guia narrador */}
      <div className="mb-6 flex items-start gap-4 rounded-2xl border border-gold/25 bg-gradient-to-br from-night-soft to-night p-4">
        <GuideAvatar size={116} mood={guideMood} />
        <div className="min-h-[112px] flex-1">
          <p className="font-display text-xs uppercase tracking-[0.2em] text-gold/70">
            Aldric, o Cronista
          </p>
          <p className="mt-2 text-lg italic leading-relaxed text-parchment/90">
            <Typewriter key={currentStep} text={guideLine} />
          </p>
        </div>
      </div>

      {erro && (
        <p className="mb-4 rounded-lg bg-wine/30 px-4 py-2 text-sm text-red-200">{erro}</p>
      )}

      <div className="rounded-2xl border border-gold/20 bg-night-soft p-5">
        {/* Atributos */}
        {currentStep === 'Atributos' && (
          <div>
            <h2 className="font-display mb-1 text-lg font-semibold text-gold-light">
              Atributos
            </h2>
            <p className="mb-4 text-sm text-parchment/60">
              Distribua os valores. O <strong>Humano</strong> concede{' '}
              <strong>+1 em todos os atributos</strong> (já somado à direita).
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
                    <span className="text-sm text-parchment/50">+{bonus} (Humano)</span>
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

        {/* Antecedente */}
        {currentStep === 'Antecedente' && (
          <div>
            <h2 className="font-display mb-1 text-lg font-semibold text-gold-light">
              Antecedente
            </h2>
            <p className="mb-4 text-sm text-parchment/60">
              O antecedente concede <strong>2 perícias</strong> (e às vezes
              ferramentas/idiomas), além de definir sua história.
            </p>
            <select
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-gold/20 bg-night px-3 py-2 text-parchment outline-none focus:border-gold/60"
            >
              <option value="">Selecione...</option>
              {bgOptions.map((en) => (
                <option key={en} value={toDisplayBackground(en)}>
                  {toDisplayBackground(en)}
                </option>
              ))}
            </select>
            {bgData && (
              <div className="mt-4 rounded-lg border border-gold/15 bg-night p-3 text-sm">
                <p>
                  <span className="text-parchment/60">Perícias do antecedente:</span>{' '}
                  <strong className="text-gold-light">
                    {bgSkills.map(skillLabel).join(', ') || '—'}
                  </strong>
                </p>
                {bgData.tools.length > 0 && (
                  <p className="mt-1">
                    <span className="text-parchment/60">Ferramentas:</span>{' '}
                    {bgData.tools.join(', ')}
                  </p>
                )}
                {bgData.languageChoices > 0 && (
                  <p className="mt-1">
                    <span className="text-parchment/60">Idiomas a escolher:</span>{' '}
                    {bgData.languageChoices}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Perícias */}
        {currentStep === 'Perícias' && (
          <div>
            <h2 className="font-display mb-1 text-lg font-semibold text-gold-light">
              Perícias do Ladino — escolha {cls?.skillChoose ?? 4}
            </h2>
            <p className="mb-3 text-sm text-parchment/60">
              O <strong>Ladino</strong> escolhe {cls?.skillChoose ?? 4} perícias (
              {classSkills.length} selecionadas).
              {bgSkills.length > 0 && (
                <>
                  {' '}
                  Já vêm do antecedente:{' '}
                  <strong className="text-gold-light">
                    {bgSkills.map(skillLabel).join(', ')}
                  </strong>
                  .
                </>
              )}
            </p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {classSkillOptions.map((k) => {
                const checked = classSkills.includes(k)
                const full = classSkills.length >= (cls?.skillChoose ?? 4)
                return (
                  <label
                    key={k}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 ${checked ? 'bg-gold/10' : 'hover:bg-gold/5'} ${!checked && full ? 'opacity-40' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && full}
                      onChange={() => toggleClassSkill(k)}
                      className="h-4 w-4 accent-gold"
                    />
                    <span className="text-parchment/90">{skillLabel(k)}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Especialização */}
        {currentStep === 'Especialização' && (
          <div>
            <h2 className="font-display mb-1 text-lg font-semibold text-gold-light">
              Especialização do Ladino — escolha 2
            </h2>
            <p className="mb-3 text-sm text-parchment/60">
              No 1º nível o <strong>Ladino</strong> dobra o bônus em 2 perícias
              proficientes (ou em ferramentas de ladrão). {expertiseCount}/2.
            </p>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {proficientSkills.map((k) => {
                const checked = expertiseSkills.includes(k)
                const full = expertiseCount >= 2
                return (
                  <label
                    key={k}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 ${checked ? 'bg-gold/10' : 'hover:bg-gold/5'} ${!checked && full ? 'opacity-40' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && full}
                      onChange={() => toggleExpertiseSkill(k)}
                      className="h-4 w-4 accent-gold-light"
                    />
                    <span className="text-parchment/90">{skillLabel(k)}</span>
                  </label>
                )
              })}
              <label
                className={`flex items-center gap-2 rounded-lg px-3 py-2 ${expertiseTools ? 'bg-gold/10' : 'hover:bg-gold/5'} ${!expertiseTools && expertiseCount >= 2 ? 'opacity-40' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={expertiseTools}
                  disabled={!expertiseTools && expertiseCount >= 2}
                  onChange={() => setExpertiseTools((v) => !v)}
                  className="h-4 w-4 accent-gold-light"
                />
                <span className="text-parchment/90">Ferramentas de Ladrão</span>
              </label>
            </div>
          </div>
        )}

        {/* Idiomas */}
        {currentStep === 'Idiomas' && (
          <div>
            <h2 className="font-display mb-1 text-lg font-semibold text-gold-light">
              Idiomas — escolha {totalLangPicks}
            </h2>
            <p className="mb-3 text-sm text-parchment/60">
              Você já fala <strong>Comum</strong>. Escolha mais{' '}
              {isHuman && '1 do Humano'}
              {isHuman && (bgData?.languageChoices ?? 0) > 0 && ' + '}
              {(bgData?.languageChoices ?? 0) > 0 &&
                `${bgData?.languageChoices} do antecedente`}
              .
            </p>
            <div className="space-y-2">
              {langPicks.map((lang, i) => (
                <select
                  key={i}
                  value={lang}
                  onChange={(e) => setLanguageAt(i, e.target.value)}
                  className="w-full max-w-xs rounded-lg border border-gold/20 bg-night px-3 py-2 text-parchment outline-none focus:border-gold/60"
                >
                  <option value="">Selecione...</option>
                  {LANGUAGES_PT.map((l) => (
                    <option key={l} value={l} disabled={langPicks.includes(l) && lang !== l}>
                      {l}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          </div>
        )}

        {/* Equipamento */}
        {currentStep === 'Equipamento' && (
          <div>
            <h2 className="font-display mb-1 text-lg font-semibold text-gold-light">
              Equipamento inicial
            </h2>
            <p className="mb-4 text-sm text-parchment/60">
              Pegue o equipamento da <strong>classe</strong> ou troque por{' '}
              <strong>ouro</strong> para comprar o seu. O equipamento do{' '}
              <strong>antecedente</strong> você recebe sempre.
            </p>

            <div className="mb-4 inline-flex rounded-lg bg-night p-1 text-sm">
              <button
                type="button"
                onClick={() => setEquipMode('itens')}
                className={`rounded-md px-3 py-1 ${equipMode === 'itens' ? 'bg-gold/20 text-gold-light' : 'text-parchment/60'}`}
              >
                Equipamento da classe
              </button>
              <button
                type="button"
                onClick={() => setEquipMode('ouro')}
                className={`rounded-md px-3 py-1 ${equipMode === 'ouro' ? 'bg-gold/20 text-gold-light' : 'text-parchment/60'}`}
              >
                Ouro {clsEquip ? `(${clsEquip.goldText})` : ''}
              </button>
            </div>

            {equipMode === 'itens' && clsEquip && (
              <div className="space-y-4">
                {clsEquip.choices.map((c, i) => (
                  <div key={i}>
                    <p className="mb-1 text-sm text-parchment/70">{c.label}</p>
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {c.options.map((opt, j) => (
                        <label
                          key={j}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 ${(equipChoices[i] ?? -1) === j ? 'bg-gold/10' : 'hover:bg-gold/5'}`}
                        >
                          <input
                            type="radio"
                            name={`equip-${i}`}
                            checked={(equipChoices[i] ?? -1) === j}
                            onChange={() => setEquipChoice(i, j)}
                            className="h-4 w-4 accent-gold"
                          />
                          <span className="text-parchment/90">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="rounded-lg border border-gold/15 bg-night p-3 text-sm">
                  <span className="text-parchment/60">Você também recebe:</span>{' '}
                  {clsEquip.fixed.join(', ')}
                </div>
              </div>
            )}

            {equipMode === 'ouro' && clsEquip && (
              <div className="rounded-lg border border-gold/15 bg-night p-3 text-sm">
                Você recebe <strong>{clsEquip.goldText}</strong> (≈{' '}
                {clsEquip.goldAverage} po) para comprar seu equipamento, em vez do
                equipamento da classe.
              </div>
            )}

            {bgEquip && (
              <div className="mt-4 rounded-lg border border-gold/15 bg-night p-3 text-sm">
                <span className="text-parchment/60">Do antecedente ({background}):</span>{' '}
                {bgEquip.fixed.join(', ')}
                {bgEquip.gp > 0 && `, ${bgEquip.gp} po`}
              </div>
            )}
          </div>
        )}

        {/* Subclasse */}
        {currentStep === 'Subclasse' && (
          <div>
            <h2 className="font-display mb-1 text-lg font-semibold text-gold-light">
              Arquétipo de Ladino (3º nível)
            </h2>
            <p className="mb-4 text-sm text-parchment/60">
              No 3º nível o <strong>Ladino</strong> escolhe seu arquétipo.
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

        {/* Revisão */}
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
                <strong>Antecedente:</strong> {background || '—'}
              </li>
              <li>
                <strong>Perícias:</strong>{' '}
                {proficientSkills.map(skillLabel).join(', ')}{' '}
                <span className="text-parchment/50">
                  (Ladino: {classSkills.map(skillLabel).join(', ') || '—'} · Antecedente:{' '}
                  {bgSkills.map(skillLabel).join(', ') || '—'})
                </span>
              </li>
              <li>
                <strong>Especialização:</strong>{' '}
                {[...expertiseSkills.map(skillLabel), ...(expertiseTools ? ['Ferramentas de Ladrão'] : [])].join(', ') || '—'}
              </li>
              <li>
                <strong>Idiomas:</strong> {['Comum', ...langPicks.filter(Boolean)].join(', ')}
              </li>
              <li>
                <strong>Equipamento:</strong>{' '}
                {equipMode === 'ouro'
                  ? `Ouro inicial da classe (${clsEquip?.goldText ?? ''})`
                  : clsEquip
                    ? clsEquip.choices
                        .map((c, i) => c.options[equipChoices[i] ?? -1])
                        .filter(Boolean)
                        .join(', ') + ` + ${clsEquip.fixed.join(', ')}`
                    : '—'}
                {bgEquip && ` · Antecedente: ${bgEquip.fixed.join(', ')}, ${bgEquip.gp} po`}
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
              classe e espaços de magia entram automaticamente).
            </p>
          </div>
        )}

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
