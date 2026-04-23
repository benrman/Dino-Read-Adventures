import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import os from 'node:os'
import {
  loadStore,
  saveStore,
  createProfile,
  updateProfile,
  deleteProfile,
  recordRound,
  updateSettings,
  getStoreSnapshot,
  getStoreSnapshotSafe,
  applyPlacement,
  bumpFossilFind,
  bumpPronunciation,
  bumpSessionPlayed,
  claimDailyBonus,
  type AppStore,
  type ReadingTier,
} from './store'

if (process.env.DINO_DISABLE_GPU === '1') {
  app.disableHardwareAcceleration()
}

function resolveStartupLogPath(): string {
  try {
    return path.join(app.getPath('userData'), 'startup.log')
  } catch {
    return path.join(os.tmpdir(), 'dino-reading-adventure', 'startup.log')
  }
}

function logStartup(message: string) {
  const line = `${new Date().toISOString()} ${message}\n`
  try {
    const p = resolveStartupLogPath()
    fs.mkdirSync(path.dirname(p), { recursive: true })
    fs.appendFileSync(p, line, 'utf-8')
  } catch (e) {
    console.error('[dino] startup log failed', e)
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

logStartup(`main: bundle loaded (APP_ROOT=${process.env.APP_ROOT})`)

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

logStartup(`main: RENDERER_DIST=${RENDERER_DIST}`)

let mainWindow: BrowserWindow | null = null

function attachMediaPermissions(session: import('electron').Session) {
  const allowMic = (p: string) => p === 'media' || p.includes('audio')
  session.setPermissionRequestHandler((_wc, permission, callback) => {
    callback(allowMic(String(permission)))
  })
  session.setPermissionCheckHandler((_wc, permission) => allowMic(String(permission)))
}

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.mjs')
  logStartup(`createWindow: preloadPath=${preloadPath}`)
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'Dino Reading Adventure',
    backgroundColor: '#0f1729',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.webContents.on('preload-error', (_e, pathLoaded, err) => {
    console.error('[dino] Preload failed:', pathLoaded, err)
    logStartup(`preload-error path=${pathLoaded} err=${err instanceof Error ? err.message : String(err)}`)
  })

  mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
    logStartup(`did-fail-load code=${code} desc=${desc} url=${url}`)
  })

  mainWindow.webContents.on('did-finish-load', () => {
    logStartup('did-finish-load')
  })

  mainWindow.webContents.on('dom-ready', () => {
    logStartup('dom-ready')
  })

  mainWindow.webContents.on('render-process-gone', (_e, details) => {
    logStartup(`render-process-gone reason=${details.reason} exitCode=${details.exitCode}`)
  })

  mainWindow.webContents.on('unresponsive', () => {
    logStartup('webContents unresponsive')
  })

  mainWindow.webContents.on('responsive', () => {
    logStartup('webContents responsive again')
  })

  mainWindow.webContents.on('console-message', (_e, level, message, line, sourceId) => {
    if (level >= 2) logStartup(`renderer console L${level}: ${message} (${sourceId}:${line})`)
  })

  attachMediaPermissions(mainWindow.webContents.session)

  if (VITE_DEV_SERVER_URL) {
    logStartup(`loadURL dev=${VITE_DEV_SERVER_URL}`)
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
    if (process.env.OPEN_DEVTOOLS === '1') {
      mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
  } else {
    const indexHtml = path.join(RENDERER_DIST, 'index.html')
    logStartup(`loadFile indexHtml=${indexHtml}`)
    mainWindow.loadFile(indexHtml)
  }
}

function ensureStore() {
  const ud = app.getPath('userData')
  logStartup(`ensureStore start userData=${ud}`)
  const s = loadStore(ud)
  logStartup(`ensureStore done profiles=${s.profiles.length}`)
}

