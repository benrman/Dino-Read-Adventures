import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { LETTERS, SOUND_ITEMS, practiceWordsForAge } from '@shared/content'
import { UI_ART, SOUND_ART } from '../assets/art'
import { scorePlacement, type PlacementAnswer } from '@shared/placementEngine'
import { useAppStore } from '../store/StoreContext'
import { useTTS } from '../hooks/useTTS'
import ReadAlongText from '../components/ReadAlongText'

type Q =
  | { id: string; prompt: string; choices: string[]; answer: string; weight: number; kind: 'letter' }
  | { id: string; prompt: string; choices: string[]; answer: string; weight: number; kind: 'word' }
  | { id: string; prompt: string; choices: string[]; answer: string; weight: number; kind: 'sentence' }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQuiz(seed: number, age: number): Q[] {
  const letter = LETTERS[seed % LETTERS.length]
  const wrongL = shuffle(LETTERS.filter((l) => l !== letter)).slice(0, 3)
  const q1: Q = {
    id: 'q1',
    prompt: `Which letter is "${letter}"?`,
    choices: shuffle([letter, ...wrongL]),
    answer: letter,
    weight: age <= 6 ? 18 : 12,
    kind: 'letter',
  }

  const item = SOUND_ITEMS[seed % SOUND_ITEMS.length]
  const wrongS = shuffle(SOUND_ITEMS.filter((s) => s.letter !== item.letter)).slice(0, 3)
  const q2: Q = {
    id: 'q2',
    prompt: `Which picture starts with the "${item.letter}" sound?`,
    choices: shuffle([item.pictureId, ...wrongS.map((w) => w.pictureId)]),
    answer: item.pictureId,
    weight: age <= 6 ? 18 : 14,
    kind: 'letter',
  }

  const wordPool = practiceWordsForAge(age)
  const word = wordPool[seed % wordPool.length]
  const wrongW = shuffle(wordPool.filter((w) => w !== word)).slice(0, 3)
  const q3: Q = {
    id: 'q3',
    prompt: `Which word is spelled correctly for "${word}"?`,
    choices: shuffle([word, ...wrongW]),
    answer: word,
    weight: age <= 7 ? 14 : 10,
    kind: 'word',
  }

  const q4: Q = {
    id: 'q4',
    prompt: 'Which word rhymes best with "hat"?',
    choices: shuffle(['mat', 'hop', 'sun', 'pig']),
    answer: 'mat',
    weight: 10,
    kind: 'word',
  }

  const q5: Q = {
    id: 'q5',
    prompt: 'In "The dino has a red scarf", what color is the scarf?',
    choices: shuffle(['red', 'blue', 'green', 'yellow']),
    answer: 'red',
    weight: age >= 8 ? 14 : 10,
    kind: 'sentence',
  }

  const q6: Q = {
    id: 'q6',
    prompt: 'Which sentence makes sense?',
    choices: shuffle([
      'I read a book with my buddy.',
      'I read a sandwich with my shoe.',
      'I read a cloud with my spoon.',
    ]),
    answer: 'I read a book with my buddy.',
    weight: age >= 9 ? 16 : 12,
    kind: 'sentence',
  }

  const q7: Q = {
    id: 'q7',
    prompt: 'Which word is a noun (a person, place, thing, or idea)?',
    choices: shuffle(['dragon', 'jump', 'quickly', 'because']),
    answer: 'dragon',
    weight: age >= 10 ? 14 : 8,
    kind: 'sentence',
  }

  const q8: Q = {
    id: 'q8',
    prompt: 'A dino finds a map, follows it, and discovers a cave. Which summary fits best?',
    choices: shuffle([
      'The dino follows a map and finds a cave.',
      'The dino cooks soup for ten friends.',
      'The dino forgets to leave the nest.',
    ]),
    answer: 'The dino follows a map and finds a cave.',
    weight: age >= 11 ? 16 : 8,
    kind: 'sentence',
  }

  return [q1, q2, q3, q4, q5, q6, q7, q8]
}

