import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ACTIVITIES } from '@shared/content'
import { MISSION_ART, UI_ART } from '../assets/art'
import { comprehensionUnlocked } from '@shared/rules'
import { useAppStore } from '../store/StoreContext'

export default function Adventure() {
  const { id } = useParams()
  const nav = useNavigate()
  const { store, profile, refresh } = useAppStore()
  const p = id ? profile(id) : undefined
  const [left, setLeft] = useState(() => (p ? store.settings.sessionMinutes * 60 : 600))

  useEffect(() => {
    if (!p) return
    setLeft(store.settings.sessionMinutes * 60)
  }, [p, store.settings.sessionMinutes])

  useEffect(() => {
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(t)
  }, [])

  const plan = useMemo(() => {
    if (!p) return []
    const comp = comprehensionUnlocked(p, store.settings)
    const pool = ACTIVITIES.filter((a) => {
      if (p.readingTier < a.minTier) return false
      if (a.id === 'story-fossil' && !comp) return false
      return true
    })
    const pick = (ids: string[]) => pool.filter((a) => ids.includes(a.id))
    const tier = p.readingTier
    const older = p.age >= 9
    if (tier <= 1) return pick(['letter-safari', 'sound-cave', 'fossil-rush', 'echo-trail', 'rhyme-rapids'])
    if (tier <= 3) {
      return older
        ? pick(['word-nest', 'roar-lab', 'story-fossil', 'fossil-rush', 'rhyme-rapids'])
        : pick(['word-nest', 'sound-cave', 'roar-lab', 'fossil-rush', 'rhyme-rapids'])
    }
    return older
      ? pick(['word-nest', 'story-fossil', 'roar-lab', 'echo-trail', 'fossil-rush'])
      : pick(['word-nest', 'story-fossil', 'roar-lab', 'echo-trail', 'rhyme-rapids'])
  }, [p, store.settings])

  if (!id || !p) return <Navigate to="/" replace />
  if (!p.placementDone) return <Navigate to={`/profile/${id}/placement`} replace />

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  async function fossilBonus() {
    await window.dino.gameBumpFossil(p.id)
    await refresh()
  }

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">
          <div className="brand-badge brand-badge--img">
            <img src={UI_ART.adventure} alt="" />
          </div>
          <div>
            Guided dig session
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
              Timer keeps sessions bite-sized and exciting.
            </div>
          </div>
        </div>
        <div className="btn-row">
          <Link className="btn secondary" to={`/profile/${p.id}/hub`}>
            Back to camp
          </Link>
        </div>
      </div>

      <div className="card game-stage">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Today's trail</h2>
            <p className="lead">
              Do at least two missions, then grab a fossil bonus. Mix listening, tapping, and speaking for max
              stimulation.
            </p>
          </div>
          <div className="pill" style={{ alignSelf: 'flex-start' }}>
            ⏱️ <b style={{ color: 'var(--text)' }}>{mm}:{ss}</b>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
          {plan.map((m) => (
            <button key={m.id} type="button" className="mission" onClick={() => nav(`/profile/${p.id}/game/${m.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div className="pill" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="mission-pill-thumb">
                      <img src={MISSION_ART[m.id]} alt="" />
                    </span>
                    <b style={{ color: 'var(--text)' }}>{m.title}</b>
                  </div>
                  <div style={{ marginTop: 8, color: 'var(--muted)' }}>{m.blurb}</div>
                </div>
                <div style={{ fontSize: '1.4rem' }}>➜</div>
              </div>
            </button>
          ))}
        </div>

        <div className="btn-row" style={{ marginTop: 14 }}>
          <button type="button" className="btn secondary" onClick={() => void fossilBonus()}>
            Fossil bonus tap (+1 find)
          </button>
          <Link className="btn ghost" to={`/profile/${p.id}/stickers`}>
            Open sticker cave
          </Link>
        </div>
      </div>
    </div>
  )
}
