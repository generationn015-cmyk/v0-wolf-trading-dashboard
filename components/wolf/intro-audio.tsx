'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

// Generates a Wolf of Wall Street-style intro sound using Web Audio API
// No external file needed — synthesized in-browser
function playWolfIntro(ctx: AudioContext) {
  const now = ctx.currentTime

  // Deep bass hit
  const bass = ctx.createOscillator()
  const bassGain = ctx.createGain()
  bass.connect(bassGain)
  bassGain.connect(ctx.destination)
  bass.type = 'sine'
  bass.frequency.setValueAtTime(60, now)
  bass.frequency.exponentialRampToValueAtTime(30, now + 0.4)
  bassGain.gain.setValueAtTime(0.6, now)
  bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
  bass.start(now)
  bass.stop(now + 0.5)

  // Mid punch
  const mid = ctx.createOscillator()
  const midGain = ctx.createGain()
  mid.connect(midGain)
  midGain.connect(ctx.destination)
  mid.type = 'triangle'
  mid.frequency.setValueAtTime(200, now + 0.05)
  mid.frequency.exponentialRampToValueAtTime(80, now + 0.3)
  midGain.gain.setValueAtTime(0.3, now + 0.05)
  midGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
  mid.start(now + 0.05)
  mid.stop(now + 0.4)

  // Rising tone — "wolf is online"
  const rise = ctx.createOscillator()
  const riseGain = ctx.createGain()
  rise.connect(riseGain)
  riseGain.connect(ctx.destination)
  rise.type = 'sawtooth'
  rise.frequency.setValueAtTime(220, now + 0.3)
  rise.frequency.exponentialRampToValueAtTime(440, now + 0.8)
  riseGain.gain.setValueAtTime(0.0, now + 0.3)
  riseGain.gain.linearRampToValueAtTime(0.15, now + 0.45)
  riseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
  rise.start(now + 0.3)
  rise.stop(now + 1.0)

  // High ping — market terminal ready
  const ping = ctx.createOscillator()
  const pingGain = ctx.createGain()
  ping.connect(pingGain)
  pingGain.connect(ctx.destination)
  ping.type = 'sine'
  ping.frequency.setValueAtTime(880, now + 0.7)
  ping.frequency.exponentialRampToValueAtTime(1100, now + 0.75)
  pingGain.gain.setValueAtTime(0.0, now + 0.7)
  pingGain.gain.linearRampToValueAtTime(0.2, now + 0.72)
  pingGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1)
  ping.start(now + 0.7)
  ping.stop(now + 1.2)
}

function playTradeWin(ctx: AudioContext) {
  const now = ctx.currentTime
  // Cash register / positive chime
  const freqs = [523, 659, 784, 1047]
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, now + i * 0.1)
    gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4)
    osc.start(now + i * 0.1)
    osc.stop(now + i * 0.1 + 0.5)
  })
}

function playTradeLoss(ctx: AudioContext) {
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(300, now)
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.4)
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
  osc.start(now)
  osc.stop(now + 0.5)
}

interface IntroAudioProps {
  soundEnabled: boolean
  onToggle: () => void
  lastTradeResult?: 'win' | 'loss' | null
}

export function IntroAudio({ soundEnabled, onToggle, lastTradeResult }: IntroAudioProps) {
  const ctxRef = useRef<AudioContext | null>(null)
  const [played, setPlayed] = useState(false)

  // Play intro on first user interaction (browser autoplay policy)
  useEffect(() => {
    if (!soundEnabled || played) return

    const handleFirst = () => {
      if (played) return
      try {
        ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        playWolfIntro(ctxRef.current)
        setPlayed(true)
      } catch {}
      window.removeEventListener('click', handleFirst)
      window.removeEventListener('touchstart', handleFirst)
    }

    window.addEventListener('click', handleFirst, { once: true })
    window.addEventListener('touchstart', handleFirst, { once: true })
    return () => {
      window.removeEventListener('click', handleFirst)
      window.removeEventListener('touchstart', handleFirst)
    }
  }, [soundEnabled, played])

  // Play win/loss sounds
  useEffect(() => {
    if (!soundEnabled || !lastTradeResult || !ctxRef.current) return
    try {
      if (lastTradeResult === 'win') playTradeWin(ctxRef.current)
      else playTradeLoss(ctxRef.current)
    } catch {}
  }, [lastTradeResult, soundEnabled])

  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all border ${
        soundEnabled
          ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
          : 'bg-secondary border-border text-muted-foreground hover:bg-secondary/80'
      }`}
      title={soundEnabled ? 'Sound ON — click to mute' : 'Sound OFF — click to enable'}
    >
      {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{soundEnabled ? 'SFX ON' : 'SFX OFF'}</span>
    </button>
  )
}

// Export audio utilities for use in other components
export { playTradeWin, playTradeLoss }
