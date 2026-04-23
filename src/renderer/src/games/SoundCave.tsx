import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { SOUND_ITEMS, buildSoundCaveDeck, SOUND_CAVE_TOTAL_ROUNDS } from '@shared/content'
import { SOUND_ART } from '../assets/art'
import { useAppStore } from '../store/StoreContext'
import { useGameFeedback } from '../hooks/useGameFeedback'
import { useTTS } from '../hooks/useTTS'
import ReadAlongText from '../components/ReadAlongText'
import GameChrome from './GameChrome'

export default function SoundCave() {
  const { id } = useParams()
  const { profile, refresh } = useAppStore()
  const p = id ? profile(id) : undefined
  const { sfx } = useGameFeedback()
  const { speak, speakSequence, activeText, activeCharIndex } = useTTS()
  const [deck] = useState(buildSoundCaveDeck)
  const [roundIndex, setRoundIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const item = deck[roundIndex]
  const choices = useMemo(() => {
    if (!item) return []
    const wrong = SOUND_ITEMS.filter((x) => x.pictureId !== item.pictureId)
    const w = wrong.sort(() => Math.random() - 0.5).slice(0, 3)
    return [item, ...w].sort(() => Math.random() - 0.5)
  }, [item])

  useEffect(() => {
    if (!item || finished) return
    speak(`Which picture starts with the ${item.letter} sound?`)
  }, [item, finished, speak])

  if (!id || !p) return <Navigate to="/" replace />

  const isLastRound = roundIndex >= deck.length - 1

  async function pick(pictureId: string) {
    if (finished || !item) return
    const correct = pictureId === item.pictureId
    if (correct) sfx('good')
    else sfx('bad')
    setToast(correct ? 'Echo located! That sound matches.' : 'Hmm — listen again. You got this.')
    await window.dino.gameRecordRound({
      profileId: p.id,
      activityId: 'sound-cave',
      correct,
      skillTag: 'phonemic',
    })
    await refresh()
    window.setTimeout(() => {
      setToast(null)
      if (!correct) return
      if (isLastRound) {
        setFinished(true)
        speak('You cleared the Sound Cave! Amazing ears.')
        return
      }
      setRoundIndex((i) => i + 1)
    }, correct ? 700 : 1100)
  }

  if (finished) {
    return (
      <GameChrome profile={p} title="Sound Cave" subtitle="Phonemic awareness">
        <div className="card game-stage">
          <h2 style={{ marginTop: 0 }}>Sound Cave cleared</h2>
          <p className="lead">
            You finished {SOUND_CAVE_TOTAL_ROUNDS} listening rounds — great work matching first sounds to pictures.
          </p>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <Link className="btn" to={`/profile/${p.id}/adventure`}>
              Back to adventure
            </Link>
            <Link className="btn secondary" to={`/profile/${p.id}/hub`}>
              Mission board
            </Link>
          </div>
        </div>
      </GameChrome>
    )
  }

  return (
    <GameChrome profile={p} title="Sound Cave" subtitle="Listen for the first sound (phonemic awareness)">
      <div className="card game-stage">
        <div className="btn-row" style={{ marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <button type="button" className="btn secondary" aria-label="Replay spoken question" onClick={() => speak(`Which picture starts with the ${item.letter} sound?`)}>
            🔊
          </button>
          <button type="button" className="btn ghost" aria-label="Speak letter hint" onClick={() => speak(`Starts with ${item.letter}`)}>
            🔊
          </button>
          <button type="button" className="btn ghost" aria-label="Speak choice words" onClick={() => speakSequence(choices.map((c) => c.word))}>
            🔊
          </button>
          <span className="pill" style={{ marginLeft: 'auto' }}>
            Round {roundIndex + 1} of {deck.length}
          </span>
        </div>
        <h2 style={{ marginTop: 0 }}>Pick the picture that matches the secret sound</h2>
        <div className="choice-grid cols-3">
          {choices.map((c) => (
            <button
              key={`${roundIndex}-${c.pictureId}-${c.word}`}
              type="button"
              className="choice choice--sound"
              onClick={() => void pick(c.pictureId)}
            >
              <div className="sound-choice-img-wrap">
                <img src={SOUND_ART[c.pictureId]} alt={c.word} />
              </div>
              <ReadAlongText
                as="span"
                text={c.word}
                activeText={activeText}
                activeCharIndex={activeCharIndex}
                style={{ marginTop: 8, color: 'var(--muted)', fontSize: '0.85rem', fontWeight: 700, display: 'inline-block' }}
              />
            </button>
          ))}
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </GameChrome>
  )
}
