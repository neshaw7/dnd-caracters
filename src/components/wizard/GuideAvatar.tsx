// Retrato ilustrado do guia (Aldric, o Cronista) numa moldura dourada ornamentada.
// SVG feito a mao, com expressoes que mudam conforme a etapa.
export type GuideMood = 'neutro' | 'pensativo' | 'instigante' | 'satisfeito' | 'serio'

// Sobrancelhas por humor (esquerda / direita).
const BROWS: Record<GuideMood, { l: string; r: string }> = {
  neutro: { l: 'M45 47 L56 46', r: 'M64 46 L75 47' },
  pensativo: { l: 'M45 46 L56 49', r: 'M64 49 L75 46' },
  instigante: { l: 'M45 47 L56 47', r: 'M64 45 L75 41' },
  satisfeito: { l: 'M45 48 L56 45', r: 'M64 45 L75 48' },
  serio: { l: 'M45 44 L56 49', r: 'M64 49 L75 44' },
}

export function GuideAvatar({
  size = 132,
  mood = 'neutro',
}: {
  size?: number
  mood?: GuideMood
}) {
  const brow = BROWS[mood]
  const smiling = mood === 'satisfeito'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]"
      role="img"
      aria-label="Retrato de Aldric, o Cronista"
    >
      <defs>
        <radialGradient id="g-bg" cx="50%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#3a2c1c" />
          <stop offset="100%" stopColor="#0f0a06" />
        </radialGradient>
        <linearGradient id="g-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0d68f" />
          <stop offset="50%" stopColor="#c8a24a" />
          <stop offset="100%" stopColor="#7e6228" />
        </linearGradient>
        <linearGradient id="g-hood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2e1c" />
          <stop offset="100%" stopColor="#170f08" />
        </linearGradient>
      </defs>

      {/* Moldura octogonal */}
      <polygon points="35,3 85,3 117,35 117,85 85,117 35,117 3,85 3,35" fill="url(#g-frame)" />
      <polygon
        points="37,8 83,8 112,37 112,83 83,112 37,112 8,83 8,37"
        fill="#5a4622"
      />
      <polygon
        points="39,11 81,11 109,39 109,81 81,109 39,109 11,81 11,39"
        fill="url(#g-bg)"
      />

      {/* Ombros / manto */}
      <path d="M26 110 Q60 80 94 110 L94 112 L26 112 Z" fill="#241a10" />
      <path d="M40 110 Q60 92 80 110 Z" fill="#1a120a" />
      {/* Gola */}
      <path d="M48 96 Q60 104 72 96 L70 110 L50 110 Z" fill="#2c2114" stroke="#4a3a1e" strokeWidth="1" />

      {/* Capuz por tras */}
      <path
        d="M60 24 Q92 28 90 78 Q80 64 74 66 L74 58 Q72 40 60 38 Q48 40 46 58 L46 66 Q40 64 30 78 Q28 28 60 24 Z"
        fill="url(#g-hood)"
        stroke="#5a4622"
        strokeWidth="1.2"
      />

      {/* Rosto */}
      <path d="M47 50 Q47 38 60 38 Q73 38 73 50 L73 64 Q73 78 60 80 Q47 78 47 64 Z" fill="#d9b48c" />
      {/* sombra do capuz no rosto */}
      <path d="M47 50 Q47 41 60 39 Q73 41 73 50 L73 53 Q60 47 47 53 Z" fill="#00000022" />

      {/* Orelhas */}
      <ellipse cx="46" cy="59" rx="2.4" ry="3.4" fill="#cda878" />
      <ellipse cx="74" cy="59" rx="2.4" ry="3.4" fill="#cda878" />

      {/* Sobrancelhas */}
      <path d={brow.l} stroke="#b9b3ad" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d={brow.r} stroke="#b9b3ad" strokeWidth="2.4" strokeLinecap="round" fill="none" />

      {/* Olhos */}
      {smiling ? (
        <>
          <path d="M49 55 Q53 52 57 55" stroke="#3a2a1a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M63 55 Q67 52 71 55" stroke="#3a2a1a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="53" cy="55" rx="3" ry="2.3" fill="#fbf4e6" />
          <circle cx="53.6" cy="55" r="1.3" fill="#5b3a1e" />
          <ellipse cx="67" cy="55" rx="3" ry="2.3" fill="#fbf4e6" />
          <circle cx="66.4" cy="55" r="1.3" fill="#5b3a1e" />
        </>
      )}

      {/* Nariz */}
      <path d="M60 56 L58 64 Q60 66 62 64 Z" fill="#c79f72" />

      {/* Bigode */}
      <path d="M52 67 Q60 71 68 67 Q64 70 60 70 Q56 70 52 67 Z" fill="#cfc9c2" />

      {/* Barba longa */}
      <path
        d="M48 66 Q49 86 60 96 Q71 86 72 66 Q66 72 60 72 Q54 72 48 66 Z"
        fill="#d8d2cb"
        stroke="#bdb7b0"
        strokeWidth="0.8"
      />
      <path d="M55 78 Q60 84 65 78" stroke="#b3ada6" strokeWidth="0.8" fill="none" />

      {/* Cantos ornamentais da moldura */}
      <circle cx="60" cy="5.5" r="2.6" fill="#3a2c1c" stroke="#f0d68f" strokeWidth="1" />
      <circle cx="60" cy="114.5" r="2.6" fill="#3a2c1c" stroke="#f0d68f" strokeWidth="1" />
      <circle cx="5.5" cy="60" r="2.2" fill="#3a2c1c" stroke="#f0d68f" strokeWidth="0.8" />
      <circle cx="114.5" cy="60" r="2.2" fill="#3a2c1c" stroke="#f0d68f" strokeWidth="0.8" />
    </svg>
  )
}
