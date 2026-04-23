import type { CSSProperties } from 'react'

type Props = {
  text: string
  activeText: string | null
  activeCharIndex: number
  as?: 'p' | 'h2' | 'h3' | 'span'
  className?: string
  style?: CSSProperties
}

function rangesForWords(text: string): Array<{ start: number; end: number; word: string }> {
  const out: Array<{ start: number; end: number; word: string }> = []
  const re = /\S+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    out.push({ start: m.index, end: m.index + m[0].length, word: m[0] })
  }
  return out
}

export default function ReadAlongText({
  text,
  activeText,
  activeCharIndex,
  as = 'p',
  className,
  style,
}: Props) {
  const words = rangesForWords(text)
  const Tag = as
  const talkingThisLine = activeText === text && activeCharIndex >= 0
  let cursor = 0
  return (
    <Tag className={className} style={style}>
      {words.map((w, i) => {
        const gap = text.slice(cursor, w.start)
        cursor = w.end
        const highlight = talkingThisLine && activeCharIndex >= w.start && activeCharIndex < w.end
        return (
          <span key={`${w.start}-${w.word}-${i}`}>
            {gap}
            <span className={highlight ? 'readalong-word on' : 'readalong-word'}>{w.word}</span>
          </span>
        )
      })}
      {text.slice(cursor)}
    </Tag>
  )
}

