'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

// ─── CSS for audio button pulse (injected once) ────────────────────────────
const AUDIO_CSS = `
@keyframes audioPulse {
  0%,100%{transform:scale(1)}
  50%{transform:scale(1.15)}
}
.audio-pulse { animation: audioPulse 1s ease-in-out infinite }
`
function injectAudioCSS() {
  if (typeof document === 'undefined') return
  if (document.getElementById('wolf-audio-css')) return
  const el = document.createElement('style')
  el.id = 'wolf-audio-css'
  el.textContent = AUDIO_CSS
  document.head.appendChild(el)
}

// ─── Web Audio synth sounds — guaranteed fallback ─────────────────────────
let sharedCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (sharedCtx && sharedCtx.state !== 'closed') {
    if (sharedCtx.state === 'suspended') sharedCtx.resume()
    return sharedCtx
  }
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    sharedCtx = new Ctor()
    return sharedCtx
  } catch { return null }
}

function synthIntro() {
  const ctx = getCtx(); if (!ctx) return
  const t = ctx.currentTime
  // Bass thud
  const b = ctx.createOscillator(); const bg = ctx.createGain()
  b.connect(bg); bg.connect(ctx.destination)
  b.type = 'sine'; b.frequency.setValueAtTime(60, t); b.frequency.exponentialRampToValueAtTime(28, t + 0.5)
  bg.gain.setValueAtTime(0.6, t); bg.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
  b.start(t); b.stop(t + 0.55)
  // Rising synth
  const r = ctx.createOscillator(); const rg = ctx.createGain()
  r.connect(rg); rg.connect(ctx.destination)
  r.type = 'sawtooth'; r.frequency.setValueAtTime(180, t + 0.3); r.frequency.exponentialRampToValueAtTime(540, t + 1.0)
  rg.gain.setValueAtTime(0, t + 0.3); rg.gain.linearRampToValueAtTime(0.1, t + 0.45); rg.gain.exponentialRampToValueAtTime(0.001, t + 1.05)
  r.start(t + 0.3); r.stop(t + 1.05)
  // Terminal ping
  const p = ctx.createOscillator(); const pg = ctx.createGain()
  p.connect(pg); pg.connect(ctx.destination)
  p.type = 'sine'; p.frequency.value = 1100
  pg.gain.setValueAtTime(0, t + 0.8); pg.gain.linearRampToValueAtTime(0.2, t + 0.82); pg.gain.exponentialRampToValueAtTime(0.001, t + 1.3)
  p.start(t + 0.8); p.stop(t + 1.3)
}

function synthWin() {
  const ctx = getCtx(); if (!ctx) return
  const t = ctx.currentTime
  ;[523, 659, 784, 1047].forEach((freq, i) => {
    const o = ctx.createOscillator(); const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'sine'; o.frequency.value = freq
    g.gain.setValueAtTime(0, t + i * 0.13)
    g.gain.linearRampToValueAtTime(0.18, t + i * 0.13 + 0.05)
    g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.13 + 0.5)
    o.start(t + i * 0.13); o.stop(t + i * 0.13 + 0.55)
  })
}

function synthLoss() {
  const ctx = getCtx(); if (!ctx) return
  const t = ctx.currentTime
  const o = ctx.createOscillator(); const g = ctx.createGain()
  o.connect(g); g.connect(ctx.destination)
  o.type = 'sawtooth'; o.frequency.setValueAtTime(320, t); o.frequency.exponentialRampToValueAtTime(120, t + 0.55)
  g.gain.setValueAtTime(0.14, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.6)
  o.start(t); o.stop(t + 0.6)
}

// ─── Component ────────────────────────────────────────────────────────────
interface IntroAudioProps {
  soundEnabled: boolean
  onToggle: () => void
  lastTradeResult?: 'win' | 'loss' | null
}

export function IntroAudio({ soundEnabled, onToggle, lastTradeResult }: IntroAudioProps) {
  const introPlayed = useRef(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    injectAudioCSS()
    setMounted(true)
  }, [])

  // Win/loss reactive sounds
  useEffect(() => {
    if (!soundEnabled || !lastTradeResult) return
    if (lastTradeResult === 'win') synthWin()
    else synthLoss()
  }, [lastTradeResult, soundEnabled])

  const handleClick = () => {
    const enabling = !soundEnabled
    onToggle()

    if (enabling) {
      // AudioContext MUST be created on this exact user gesture
      getCtx()
      if (!introPlayed.current) {
        introPlayed.current = true
        setTimeout(synthIntro, 80)
      }
    }
  }

  if (!mounted) return null

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all border ${
        soundEnabled
          ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
          : 'bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-amber-500/30'
      }`}
      title={soundEnabled ? 'Sound ON — click to mute' : 'Sound OFF — click to enable'}
    >
      {soundEnabled
        ? <Volume2 className={`h-3.5 w-3.5 ${soundEnabled ? 'audio-pulse' : ''}`} />
        : <VolumeX className="h-3.5 w-3.5" />
      }
      <span className="hidden sm:inline text-[11px]">{soundEnabled ? 'AUDIO ON' : 'AUDIO OFF'}</span>
    </button>
  )
}

export { synthWin, synthLoss, synthIntro }
