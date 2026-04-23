import { Link, Navigate, useParams } from 'react-router-dom'
import { resolveStickerArt, UI_ART } from '../assets/art'
import { useAppStore } from '../store/StoreContext'

const STICKER_META: Record<string, { title: string }> = {
  welcome: { title: 'Welcome hatchling' },
  'daily-dig': { title: 'Daily dig bonus' },
  'hot-streak': { title: 'Hot streak' },
  'act-letter-safari': { title: 'Letter safari star' },
  'act-sound-cave': { title: 'Sound cave star' },
  'act-word-nest': { title: 'Word nest star' },
  'act-fossil-rush': { title: 'Fossil rush star' },
  'act-echo-trail': { title: 'Echo trail star' },
  'act-roar-lab': { title: 'Roar lab star' },
  'act-story-fossil': { title: 'Story fossil star' },
  'act-rhyme-rapids': { title: 'Rhyme rapids star' },
}

export default function Stickers() {
  const { id } = useParams()
  const { profile } = useAppStore()
  const p = id ? profile(id) : undefined
  if (!id || !p) return <Navigate to="/" replace />

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">
          <div className="brand-badge brand-badge--img">
            <img src={UI_ART.stickers} alt="" />
          </div>
          <div>
            Sticker cave
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
              Collectibles unlock as you explore missions.
            </div>
          </div>
        </div>
        <Link className="btn secondary" to={`/profile/${p.id}/hub`} style={{ textDecoration: 'none' }}>
          Back
        </Link>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>{p.name}'s collection</h2>
        <p className="lead">Stickers are like fossils: shiny proof of practice, not perfection.</p>
        <div className="mission-grid">
          {p.stickers.map((s) => {
            const meta = STICKER_META[s] ?? { title: s }
            const art = resolveStickerArt(s)
            return (
              <div key={s} className="mission sticker-tile" style={{ cursor: 'default' }}>
                <div className="sticker-art-wrap">
                  <img src={art} alt="" />
                </div>
                <h3 style={{ marginBottom: 6 }}>{meta.title}</h3>
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.85rem' }}>{s}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
