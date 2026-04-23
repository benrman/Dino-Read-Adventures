import { useCallback } from 'react'
import { useAppStore } from '../store/StoreContext'

export function useGameFeedback() {
  const { store } = useAppStore()
  const on = store?.settings.soundEffects ?? true

  const sfx = useCallback(
    (kind: 'pop' | 'good' | 'bad') => {
      if (!on) return
      const ctx = new AudioContext()
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g)
      g.connect(ctx.destination)
      const now = ctx.currentTime
      if (kind === 'pop') {
        o.type = 'triangle'
        o.frequency.setValueAtTime(420, now)
        g.gain.setValueAtTime(0.0001, now)
        g.gain.exponentialRampToValueAtTime(0.08, now + 0.02)
        o.start(now)
        o.stop(now + 0.08)
      } else if (kind === 'good') {
        o.type = 'sine'
        o.frequency.setValueAtTime(520, now)
        o.frequency.exponentialRampToValueAtTime(880, now + 0.12)
        g.gain.setValueAtTime(0.0001, now)
        g.gain.exponentialRampToValueAtTime(0.1, now + 0.02)
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
        o.start(now)
        o.stop(now + 0.2)
      } else {
        o.type = 'square'
        o.frequency.setValueAtTime(180, now)
        g.gain.setValueAtTime(0.0001, now)
        g.gain.exponentialRampToValueAtTime(0.06, now + 0.02)
        o.start(now)
        o.stop(now + 0.12)
      }
      void ctx.resume()
    },
    [on],
  )

  return { sfx }
}
