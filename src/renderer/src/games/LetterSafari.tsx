import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { LETTERS } from '@shared/content'
import { useAppStore } from '../store/StoreContext'
import { useGameFeedback } from '../hooks/useGameFeedback'
import { useTTS } from '../hooks/useTTS'
import ReadAlongText from '../components/ReadAlongText'
import GameChrome from './GameChrome'

function pickLetter(seed: number) {
  return LETTERS[seed % LETTERS.length]
}

export default function LetterSafari() {
  const { id } = useParams()
  const { profile, refresh } = useAppStore()
  const p = id ? profile(id) : undefined
  const { sfx } = useGameFeedback()
  const { speak, speakSequence, activeText, activeCharIndex } = useTTS()
  const [round, setRound] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  const target = useMemo(() => pickLetter(round * 17 + (p?.age ?? 0)), [round, p?.age])
  const choices = useMemo(() => {
    const wrong = LETTERS.filter((l) => l !== target)
    const w = wrong.sort(() => Math.random() - 0.5).slice(0, 3)
    return [target, ...w].sort(() => Math.random() - 0.5)
  }, [target])

  if (!id || !p) return <Navigate to="/" replace />

  async function choose(letter: string) {
    const correct = letter === target
    if (correct) sfx('good')
    else sfx('bad')
    setToast(correct ? 'Stomp stomp! Perfect letter track.' : 'Nice try — raptors practice fast. Want a hint?')
    await window.dino.gameRecordRound({
      profileId: p.id,
      activityId: 'letter-safari',
      correct,
      skillTag: 'letters',
    })
    await refresh()
    window.setTimeout(() => {
      setToast(null)
      setRound((r) => r + 1)
    }, correct ? 650 : 900)
  }

  return (
    <GameChrome profile={p} title="Letter Safari" subtitle="Spot the correct letter footprint">
      <div className="card game-stage">
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button type="button" className="btn secondary" aria-label="Speak letter hint" onClick={() => speak(`Find letter ${target}`)}>
            🔊
          </button>
          <button type="button" className="btn ghost" aria-label="Speak letter choices" onClick={() => speakSequence(choices.map((c) => c.toUpperCase()))}>
            🔊
          </button>
        </div>
        <h2 style={{ marginTop: 0 }}>
          Which footprint matches "
          <ReadAlongText text={target} activeText={activeText} activeCharIndex={activeCharIndex} as="span" />
          "?
        </h2>
        <div className="choice-grid cols-3">
          {choices.map((c) => (
            <button key={`${round}-${c}`} type="button" className="choice" onClick={() => void choose(c)}>
              <span style={{ fontSize: '2.6rem' }}>
                <ReadAlongText text={c} activeText={activeText} activeCharIndex={activeCharIndex} as="span" />
              </span>
            </button>
          ))}
        </div>
        <p style={{ color: 'var(--muted)' }}>Round {round + 1} · Tap quickly for a tiny fossil rush feeling.</p>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </GameChrome>
  )
}
