// Divisoria ornamental (fleurao) medieval — usada sob titulos/cabecalhos.
export function Flourish({
  width = 220,
  className = '',
  color = '#b8995a',
}: {
  width?: number
  className?: string
  color?: string
}) {
  return (
    <svg
      width={width}
      height={16}
      viewBox="0 0 220 16"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="presentation"
      aria-hidden="true"
    >
      <g stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round">
        {/* linhas laterais que afinam em direcao ao centro */}
        <line x1="6" y1="8" x2="86" y2="8" />
        <line x1="134" y1="8" x2="214" y2="8" />
        {/* volutas */}
        <path d="M86 8 Q96 8 98 4 Q100 0 104 2 Q107 4 104 7" />
        <path d="M134 8 Q124 8 122 4 Q120 0 116 2 Q113 4 116 7" />
        {/* losango central */}
        <path d="M110 1 L116 8 L110 15 L104 8 Z" fill={color} stroke="none" />
        <circle cx="110" cy="8" r="1.6" fill="#1a120a" stroke="none" />
        {/* pingos nas pontas */}
        <circle cx="6" cy="8" r="1.6" fill={color} stroke="none" />
        <circle cx="214" cy="8" r="1.6" fill={color} stroke="none" />
      </g>
    </svg>
  )
}
