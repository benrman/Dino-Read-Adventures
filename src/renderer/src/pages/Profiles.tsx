import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/StoreContext'
import AvatarDisplay from '../components/AvatarDisplay'
import { AVATAR_OPTIONS, DEFAULT_AVATAR_KEY } from '../config/avatars'
import trexLogo from '../assets/jurassic/avatar-trex.png'

export default function Profiles() {
  const { store, refresh } = useAppStore()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [age, setAge] = useState(6)
  const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR_KEY)

  const sorted = useMemo(
    () => [...store.profiles].sort((a, b) => a.name.localeCompare(b.name)),
    [store.profiles],
  )

  async function create() {
    const p = await window.dino.profileCreate({
      name: name || 'Explorer',
      age,
      avatar,
    })
    setName('')
    await refresh()
    nav(`/profile/${p.id}/placement`)
  }

  return (
    <div className="page">
      <div className="clouds">
        <span className="cloud" />
        <span className="cloud" />
        <span className="cloud" />
        <span className="cloud" />
      </div>
      <div className="topbar">
        <div className="brand">
          <div className="brand-badge brand-badge--img">
            <img src={trexLogo} alt="" />
          </div>
          <div>
            Dino Reading Adventure
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
              Offline play · Ages 5–12 · Mic-ready missions
            </div>
          </div>
        </div>
        <Link className="link" to="/parent">
          Parent zone
        </Link>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Choose your explorer</h2>
          <p className="lead">
            Each child gets their own streaks, eggs, stickers, and reading path. Everything stays on this computer.
          </p>
          {sorted.length === 0 ? (
            <p className="lead">No profiles yet — hatch the first one on the right!</p>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {sorted.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="mission"
                  onClick={() => nav(`/profile/${p.id}/hub`)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div className="pill" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <AvatarDisplay avatar={p.avatar} size={36} round={12} />
                        <b style={{ color: 'var(--text)' }}>{p.name}</b>
                      </div>
                      <div style={{ marginTop: 8, color: 'var(--muted)', fontSize: '0.9rem' }}>
                        Age {p.age} · Tier {p.readingTier} · 🔥 {p.streakDays} day streak
                      </div>
                    </div>
                    <div style={{ fontSize: '1.6rem' }}>➜</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Hatch a new profile</h2>
          <p className="lead">Pick a dino buddy portrait, set an age, and we will run a quick placement dig.</p>
          <div className="field">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Leo" />
          </div>
          <div className="field">
            <label>Age (5–12)</label>
            <input
              type="number"
              min={5}
              max={12}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label>Buddy</label>
            <div className="avatar-pick-grid">
              {AVATAR_OPTIONS.map((a) => (
                <button
                  key={a.key}
                  type="button"
                  className={`avatar-pick${avatar === a.key ? ' avatar-pick--on' : ''}`}
                  title={a.label}
                  onClick={() => setAvatar(a.key)}
                >
                  <AvatarDisplay avatar={a.key} size={72} round={16} />
                  <span>{a.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: 8 }}>
            <button type="button" className="btn" onClick={() => void create()}>
              Create & start placement
            </button>
            <Link to="/parent" className="btn secondary" style={{ display: 'inline-flex', alignItems: 'center' }}>
              Parent settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