export default function Placement() {
  const { id } = useParams()
  const { profile, refresh } = useAppStore()
  const p = id ? profile(id) : undefined
  const { speak, speakSequence, activeText, activeCharIndex } = useTTS()

  const seed = useMemo(() => Math.floor(Date.now() / 1000) % 9000, [])
  const quiz = useMemo(() => (p ? buildQuiz(seed + p.age * 13, p.age) : []), [p, seed])

  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState<PlacementAnswer[]>([])
  const [result, setResult] = useState<{ tier: number; confidence: number; readiness: number } | null>(null)

  if (!id || !p) return <Navigate to="/" replace />
  if (p.placementDone) return <Navigate to={`/profile/${id}/hub`} replace />

  const q = quiz[idx]

  useEffect(() => {
    if (!q || result) return
    speak(q.prompt)
  }, [q, result, speak])

  function pick(choice: string) {
    const correct = choice === q.answer
    const nextA: PlacementAnswer = { q: q.id, correct, weight: q.weight }
    setAnswers((prev) => {
      const merged = [...prev, nextA]
      if (merged.length >= quiz.length) {
        const scored = scorePlacement(merged)
        void (async () => {
          await window.dino.placementApply({
            profileId: p.id,
            tier: scored.tier,
            confidence: scored.confidence,
            readiness: scored.readiness,
          })
          await refresh()
          setResult(scored)
          speak(
            `Placement complete. Starting tier ${scored.tier}. Readiness ${scored.readiness} percent. Confidence ${scored.confidence} percent.`,
          )
        })()
        return merged
      }
      setIdx((i) => i + 1)
      return merged
    })
  }

  const letterHint = SOUND_ITEMS.find((s) => s.pictureId === q.answer)?.letter ?? ''

  if (result) {
    return (
      <div className="page">
        <div className="topbar">
          <div className="brand">
            <div className="brand-badge brand-badge--img">
              <img src={UI_ART.placement} alt="" />
            </div>
            <div>
              Placement complete
              <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
                Starting path is ready.
              </div>
            </div>
          </div>
        </div>
        <div className="card game-stage">
          <h2 style={{ marginTop: 0 }}>Great work, {p.name}!</h2>
          <p className="lead">You finished all {quiz.length} questions.</p>
          <div className="btn-row" style={{ marginBottom: 12 }}>
            <span className="pill">
              Tier <b style={{ color: 'var(--text)' }}>{result.tier}</b>
            </span>
            <span className="pill">
              Readiness <b style={{ color: 'var(--text)' }}>{result.readiness}%</b>
            </span>
            <span className="pill">
              Confidence <b style={{ color: 'var(--text)' }}>{result.confidence}%</b>
            </span>
          </div>
          <Link className="btn" to={`/profile/${p.id}/hub`}>
            Continue to camp
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">
          <div className="brand-badge brand-badge--img">
            <img src={UI_ART.placement} alt="" />
          </div>
          <div>
            Placement dig
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
              ~2 minutes · sets starting missions
            </div>
          </div>
        </div>
        <Link className="link" to="/">
          Home
        </Link>
      </div>

      <div className="card game-stage">
        <div className="pill" style={{ marginBottom: 12 }}>
          Question {idx + 1}/{quiz.length} · Age {p.age}
        </div>
        <ReadAlongText
          as="h2"
          text={q.prompt}
          activeText={activeText}
          activeCharIndex={activeCharIndex}
          style={{ marginTop: 0 }}
        />
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button type="button" className="btn secondary" aria-label="Speak question aloud" onClick={() => speak(q.prompt)}>
            🔊
          </button>
          <button type="button" className="btn ghost" aria-label="Speak choices aloud" onClick={() => speakSequence(q.choices)}>
            🔊
          </button>
        </div>
        {q.kind === 'letter' && q.id === 'q2' && (
          <div className="btn-row" style={{ marginBottom: 12 }}>
            <button type="button" className="btn secondary" aria-label="Speak hint sound" onClick={() => speak(`Starts with ${letterHint}`)}>
              🔊
            </button>
          </div>
        )}
        <div className={`choice-grid${q.id === 'q2' ? ' cols-3' : ''}`}>
          {q.choices.map((c) => (
            <button
              key={c}
              type="button"
              className={q.id === 'q2' ? 'choice choice--sound' : 'choice'}
              onClick={() => pick(c)}
            >
              {q.id === 'q2' ? (
                <div className="sound-choice-img-wrap">
                  <img src={SOUND_ART[c]} alt="" />
                </div>
              ) : (
                <ReadAlongText text={c} activeText={activeText} activeCharIndex={activeCharIndex} as="span" />
              )}
            </button>
          ))}
        </div>
        <p style={{ color: 'var(--muted)', marginTop: 14 }}>
          Tip: mistakes are okay — this only tunes the starting path, not your score.
        </p>
      </div>
    </div>
  )
}
