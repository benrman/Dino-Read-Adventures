import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UI_ART } from '../assets/art'
import { useAppStore } from '../store/StoreContext'
import { buildStudioPlan, type StudioPlan } from '@shared/studioPlanner'

export default function Parent() {
  const { store, refresh } = useAppStore()
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [studioPrompt, setStudioPrompt] = useState('Make a level-1 phonics game about space')
  const [studioAge, setStudioAge] = useState(6)
  const [studioPlan, setStudioPlan] = useState<StudioPlan | null>(null)

  const ok = useMemo(() => unlocked || pin === store.settings.parentPin, [unlocked, pin, store.settings.parentPin])

  async function save(patch: Partial<typeof store.settings>) {
    if (!window.dino) return
    await window.dino.settingsUpdate(patch)
    await refresh()
  }

  async function pickVoice() {
    if (!window.dino) return
    const folder = await window.dino.parentPickVoiceFolder()
    if (folder) await save({ customVoiceFolder: folder })
  }

  function generateStudioPlan() {
    setStudioPlan(buildStudioPlan(studioPrompt, studioAge))
  }

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">
          <div className="brand-badge brand-badge--img">
            <img src={UI_ART.parent} alt="" />
          </div>
          <div>
            Parent zone
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
              Controls stay local. Gemini is optional and off by default.
            </div>
          </div>
        </div>
        <Link className="link" to="/">
          Home
        </Link>
      </div>

      {!ok ? (
        <div className="card game-stage">
          <h2 style={{ marginTop: 0 }}>Enter parent PIN</h2>
          <p className="lead">Default PIN is 2468 (change it below after unlocking).</p>
          <div className="field">
            <label>PIN</label>
            <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" />
          </div>
          <button type="button" className="btn" onClick={() => setUnlocked(pin === store.settings.parentPin)}>
            Unlock
          </button>
        </div>
      ) : (
        <>
        <div className="grid-2">
          <div className="card">
            <h2>Session & safety</h2>
            <div className="field">
              <label>Session length</label>
              <select
                value={store.settings.sessionMinutes}
                onChange={(e) => void save({ sessionMinutes: Number(e.target.value) as 5 | 10 | 15 })}
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
              </select>
            </div>
            <div className="field">
              <label>
                <input
                  type="checkbox"
                  checked={store.settings.micEnabled}
                  onChange={(e) => void save({ micEnabled: e.target.checked })}
                />{' '}
                Microphone missions enabled
              </label>
            </div>
            <div className="field">
              <label>
                <input
                  type="checkbox"
                  checked={store.settings.speechFeaturesEnabled}
                  onChange={(e) => void save({ speechFeaturesEnabled: e.target.checked })}
                />{' '}
                Speech recognition (read-aloud) enabled
              </label>
            </div>
            <div className="field">
              <label>
                <input
                  type="checkbox"
                  checked={store.settings.soundEffects}
                  onChange={(e) => void save({ soundEffects: e.target.checked })}
                />{' '}
                Sound effect pops
              </label>
            </div>
            <div className="field">
              <label>
                <input
                  type="checkbox"
                  checked={store.settings.reducedMotion}
                  onChange={(e) => void save({ reducedMotion: e.target.checked })}
                />{' '}
                Reduced motion (fewer big animations)
              </label>
            </div>
            <div className="field">
              <label>New parent PIN</label>
              <input
                placeholder="numbers only"
                onBlur={(e) => {
                  const v = e.target.value.trim()
                  if (v) void save({ parentPin: v })
                }}
              />
            </div>
          </div>

          <div className="card">
            <h2>Reading gates & audio</h2>
            <p className="lead">
              Comprehension uses the hybrid rule: age ≥ threshold and placement readiness ≥ threshold.
            </p>
            <div className="field">
              <label>Comprehension minimum age</label>
              <input
                type="number"
                min={5}
                max={12}
                value={store.settings.comprehensionMinAge}
                onChange={(e) => void save({ comprehensionMinAge: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Comprehension readiness minimum (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={store.settings.comprehensionMinReadiness}
                onChange={(e) => void save({ comprehensionMinReadiness: Number(e.target.value) })}
              />
            </div>
            <div className="btn-row" style={{ marginBottom: 12 }}>
              <button type="button" className="btn secondary" onClick={() => void pickVoice()}>
                Choose custom voice folder
              </button>
            </div>
            <div className="pill" style={{ marginBottom: 12 }}>
              Folder:{' '}
              <span style={{ color: 'var(--text)' }}>{store.settings.customVoiceFolder ?? 'not set'}</span>
            </div>
            <p className="lead" style={{ fontSize: '0.9rem' }}>
              Put files named like <code>clipId.wav</code> in that folder to override spoken prompts (clip ids are
              shown in dev logs later).
            </p>

            <h3 style={{ marginTop: 18 }}>Optional Gemini coach</h3>
            <div className="field">
              <label>
                <input
                  type="checkbox"
                  checked={store.settings.geminiEnabled}
                  onChange={(e) => void save({ geminiEnabled: e.target.checked })}
                />{' '}
                Allow Gemini pronunciation tips (requires internet + API key)
              </label>
            </div>
            <div className="field">
              <label>Gemini API key (stored locally on this PC)</label>
              <input
                type="password"
                value={store.settings.geminiApiKey}
                onChange={(e) => void save({ geminiApiKey: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Model id</label>
              <input value={store.settings.geminiModel} onChange={(e) => void save({ geminiModel: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="card" style={{ marginTop: 18 }}>
          <h2>1-click content studio (phase 1)</h2>
          <p className="lead">
            Enter one prompt and generate a structured lesson/missions blueprint (PM + pedagogy + QA scaffolding).
          </p>
          <div className="field">
            <label>Prompt</label>
            <input value={studioPrompt} onChange={(e) => setStudioPrompt(e.target.value)} />
          </div>
          <div className="field">
            <label>Target age</label>
            <input
              type="number"
              min={5}
              max={12}
              value={studioAge}
              onChange={(e) => setStudioAge(Math.max(5, Math.min(12, Number(e.target.value) || 5)))}
            />
          </div>
          <div className="btn-row" style={{ marginBottom: 12 }}>
            <button type="button" className="btn" onClick={generateStudioPlan}>
              Generate blueprint
            </button>
          </div>
          {studioPlan && (
            <div style={{ display: 'grid', gap: 10 }}>
              <div className="pill">
                Age band: <b style={{ color: 'var(--text)' }}>{studioPlan.ageBand}</b>
              </div>
              <h3 style={{ margin: '6px 0 0' }}>{studioPlan.title}</h3>
              <p style={{ margin: 0, color: 'var(--muted)' }}>{studioPlan.storyHook}</p>
              <div>
                <b>Reading focus</b>
                <ul style={{ margin: '8px 0 0' }}>
                  {studioPlan.focus.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <b>Mission set</b>
                <ul style={{ margin: '8px 0 0' }}>
                  {studioPlan.missions.map((m) => (
                    <li key={m.id}>
                      <code>{m.id}</code> - {m.why}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <b>QA gate checklist</b>
                <ul style={{ margin: '8px 0 0' }}>
                  {studioPlan.qaChecks.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  )
}
