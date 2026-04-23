import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ChildProfile } from '@shared/types'
import AvatarDisplay from '../components/AvatarDisplay'

export default function GameChrome({
  profile,
  title,
  subtitle,
  children,
}: {
  profile: ChildProfile
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">
          <div className="brand-badge brand-badge--avatar">
            <AvatarDisplay avatar={profile.avatar} size={42} round={14} />
          </div>
          <div>
            {title}
            <div style={{ fontSize: '0.82rem', color: 'var(--muted)', fontWeight: 600 }}>
              {subtitle ?? `${profile.name} · Tier ${profile.readingTier}`}
            </div>
          </div>
        </div>
        <Link className="btn secondary" to={`/profile/${profile.id}/hub`} style={{ textDecoration: 'none' }}>
          Camp
        </Link>
      </div>
      {children}
    </div>
  )
}
