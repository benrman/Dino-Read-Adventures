import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { practiceWordsForAge } from '@shared/content'
import { useAppStore } from '../store/StoreContext'
import { useGameFeedback } from '../hooks/useGameFeedback'
import { useTTS } from '../hooks/useTTS'
import ReadAlongText from '../components/ReadAlongText'
import GameChrome from './GameChrome'

export default function WordNest() {
  const { id } = useParams()
  const { profile, refresh } = useAppStore()
  const p = id ? profile(id) : undefined
  const { sfx } = useGameFeedback()
  const { speak, speakSequence, activeText, activeCharIndex } = useTTS()
  const [round, setRound] = useState(0)
  const [built, setBuilt] = useState<string[]>([])

  const pool = useMemo(() => practiceWordsForAge(p?.age ?? 7), [p?.age])
  const word = useMemo(() => pool[round % pool.length], [round, pool])
  const letters = useMemo(() => word.split(''), [word])
  const bank = useMemo(() => {
    const noise = 'RSTLNPM'.split('')
    const extras = noise.filter((l) => !letters.includes(l)).slice(0, 3)
    return [...letters, ...extras].sort(() => Math.random() - 0.5)
  }, [letters])

  if (!id || !p) return <Navigate to="/" replace />

  function resetNest() {
    setBuilt([])
  }

  async function submit() {
    if (built.length !== letters.length) {
      return
    }
    const guess = built.join('')
    const correct = guess === word
    if (correct) sfx('good')
    else sfx('bad')
    await window.dino.gameRecordRound({
      profileId: p.id,
      activityId: 'word-nest',
      correct,
      skillTag: 'phonics',
    })
    await refresh()
    window.setTimeout(() => {
      setBuilt([])
      setRound((r) => r + 1)
    }, correct ? 700 : 900)
  }

  return (
    <GameChrome profile={p} title="Word Nest" subtitle="Tap letter eggs in order — like building a nest">
      <div className="card game-stage">
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button type="button" className="btn secondary" aria-label="Speak target word" onClick={() => speak(word)}>
            🔊
          </button>
          <button type="button" className="btn ghost" aria-label="Speak letter choices" onClick={() => speakSequence(bank.map((b) => b.toUpperCase()))}>
            🔊
          </button>
          <button type="button" className="btn ghost" onClick={resetNest}>
            Clear nest
          </button>
        </div>
        <h2 style={{ marginTop: 0 }}>
          Build: "
          <ReadAlongText text={word.toUpperCase()} activeText={activeText} activeCharIndex={activeCharIndex} as="span" />
          "
        </h2>
        <div className="pill" style={{ marginBottom: 12 }}>
          Nest:{' '}
          <b style={{ color: 'var(--text)' }}>{built.length ? built.join(' · ') : '…'}</b>
        </div>
        <div className="choice-grid cols-3">
          {bank.map((l, i) => (
            <button
              key={`${round}-${i}-${l}`}
              type="button"
              className="choice"
              onClick={() => {
                sfx('pop')
                if (built.length < letters.length) setBuilt((b) => [...b, l])
              }}
            >
              <ReadAlongText text={l.toUpperCase()} activeText={activeText} activeCharIndex={activeCharIndex} as="span" />
            </button>
          ))}
        </div>
        <div className="btn-row" style={{ marginTop: 14 }}>
          <button type="button" className="btn" onClick={() => void submit()}>
            Check nest
          </button>
        </div>
        <p style={{ color: 'var(--muted)' }}>
          Multisensory trick: say each sound as you tap — ears + eyes + hands together stick better.
        </p>
      </div>
    </GameChrome>
  )
}
