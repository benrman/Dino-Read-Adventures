import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

export type ReadingTier = 0 | 1 | 2 | 3 | 4 | 5

export type ChildProfile = {
  id: string
  name: string
  age: number
  avatar: string
  createdAt: string
  placementDone: boolean
  readingTier: ReadingTier
  placementConfidence: number
  placementReadiness: number
  mastery: Record<string, number>
  streakDays: number
  lastPlayDate: string | null
  xp: number
  level: number
  eggsHatched: number
  eggProgress: number
  stickers: string[]
  badges: string[]
  fossilFinds: number
  sessionsPlayed: number
  correctStreak: number
  pronunciationAttempts: number
  pronunciationStars: number
  lastDailyBonusDate: string | null
}

export type AppStore = {
  version: 1
  settings: {
    parentPin: string
    sessionMinutes: 5 | 10 | 15
    micEnabled: boolean
    speechFeaturesEnabled: boolean
    geminiEnabled: boolean
    geminiApiKey: string
    geminiModel: string
    comprehensionMinAge: number
    comprehensionMinReadiness: number
    customVoiceFolder: string | null
    reducedMotion: boolean
    soundEffects: boolean
  }
  profiles: ChildProfile[]
}

const STORE_VERSION = 1 as const

let userDataDir = ''
let cached: AppStore | null = null

const defaultSettings = (): AppStore['settings'] => ({
  parentPin: '2468',
  sessionMinutes: 10,
  micEnabled: true,
  speechFeaturesEnabled: true,
  geminiEnabled: false,
  geminiApiKey: '',
  geminiModel: 'gemini-1.5-flash',
  comprehensionMinAge: 7,
  comprehensionMinReadiness: 55,
  customVoiceFolder: null,
  reducedMotion: false,
  soundEffects: true,
})

export function defaultStore(): AppStore {
  return {
    version: STORE_VERSION,
    settings: defaultSettings(),
    profiles: [],
  }
}

function storePath() {
  return path.join(userDataDir, 'dino-reading-data.json')
}

export function loadStore(dir: string) {
  userDataDir = dir
  const p = storePath()
  try {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf-8')
      cached = migrate(JSON.parse(raw) as AppStore)
      return cached
    }
  } catch {
    // fall through
  }
  cached = defaultStore()
  saveStore(cached)
  return cached
}

function migrate(s: AppStore): AppStore {
  if (!s || typeof s !== 'object') return defaultStore()
  if (!Array.isArray(s.profiles)) s.profiles = []
  if (!s.version) s.version = 1
  if (!s.settings) s.settings = defaultSettings()
  const defs = defaultSettings()
  for (const k of Object.keys(defs) as (keyof AppStore['settings'])[]) {
    if (s.settings[k] === undefined) (s.settings as Record<string, unknown>)[k] = defs[k]
  }
  for (const p of s.profiles) {
    if (p.placementReadiness === undefined) p.placementReadiness = p.placementConfidence ?? 40
    if (p.fossilFinds === undefined) p.fossilFinds = 0
    if (p.sessionsPlayed === undefined) p.sessionsPlayed = 0
    if (p.correctStreak === undefined) p.correctStreak = 0
    if (p.pronunciationAttempts === undefined) p.pronunciationAttempts = 0
    if (p.pronunciationStars === undefined) p.pronunciationStars = 0
    if (p.lastDailyBonusDate === undefined) p.lastDailyBonusDate = null
    const legacyEmoji = ['🦕', '🦖', '🦎', '🥚', '🪺', '🌋', '🌿', '⭐']
    if (legacyEmoji.includes(p.avatar)) {
      const map: Record<string, string> = {
        '🦖': 'jurassic-trex',
        '🦕': 'jurassic-bronto',
        '🦎': 'jurassic-raptor',
        '🥚': 'jurassic-trex',
        '🪺': 'jurassic-trike',
        '🌋': 'jurassic-stego',
        '🌿': 'jurassic-bronto',
        '⭐': 'jurassic-raptor',
      }
      p.avatar = map[p.avatar] ?? 'jurassic-trex'
    }
  }
  return s
}

