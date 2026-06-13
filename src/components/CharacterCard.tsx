import { Link } from 'react-router-dom'
import type { CharacterListItem } from '../lib/characters'

export function CharacterCard({
  character,
  onDelete,
}: {
  character: CharacterListItem
  onDelete: (c: CharacterListItem) => void
}) {
  const subtitle = [character.race, character.char_class]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-gold/20 bg-night-soft transition hover:border-gold/50 hover:shadow-lg hover:shadow-black/30">
      <Link to={`/personagem/${character.id}`} className="flex flex-1 flex-col">
        <div className="flex h-32 items-center justify-center bg-gradient-to-br from-night to-wine/30">
          {character.avatar_url ? (
            <img
              src={character.avatar_url}
              alt={character.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-display text-5xl text-gold/40">
              {character.name.charAt(0).toUpperCase() || '?'}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-lg font-semibold text-gold-light">
            {character.name}
          </h3>
          <p className="text-sm text-parchment/60">
            {subtitle || 'Sem classe definida'}
          </p>
          <span className="mt-2 inline-flex w-fit rounded-full border border-gold/30 px-2 py-0.5 text-xs text-parchment/70">
            Nível {character.level}
          </span>
        </div>
      </Link>

      <div className="flex border-t border-gold/10">
        <Link
          to={`/personagem/${character.id}/editar`}
          className="flex-1 py-2 text-center text-sm text-parchment/70 transition hover:bg-gold/10 hover:text-parchment"
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={() => onDelete(character)}
          className="flex-1 border-l border-gold/10 py-2 text-center text-sm text-red-300/70 transition hover:bg-wine/30 hover:text-red-200"
        >
          Apagar
        </button>
      </div>
    </div>
  )
}
