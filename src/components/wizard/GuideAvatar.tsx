// Retrato ilustrado do guia (mentor encapuzado) numa moldura dourada ornamentada.
// SVG feito a mao para nao depender de imagem externa; da pra trocar depois.
export function GuideAvatar({ size = 132 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
      role="img"
      aria-label="Retrato do guia"
    >
      <defs>
        <radialGradient id="guide-bg" cx="50%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#3a2c1c" />
          <stop offset="100%" stopColor="#120d08" />
        </radialGradient>
        <linearGradient id="guide-frame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e6c878" />
          <stop offset="50%" stopColor="#c8a24a" />
          <stop offset="100%" stopColor="#8a6e2f" />
        </linearGradient>
      </defs>

      {/* Moldura octogonal */}
      <polygon
        points="35,4 85,4 116,35 116,85 85,116 35,116 4,85 4,35"
        fill="url(#guide-frame)"
      />
      <polygon
        points="38,9 82,9 111,38 111,82 82,111 38,111 9,82 9,38"
        fill="url(#guide-bg)"
        stroke="#5a4622"
        strokeWidth="1.5"
      />

      {/* Figura encapuzada */}
      <g>
        {/* ombros/manto */}
        <path d="M30 112 Q60 78 90 112 Z" fill="#241a10" />
        <path d="M34 112 Q60 84 86 112 Z" fill="#2f2415" />
        {/* capuz */}
        <path
          d="M60 30 Q86 34 84 72 Q78 64 72 66 Q70 50 60 48 Q50 50 48 66 Q42 64 36 72 Q34 34 60 30 Z"
          fill="#1c140c"
          stroke="#4a3a1e"
          strokeWidth="1.5"
        />
        {/* sombra do rosto */}
        <ellipse cx="60" cy="62" rx="13" ry="16" fill="#0a0704" />
        {/* olhos brilhantes */}
        <circle cx="54.5" cy="60" r="2.1" fill="#e6c878" />
        <circle cx="65.5" cy="60" r="2.1" fill="#e6c878" />
      </g>

      {/* Cantos ornamentais */}
      <circle cx="60" cy="6" r="2.4" fill="#3a2c1c" stroke="#e6c878" strokeWidth="1" />
      <circle cx="60" cy="114" r="2.4" fill="#3a2c1c" stroke="#e6c878" strokeWidth="1" />
    </svg>
  )
}