export function saveStore(next: AppStore) {
  cached = next
  fs.mkdirSync(userDataDir, { recursive: true })
  const tmp = storePath() + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(next, null, 2), 'utf-8')
  fs.renameSync(tmp, storePath())
}

export function getStoreSnapshot(): AppStore {
  if (!cached) throw new Error('Store not loaded')
  return JSON.parse(JSON.stringify(cached)) as AppStore
}

/** Safe for IPC: never throws; re-loads or resets if cache is missing or corrupt. */
export function getStoreSnapshotSafe(userDataDirForApp: string): AppStore {
  try {
    if (!cached || userDataDir !== userDataDirForApp) loadStore(userDataDirForApp)
    return getStoreSnapshot()
  } catch (e) {
    console.error('[dino-store] getStoreSnapshotSafe', e)
    userDataDir = userDataDirForApp
    cached = defaultStore()
    try {
      saveStore(cached)
    } catch {
      // disk may be read-only; still return in-memory defaults
    }
    return getStoreSnapshot()
  }
}

export function createProfile(
  store: AppStore,
  input: { name: string; age: number; avatar: string },
): { profile: ChildProfile; store: AppStore } {
  const profile: ChildProfile = {
    id: randomUUID(),
    name: input.name.trim() || 'Explorer',
    age: Math.min(12, Math.max(5, Math.round(input.age))),
    avatar: input.avatar || 'jurassic-trex',
    createdAt: new Date().toISOString(),
    placementDone: false,
    readingTier: 0,
    placementConfidence: 35,
    placementReadiness: 30,
    mastery: {},
    streakDays: 0,
    lastPlayDate: null,
    xp: 0,
    level: 1,
    eggsHatched: 0,
    eggProgress: 0,
    stickers: ['welcome'],
    badges: [],
    fossilFinds: 0,
    sessionsPlayed: 0,
    correctStreak: 0,
    pronunciationAttempts: 0,
    pronunciationStars: 0,
    lastDailyBonusDate: null,
  }
  return { profile, store: { ...store, profiles: [...store.profiles, profile] } }
}

export function updateProfile(
  store: AppStore,
  id: string,
  patch: Partial<{ name: string; age: number; avatar: string }>,
): { profile: ChildProfile; store: AppStore } {
  const profiles = store.profiles.map((p) => {
    if (p.id !== id) return p
    return {
      ...p,
      ...patch,
      age: patch.age !== undefined ? Math.min(12, Math.max(5, Math.round(patch.age))) : p.age,
    }
  })
  const profile = profiles.find((p) => p.id === id)
  if (!profile) throw new Error('Profile not found')
  return { profile, store: { ...store, profiles } }
}

