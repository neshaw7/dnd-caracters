import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CLASSES,
  CLASS_PT_TO_EN,
  ALIGNMENTS,
  SKILLS,
  abilityModifier,
  formatModifier,
  proficiencyBonus as calcProfBonus,
  type AbilityKey,
  type SkillKey,
} from '../domain/dnd'
import { getCharacter, updateCharacter } from '../lib/characters'
import type { CharacterData } from '../types/character'
import { emptyCharacterData } from '../types/character'
import { getRuleClassByName } from '../lib/aurora/rulesStore'
import { applyRules, AUTO_MARK } from '../lib/aurora/autofill'
import type { ParsedClass } from '../lib/aurora/parse'
import {
  TextField,
  NumberField,
  TextArea,
  SelectField,
  SectionCard,
} from '../components/form'
import { AbilityScoresEditor } from '../components/editor/AbilityScoresEditor'
import { SavingThrowsEditor } from '../components/editor/SavingThrowsEditor'
import { SkillsEditor } from '../components/editor/SkillsEditor'
import { AttacksEditor } from '../components/editor/AttacksEditor'
import { SpellcastingEditor } from '../components/editor/SpellcastingEditor'

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

export function CharacterEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [charClass, setCharClass] = useState('')
  const [level, setLevel] = useState(1)
  const [race, setRace] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [data, setData] = useState<CharacterData>(emptyCharacterData())
  const [ruleClass, setRuleClass] = useState<ParsedClass | null>(null)
  const [rulesMsg, setRulesMsg] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!id) return
    let active = true
    // loading ja inicia em true; o setState acontece dentro das promises.
    getCharacter(id)
      .then((row) => {
        if (!active) return
        setName(row.name)
        setCharClass(row.char_class ?? '')
        setLevel(row.level)
        setRace(row.race ?? '')
        setAvatarUrl(row.avatar_url ?? '')
        setData(row.data)
      })
      .catch((err) =>
        setErro(err instanceof Error ? err.message : 'Erro ao carregar.'),
      )
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [id])

  // Atualiza um campo da ficha (data) marcando como nao salvo.
  const patch = useCallback((p: Partial<CharacterData>) => {
    setData((prev) => ({ ...prev, ...p }))
    setDirty(true)
    setSavedAt(false)
  }, [])

  // Preenchimento automatico das regras (classe + subclasse + nivel).
  const aplicarRegras = useCallback(
    (rc: ParsedClass) => {
      const archetype = rc.archetypes.find((a) => a.name === data.subclass) ?? null
      const next = applyRules(data, { cls: rc, archetype, race: null, level })
      setData(next)
      setDirty(true)
      setSavedAt(false)
      setRulesMsg(
        `Preenchido das regras: ${rc.name}${archetype ? ` (${archetype.name})` : ''}.`,
      )
    },
    [data, level],
  )

  // Carrega a classe das regras (do nosso banco) quando a classe muda.
  // Na criacao, ja preenche sozinho se a ficha ainda nao tem bloco automatico.
  useEffect(() => {
    const en = CLASS_PT_TO_EN[charClass]
    if (!en) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRuleClass(null)
      return
    }
    let active = true
    getRuleClassByName(en)
      .then((rc) => {
        if (!active) return
        setRuleClass(rc)
        if (rc && !data.featuresAndTraits.includes(AUTO_MARK)) {
          const archetype = rc.archetypes.find((a) => a.name === data.subclass) ?? null
          setData(applyRules(data, { cls: rc, archetype, race: null, level }))
          setDirty(true)
          setRulesMsg(`Preenchido das regras: ${rc.name}.`)
        }
      })
      .catch(() => active && setRuleClass(null))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charClass])

  // Wrappers para campos do topo que tambem marcam dirty.
  function bind<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v)
      setDirty(true)
      setSavedAt(false)
    }
  }

  async function handleSave() {
    if (!id) return
    setSaving(true)
    setErro(null)
    try {
      await updateCharacter(id, {
        name: name.trim() || 'Sem nome',
        char_class: charClass || null,
        level,
        race: race || null,
        avatar_url: avatarUrl || null,
        data,
      })
      setDirty(false)
      setSavedAt(true)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="py-20 text-center text-parchment/60">Carregando ficha...</p>
  }

  const profBonus = calcProfBonus(level)
  const initiative = abilityModifier(data.abilities.dex)
  const perceptionSkill = SKILLS.find((s) => s.key === 'percepcao')!
  const perceptionProf = data.skillProficiencies.includes('percepcao')
  const perceptionExp = data.skillExpertise.includes('percepcao')
  const passivePerception =
    10 +
    abilityModifier(data.abilities[perceptionSkill.ability]) +
    (perceptionExp ? profBonus * 2 : perceptionProf ? profBonus : 0)

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-6 sm:px-6">
      {/* Cabecalho */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="text-sm text-parchment/60 transition hover:text-gold-light">
          ← Voltar
        </Link>
        <div className="flex items-center gap-3">
          {dirty && <span className="text-xs text-amber-300/70">alterações não salvas</span>}
          {savedAt && <span className="text-xs text-emerald-300/80">salvo ✓</span>}
          <Link
            to={`/personagem/${id}`}
            className="rounded-lg border border-gold/30 px-4 py-2 text-sm text-parchment/80 transition hover:border-gold/60"
          >
            Ver ficha
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="font-display rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-night transition hover:bg-gold-light disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {erro && (
        <p className="mb-4 rounded-lg bg-wine/30 px-4 py-2 text-sm text-red-200">{erro}</p>
      )}

      <div className="space-y-6">
        {/* Identidade */}
        <SectionCard title="Identidade">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField label="Nome" value={name} onChange={bind(setName)} />
            <TextField label="Raça" value={race} onChange={bind(setRace)} />
            <SelectField
              label="Classe"
              value={charClass}
              onChange={bind(setCharClass)}
              options={CLASSES}
            />
            <NumberField label="Nível" value={level} onChange={bind(setLevel)} min={1} max={20} />
            <SelectField
              label="Subclasse / Arquétipo"
              value={data.subclass}
              onChange={(v) => {
                const archetype =
                  ruleClass?.archetypes.find((a) => a.name === v) ?? null
                const base = { ...data, subclass: v }
                setData(
                  ruleClass
                    ? applyRules(base, { cls: ruleClass, archetype, race: null, level })
                    : base,
                )
                setDirty(true)
                setSavedAt(false)
              }}
              options={ruleClass?.archetypes.map((a) => a.name) ?? []}
              placeholder={ruleClass ? 'Selecione...' : 'Importe as regras primeiro'}
            />
            <SelectField
              label="Alinhamento"
              value={data.alignment}
              onChange={(v) => patch({ alignment: v })}
              options={ALIGNMENTS}
            />
            <TextField
              label="Antecedente"
              value={data.background}
              onChange={(v) => patch({ background: v })}
            />
            <TextField
              label="Nome do jogador"
              value={data.playerName}
              onChange={(v) => patch({ playerName: v })}
            />
            <NumberField
              label="Experiência (XP)"
              value={data.xp}
              onChange={(v) => patch({ xp: v })}
              min={0}
            />
            <TextField
              label="URL do retrato (opcional)"
              value={avatarUrl}
              onChange={bind(setAvatarUrl)}
              placeholder="https://..."
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!ruleClass}
              onClick={() => ruleClass && aplicarRegras(ruleClass)}
              className="rounded-lg border border-gold/40 px-4 py-2 text-sm text-gold-light transition hover:bg-gold/10 disabled:opacity-40"
            >
              ↻ Preencher das regras
            </button>
            {rulesMsg && <span className="text-xs text-emerald-300/80">{rulesMsg}</span>}
            {!ruleClass && charClass && (
              <span className="text-xs text-parchment/50">
                Classe não encontrada nas regras. Importe em "Regras".
              </span>
            )}
          </div>
        </SectionCard>

        {/* Atributos + derivados */}
        <SectionCard title="Atributos">
          <AbilityScoresEditor
            abilities={data.abilities}
            onChange={(next) => patch({ abilities: next })}
          />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Derived label="Bônus de proficiência" value={formatModifier(profBonus)} />
            <Derived label="Iniciativa" value={formatModifier(initiative)} />
            <Derived label="Percepção passiva" value={String(passivePerception)} />
            <label className="flex flex-col items-center justify-center rounded-xl border border-gold/20 bg-night p-3">
              <span className="text-xs text-parchment/60">Inspiração</span>
              <input
                type="checkbox"
                checked={data.inspiration}
                onChange={(e) => patch({ inspiration: e.target.checked })}
                className="mt-1 h-5 w-5 accent-gold"
              />
            </label>
          </div>
        </SectionCard>

        {/* Resistencias + Pericias */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
          <SectionCard title="Testes de resistência">
            <SavingThrowsEditor
              abilities={data.abilities}
              proficiencies={data.savingThrowProficiencies}
              proficiencyBonus={profBonus}
              onToggle={(key: AbilityKey) =>
                patch({
                  savingThrowProficiencies: toggle(data.savingThrowProficiencies, key),
                })
              }
            />
          </SectionCard>
          <SectionCard title="Perícias">
            <p className="mb-2 text-xs text-parchment/50">
              1ª caixa = proficiente · 2ª caixa = especialização
            </p>
            <SkillsEditor
              abilities={data.abilities}
              proficiencyBonus={profBonus}
              skillProficiencies={data.skillProficiencies}
              skillExpertise={data.skillExpertise}
              onToggleProficiency={(key: SkillKey) =>
                patch({ skillProficiencies: toggle(data.skillProficiencies, key) })
              }
              onToggleExpertise={(key: SkillKey) =>
                patch({ skillExpertise: toggle(data.skillExpertise, key) })
              }
            />
          </SectionCard>
        </div>

        {/* Combate */}
        <SectionCard title="Combate">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <NumberField
              label="Classe de Armadura"
              value={data.armorClass}
              onChange={(v) => patch({ armorClass: v })}
            />
            <NumberField
              label="Deslocamento (m)"
              value={data.speed}
              onChange={(v) => patch({ speed: v })}
            />
            <NumberField
              label="PV máximo"
              value={data.maxHp}
              onChange={(v) => patch({ maxHp: v })}
            />
            <NumberField
              label="PV atual"
              value={data.currentHp}
              onChange={(v) => patch({ currentHp: v })}
            />
            <NumberField
              label="PV temporário"
              value={data.tempHp}
              onChange={(v) => patch({ tempHp: v })}
            />
            <TextField
              label="Dados de vida"
              value={data.hitDice}
              onChange={(v) => patch({ hitDice: v })}
            />
          </div>
        </SectionCard>

        {/* Ataques */}
        <SectionCard title="Ataques e magias">
          <AttacksEditor
            attacks={data.attacks}
            onChange={(next) => patch({ attacks: next })}
          />
        </SectionCard>

        {/* Magias */}
        <SectionCard title="Conjuração de magias">
          <SpellcastingEditor
            spellcasting={data.spellcasting}
            abilities={data.abilities}
            proficiencyBonus={profBonus}
            onChange={(next) => patch({ spellcasting: next })}
          />
        </SectionCard>

        {/* Equipamento e moedas */}
        <SectionCard title="Equipamento e tesouro">
          <div className="mb-4 grid grid-cols-5 gap-2">
            {(['cp', 'sp', 'ep', 'gp', 'pp'] as const).map((coin) => (
              <NumberField
                key={coin}
                label={
                  { cp: 'PC', sp: 'PP', ep: 'PE', gp: 'PO', pp: 'PL' }[coin]
                }
                value={data.coins[coin]}
                onChange={(v) => patch({ coins: { ...data.coins, [coin]: v } })}
                min={0}
              />
            ))}
          </div>
          <TextArea
            label="Equipamento"
            value={data.equipment}
            onChange={(v) => patch({ equipment: v })}
            rows={4}
            placeholder="Mochila, corda, rações..."
          />
        </SectionCard>

        {/* Personalidade */}
        <SectionCard title="Personalidade">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextArea
              label="Traços de personalidade"
              value={data.personality.traits}
              onChange={(v) => patch({ personality: { ...data.personality, traits: v } })}
            />
            <TextArea
              label="Ideais"
              value={data.personality.ideals}
              onChange={(v) => patch({ personality: { ...data.personality, ideals: v } })}
            />
            <TextArea
              label="Vínculos"
              value={data.personality.bonds}
              onChange={(v) => patch({ personality: { ...data.personality, bonds: v } })}
            />
            <TextArea
              label="Fraquezas"
              value={data.personality.flaws}
              onChange={(v) => patch({ personality: { ...data.personality, flaws: v } })}
            />
          </div>
        </SectionCard>

        {/* Caracteristicas e proficiencias */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard title="Características e traços">
            <TextArea
              label=""
              value={data.featuresAndTraits}
              onChange={(v) => patch({ featuresAndTraits: v })}
              rows={6}
            />
          </SectionCard>
          <SectionCard title="Outras proficiências e idiomas">
            <TextArea
              label=""
              value={data.otherProficiencies}
              onChange={(v) => patch({ otherProficiencies: v })}
              rows={6}
            />
          </SectionCard>
        </div>

        {/* Aparencia e historia */}
        <SectionCard title="Aparência e história">
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <TextField label="Idade" value={data.appearance.age} onChange={(v) => patch({ appearance: { ...data.appearance, age: v } })} />
            <TextField label="Altura" value={data.appearance.height} onChange={(v) => patch({ appearance: { ...data.appearance, height: v } })} />
            <TextField label="Peso" value={data.appearance.weight} onChange={(v) => patch({ appearance: { ...data.appearance, weight: v } })} />
            <TextField label="Olhos" value={data.appearance.eyes} onChange={(v) => patch({ appearance: { ...data.appearance, eyes: v } })} />
            <TextField label="Pele" value={data.appearance.skin} onChange={(v) => patch({ appearance: { ...data.appearance, skin: v } })} />
            <TextField label="Cabelo" value={data.appearance.hair} onChange={(v) => patch({ appearance: { ...data.appearance, hair: v } })} />
          </div>
          <TextArea
            label="História do personagem"
            value={data.backstory}
            onChange={(v) => patch({ backstory: v })}
            rows={6}
          />
        </SectionCard>
      </div>

      {/* Barra fixa de salvar (mobile-friendly) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-night/95 px-4 py-3 backdrop-blur sm:hidden">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="font-display w-full rounded-lg bg-gold py-3 font-semibold text-night transition hover:bg-gold-light disabled:opacity-50"
        >
          {saving ? 'Salvando...' : dirty ? 'Salvar alterações' : 'Salvo ✓'}
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-sm text-parchment/50 transition hover:text-parchment"
        >
          Voltar para a galeria
        </button>
      </div>
    </div>
  )
}

function Derived({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gold/20 bg-night p-3 text-center">
      <span className="text-xs text-parchment/60">{label}</span>
      <span className="mt-1 text-xl font-bold text-gold-light">{value}</span>
    </div>
  )
}
