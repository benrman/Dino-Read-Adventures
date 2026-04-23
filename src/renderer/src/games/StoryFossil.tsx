import { useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { STORY_SNIPPETS } from '@shared/content'
import { comprehensionUnlocked } from '@shared/rules'
import { useAppStore } from '../store/StoreContext'
import { useGameFeedback } from '../hooks/useGameFeedback'
import { useTTS } from '../hooks/useTTS'
import ReadAlongText from '../components/ReadAlongText'
import GameChrome from './GameChrome'

export default function StoryFossil() {
  const { id } = useParams()
  const { store, profile, refresh } = useAppStore()
  const p = id ? profile(id) : undefined
  const { sfx } = useGameFeedback()
  const { speak, speakSequence, activeText, activeCharIndex } = useTTS()
  const [round, setRound] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  const story = useMemo(() => {
    const s = STORY_SNIPPETS[round % STORY_SNIPPETS.length]
    const choices = [...s.choices].sort(() => Math.random() - 0.5)
    return { ...s, choices }
  }, [round])

  if (!id || !p) return <Navigate to="/" replace />

  const unlocked = comprehensionUnlocked(p, store.settings)
  if (!unlocked) {
    return (
      <GameChrome profile={p} title="Story Fossil" subtitle="Locked dig site">
        <div className="card game-stage">
          <h2 style={{ marginTop: 0 }}>This comprehension cave is still sealed</h2>
          <p className="lead">
            Unlocks when age ≥ {store.settings.comprehensionMinAge} and readiness ≥{' '}
            {store.settings.comprehensionMinReadiness}. Parents can tune gates in Parent zone.
          </p>
        </div>
      </GameChrome>
    )
  }

  async function pick(choice: string) {
    const correct = choice === story.answer
    if (correct) sfx('good')
    else sfx('bad')
    setToast(correct ? 'You cracked the fossil question!' : 'Nice thinking — try another angle.')
    await window.dino.gameRecordRound({
      profileId: p.id,
      activityId: 'story-fossil',
      correct,
      skillTag: 'comprehension',
    })
    await refresh()
    window.setTimeout(() => {
      setToast(null)
      setRound((r) => r + 1)
    }, correct ? 900 : 1100)
  }

  return (
    <GameChrome profile={p} title="Story Fossil" subtitle="Read, wonder, answer">
      <div className="card game-stage">
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button type="button" className="btn secondary" aria-label="Speak passage" onClick={() => speak(story.text)}>
            🔊
          </button>
          <button type="button" className="btn ghost" aria-label="Speak answer choices" onClick={() => speakSequence(story.choices)}>
            🔊
          </button>
        </div>
        <h2 style={{ marginTop: 0 }}>Passage</h2>
        <ReadAlongText
          text={story.text}
          activeText={activeText}
          activeCharIndex={activeCharIndex}
          className="lead"
          style={{ lineHeight: 1.65 }}
        />
        <h3>{story.q}</h3>
        <div className="choice-grid">
          {story.choices.map((c) => (
            <button key={`${round}-${c}`} type="button" className="choice" onClick={() => void pick(c)}>
              <ReadAlongText text={c} activeText={activeText} activeCharIndex={activeCharIndex} as="span" />
            </button>
          ))}
        </div>
        <p style={{ color: 'var(--muted)' }}>Round {round + 1} · Mix literal recall with quick inference.</p>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </GameChrome>
  )
}
