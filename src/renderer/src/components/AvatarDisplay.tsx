import { resolveAvatarSrc } from '../config/avatars'

export default function AvatarDisplay({
  avatar,
  size = 48,
  className = '',
  round = 14,
}: {
  avatar: string
  size?: number
  className?: string
  round?: number
}) {
  const src = resolveAvatarSrc(avatar)
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={className}
        draggable={false}
        style={{
          width: size,
          height: size,
          borderRadius: round,
          objectFit: 'cover',
          display: 'block',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
        }}
      />
    )
  }
  return (
    <span
      className={className}
      style={{
        fontSize: Math.max(22, size * 0.72),
        lineHeight: 1,
        display: 'grid',
        placeItems: 'center',
        width: size,
        height: size,
      }}
      role="img"
      aria-hidden
    >
      {avatar}
    </span>
  )
}
