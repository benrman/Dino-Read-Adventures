# Dino Reading Adventure

Offline Windows-friendly reading game (Electron + Vite + React + TypeScript). See `REPO_ROOT.txt` for the canonical repo path on this machine.

## Development

```bash
npm install
npm run dev
```

Use only the **Electron window** that opens (not a separate browser tab), so `window.dino` IPC is available.

## Production build

```bash
npm run build
```

`npm run build` first runs **`unlock:dino`**, which stops **`Dino Reading Adventure.exe`** (if running) and deletes **`dist-release/`** so `app.asar` is not locked. If the build still fails with “file is being used by another process”, close your **`npm run dev`** Electron window, close **File Explorer** inside `dist-release\win-unpacked`, then run **`npm run unlock:dino`** manually and build again.

To skip the unlock step (CI only, when `dist-release` is already clean): **`npm run build:only`**.

If **`dist-release`** cannot be deleted (antivirus, Explorer, or an unknown handle on `app.asar`), use a **separate output folder**:

```bash
npm run build:fresh-out
```

Portable exe: **`dist-pack-out\Dino Reading Adventure 1.0.0.exe`**. When nothing is locking the old folder anymore, you can delete **`dist-release`** manually and go back to **`npm run build`**.

Outputs:

- Renderer: `dist/`
- Main + preload: `dist-electron/`
- Packaged Windows **portable** `.exe` and **dir** output: **`dist-release/`** (default), or **`dist-pack-out/`** if you use the alternate command below.

## Windows rebuild hygiene

`npm run build` tries to clear this automatically. If you still see **`app.asar` in use**:

1. Quit the packaged **Dino Reading Adventure** window (the script sends `taskkill` for that exe).
2. Quit **`npm run dev`** and close its Electron window (otherwise it may hold files under this repo).
3. Close **File Explorer** if it is browsing `dist-release\win-unpacked` (Explorer locks `app.asar`).
4. Run **`npm run unlock:dino`**, then **`npm run build`** again.

Do **not** blanket-kill every `electron.exe` on the machine—that can close **Cursor** or **VS Code** (they are Electron apps).

## Diagnostics

- Save data: `%APPDATA%\dino-reading-adventure\dino-reading-data.json`
- Startup log: `%APPDATA%\dino-reading-adventure\startup.log`

Set `DINO_DISABLE_GPU=1` before launch to call `app.disableHardwareAcceleration()` (useful if GPU-related hangs occur).
