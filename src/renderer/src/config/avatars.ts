import trex from '../assets/jurassic/avatar-trex.png'
import triceratops from '../assets/jurassic/avatar-triceratops.png'
import brachiosaurus from '../assets/jurassic/avatar-brachiosaurus.png'
import raptor from '../assets/jurassic/avatar-raptor.png'
import stego from '../assets/jurassic/avatar-stego.png'

export const DEFAULT_AVATAR_KEY = 'jurassic-trex'

export const AVATAR_REGISTRY: Record<string, string> = {
  'jurassic-trex': trex,
  'jurassic-trike': triceratops,
  'jurassic-bronto': brachiosaurus,
  'jurassic-raptor': raptor,
  'jurassic-stego': stego,
}

export const AVATAR_OPTIONS: { key: string; label: string }[] = [
  { key: 'jurassic-trex', label: 'Tiny Rex' },
  { key: 'jurassic-trike', label: 'Trike' },
  { key: 'jurassic-bronto', label: 'Bronto' },
  { key: 'jurassic-raptor', label: 'Raptor' },
  { key: 'jurassic-stego', label: 'Stego' },
]

export function resolveAvatarSrc(avatar: string): string | null {
  if (AVATAR_REGISTRY[avatar]) return AVATAR_REGISTRY[avatar]
  if (avatar.startsWith('/assets/')) {
    return `${import.meta.env.BASE_URL}${avatar.slice(1)}`
  }
  if (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.includes('.png') || avatar.includes('.webp')) {
    return avatar
  }
  return null
}