export function deleteProfile(store: AppStore, id: string): AppStore {
  return { ...store, profiles: store.profiles.filter((p) => p.id !== id) }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function recordRound(
  store: AppStore,
  payload: {
    profileId: string
    activityId: string
    correct: boolean
    skillTag: string
    tierDelta?: number
  },
): AppStore {
  const day = todayKey()
  const profiles = store.profiles.map((p) => {
    if (p.id !== payload.profileId) return p
    const m = { ...p.mastery }
    const prev = m[payload.skillTag] ?? 0
    m[payload.skillTag] = Math.max(0, Math.min(100, prev + (payload.correct ? 8 : -3)))

    let xp = p.xp + (payload.correct ? 12 : 4)
    let level = p.level
    while (xp >= level * 100) {
      xp -= level * 100
      level += 1
    }

    let streakDays = p.streakDays
    if (p.lastPlayDate !== day) {
      if (p.lastPlayDate) {
        const prevD = new Date(p.lastPlayDate + 'T12:00:00')
        const curD = new Date(day + 'T12:00:00')
        const diff = (curD.getTime() - prevD.getTime()) / 86400000
        if (diff === 1) streakDays += 1
        else if (diff > 1) streakDays = 1
      } else {
        streakDays = 1
      }
    }

    let readingTier = p.readingTier
    if (payload.tierDelta) {
      readingTier = Math.max(0, Math.min(5, readingTier + payload.tierDelta)) as ReadingTier
    } else if (payload.correct) {
      const hi = Object.values(m).filter((v) => v >= 72).length
      if (hi >= 3 && readingTier < 5) readingTier = (readingTier + 1) as ReadingTier
    }

    let eggProgress = p.eggProgress + (payload.correct ? 18 : 6)
    let eggsHatched = p.eggsHatched
    if (eggProgress >= 100) {
      eggProgress -= 100
      eggsHatched += 1
    }

    const nextStreak = payload.correct ? p.correctStreak + 1 : 0
    const stickers = new Set(p.stickers)
    if (payload.correct && nextStreak >= 5) stickers.add('hot-streak')
    if (payload.correct) stickers.add(`act-${payload.activityId}`)

    const badges = [...p.badges]
    if (streakDays === 3 && !badges.includes('streak-3')) badges.push('streak-3')
    if (streakDays === 7 && !badges.includes('streak-7')) badges.push('streak-7')
    if (level >= 5 && !badges.includes('level-5')) badges.push('level-5')

    return {
      ...p,
      mastery: m,
      xp,
      level,
      streakDays,
      lastPlayDate: day,
      readingTier,
      eggProgress,
      eggsHatched,
      stickers: [...stickers],
      badges,
      correctStreak: nextStreak,
      sessionsPlayed: p.sessionsPlayed,
      fossilFinds: p.fossilFinds,
      pronunciationAttempts: p.pronunciationAttempts,
      pronunciationStars: p.pronunciationStars,
    }
  })
  return { ...store, profiles }
}

export function applyPlacement(
  store: AppStore,
  profileId: string,
  result: { tier: ReadingTier; confidence: number; readiness: number },
): AppStore {
  const profiles = store.profiles.map((p) =>
    p.id === profileId
      ? {
          ...p,
          placementDone: true,
          readingTier: result.tier,
          placementConfidence: result.confidence,
          placementReadiness: result.readiness,
          badges: p.badges.includes('placed') ? p.badges : [...p.badges, 'placed'],
        }
      : p,
  )
  return { ...store, profiles }
}

export function updateSettings(store: AppStore, patch: Partial<AppStore['settings']>): AppStore {
  return { ...store, settings: { ...store.settings, ...patch } }
}

export function bumpFossilFind(store: AppStore, profileId: string): AppStore {
  const profiles = store.profiles.map((p) =>
    p.id === profileId ? { ...p, fossilFinds: p.fossilFinds + 1 } : p,
  )
  return { ...store, profiles }
}

export function bumpPronunciation(store: AppStore, profileId: string, stars: number): AppStore {
  const profiles = store.profiles.map((p) =>
    p.id === profileId
      ? {
          ...p,
          pronunciationAttempts: p.pronunciationAttempts + 1,
          pronunciationStars: p.pronunciationStars + stars,
        }
      : p,
  )
  return { ...store, profiles }
}

export function bumpSessionPlayed(store: AppStore, profileId: string): AppStore {
  const profiles = store.profiles.map((p) =>
    p.id === profileId ? { ...p, sessionsPlayed: p.sessionsPlayed + 1 } : p,
  )
  return { ...store, profiles }
}

export function claimDailyBonus(store: AppStore, profileId: string): AppStore {
  const day = todayKey()
  const profiles = store.profiles.map((p) => {
    if (p.id !== profileId) return p
    if (p.lastDailyBonusDate === day) return p
    const stickers = new Set(p.stickers)
    stickers.add('daily-dig')
    return {
      ...p,
      lastDailyBonusDate: day,
      xp: p.xp + 30,
      stickers: [...stickers],
      badges: p.badges.includes('daily') ? p.badges : [...p.badges, 'daily'],
    }
  })
  return { ...store, profiles }
}
