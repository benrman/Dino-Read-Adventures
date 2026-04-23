import { useCallback, useState } from 'react'

export function useTTS() {
  const [activeText, setActiveText] = useState<string | null>(null)
  const [activeCharIndex, setActiveCharIndex] = useState<number>(-1)

  const speak = useCallback((text: string, rate = 0.95) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = rate
    u.pitch = 1.05
    u.onstart = () => {
      setActiveText(text)
      setActiveCharIndex(0)
    }
    u.onboundary = (ev) => {
      if (typeof ev.charIndex === 'number') setActiveCharIndex(ev.charIndex)
    }
    u.onend = () => {
      setActiveCharIndex(-1)
      setActiveText(null)
    }
    u.onerror = () => {
      setActiveCharIndex(-1)
      setActiveText(null)
    }
    window.speechSynthesis.speak(u)
  }, [])

  const stop = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    setActiveCharIndex(-1)
    setActiveText(null)
  }, [])

  const speakSequence = useCallback(
    (parts: string[], rate = 0.95) => {
      if (!('speechSynthesis' in window)) return
      window.speechSynthesis.cancel()
      parts
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((part, idx, arr) => {
          const u = new SpeechSynthesisUtterance(part)
          u.rate = rate
          u.pitch = 1.05
          u.onstart = () => {
            setActiveText(part)
            setActiveCharIndex(0)
          }
          u.onboundary = (ev) => {
            if (typeof ev.charIndex === 'number') setActiveCharIndex(ev.charIndex)
          }
          u.onend = () => {
            if (idx === arr.length - 1) {
              setActiveCharIndex(-1)
              setActiveText(null)
            }
          }
          u.onerror = () => {
            setActiveCharIndex(-1)
            setActiveText(null)
          }
          window.speechSynthesis.speak(u)
        })
    },
    [],
  )

  return { speak, speakSequence, stop, activeText, activeCharIndex }
}
