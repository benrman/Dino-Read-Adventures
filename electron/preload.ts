import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('dino', {
  diagPing: () => ipcRenderer.invoke('diag:ping'),
  diagStartupLogPath: () => ipcRenderer.invoke('diag:startupLogPath') as Promise<string>,
  diagDataPaths: () =>
    ipcRenderer.invoke('diag:dataPaths') as Promise<{
      userData: string
      saveFile: string
      startupLog: string
    }>,
  storeGet: () => ipcRenderer.invoke('store:get'),
  storeSave: (store: unknown) => ipcRenderer.invoke('store:save', store),
  profileCreate: (input: { name: string; age: number; avatar: string }) =>
    ipcRenderer.invoke('profile:create', input),
  profileUpdate: (input: { id: string; patch: Partial<{ name: string; age: number; avatar: string }> }) =>
    ipcRenderer.invoke('profile:update', input),
  profileDelete: (id: string) => ipcRenderer.invoke('profile:delete', id),
  placementApply: (payload: {
    profileId: string
    tier: number
    confidence: number
    readiness: number
  }) => ipcRenderer.invoke('placement:apply', payload),
  gameBumpFossil: (profileId: string) => ipcRenderer.invoke('game:bumpFossil', profileId),
  gameBumpPronunciation: (payload: { profileId: string; stars: number }) =>
    ipcRenderer.invoke('game:bumpPronunciation', payload),
  sessionStart: (profileId: string) => ipcRenderer.invoke('session:start', profileId),
  dailyClaim: (profileId: string) => ipcRenderer.invoke('daily:claim', profileId),
  gameRecordRound: (payload: {
    profileId: string
    activityId: string
    correct: boolean
    skillTag: string
    tierDelta?: number
  }) => ipcRenderer.invoke('game:recordRound', payload),
  settingsUpdate: (patch: unknown) => ipcRenderer.invoke('settings:update', patch),
  parentPickVoiceFolder: () => ipcRenderer.invoke('parent:pickVoiceFolder'),
  audioResolveCustomClip: (clipId: string) => ipcRenderer.invoke('audio:resolveCustomClip', clipId),
  geminiPronunciationCoach: (body: {
    apiKey: string
    target: string
    transcript: string
    model?: string
  }) => ipcRenderer.invoke('gemini:pronunciationCoach', body),
  shellOpenPath: (p: string) => ipcRenderer.invoke('shell:openPath', p),
})
