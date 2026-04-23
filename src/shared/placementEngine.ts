import type { ReadingTier } from './types'

export type PlacementAnswer = { q: string; correct: boolean; weight: number }

export function scorePlacement(answers: PlacementAnswer[]): {
  tier: ReadingTier
  confidence: number
  readiness: number
} {
  let score = 0
  let max = 0
  for (const a of answers) {
    max += a.weight
    if (a.correct) score += a.weight
  }
  const ratio = max ? score / max : 0
  const readiness = Math.round(40 + ratio * 55)
  const confidence = Math.round(30 + ratio * 65)
  let tier: ReadingTier = 0
  if (ratio > 0.85) tier = 4
  else if (ratio > 0.7) tier = 3
  else if (ratio > 0.55) tier = 2
  else if (ratio > 0.35) tier = 1
  else tier = 0
  return { tier, confidence, readiness }
}