app.whenReady().then(() => {
  logStartup('app whenReady')
  ensureStore()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('diag:ping', () => {
  logStartup('ipc diag:ping')
  return { ok: true as const, t: Date.now() }
})

ipcMain.handle('diag:startupLogPath', () => resolveStartupLogPath())

ipcMain.handle('diag:dataPaths', () => {
  const userData = app.getPath('userData')
  return {
    userData,
    saveFile: path.join(userData, 'dino-reading-data.json'),
    startupLog: resolveStartupLogPath(),
  }
})

ipcMain.handle('store:get', () => {
  const t0 = Date.now()
  logStartup('ipc store:get (start)')
  const snap = getStoreSnapshotSafe(app.getPath('userData'))
  logStartup(`ipc store:get (done ${Date.now() - t0}ms, profiles=${snap.profiles.length})`)
  return snap
})

ipcMain.handle('store:save', (_e, next: AppStore) => {
  saveStore(next)
  return getStoreSnapshot()
})

ipcMain.handle('profile:create', (_e, input: { name: string; age: number; avatar: string }) => {
  const s = getStoreSnapshot()
  const { profile, store } = createProfile(s, input)
  saveStore(store)
  return profile
})

ipcMain.handle(
  'profile:update',
  (_e, input: { id: string; patch: Partial<{ name: string; age: number; avatar: string }> }) => {
    const s = getStoreSnapshot()
    const { profile, store } = updateProfile(s, input.id, input.patch)
    saveStore(store)
    return profile
  },
)

ipcMain.handle('profile:delete', (_e, id: string) => {
  const s = getStoreSnapshot()
  const store = deleteProfile(s, id)
  saveStore(store)
  return true
})

ipcMain.handle(
  'placement:apply',
  (
    _e,
    payload: { profileId: string; tier: ReadingTier; confidence: number; readiness: number },
  ) => {
    const s = getStoreSnapshot()
    const store = applyPlacement(s, payload.profileId, {
      tier: payload.tier,
      confidence: payload.confidence,
      readiness: payload.readiness,
    })
    saveStore(store)
    return getStoreSnapshot()
  },
)

ipcMain.handle('game:bumpFossil', (_e, profileId: string) => {
  const s = getStoreSnapshot()
  const store = bumpFossilFind(s, profileId)
  saveStore(store)
  return getStoreSnapshot()
})

ipcMain.handle('game:bumpPronunciation', (_e, payload: { profileId: string; stars: number }) => {
  const s = getStoreSnapshot()
  const store = bumpPronunciation(s, payload.profileId, payload.stars)
  saveStore(store)
  return getStoreSnapshot()
})

ipcMain.handle('session:start', (_e, profileId: string) => {
  const s = getStoreSnapshot()
  const store = bumpSessionPlayed(s, profileId)
  saveStore(store)
  return getStoreSnapshot()
})

ipcMain.handle('daily:claim', (_e, profileId: string) => {
  const s = getStoreSnapshot()
  const store = claimDailyBonus(s, profileId)
  saveStore(store)
  return getStoreSnapshot()
})

ipcMain.handle(
  'game:recordRound',
  (
    _e,
    payload: {
      profileId: string
      activityId: string
      correct: boolean
      skillTag: string
      tierDelta?: number
    },
  ) => {
    const s = getStoreSnapshot()
    const store = recordRound(s, payload)
    saveStore(store)
    return getStoreSnapshot()
  },
)

ipcMain.handle('settings:update', (_e, patch: Partial<AppStore['settings']>) => {
  const s = getStoreSnapshot()
  const store = updateSettings(s, patch)
  saveStore(store)
  return getStoreSnapshot()
})

ipcMain.handle('parent:pickVoiceFolder', async () => {
  const win = BrowserWindow.getFocusedWindow() ?? mainWindow
  const res = await dialog.showOpenDialog(win!, {
    properties: ['openDirectory'],
    title: 'Choose folder with custom voice clips',
  })
  if (res.canceled || !res.filePaths[0]) return null
  return res.filePaths[0]
})

ipcMain.handle('audio:resolveCustomClip', (_e, clipId: string) => {
  const s = getStoreSnapshot()
  const root = s.settings.customVoiceFolder
  if (!root) return null
  const exts = ['.wav', '.mp3', '.ogg', '.m4a', '.webm']
  for (const ext of exts) {
    const p = path.join(root, `${clipId}${ext}`)
    if (fs.existsSync(p)) return `file:///${p.replace(/\\/g, '/')}`
  }
  return null
})

ipcMain.handle(
  'gemini:pronunciationCoach',
  async (
    _e,
    body: { apiKey: string; target: string; transcript: string; model?: string },
  ): Promise<{ ok: true; text: string } | { ok: false; error: string }> => {
    const key = body.apiKey?.trim()
    if (!key) return { ok: false, error: 'No API key' }
    const model = body.model ?? 'gemini-1.5-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`
    const prompt = `You are a friendly reading coach for a child. They were asked to say: "${body.target}". They said: "${body.transcript}". Give 2-3 short encouraging sentences plus one tiny tip (one phoneme or syllable). No markdown. Under 80 words.`
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }),
      })
      if (!r.ok) {
        const t = await r.text()
        return { ok: false, error: t.slice(0, 200) }
      }
      const j = (await r.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[]
      }
      const text =
        j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? 'Great try! Keep practicing.'
      return { ok: true, text }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Network error' }
    }
  },
)

ipcMain.handle('shell:openPath', (_e, p: string) => {
  shell.openPath(p)
})
