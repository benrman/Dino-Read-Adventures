/** Prime Windows / Chromium mic permission before Web Speech API (often fixes silent onerror). */
export async function warmMic(): Promise<{ ok: true } | { ok: false; reason: 'denied' | 'unavailable' }> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { ok: false, reason: 'unavailable' }
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    for (const t of stream.getTracks()) t.stop()
    return { ok: true }
  } catch (e) {
    const name = e instanceof DOMException ? e.name : ''
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return { ok: false, reason: 'denied' }
    }
    return { ok: false, reason: 'unavailable' }
  }
}

export function speechRecognitionErrorMessage(code: string): string {
  const m: Record<string, string> = {
    'not-allowed':
      'Microphone was blocked. Ask a grown-up: Windows Settings → Privacy → Microphone → let desktop apps use the mic, and allow this app.',
    'no-speech': 'No speech detected — tap Listen again and speak right after the click.',
    'audio-capture': 'No microphone was found. Plug in a headset mic or check Sound settings.',
    aborted: 'Listening restarted — tap Listen once more.',
    network:
      'Speech recognition could not reach the speech service. Check internet, then try again (Chromium uses a short online step for dictation).',
    'service-not-allowed': 'Speech recognition is not allowed on this device profile.',
  }
  return m[code] ?? `Speech recognition issue (${code}). Try again or restart the app.`
}
