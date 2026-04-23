import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AppStore, ChildProfile } from '@shared/types'
import trexBoot from '../assets/jurassic/avatar-trex.png'

const IPC_TIMEOUT_MS = 15000
const IPC_PING_MS = 2000

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    p.then(
      (v) => {
        window.clearTimeout(t)
        resolve(v)
      },
      (e) => {
        window.clearTimeout(t)
        reject(e)
      },
    )
  })
}

type Ctx = {
  store: AppStore | null
  refresh: () => Promise<void>
  profile: (id: string) => ChildProfile | undefined
}

const StoreContext = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<AppStore | null>(null)
  const [bootError, setBootError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setBootError(null)
    const dino = window.dino
    try {
      if (!dino) {
        setBootError(
          'This screen is not running inside the Dino Reading Adventure desktop app, so saved data cannot load. Close this browser tab. From the project folder run: npm run dev — and use only the Electron window that opens (not Chrome). If you installed a .exe, launch that instead.',
        )
        return
      }
      await withTimeout(dino.diagPing(), IPC_PING_MS, 'Desktop link (ping)')
      const s = await withTimeout(dino.storeGet(), IPC_TIMEOUT_MS, 'Loading save data')
      setStore(s)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      let pathsHint = ''
      try {
        if (dino) {
          const paths = await dino.diagDataPaths()
          pathsHint = ` Save file: ${paths.saveFile}. Startup log: ${paths.startupLog}.`
        }
      } catch {
        // ignore
      }
      let logHint = ''
      try {
        if (dino) {
          const logPath = await dino.diagStartupLogPath()
          if (logPath) logHint = ` Log path: ${logPath}.`
        }
      } catch {
        // ignore
      }
      setBootError(
        `Could not load your dig site: ${msg}.${pathsHint}${logHint} If you are using npm run dev, quit and run it again from the project folder. If the problem continues, a grown-up can rename or remove the save file shown above (your progress will reset).`,
      )
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const profile = useCallback(
    (id: string) => store?.profiles.find((p) => p.id === id),
    [store],
  )

  const value = useMemo(() => ({ store, refresh, profile }), [store, refresh, profile])

  if (bootError) {
    return (
      <div className="boot-screen">
        <div className="boot-card" style={{ maxWidth: 520 }}>
          <div className="boot-dino boot-dino--art">
            <img src={trexBoot} alt="" width={120} height={120} />
          </div>
          <h2 style={{ marginTop: 12 }}>Stuck loading?</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.55 }}>{bootError}</p>
          <button type="button" className="btn" style={{ marginTop: 12 }} onClick={() => void refresh()}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="boot-screen">
        <div className="boot-card">
          <div className="boot-dino boot-dino--art">
            <img src={trexBoot} alt="" width={120} height={120} />
          </div>
          <p>Loading your dig site…</p>
        </div>
      </div>
    )
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useAppStore() {
  const v = useContext(StoreContext)
  if (!v) throw new Error('Store missing')
  return v
}
