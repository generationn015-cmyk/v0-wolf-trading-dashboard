'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

// ─── All audio is synthesized via Web Audio API ─────────────────────────────
// This guarantees it works everywhere — no external files, no CDN deps, no CORS

function createCtx(): AudioContext | null {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    return new Ctor()
  } catch { return null }
}

function resumeCtx(ctx: AudioContext) {
  if (ctx.state === 'suspended') ctx.resume()
}

// Intro: dark bass hit + rising synth + terminal ping — "Wolf is online"
function playIntro(ctx: AudioContext) {
  const t = ctx.currentTime

  const bass = ctx.createOscillator(); const bg = ctx.createGain()
  bass.connect(bg); bg.connect(ctx.destination)
  bass.type = 'sine'
  bass.frequency.setValueAtTime(60, t)
  bass.frequency.exponentialRampToValueAtTime(28, t + 0.45)
  bg.gain.setValueAtTime(0.55, t)
  bg.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
  bass.start(t); bass.stop(t + 0.5)

  const rise = ctx.createOscillator(); const rg = ctx.createGain()
  rise.connect(rg); rg.connect(ctx.destination)
  rise.type = 'sawtooth'
  rise.frequency.setValueAtTime(180, t + 0.3)
  rise.frequency.exponentialRampToValueAtTime(540, t + 0.95)
  rg.gain.setValueAtTime(0, t + 0.3)
  rg.gain.linearRampToValueAtTime(0.1, t + 0.45)
  rg.gain.exponentialRampToValueAtTime(0.001, t + 1.0)
  rise.start(t + 0.3); rise.stop(t + 1.0)

  const ping = ctx.createOscillator(); const pg = ctx.createGain()
  ping.connect(pg); pg.connect(ctx.destination)
  ping.type = 'sine'
  ping.frequency.setValueAtTime(1100, t + 0.8)
  pg.gain.setValueAtTime(0, t + 0.8)
  pg.gain.linearRampToValueAtTime(0.18, t + 0.82)
  pg.gain.exponentialRampToValueAtTime(0.001, t + 1.3)
  ping.start(t + 0.8); ping.stop(t + 1.3)
}

// Win: ascending 4-note arpeggio — cash register vibe
function playWin(ctx: AudioContext) {
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

// Loss: descending sawtooth
function playLoss(ctx: AudioContext) {
  const t = ctx.currentTime
  const o = ctx.createOscillator(); const g = ctx.createGain()
  o.connect(g); g.connect(ctx.destination)
  o.type = 'sawtooth'
  o.frequency.setValueAtTime(320, t)
  o.frequency.exponentialRampToValueAtTime(120, t + 0.5)
  g.gain.setValueAtTime(0.14, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.55)
  o.start(t); o.stop(t + 0.6)
}

// ─── Component ────────────────────────────────────────────────────────────────

interface IntroAudioProps {
  soundEnabled: boolean
  onToggle: () => void
  lastTradeResult?: 'win' | 'loss' | null
}

export function IntroAudio({ soundEnabled, onToggle, lastTradeResult }: IntroAudioProps) {
  const ctxRef = useRef<AudioContext | null>(null)
  const introPlayedRef = useRef(false)

  // On enable toggle: immediately create + resume context, play intro
  const handleToggle = () => {
    const willEnable = !soundEnabled
    onToggle()

    if (willEnable) {
      // Create context on this user gesture — guaranteed to work
      if (!ctxRef.current) ctxRef.current = createCtx()
      if (ctxRef.current) {
        resumeCtx(ctxRef.current)
        if (!introPlayedRef.current) {
          introPlayedRef.current = true
          // Small delay so toggle animation renders first
          setTimeout(() => {
            if (ctxRef.current) {
              resumeCtx(ctxRef.current)
              playIntro(ctxRef.current)
            }
          }, 50)
        }
      }
    }
  }

  // Win/loss sounds
  useEffect(() => {
    if (!soundEnabled || !lastTradeResult) return
    if (!ctxRef.current) ctxRef.current = createCtx()
    if (!ctxRef.current) return
    resumeCtx(ctxRef.current)
    if (lastTradeResult === 'win') playWin(ctxRef.current)
    else playLoss(ctxRef.current)
  }, [lastTradeResult, soundEnabled])

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all border ${
        soundEnabled
          ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
          : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
      }`}
      title={soundEnabled ? 'Sound ON — click to mute' : 'Sound OFF — click to enable'}
    >
      {soundEnabled
        ? <Volume2 className="h-3.5 w-3.5 animate-pulse" />
        : <VolumeX className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline text-[11px]">{soundEnabled ? 'AUDIO ON' : 'AUDIO OFF'}</span>
    </button>
  )
}

export { playWin, playLoss, playIntro }
