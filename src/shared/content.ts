export type ActivityMeta = {
  id: string
  title: string
  blurb: string
  skillTags: string[]
  minTier: number
  /** Ties the mission to evidence-based reading strands (phonemic awareness, phonics, fluency, vocabulary, comprehension). */
  scienceBlurb?: string
}

export const ACTIVITIES: ActivityMeta[] = [
  {
    id: 'letter-safari',
    title: 'Letter Safari',
    blurb: 'Spot the matching letter before it stomps away!',
    skillTags: ['letters'],
    minTier: 0,
    scienceBlurb: 'Letter–sound links build the decoding side of reading (phonics + print awareness).',
  },
  {
    id: 'sound-cave',
    title: 'Sound Cave',
    blurb: 'Seven rounds: pick the picture that starts with the secret sound, then exit to camp.',
    skillTags: ['phonemic'],
    minTier: 0,
    scienceBlurb: 'Hearing first sounds trains phonemic awareness — a strong predictor of later reading success.',
  },
  {
    id: 'word-nest',
    title: 'Word Nest',
    blurb: 'Build tiny words from letter eggs.',
    skillTags: ['phonics'],
    minTier: 1,
    scienceBlurb: 'Blending letter sounds into words is systematic phonics practice (ages 5–7: short words; 9+: adds longer patterns).',
  },
  {
    id: 'fossil-rush',
    title: 'Fossil Rush',
    blurb: 'Quick taps! Chase the glowing fossil letter.',
    skillTags: ['fluency'],
    minTier: 0,
    scienceBlurb: 'Quick, accurate responses support automaticity — one piece of fluent reading.',
  },
  {
    id: 'echo-trail',
    title: 'Echo Trail',
    blurb: 'Listen, then say it back like a dino echo.',
    skillTags: ['oral'],
    minTier: 0,
    scienceBlurb: 'Repeating a model line builds oral language and expressive prosody (how reading should sound).',
  },
  {
    id: 'roar-lab',
    title: 'Roar Lab',
    blurb: 'Microphone mission: roar the word clearly!',
    skillTags: ['pronunciation'],
    minTier: 0,
    scienceBlurb: 'Clear speech overlaps with phonics: kids hear their own sounds and adjust.',
  },
  {
    id: 'story-fossil',
    title: 'Story Fossil',
    blurb: 'Read a short passage and crack the question rock.',
    skillTags: ['comprehension'],
    minTier: 2,
    scienceBlurb: 'Understanding “who did what and why” is comprehension — best when decoding is catching up (parent-gated here).',
  },
  {
    id: 'rhyme-rapids',
    title: 'Rhyme Rapids',
    blurb: 'Splash through pairs that rhyme — fast ears, big smiles.',
    skillTags: ['phonemic'],
    minTier: 0,
    scienceBlurb: 'Rhyming strengthens phonological awareness and word families (vocabulary + sound patterns).',
  },
]

export const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'.split('')

/** First-sound drills: several words per picture so sessions feel varied (art reused from SOUND_ART). */
export const SOUND_ITEMS: { word: string; letter: string; pictureId: string }[] = [
  { word: 'Apple', letter: 'A', pictureId: 'apple' },
  { word: 'Ant', letter: 'A', pictureId: 'apple' },
  { word: 'Arrow', letter: 'A', pictureId: 'apple' },
  { word: 'Apron', letter: 'A', pictureId: 'apple' },
  { word: 'Ball', letter: 'B', pictureId: 'ball' },
  { word: 'Bat', letter: 'B', pictureId: 'ball' },
  { word: 'Bug', letter: 'B', pictureId: 'ball' },
  { word: 'Bell', letter: 'B', pictureId: 'ball' },
  { word: 'Cat', letter: 'C', pictureId: 'cat' },
  { word: 'Cup', letter: 'C', pictureId: 'cat' },
  { word: 'Can', letter: 'C', pictureId: 'cat' },
  { word: 'Cap', letter: 'C', pictureId: 'cat' },
  { word: 'Dog', letter: 'D', pictureId: 'dog' },
  { word: 'Dot', letter: 'D', pictureId: 'dog' },
  { word: 'Dip', letter: 'D', pictureId: 'dog' },
  { word: 'Dig', letter: 'D', pictureId: 'dog' },
  { word: 'Sun', letter: 'S', pictureId: 'sun' },
  { word: 'Sit', letter: 'S', pictureId: 'sun' },
  { word: 'Sad', letter: 'S', pictureId: 'sun' },
  { word: 'Sock', letter: 'S', pictureId: 'sun' },
  { word: 'Moon', letter: 'M', pictureId: 'moon' },
  { word: 'Map', letter: 'M', pictureId: 'moon' },
  { word: 'Mop', letter: 'M', pictureId: 'moon' },
  { word: 'Mud', letter: 'M', pictureId: 'moon' },
  { word: 'Fish', letter: 'F', pictureId: 'fish' },
  { word: 'Fan', letter: 'F', pictureId: 'fish' },
  { word: 'Fun', letter: 'F', pictureId: 'fish' },
  { word: 'Fin', letter: 'F', pictureId: 'fish' },
  { word: 'Nest', letter: 'N', pictureId: 'nest' },
  { word: 'Net', letter: 'N', pictureId: 'nest' },
  { word: 'Nap', letter: 'N', pictureId: 'nest' },
  { word: 'Nut', letter: 'N', pictureId: 'nest' },
]

