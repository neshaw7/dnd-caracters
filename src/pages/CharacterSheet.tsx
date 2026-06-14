import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ABILITIES,
  SKILLS,
  ABILITY_LABEL,
  abilityModifier,
  formatModifier,
  proficiencyBonus as calcProfBonus,
} from '../domain/dnd'
import { getCharacter } from '../lib/characters'
import type { CharacterRow } from '../types/character'

export function CharacterSheet() {
  const { id } = useParams<{ id: string }>()
  const [row, setRow] = useState<CharacterRow | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    getCharacter(id)
      .then((r) => active && setRow(r))
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao carregar.'))
    return () => {
      active = false
    }
  }, [id])

  if (erro) {
    return <p className="py-20 text-center text-red-300">{erro}</p>
  }
  if (!row) {
    return <p className="py-20 text-center text-parchment/60">Carregando ficha...</p>
  }

  const d = row.data
  const profBonus = calcProfBonus(row.level)
  const initiative = abilityModifier(d.abilities.dex)
  const perc = SKILLS.find((s) => s.key === 'percepcao')!
  const passivePerception =
    10 +
    abilityModifier(d.abilities[perc.ability]) +
    (d.skillExpertise.includes('percepcao')
      ? profBonus * 2
      : d.skillProficiencies.includes('percepcao')
        ? profBonus
        : 0)

  const hasSpells = d.spellcasting.ability !== '' || d.spellcasting.spells.length > 0

  return (
    <div className="px-4 py-6">
      {/* Barra de acoes (nao imprime) */}
      <div className="no-print mx-auto mb-4 flex max-w-[1000px] items-center justify-between">
        <Link to="/" className="text-sm text-parchment/60 transition hover:text-gold-light">
          ← Galeria
        </Link>
        <div className="flex gap-3">
          <Link
            to={`/personagem/${id}/editar`}
            className="rounded-lg border border-gold/30 px-4 py-2 text-sm text-parchment/80 transition hover:border-gold/60"
          >
            Editar
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="font-display rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-night transition hover:bg-gold-light"
          >
            🖨 Imprimir ficha
          </button>
        </div>
      </div>

      {/* Pagina da ficha */}
      <div className="sheet-paper mx-auto max-w-[1000px] rounded-xl p-6 shadow-2xl shadow-black/40 sm:p-8">
        {/* Cabecalho */}
        <header className="sheet-avoid-break mb-5 border-b-2 border-[#b8995a] pb-4">
          <h1 className="sheet-title text-4xl font-bold">{row.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <HeaderField
              label="Classe e Nível"
              value={`${row.char_class ?? '—'} ${row.level}${d.subclass ? ` · ${d.subclass}` : ''}`}
            />
            <HeaderField label="Raça" value={row.race ?? '—'} />
            <HeaderField label="Antecedente" value={d.background || '—'} />
            <HeaderField label="Alinhamento" value={d.alignment || '—'} />
            <HeaderField label="Jogador" value={d.playerName || '—'} />
            <HeaderField label="XP" value={String(d.xp || 0)} />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Coluna 1: atributos, resistencias, pericias */}
          <div className="space-y-4">
            <div className="sheet-avoid-break grid grid-cols-3 gap-2 lg:grid-cols-2">
              {ABILITIES.map((ab) => (
                <div
                  key={ab.key}
                  className="sheet-box flex flex-col items-center px-2 py-2"
                >
                  <span className="sheet-label">{ab.abbr}</span>
                  <span className="text-2xl font-bold">
                    {formatModifier(abilityModifier(d.abilities[ab.key]))}
                  </span>
                  <span className="text-xs text-[#6b5a33]">{d.abilities[ab.key]}</span>
                </div>
              ))}
            </div>

            <div className="sheet-box sheet-avoid-break px-3 py-2 text-center">
              <span className="sheet-label">Bônus de Proficiência</span>
              <div className="text-xl font-bold">{formatModifier(profBonus)}</div>
            </div>

            <div className="sheet-box sheet-avoid-break p-3">
              <h2 className="sheet-label mb-1">Testes de Resistência</h2>
              <ul className="text-sm">
                {ABILITIES.map((ab) => {
                  const prof = d.savingThrowProficiencies.includes(ab.key)
                  const total = abilityModifier(d.abilities[ab.key]) + (prof ? profBonus : 0)
                  return (
                    <li key={ab.key} className="flex items-center gap-2 py-0.5">
                      <Dot filled={prof} />
                      <span className="w-8 font-semibold">{formatModifier(total)}</span>
                      <span>{ab.label}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="sheet-box sheet-avoid-break p-3">
              <h2 className="sheet-label mb-1">Perícias</h2>
              <ul className="text-sm">
                {SKILLS.map((sk) => {
                  const prof = d.skillProficiencies.includes(sk.key)
                  const exp = d.skillExpertise.includes(sk.key)
                  const total =
                    abilityModifier(d.abilities[sk.ability]) +
                    (exp ? profBonus * 2 : prof ? profBonus : 0)
                  return (
                    <li key={sk.key} className="flex items-center gap-2 py-0.5">
                      <Dot filled={prof} doubled={exp} />
                      <span className="w-8 font-semibold">{formatModifier(total)}</span>
                      <span className="flex-1">{sk.label}</span>
                      <span className="text-xs text-[#6b5a33]">
                        {ABILITY_LABEL[sk.ability].slice(0, 3)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="sheet-box sheet-avoid-break px-3 py-2 text-center">
              <span className="sheet-label">Percepção Passiva</span>
              <div className="text-xl font-bold">{passivePerception}</div>
            </div>

            {d.otherProficiencies && (
              <div className="sheet-box sheet-avoid-break p-3">
                <h2 className="sheet-label mb-1">Outras Proficiências e Idiomas</h2>
                <p className="whitespace-pre-wrap text-sm">{d.otherProficiencies}</p>
              </div>
            )}
          </div>

          {/* Coluna 2: combate, ataques, equipamento */}
          <div className="space-y-4">
            <div className="sheet-avoid-break grid grid-cols-3 gap-2">
              <StatBox label="Classe de Armadura" value={String(d.armorClass)} />
              <StatBox label="Iniciativa" value={formatModifier(initiative)} />
              <StatBox label="Deslocamento" value={`${d.speed}m`} />
            </div>

            <div className="sheet-box sheet-avoid-break p-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="sheet-label">PV Máximo</span>
                  <div className="text-lg font-bold">{d.maxHp}</div>
                </div>
                <div>
                  <span className="sheet-label">PV Atual</span>
                  <div className="text-lg font-bold">{d.currentHp}</div>
                </div>
                <div>
                  <span className="sheet-label">PV Temp.</span>
                  <div className="text-lg font-bold">{d.tempHp}</div>
                </div>
              </div>
              <div className="mt-2 flex justify-between border-t border-[#b8995a]/40 pt-2 text-sm">
                <span>
                  <span className="sheet-label">Dados de Vida:</span> {d.hitDice || '—'}
                </span>
                <span>
                  <span className="sheet-label">Resist. à Morte:</span>{' '}
                  {d.deathSaves.successes}✓ / {d.deathSaves.failures}✗
                </span>
              </div>
            </div>

            <div className="sheet-box sheet-avoid-break p-3">
              <h2 className="sheet-label mb-2">Ataques e Magias</h2>
              {d.attacks.length === 0 ? (
                <p className="text-sm text-[#6b5a33]">Nenhum ataque cadastrado.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="sheet-label text-left">
                      <th className="font-normal">Nome</th>
                      <th className="font-normal">Bônus</th>
                      <th className="font-normal">Dano/Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.attacks.map((a) => (
                      <tr key={a.id} className="border-t border-[#b8995a]/30">
                        <td className="py-1">{a.name}</td>
                        <td className="py-1 text-center">{a.bonus}</td>
                        <td className="py-1">{a.damage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="sheet-box sheet-avoid-break p-3">
              <h2 className="sheet-label mb-1">Equipamento e Tesouro</h2>
              <div className="mb-2 flex flex-wrap gap-x-4 text-sm">
                <span>PC {d.coins.cp}</span>
                <span>PP {d.coins.sp}</span>
                <span>PE {d.coins.ep}</span>
                <span>PO {d.coins.gp}</span>
                <span>PL {d.coins.pp}</span>
              </div>
              {d.equipment && (
                <p className="whitespace-pre-wrap text-sm">{d.equipment}</p>
              )}
            </div>
          </div>

          {/* Coluna 3: personalidade, caracteristicas */}
          <div className="space-y-4">
            <div className="sheet-box sheet-avoid-break p-3">
              <PersonalityBlock label="Traços de Personalidade" value={d.personality.traits} />
              <PersonalityBlock label="Ideais" value={d.personality.ideals} />
              <PersonalityBlock label="Vínculos" value={d.personality.bonds} />
              <PersonalityBlock label="Fraquezas" value={d.personality.flaws} last />
            </div>

            {d.featuresAndTraits && (
              <div className="sheet-box sheet-avoid-break p-3">
                <h2 className="sheet-label mb-1">Anotações</h2>
                <p className="whitespace-pre-wrap text-sm">{d.featuresAndTraits}</p>
              </div>
            )}

            {d.inspiration && (
              <div className="sheet-box sheet-avoid-break px-3 py-2 text-center">
                <span className="sheet-label">Inspiração</span>
                <div className="text-lg font-bold">★</div>
              </div>
            )}
          </div>
        </div>

        {/* Caracteristicas de classe/subclasse (um card por feature) */}
        {d.appliedFeatures.length > 0 && (
          <div className="mt-5">
            <h2 className="sheet-title mb-2 text-lg font-semibold">
              Características de Classe
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {d.appliedFeatures.map((f, i) => (
                <div key={i} className="sheet-box sheet-avoid-break p-3">
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <h3 className="sheet-title font-semibold">{f.name}</h3>
                    <span className="sheet-label shrink-0">
                      {f.source} · Nv {f.level}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-snug">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Magias */}
        {hasSpells && (
          <div className="sheet-box sheet-avoid-break mt-5 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1">
              <h2 className="sheet-title text-lg font-semibold">Magias</h2>
              {d.spellcasting.ability !== '' && (
                <>
                  <HeaderField
                    label="Atributo"
                    value={ABILITY_LABEL[d.spellcasting.ability]}
                  />
                  <HeaderField
                    label="CD"
                    value={String(
                      8 + profBonus + abilityModifier(d.abilities[d.spellcasting.ability]),
                    )}
                  />
                  <HeaderField
                    label="Bônus de Ataque"
                    value={formatModifier(
                      profBonus + abilityModifier(d.abilities[d.spellcasting.ability]),
                    )}
                  />
                </>
              )}
            </div>
            {d.spellcasting.slots.some((s) => s.total > 0) && (
              <div className="mb-3">
                <span className="sheet-label">Espaços de magia</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {d.spellcasting.slots.map((s, lvl) =>
                    lvl >= 1 && s.total > 0 ? (
                      <div key={lvl} className="sheet-box px-3 py-1 text-center">
                        <span className="sheet-label">{lvl}º círculo</span>
                        <div className="text-sm font-bold">{s.total}</div>
                      </div>
                    ) : null,
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => {
                const spells = d.spellcasting.spells.filter((s) => s.level === lvl)
                const slot = d.spellcasting.slots[lvl]
                if (spells.length === 0 && (!slot || slot.total === 0)) return null
                return (
                  <div key={lvl}>
                    <h3 className="sheet-label border-b border-[#b8995a]/40">
                      {lvl === 0 ? 'Truques' : `${lvl}º Círculo`}
                      {lvl > 0 && slot && slot.total > 0 && (
                        <span> · {slot.total} espaços</span>
                      )}
                    </h3>
                    <ul className="mt-1 text-sm">
                      {spells.map((s) => (
                        <li key={s.id} className="flex items-center gap-1.5 py-0.5">
                          {lvl > 0 && <Dot filled={s.prepared} />}
                          <span>{s.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Aparencia e historia */}
        {(d.backstory ||
          Object.values(d.appearance).some(Boolean)) && (
          <div className="sheet-box sheet-avoid-break mt-5 p-4">
            <h2 className="sheet-title mb-2 text-lg font-semibold">Aparência e História</h2>
            <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              {d.appearance.age && <HeaderField label="Idade" value={d.appearance.age} />}
              {d.appearance.height && <HeaderField label="Altura" value={d.appearance.height} />}
              {d.appearance.weight && <HeaderField label="Peso" value={d.appearance.weight} />}
              {d.appearance.eyes && <HeaderField label="Olhos" value={d.appearance.eyes} />}
              {d.appearance.skin && <HeaderField label="Pele" value={d.appearance.skin} />}
              {d.appearance.hair && <HeaderField label="Cabelo" value={d.appearance.hair} />}
            </div>
            {d.backstory && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{d.backstory}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function HeaderField({ label, value }: { label: string; value: string }) {
  return (
    <span className="leading-tight">
      <span className="sheet-label block">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="sheet-box flex flex-col items-center px-1 py-2 text-center">
      <span className="sheet-label">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  )
}

function PersonalityBlock({
  label,
  value,
  last,
}: {
  label: string
  value: string
  last?: boolean
}) {
  return (
    <div className={last ? '' : 'mb-2 border-b border-[#b8995a]/30 pb-2'}>
      <span className="sheet-label">{label}</span>
      <p className="whitespace-pre-wrap text-sm">{value || '—'}</p>
    </div>
  )
}

function Dot({ filled, doubled }: { filled: boolean; doubled?: boolean }) {
  return (
    <span
      className={`inline-block h-3 w-3 shrink-0 rounded-full border border-[#6b5a33] ${
        doubled ? 'bg-[#6b5a33]' : filled ? 'bg-[#b8995a]' : 'bg-transparent'
      }`}
    />
  )
}
