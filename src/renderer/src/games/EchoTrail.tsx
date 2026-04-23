import { useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { CVC_WORDS } from '@shared/content'
import { utteranceMatchesTarget } from '@shared/speech'
import { warmMic, speechRecognitionErrorMessage } from '../lib/micAccess'
import { useAppStore } from '../store/StoreContext'
import { useGameFeedback } from '../hooks/useGameFeedback'
import { useTTS } from '../hooks/useTTS'
import ReadAlongText from '../components/ReadAlongText'
import GameChrome from './GameChrome'

type RecCtor = new () => SpeechRecognition

export default function EchoTrail() {
  const { id } = useParams()
  const { store, profile, refresh } = useAppStore()
  const p = id ? profile(id) : undefined
  const { sfx } = useGameFeedback()
  const { speak, activeText, activeCharIndex } = useTTS()
  const [round, setRound] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [live, setLive] = useState('')
  const recRef = useRef<SpeechRecognition | null>(null)

  const word = useMemo(() => CVC_WORDS[round % CVC_WORDS.length], [round])

  if (!id || !p) return <Navigate to="/" replace />
  if (!store.settings.speechFeaturesEnabled || !store.settings.micEnabled) {
    return (
      <GameChrome profile={p} title="Echo Trail" subtitle="Speech is off">
        <div className="card game-stage">
          <h2 style={{ marginTop: 0 }}>Turn on mic + speech in Parent zone</h2>
          <p className="lead">This mission needs the microphone so we can hear your awesome echo.</p>
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
    setToast(
      correct ? 'Echo received! That matched beautifully.' : 'Good energy — try shaping the sounds a bit closer.',
    )
    await window.dino.gameRecordRound({
      profileId: p.id,
      activityId: 'echo-trail',
      correct,
      skillTag: 'oral',
    })
    if (correct) {
      await window.dino.gameBumpPronunciation({ profileId: p.id, stars: 1 })
    }
    await refresh()
    window.setTimeout(() => {
      setToast(null)
      setLive('')
      setRound((r) => r + 1)
    }, correct ? 800 : 1200)
  }

  async function listen() {
    if (!Rec) {
      setToast('Speech recognition not available in this build. Try the installed Windows app.')
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

  return (
    <GameChrome profile={p} title="Echo Trail" subtitle="Listen → speak → instant feedback">
      <div className="card game-stage">
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button type="button" className="btn secondary" aria-label="Speak target word" onClick={() => speak(`Say: ${word}`)}>
            🔊
          </button>
          <button type="button" className="btn" onClick={() => listen()}>
            Start listening
          </button>
        </div>
        <h2 style={{ marginTop: 0 }}>
          Say the word: "
          <ReadAlongText text={word.toUpperCase()} activeText={activeText} activeCharIndex={activeCharIndex} as="span" />
          "
        </h2>
        <p className="lead" style={{ marginTop: 0 }}>
          Live: <b style={{ color: 'var(--text)' }}>{live || '…'}</b>
        </p>
        <p style={{ color: 'var(--muted)' }}>
          Multisensory loop: ears (listen) → mouth (say) → eyes (see text) builds stronger memory traces.
        </p>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </GameChrome>
  )
}