const SOUND_CAVE_ROUND_COUNT = 7

/** Fisher–Yates shuffle copy for one Sound Cave run (no repeats until deck exhausts). */
export type SoundItem = (typeof SOUND_ITEMS)[number]

export function buildSoundCaveDeck(): SoundItem[] {
  const a = [...SOUND_ITEMS]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, Math.min(SOUND_CAVE_ROUND_COUNT, a.length))
}

export const SOUND_CAVE_TOTAL_ROUNDS = SOUND_CAVE_ROUND_COUNT

export const CVC_WORDS = ['cat', 'dog', 'sun', 'map', 'pen', 'sit', 'hop', 'web', 'bug', 'jam']

/** Longer words with common prefixes/suffixes for ages 9–12 (light morphology practice). */
export const MORPH_WORDS = ['replay', 'unhappy', 'preview', 'return', 'rewrite', 'dislike', 'submarine', 'preschool']

/** Word pools for spelling / roar games: younger kids stay on CVC; older get morphology mix. */
export function practiceWordsForAge(age: number): string[] {
  return age >= 9 ? [...CVC_WORDS, ...MORPH_WORDS] : [...CVC_WORDS]
}

export const STORY_SNIPPETS: {
  id: string
  text: string
  q: string
  choices: string[]
  answer: string
}[] = [
  {
    id: 's1',
    text: 'The little raptor hid a shiny pebble under a fern. She wanted to surprise her brother at sunset.',
    q: 'What did the raptor hide?',
    choices: ['A pebble', 'A sandwich', 'A map'],
    answer: 'A pebble',
  },
  {
    id: 's2',
    text: 'Bronto felt thunder in his feet when the herd began to move. He took one slow step, then another.',
    q: 'How does Bronto move at first?',
    choices: ['Very fast', 'One slow step', 'He flies'],
    answer: 'One slow step',
  },
  {
    id: 's3',
    text: 'Ptero skimmed the lake and spotted ripples spelling a secret word. He squawked happily and circled once.',
    q: 'What did Ptero see on the water?',
    choices: ['Ripples', 'A pizza', 'A bicycle'],
    answer: 'Ripples',
  },
  {
    id: 's4',
    text: 'Stego packed leaves for the hike. He checked his tail spikes so they would not bump the cave walls.',
    q: 'Why did Stego check his tail spikes?',
    choices: ['To avoid bumping walls', 'To paint them blue', 'To make music'],
    answer: 'To avoid bumping walls',
  },
]

export const RHYME_PAIRS: { prompt: string; rhyme: string; wrong: string[] }[] = [
  { prompt: 'cat', rhyme: 'hat', wrong: ['dog', 'sun'] },
  { prompt: 'tree', rhyme: 'bee', wrong: ['car', 'milk'] },
  { prompt: 'light', rhyme: 'night', wrong: ['chair', 'jump'] },
  { prompt: 'star', rhyme: 'far', wrong: ['desk', 'frog'] },
  { prompt: 'train', rhyme: 'rain', wrong: ['sock', 'brick'] },
]
