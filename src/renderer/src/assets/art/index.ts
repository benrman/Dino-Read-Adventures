import missionLetterSafari from './mission-letter-safari.png'
import missionSoundCave from './mission-sound-cave.png'
import missionWordNest from './mission-word-nest.png'
import missionFossilRush from './mission-fossil-rush.png'
import missionEchoTrail from './mission-echo-trail.png'
import missionRoarLab from './mission-roar-lab.png'
import missionStoryFossil from './mission-story-fossil.png'
import missionRhymeRapids from './mission-rhyme-rapids.png'

import soundApple from './sound-apple.png'
import soundBall from './sound-ball.png'
import soundCat from './sound-cat.png'
import soundDog from './sound-dog.png'
import soundSun from './sound-sun.png'
import soundMoon from './sound-moon.png'
import soundFish from './sound-fish.png'
import soundNest from './sound-nest.png'

import uiPlacement from './ui-placement.png'
import uiAdventure from './ui-adventure.png'
import uiParent from './ui-parent.png'
import uiStickers from './ui-stickers.png'

import stickerWelcome from './sticker-welcome.png'
import stickerDailyDig from './sticker-daily-dig.png'
import stickerHotStreak from './sticker-hot-streak.png'
import stickerUnknown from './sticker-unknown.png'

export const MISSION_ART: Record<string, string> = {
  'letter-safari': missionLetterSafari,
  'sound-cave': missionSoundCave,
  'word-nest': missionWordNest,
  'fossil-rush': missionFossilRush,
  'echo-trail': missionEchoTrail,
  'roar-lab': missionRoarLab,
  'story-fossil': missionStoryFossil,
  'rhyme-rapids': missionRhymeRapids,
}

export const SOUND_ART: Record<string, string> = {
  apple: soundApple,
  ball: soundBall,
  cat: soundCat,
  dog: soundDog,
  sun: soundSun,
  moon: soundMoon,
  fish: soundFish,
  nest: soundNest,
}

export const UI_ART = {
  placement: uiPlacement,
  adventure: uiAdventure,
  parent: uiParent,
  stickers: uiStickers,
} as const

export function resolveStickerArt(stickerId: string): string {
  if (stickerId === 'welcome') return stickerWelcome
  if (stickerId === 'daily-dig') return stickerDailyDig
  if (stickerId === 'hot-streak') return stickerHotStreak
  if (stickerId.startsWith('act-')) {
    const missionId = stickerId.replace(/^act-/, '')
    return MISSION_ART[missionId] ?? stickerUnknown
  }
  return stickerUnknown
}
