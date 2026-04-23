import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { RHYME_PAIRS } from '@shared/content'
import { useAppStore } from '../store/StoreContext'
import { useGameFeedback } from '../hooks/useGameFeedback'
import { useTTS } from '../hooks/useTTS'
import ReadAlongText from '../components/ReadAlongText'
import GameChrome from './GameChrome'

export default function RhymeRapids() {
  const { id } = useParams()
  const { profile, refresh } = useAppStore()
  const p = id ? profile(id) : undefined
  const { sfx } = useGameFeedback()
  const { speak, speakSequence, activeText, activeCharIndex } = useTTS()
  const [round, setRound] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  const item = useMemo(() => RHYME_PAIRS[round % RHYME_PAIRS.length], [round])
  const choices = useMemo(() => {
    const pool = [item.rhyme, ...item.wrong]
    return pool.sort(() => Math.random() - 0.5)
  }, [item])

  if (!id || !p) return <Navigate to="/" replace />

  async function pick(w: string) {
    const correct = w === item.rhyme
    if (correct) sfx('good')
    else sfx('bad')
    setToast(correct ? 'Splash! That rhyme rides the rapids!' : 'Listen for the ending sound — try again!')
    await window.dino.gameRecordRound({
      profileId: p.id,
      activityId: 'rhyme-rapids',
      correct,
      skillTag: 'phonemic',
    })
    await refresh()
    window.setTimeout(() => {
      setToast(null)
      setRound((r) => r + 1)
    }, correct ? 700 : 1000)
  }

  return (
    <GameChrome profile={p} title="Rhyme Rapids" subtitle="Rhyming builds flexible sound maps in the brain">
      <div className="card game-stage">
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button type="button" className="btn secondary" aria-label="Speak rhyme prompt" onClick={() => speak(`What rhymes with ${item.prompt}?`)}>
            🔊
          </button>
          <button type="button" className="btn ghost" aria-label="Speak choices" onClick={() => speakSequence(choices)}>
            🔊
          </button>
        </div>
        <ReadAlongText
          as="h2"
          text={`What rhymes with "${item.prompt}"?`}
          activeText={activeText}
          activeCharIndex={activeCharIndex}
          style={{ marginTop: 0 }}
        />
        <div className="choice-grid cols-3">
          {choices.map((c) => (
            <button key={`${round}-${c}`} type="button" className="choice" onClick={() => void pick(c)}>
              <ReadAlongText text={c} activeText={activeText} activeCharIndex={activeCharIndex} as="span" />
            </button>
          ))}
        </div>
        <p style={{ color: 'var(--muted)' }}>Round {round + 1} · Say the words out loud for extra sparkle.</p>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </GameChrome>
  )
}
