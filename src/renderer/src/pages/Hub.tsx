import { useMemo } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ACTIVITIES } from '@shared/content'
import { comprehensionUnlocked, greetingLine, pickBuddyLine } from '@shared/rules'
import { useAppStore } from '../store/StoreContext'
import TipsCarousel from '../components/TipsCarousel'
import AvatarDisplay from '../components/AvatarDisplay'
import { MISSION_ART } from '../assets/art'

export default function Hub() {
  const { id } = useParams()
  const nav = useNavigate()
  const { store, refresh, profile } = useAppStore()
  const p = id ? profile(id) : undefined

  const today = new Date().toISOString().slice(0, 10)
  const dailyAvailable = p && p.lastDailyBonusDate !== today

  const missions = useMemo(() => {
    if (!p) return []
    const comp = comprehensionUnlocked(p, store.settings)
    return ACTIVITIES.map((a) => {
      const tierLocked = p.readingTier < a.minTier
      const storyLocked = a.id === 'story-fossil' && !comp
      return { ...a, locked: tierLocked || storyLocked, tierLocked, storyLocked }
    })
  }, [p, store.settings])

  if (!id || !p) return <Navigate to="/" replace />
  if (!p.placementDone) return <Navigate to={`/profile/${id}/placement`} replace />

  const xpIntoLevel = p.xp
  const xpNeed = Math.max(1, p.level * 100)
  const xpPct = Math.min(100, Math.round((xpIntoLevel / xpNeed) * 100))

  async function startDig() {
    await window.dino.sessionStart(p.id)
    await refresh()
    nav(`/profile/${p.id}/adventure`)
  }

  async function claimDaily() {
    await window.dino.dailyClaim(p.id)
    await refresh()
  }

  return (
    <div className="page">
      <div className="clouds">
        <span className="cloud" />
        <span className="cloud" />
        <span className="cloud" />
      </div>
      <div className="topbar">
        <div className="brand">
          <div className="brand-badge brand-badge--avatar">
            <AvatarDisplay avatar={p.avatar} size={42} round={14} />
          </div>
          <div>
            {p.name}'s camp
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
              {greetingLine(p.name)}
            </div>
          </div>
        </div>
        <div className="btn-row">
          <Link className="btn secondary" to="/">
            Profiles
          </Link>
          <Link className="btn secondary" to={`/profile/${p.id}/stickers`}>
            Sticker cave
          </Link>
          <Link className="btn secondary" to="/parent">
            Parent
          </Link>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ marginTop: 0 }}>Today's dig site</h2>
              <p className="lead" style={{ marginBottom: 8 }}>
                {pickBuddyLine(p.sessionsPlayed + p.level * 7)}
              </p>
              <div className="pill">
                Session pack: <b style={{ color: 'var(--text)' }}>{store.settings.sessionMinutes} min</b>
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="hero-dino hero-dino--art">
                <AvatarDisplay avatar={p.avatar} size={200} round={28} />
              </div>
              <div className="sparkle" style={{ top: 18, right: 18 }} />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <b>
                Level {p.level}
              </b>
              <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                XP {p.xp}/{xpNeed}
              </span>
            </div>
            <div className="xp-bar">
              <i style={{ width: `${xpPct}%` }} />
            </div>
          </div>

          <div className="stat-grid" style={{ marginTop: 14 }}>
            <div className="stat">
              <b>🔥 {p.streakDays}</b>
              <span>day streak</span>
            </div>
            <div className="stat">
              <b>🥚 {Math.round(p.eggProgress)}%</b>
              <span>next hatch</span>
            </div>
            <div className="stat">
              <b>🪨 {p.fossilFinds}</b>
              <span>fossil finds</span>
            </div>
            <div className="stat">
              <b>🎙️ {p.pronunciationStars}</b>
              <span>roar stars</span>
            </div>
          </div>

          <div className="btn-row" style={{ marginTop: 16 }}>
            <button type="button" className="btn" onClick={() => void startDig()}>
              Start today's dig
            </button>
            <button
              type="button"
              className="btn secondary"
              disabled={!dailyAvailable}
              onClick={() => void claimDaily()}
              title={dailyAvailable ? 'Claim bonus XP' : 'Come back tomorrow'}
            >
              {dailyAvailable ? 'Claim daily fossil bonus' : 'Daily bonus claimed'}
            </button>
          </div>

          {p.badges.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 8 }}>Recent badges</div>
              <div className="btn-row">
                {p.badges.slice(-6).map((b) => (
                  <span key={b} className="pill">
                    🏅 {b}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <TipsCarousel profileId={p.id} />
          <h2 style={{ marginTop: 18 }}>Mission board</h2>
          <p className="lead">
            Rotate through a few missions each session — variety keeps brains curious (multisensory wins!).
          </p>
          <div className="mission-grid">
            {missions.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`mission${m.locked ? ' locked' : ''}`}
                onClick={() => {
                  if (m.locked) return
                  nav(`/profile/${p.id}/game/${m.id}`)
                }}
              >
                <div className="mission-thumb">
                  <img src={MISSION_ART[m.id]} alt="" />
                </div>
                <h3>
                  {m.title}{' '}
                  {m.locked && <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>(locked)</span>}
                </h3>
                <p>{m.blurb}</p>
                {m.scienceBlurb && (
                  <p style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.45 }}>
                    {m.scienceBlurb}
                  </p>
                )}
                {m.locked && m.tierLocked && (
                  <p style={{ marginTop: 8, color: 'var(--gold)', fontSize: '0.85rem' }}>
                    Unlocks at reading tier {m.minTier} (keep digging — your tier rises with practice).
                  </p>
                )}
                {m.locked && m.storyLocked && !m.tierLocked && (
                  <p style={{ marginTop: 8, color: 'var(--gold)', fontSize: '0.85rem' }}>
                    Story comprehension unlocks when age ≥ {store.settings.comprehensionMinAge} and placement readiness ≥{' '}
                    {store.settings.comprehensionMinReadiness} (parent can adjust in Parent zone).
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
