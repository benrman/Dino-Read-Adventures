export type StudioPlan = {
  title: string
  ageBand: '5-7' | '8-12'
  focus: string[]
  storyHook: string
  missions: { id: string; why: string }[]
  qaChecks: string[]
}

const MISSION_POOL = [
  { id: 'letter-safari', lane: 'phonics' },
  { id: 'sound-cave', lane: 'phonemic awareness' },
  { id: 'word-nest', lane: 'decoding + spelling' },
  { id: 'fossil-rush', lane: 'fluency' },
  { id: 'echo-trail', lane: 'oral language' },
  { id: 'roar-lab', lane: 'pronunciation' },
  { id: 'story-fossil', lane: 'comprehension' },
  { id: 'rhyme-rapids', lane: 'phonological play' },
]

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function buildStudioPlan(prompt: string, age: number): StudioPlan {
  const clean = prompt.trim() || 'Dino reading mission'
  const seed = hash(`${clean}:${age}`)
  const ageBand: StudioPlan['ageBand'] = age <= 7 ? '5-7' : '8-12'
  const focus =
    ageBand === '5-7'
      ? ['phonemic awareness', 'systematic phonics', 'short decodable words', 'supported comprehension']
      : ['fluency + expression', 'vocabulary + morphology', 'connected-text comprehension', 'oral retell']
  const offset = seed % MISSION_POOL.length
  const picked = Array.from({ length: 5 }).map((_, i) => MISSION_POOL[(offset + i) % MISSION_POOL.length])
  return {
    title: clean,
    ageBand,
    focus,
    storyHook: `A dino explorer follows clues about "${clean}" and unlocks reading power-ups each mission.`,
    missions: picked.map((m) => ({ id: m.id, why: m.lane })),
    qaChecks: [
      'All prompts can be read aloud (TTS button visible).',
      'Session ends with a clear completion state.',
      'At least one mic mission gives useful error feedback.',
      'Contrast stays readable on dark backgrounds.',
    ],
  }
}

