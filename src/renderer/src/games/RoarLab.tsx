import { useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { practiceWordsForAge } from '@shared/content'
import { utteranceMatchesTarget } from '@shared/speech'
import { warmMic, speechRecognitionErrorMessage } from '../lib/micAccess'
import { useAppStore } from '../store/StoreContext'
import { useGameFeedback } from '../hooks/useGameFeedback'
import { useTTS } from '../hooks/useTTS'
import ReadAlongText from '../components/ReadAlongText'
import GameChrome from './GameChrome'

type RecCtor = new () => SpeechRecognition

export default function RoarLab() {
  const { id } = useParams()
  const { store, profile, refresh } = useAppStore()
  const p = id ? profile(id) : undefined
  const { sfx } = useGameFeedback()
  const { speak, activeText, activeCharIndex } = useTTS()
  const [round, setRound] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [live, setLive] = useState('')
  const [coach, setCoach] = useState<string | null>(null)
  const recRef = useRef<SpeechRecognition | null>(null)

  const pool = useMemo(() => practiceWordsForAge(p?.age ?? 7), [p?.age])
  const word = useMemo(() => pool[(round + 3) % pool.length], [round, pool])

  if (!id || !p) return <Navigate to="/" replace />
  if (!store.settings.speechFeaturesEnabled || !store.settings.micEnabled) {
    return (
      <GameChrome profile={p} title="Roar Lab" subtitle="Speech is off">
        <div className="card game-stage">
          <h2 style={{ marginTop: 0 }}>Enable mic + speech features</h2>
          <p className="lead">Parents can turn this on anytime in the Parent zone.</p>
        </div>
      </GameChrome>
    )
  }

  const Rec = (window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor })
    .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: RecCtor }).webkitSpeechRecognition

  async function grade(transcript: string) {
    const correct = utteranceMatchesTarget(word, transcript)
    if (correct) sfx('good')
    else sfx('bad')
    setToast(correct ? 'ROAR SCORED! Clear and proud.' : 'Nice roar — adjust the middle sounds a little.')
    await window.dino.gameRecordRound({
      profileId: p.id,
      activityId: 'roar-lab',
      correct,
      skillTag: 'pronunciation',
    })
    const stars = correct ? 2 : 1
    await window.dino.gameBumpPronunciation({ profileId: p.id, stars })
    await refresh()
    window.setTimeout(() => {
      setToast(null)
      setLive('')
      setRound((r) => r + 1)
    }, correct ? 850 : 1200)
  }

  async function listen() {
    if (!Rec) {
      setToast('Speech recognition not available here.')
      return
    }
    window.speechSynthesis.cancel()
    const mic = await warmMic()
    if (!mic.ok) {
      setToast(
        mic.reason === 'denied'
          ? 'Microphone was blocked. Ask a grown-up to allow the mic for this app in Windows Settings → Privacy → Microphone.'
          : 'Could not open the microphone. Check that a mic is plugged in.',
      )
      return
    }
    try {
      recRef.current?.stop()
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 200))
    const r = new Rec()
    r.lang = 'en-US'
    r.continuous = false
    r.interimResults = true
    r.maxAlternatives = 1
    r.onresult = (ev) => {
      let text = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        text += ev.results[i][0].transcript
      }
      setLive(text)
      if (ev.results[ev.results.length - 1].isFinal) {
        void grade(text)
      }
    }
    r.onerror = (ev) => {
      const err = (ev as SpeechRecognitionErrorEvent).error
      if (err === 'aborted') return
      sfx('bad')
      setToast(speechRecognitionErrorMessage(err))
    }
    recRef.current = r
    try {
      r.start()
    } catch {
      setToast('Could not start listening. Wait for the voice hint to finish, then tap again.')
      return
    }
    sfx('pop')
  }

  async function askGemini() {
    if (!store.settings.geminiEnabled) {
      setCoach('Gemini is off — flip it on in Parent zone if you want cloud tips.')
      return
    }
    const key = store.settings.geminiApiKey
    if (!key) {
      setCoach('Add a Gemini API key in Parent zone for cloud coaching.')
      return
    }
    setCoach('Asking coach…')
    const res = await window.dino.geminiPronunciationCoach({
      apiKey: key,
      target: word,
      transcript: live || '(no speech yet)',
      model: store.settings.geminiModel,
    })
    if (res.ok) setCoach(res.text)
    else setCoach(`Coach unavailable: ${res.error}`)
  }

  return (
    <GameChrome profile={p} title="Roar Lab" subtitle="Microphone mission + optional Gemini boost">
      <div className="card game-stage">
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button type="button" className="btn secondary" aria-label="Speak target word" onClick={() => speak(`Roar this word: ${word}`)}>
            🔊
          </button>
          <button type="button" className="btn" onClick={() => listen()}>
            Record my roar
          </button>
          <button type="button" className="btn ghost" onClick={() => void askGemini()}>
            Gemini tip (optional)
          </button>
        </div>
        <h2 style={{ marginTop: 0 }}>
          Word: "
          <ReadAlongText text={word.toUpperCase()} activeText={activeText} activeCharIndex={activeCharIndex} as="span" />
          "
        </h2>
        <p className="lead" style={{ marginTop: 0 }}>
          Heard: <b style={{ color: 'var(--text)' }}>{live || '…'}</b>
        </p>
        {coach && (
          <div className="pill" style={{ marginTop: 10, color: 'var(--text)', lineHeight: 1.45 }}>
            {coach}
          </div>
        )}
        <p style={{ color: 'var(--muted)', marginTop: 12 }}>
          Local-first: we score without internet. Gemini is a parent-only optional add-on.
        </p>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </GameChrome>
  )
}
