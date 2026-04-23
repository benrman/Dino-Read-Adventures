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

export type AppSettings = {
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

export type AppStore = {
  version: 1
  settings: AppSettings
  profiles: ChildProfile[]
}

export type DinoApi = {
  diagPing: () => Promise<{ ok: true; t: number }>
  diagStartupLogPath: () => Promise<string>
  diagDataPaths: () => Promise<{ userData: string; saveFile: string; startupLog: string }>
  storeGet: () => Promise<AppStore>
  storeSave: (store: AppStore) => Promise<AppStore>
  profileCreate: (input: { name: string; age: number; avatar: string }) => Promise<ChildProfile>
  profileUpdate: (input: {
    id: string
    patch: Partial<{ name: string; age: number; avatar: string }>
  }) => Promise<ChildProfile>
  profileDelete: (id: string) => Promise<boolean>
  placementApply: (payload: {
    profileId: string
    tier: number
    confidence: number
    readiness: number
  }) => Promise<AppStore>
  gameBumpFossil: (profileId: string) => Promise<AppStore>
  gameBumpPronunciation: (payload: { profileId: string; stars: number }) => Promise<AppStore>
  sessionStart: (profileId: string) => Promise<AppStore>
  dailyClaim: (profileId: string) => Promise<AppStore>
  gameRecordRound: (payload: {
    profileId: string
    activityId: string
    correct: boolean
    skillTag: string
    tierDelta?: number
  }) => Promise<AppStore>
  settingsUpdate: (patch: Partial<AppSettings>) => Promise<AppStore>
  parentPickVoiceFolder: () => Promise<string | null>
  audioResolveCustomClip: (clipId: string) => Promise<string | null>
  geminiPronunciationCoach: (body: {
    apiKey: string
    target: string
    transcript: string
    model?: string
  }) => Promise<{ ok: true; text: string } | { ok: false; error: string }>
  shellOpenPath: (p: string) => Promise<void>
}

declare global {
  interface Window {
    /** Present only inside the Electron desktop window (not in a normal browser tab). */
    dino?: DinoApi
  }
}
