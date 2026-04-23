/**
 * Frees electron-builder locks on dist-release:
 * 1) Stops packaged "Dino Reading Adventure.exe"
 * 2) Stops electron.exe only if its command line contains this repo path (dev server),
 *    so Cursor/VS Code (other Electron apps) are not killed.
 * 3) Retries deleting dist-release/
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const distRelease = path.join(root, 'dist-release')
const rootMarker = root.replace(/\\/g, '/').toLowerCase()

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function killPackagedApp() {
  if (process.platform !== 'win32') return
  try {
    execSync('taskkill /IM "Dino Reading Adventure.exe" /F', { stdio: 'ignore' })
  } catch {
    // not running
  }
}

/** Stop Electron dev instances launched from this repo only. */
function killProjectElectronDevs() {
  if (process.platform !== 'win32') return
  const marker = root.replace(/'/g, "''")
  const ps = [
    '$ErrorActionPreference = "SilentlyContinue"',
    `$marker = '${marker}'`,
    "Get-CimInstance Win32_Process -Filter \"Name='electron.exe'\" | ForEach-Object {",
    '  if ($null -ne $_.CommandLine -and $_.CommandLine.ToLower().Contains($marker.ToLower())) {',
    '    Stop-Process -Id $_.ProcessId -Force',
    '  }',
    '}',
  ].join(' ')
  try {
    execSync(`powershell -NoProfile -NonInteractive -Command "${ps}"`, { stdio: 'ignore' })
  } catch {
    // ignore
  }
}

async function tryRemoveDistRelease() {
  for (let attempt = 0; attempt < 8; attempt++) {
    killPackagedApp()
    killProjectElectronDevs()
    await sleep(attempt === 0 ? 600 : 900)
    try {
      if (fs.existsSync(distRelease)) {
        fs.rmSync(distRelease, { recursive: true, force: true })
      }
      return
    } catch (err) {
      if (attempt === 7) {
        console.error(
          '\n[dino] Still cannot delete dist-release (EBUSY on app.asar). Try:\n' +
            '  • Close File Explorer if it is open inside dist-release\\win-unpacked\n' +
            '  • Pause antivirus / Windows Defender real-time scan on this folder\n' +
            '  • Run: npm run build:fresh-out   (writes portable build to dist-pack-out/ instead)\n' +
            `  • Repo path marker used for dev Electron: ${rootMarker}\n`,
        )
        throw err
      }
    }
  }
}

await tryRemoveDistRelease()
console.log('[dino] dist-release cleared (or did not exist).')
