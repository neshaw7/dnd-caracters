import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  listCharacters,
  createCharacter,
  deleteCharacter,
  type CharacterListItem,
} from '../lib/characters'
import { CharacterCard } from '../components/CharacterCard'
import { NewCharacterModal, type NewCharacterValues } from '../components/NewCharacterModal'
import { ConfirmDialog } from '../components/ConfirmDialog'

export function Gallery() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [characters, setCharacters] = useState<CharacterListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [toDelete, setToDelete] = useState<CharacterListItem | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro(null)
    try {
      setCharacters(await listCharacters())
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao carregar personagens.')
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial: setState acontece dentro da promise (loading ja inicia true).
  useEffect(() => {
    let active = true
    listCharacters()
      .then((list) => active && setCharacters(list))
      .catch(
        (err) =>
          active &&
          setErro(err instanceof Error ? err.message : 'Erro ao carregar personagens.'),
      )
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  async function handleCreate(values: NewCharacterValues) {
    const id = await createCharacter({
      name: values.name,
      char_class: values.char_class || undefined,
      level: values.level,
      race: values.race || undefined,
    })
    navigate(`/personagem/${id}/editar`)
  }

  async function handleConfirmDelete() {
    if (!toDelete) return
    const alvo = toDelete
    setToDelete(null)
    setCharacters((prev) => prev.filter((c) => c.id !== alvo.id))
    try {
      await deleteCharacter(alvo.id)
    } catch {
      carregar() // reverte se falhar
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gold/20 pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-light">
            Meus Personagens
          </h1>
          <p className="text-sm text-parchment/60">{user?.email}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/regras"
            className="rounded-lg border border-gold/30 px-4 py-2 text-sm text-parchment/80 transition hover:border-gold/60 hover:text-parchment"
          >
            Regras
          </Link>
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="font-display rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-night transition hover:bg-gold-light"
          >
            + Novo personagem
          </button>
          <button
            type="button"
            onClick={signOut}
            className="rounded-lg border border-gold/30 px-4 py-2 text-sm text-parchment/80 transition hover:border-gold/60 hover:text-parchment"
          >
            Sair
          </button>
        </div>
      </header>

      {loading && (
        <p className="mt-12 text-center text-parchment/60">Carregando...</p>
      )}

      {erro && (
        <p className="mt-12 rounded-lg bg-wine/30 px-4 py-3 text-center text-red-200">
          {erro}
        </p>
      )}

      {!loading && !erro && characters.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-gold/30 bg-night-soft p-12 text-center">
          <p className="font-display text-lg text-gold-light">
            Nenhum personagem ainda
          </p>
          <p className="mt-2 text-parchment/70">
            Clique em "Novo personagem" para criar sua primeira ficha.
          </p>
        </div>
      )}

      {!loading && characters.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {characters.map((c) => (
            <CharacterCard key={c.id} character={c} onDelete={setToDelete} />
          ))}
        </div>
      )}

      {showNew && (
        <NewCharacterModal
          onClose={() => setShowNew(false)}
          onCreate={handleCreate}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          title="Apagar personagem"
          message={`Tem certeza que quer apagar "${toDelete.name}"? Essa ação não pode ser desfeita.`}
          confirmLabel="Apagar"
          onConfirm={handleConfirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  )
}
