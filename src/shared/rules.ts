import type { AppSettings, ChildProfile } from './types'

export function comprehensionUnlocked(profile: ChildProfile, settings: AppSettings): boolean {
  return (
    profile.age >= settings.comprehensionMinAge &&
    profile.placementReadiness >= settings.comprehensionMinReadiness &&
    profile.placementDone
  )
}

export function greetingLine(name: string): string {
  const h = new Date().getHours()
  if (h < 11) return `Good morning, ${name}! Ready to hatch some words?`
  if (h < 17) return `Hey ${name}! The dig site is glowing today.`
  return `Evening, ${name}! One more roar before bedtime?`
}

export const BUDDY_LINES = [
  'Tap a mission card — I saved you the shiniest fossils!',
  'Streaks are like tails: the longer, the cooler.',
  'Mistakes are just dino footprints. We follow them to learn!',
  'Big readers grow slow and strong, like sauropods.',
]

export function pickBuddyLine(seed: number): string {
  return BUDDY_LINES[Math.abs(seed) % BUDDY_LINES.length]
}
