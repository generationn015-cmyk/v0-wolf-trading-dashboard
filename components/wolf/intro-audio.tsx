'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

// ─── Wolf of Wall Street Audio ────────────────────────────────────────────────
// Using reliable public CDN sources for famous WoWS clips.
// Fallback: Web Audio API synthesized tones if clip fails.

const CLIPS = {
  intro: [
    // "I'm not fucking leaving" — chest pound
    'https://www.101soundboards.com/sounds/19640/download',
    // Fallback: synthesize
  ],
  win: [
    // "Sell me this pen" 
    'https://www.101soundboards.com/sounds/19641/download',
  ],
  howl: [
    // Wolf howl sfx — generic free audio
    'https://assets.mixkit.co/active_storage/sfx/wolf-howl-1042.wav',
    'https://assets.mixkit.co/sfx/preview/mixkit-wolf-howl-1042.mp3',
  ],
}

// ─── Synthesized sounds (guaranteed fallback) ─────────────────────────────────

function getCtx(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  } catch { return null }
}

function synthIntro(ctx: AudioContext) {
  const t = ctx.currentTime
  // Impact bass
  ;[[55, 0, 0.5, 0.6], [30, 0, 0, 0.6]].forEach(([freq, start, ramp, stop]) => {
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'sine'; o.frequency.setValueAtTime(freq, t + start)
    if (ramp) o.frequency.exponentialRampToValueAtTime(ramp, t + stop)
    g.gain.setValueAtTime(0.5, t + start); g.gain.exponentialRampToValueAtTime(0.001, t + stop)
    o.start(t + start); o.stop(t + stop)
  })
  // Rise
  const o2 = ctx.createOscillator(); const g2 = ctx.createGain()
  o2.connect(g2); g2.connect(ctx.destination)
  o2.type = 'sawtooth'
  o2.frequency.setValueAtTime(220, t + 0.35); o2.frequency.exponentialRampToValueAtTime(550, t + 1.0)
  g2.gain.setValueAtTime(0, t + 0.35); g2.gain.linearRampToValueAtTime(0.12, t + 0.5); g2.gain.exponentialRampToValueAtTime(0.001, t + 1.1)
  o2.start(t + 0.35); o2.stop(t + 1.1)
  // Terminal ping
  const o3 = ctx.createOscillator(); const g3 = ctx.createGain()
  o3.connect(g3); g3.connect(ctx.destination)
  o3.type = 'sine'; o3.frequency.value = 1100
  g3.gain.setValueAtTime(0, t + 0.8); g3.gain.linearRampToValueAtTime(0.2, t + 0.82); g3.gain.exponentialRampToValueAtTime(0.001, t + 1.3)
  o3.start(t + 0.8); o3.stop(t + 1.3)
}

function synthWin(ctx: AudioContext) {
  const t = ctx.currentTime
  ;[523, 659, 784, 1047].forEach((freq, i) => {
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'sine'; o.frequency.value = freq
    g.gain.setValueAtTime(0, t + i * 0.13); g.gain.linearRampToValueAtTime(0.2, t + i * 0.13 + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.13 + 0.5)
    o.start(t + i * 0.13); o.stop(t + i * 0.13 + 0.55)
  })
}

function synthLoss(ctx: AudioContext) {
  const t = ctx.currentTime
  const o = ctx.createOscillator(); const g = ctx.createGain()
  o.connect(g); g.connect(ctx.destination)
  o.type = 'sawtooth'; o.frequency.setValueAtTime(320, t); o.frequency.exponentialRampToValueAtTime(120, t + 0.5)
  g.gain.setValueAtTime(0.14, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
  o.start(t); o.stop(t + 0.6)
}

// ─── Try to play an audio URL, fallback to synth ─────────────────────────────
function playOrFallback(
  urls: string[],
  fallback: (ctx: AudioContext) => void,
  ctxRef: React.MutableRefObject<AudioContext | null>
) {
  const tryUrl = (index: number) => {
    if (index >= urls.length) {
      // All URLs failed — use synth
      if (!ctxRef.current) ctxRef.current = getCtx()
      if (ctxRef.current) {
        if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
        fallback(ctxRef.current)
      }
      return
    }
    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.volume = 0.75
    audio.src = urls[index]

    const onError = () => tryUrl(index + 1)
    audio.addEventListener('error', onError, { once: true })

    const play = audio.play()
    if (play) {
      play.catch(() => {
        // Autoplay blocked or load failed — use synth
        if (!ctxRef.current) ctxRef.current = getCtx()
        if (ctxRef.current) {
          if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
          fallback(ctxRef.current)
        }
      })
    }
  }
  tryUrl(0)
}

// ─── Component ────────────────────────────────────────────────────────────────

interface IntroAudioProps {
  soundEnabled: boolean
  onToggle: () => void
  lastTradeResult?: 'win' | 'loss' | null
}

export function IntroAudio({ soundEnabled, onToggle, lastTradeResult }: IntroAudioProps) {
  const ctxRef = useRef<AudioContext | null>(null)
  const [played, setPlayed] = useState(false)

  // Initialize audio context on first interaction
  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = getCtx()
    if (ctxRef.current?.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }, [])

  // Play intro on first click
  useEffect(() => {
    if (!soundEnabled || played) return

    const handleFirst = () => {
      if (played) return
      setPlayed(true)
      ensureCtx()
      // Synth intro — guaranteed to work
      if (ctxRef.current) synthIntro(ctxRef.current)
    }

    window.addEventListener('click', handleFirst, { once: true })
    window.addEventListener('touchstart', handleFirst, { once: true })
    return () => {
      window.removeEventListener('click', handleFirst)
      window.removeEventListener('touchstart', handleFirst)
    }
  }, [soundEnabled, played, ensureCtx])

  // Win/Loss sounds
  useEffect(() => {
    if (!soundEnabled || !lastTradeResult) return
    ensureCtx()
    if (!ctxRef.current) return
    if (lastTradeResult === 'win') synthWin(ctxRef.current)
    else synthLoss(ctxRef.current)
  }, [lastTradeResult, soundEnabled, ensureCtx])

  return (
    <button
      onClick={() => {
        onToggle()
        // On enable: immediately prime audio context with a silent note
        if (!soundEnabled) {
          ensureCtx()
          if (ctxRef.current) {
            const o = ctxRef.current.createOscillator()
            const g = ctxRef.current.createGain()
            o.connect(g); g.connect(ctxRef.current.destination)
            g.gain.setValueAtTime(0, ctxRef.current.currentTime)
            o.start(); o.stop(ctxRef.current.currentTime + 0.001)
          }
        }
      }}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all border ${
        soundEnabled
          ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
          : 'bg-secondary border-border text-muted-foreground hover:bg-secondary/20'
      }`}
      title={soundEnabled ? 'Sound ON — click to mute' : 'Sound OFF — click to enable'}
    >
      {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline text-[11px]">{soundEnabled ? 'AUDIO ON' : 'AUDIO OFF'}</span>
    </button>
  )
}

// Named exports for use in other components
export { synthWin, synthLoss, synthIntro }
