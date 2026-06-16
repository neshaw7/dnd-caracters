import { useEffect, useState } from 'react'

// Revela o texto caractere a caractere. O pai deve passar key={...} para
// remontar (e reiniciar) quando o texto muda.
export function Typewriter({ text, speed = 22 }: { text: string; speed?: number }) {
  const [shown, setShown] = useState('')

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return (
    <span>
      {shown}
      {shown.length < text.length && (
        <span className="ml-0.5 animate-pulse text-gold/70">▍</span>
      )}
    </span>
  )
}
