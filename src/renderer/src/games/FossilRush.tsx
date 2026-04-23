import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { LETTERS } from '@shared/content'
import { useAppStore } from '../store/StoreContext'
import { useGameFeedback } from '../hooks/useGameFeedback'
import { useTTS } from '../hooks/useTTS'
import ReadAlongText from '../components/ReadAlongText'
import GameChrome from './GameChrome'

export default function FossilRush() {
  const { id } = useParams()
  const { profile, refresh } = useAppStore()
  const p = id ? profile(id) : undefined
  const { sfx } = useGameFeedback()
  const { speak, speakSequence, activeText, activeCharIndex } = useTTS()
  const [round, setRound] = useState(0)
  const [msLeft, setMsLeft] = useState(5000)
  const [toast, setToast] = useState<string | null>(null)
  const settled = useRef(false)

  const target = useMemo(() => LETTERS[(round * 11 + (p?.age ?? 0)) % LETTERS.length], [round, p?.age])
  const choices = useMemo(() => {
    const wrong = LETTERS.filter((l) => l !== target)
    const w = wrong.sort(() => Math.random() - 0.5).slice(0, 2)
    return [target, ...w].sort(() => Math.random() - 0.5)
  }, [target])

  const failRound = useCallback(async () => {
    if (!p) return
    sfx('bad')
    setToast('Time roar! The fossil got away — try the next one.')
    await window.dino.gameRecordRound({
      profileId: p.id,
      activityId: 'fossil-rush',
      correct: false,
      skillTag: 'fluency',
    })
    await refresh()
    window.setTimeout(() => {
      setToast(null)
      setRound((r) => r + 1)
    }, 900)
  }, [p, refresh, sfx])

  useEffect(() => {
    settled.current = false
    let ms = 5000
    setMsLeft(ms)
    speak(`Quick! Tap ${target}`)
    const id = window.setInterval(() => {
      if (settled.current) {
        window.clearInterval(id)
        return
      }
      ms -= 50
      setMsLeft(ms)
      if (ms <= 0) {
        settled.current = true
        window.clearInterval(id)
        void failRound()
      }
    }, 50)
    return () => window.clearInterval(id)
  }, [round, target, speak, failRound])

  if (!id || !p) return <Navigate to="/" replace />

  const pct = Math.round((msLeft / 5000) * 100)

  async function pick(letter: string) {
    if (settled.current) return
    settled.current = true
    const correct = letter === target
    if (correct) sfx('good')
    else sfx('bad')
    setToast(correct ? 'SNAP! Fossil captured.' : 'Close! The glow was on another letter.')
    await window.dino.gameRecordRound({
      profileId: p.id,
      activityId: 'fossil-rush',
      correct,
      skillTag: 'fluency',
    })
    await refresh()
    window.setTimeout(() => {
      setToast(null)
      setRound((r) => r + 1)
    }, correct ? 650 : 900)
  }

  return (
    <GameChrome profile={p} title="Fossil Rush" subtitle="Speed + focus = fluency fun">
      <div className="card game-stage">
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button type="button" className="btn secondary" aria-label="Speak target letter" onClick={() => speak(`Quick! Tap ${target}`)}>
            🔊
          </button>
          <button type="button" className="btn ghost" aria-label="Speak letter choices" onClick={() => speakSequence(choices)}>
            🔊
          </button>
        </div>
        <h2 style={{ marginTop: 0 }}>
          Tap the glowing target: "
          <ReadAlongText text={target} activeText={activeText} activeCharIndex={activeCharIndex} as="span" />
          "
        </h2>
        <div className="timer-bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="choice-grid cols-3">
          {choices.map((c) => (
            <button
              key={`${round}-${c}`}
              type="button"
              className="choice"
              style={c === target ? { boxShadow: '0 0 0 3px rgba(251,191,36,0.35)' } : undefined}
              onClick={() => void pick(c)}
            >
              <span style={{ fontSize: '2.6rem' }}>
                <ReadAlongText text={c} activeText={activeText} activeCharIndex={activeCharIndex} as="span" />
              </span>
            </button>
          ))}
        </div>
        <p style={{ color: 'var(--muted)' }}>Round {round + 1} · Quick wins keep energy high.</p>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </GameChrome>
  )
}
