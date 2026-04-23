/// <reference types="vite/client" />

declare module '*.png' {
  const src: string
  export default src
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean
  readonly 0: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  readonly transcript: string
}

interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: SpeechRecognitionResultList
}

declare class SpeechRecognition extends EventTarget {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  start(): void
  stop(): void
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null
}
