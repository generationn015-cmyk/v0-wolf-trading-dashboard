'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

// ─── Wolf of Wall Street Audio Clips ─────────────────────────────────────────
// Sourced from public YouTube audio extracts via yt-dlp proxied CDN.
// We use Howler-style lazy loading via <audio> tags with canplaythrough.
// All clips are short (<10s), famous scenes only.

const WOWS_CLIPS = [
  {
    id: 'not_leaving',
    label: 'Not Leaving',
    // "I'm not fucking leaving!" — chest pound scene
    url: 'https://www.myinstants.com/media/sounds/im-not-leaving.mp3',
    fallback: 'https://assets.mixkit.co/sfx/preview/mixkit-cinematic-mystery-drums-1070.mp3',
    trigger: 'intro',
  },
  {
    id: 'sell_me_pen',
    label: 'Sell Me This Pen',
    // "Sell me this pen" — iconic sales scene
    url: 'https://www.myinstants.com/media/sounds/sell-me-this-pen.mp3',
    fallback: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3',
    trigger: 'win',
  },
  {
    id: 'stratton_oakmont',
    label: 'Stratton Oakmont IS America',
    url: 'https://www.myinstants.com/media/sounds/stratton-oakmont-is-america.mp3',
    fallback: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
    trigger: 'big_win',
  },
]

// Synthesized fallback sounds (no external deps)
function playIntroTone(ctx: AudioContext) {
  const now = ctx.currentTime
  // Bass
  const osc1 = ctx.createOscillator(); const g1 = ctx.createGain()
  osc1.connect(g1); g1.connect(ctx.destination)
  osc1.type = 'sine'; osc1.frequency.setValueAtTime(55, now)
  osc1.frequency.exponentialRampToValueAtTime(30, now + 0.5)
  g1.gain.setValueAtTime(0.5, now); g1.gain.exponentialRampToValueAtTime(0.001, now + 0.6)
  osc1.start(now); osc1.stop(now + 0.6)
  // Rise
  const osc2 = ctx.createOscillator(); const g2 = ctx.createGain()
  osc2.connect(g2); g2.connect(ctx.destination)
  osc2.type = 'sawtooth'; osc2.frequency.setValueAtTime(220, now + 0.3)
  osc2.frequency.exponentialRampToValueAtTime(550, now + 0.9)
  g2.gain.setValueAtTime(0, now + 0.3); g2.gain.linearRampToValueAtTime(0.12, now + 0.45)
  g2.gain.exponentialRampToValueAtTime(0.001, now + 1.0)
  osc2.start(now + 0.3); osc2.stop(now + 1.0)
  // Ping
  const osc3 = ctx.createOscillator(); const g3 = ctx.createGain()
  osc3.connect(g3); g3.connect(ctx.destination)
  osc3.type = 'sine'; osc3.frequency.setValueAtTime(880, now + 0.75)
  g3.gain.setValueAtTime(0, now + 0.75); g3.gain.linearRampToValueAtTime(0.18, now + 0.78)
  g3.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
  osc3.start(now + 0.75); osc3.stop(now + 1.2)
}

function playWinTone(ctx: AudioContext) {
  const now = ctx.currentTime
  const freqs = [523, 659, 784, 1047]
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator(); const g = ctx.createGain()
    osc.connect(g); g.connect(ctx.destination)
    osc.type = 'sine'; osc.frequency.value = freq
    g.gain.setValueAtTime(0, now + i * 0.12)
    g.gain.linearRampToValueAtTime(0.18, now + i * 0.12 + 0.05)
    g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.45)
    osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.5)
  })
}

function playLossTone(ctx: AudioContext) {
  const now = ctx.currentTime
  const osc = ctx.createOscillator(); const g = ctx.createGain()
  osc.connect(g); g.connect(ctx.destination)
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(320, now)
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.5)
  g.gain.setValueAtTime(0.14, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.55)
  osc.start(now); osc.stop(now + 0.6)
}

// ─── Component ────────────────────────────────────────────────────────────────

interface IntroAudioProps {
  soundEnabled: boolean
  onToggle: () => void
  lastTradeResult?: 'win' | 'loss' | null
}

export function IntroAudio({ soundEnabled, onToggle, lastTradeResult }: IntroAudioProps) {
  const ctxRef = useRef<AudioContext | null>(null)
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})
  const [played, setPlayed] = useState(false)
  const [clipsLoaded, setClipsLoaded] = useState(false)

  // Pre-load audio elements
  useEffect(() => {
    if (typeof window === 'undefined') return
    WOWS_CLIPS.forEach(clip => {
      const el = new Audio()
      el.preload = 'none' // only load on demand
      el.volume = 0.7
      audioRefs.current[clip.id] = el
    })
    setClipsLoaded(true)
  }, [])

  const getAudioCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return ctxRef.current
  }, [])

  const playClip = useCallback((clipId: string) => {
    const clip = WOWS_CLIPS.find(c => c.id === clipId)
    if (!clip) return
    const el = audioRefs.current[clipId]
    if (!el) return
    // Try primary URL
    el.src = clip.url
    const playPromise = el.play()
    if (playPromise) {
      playPromise.catch(() => {
        // Fallback to synth if clip fails
        try {
          const ctx = getAudioCtx()
          if (clipId === 'not_leaving') playIntroTone(ctx)
          else if (clipId === 'sell_me_pen') playWinTone(ctx)
          else playWinTone(ctx)
        } catch {}
      })
    }
  }, [getAudioCtx])

  // Intro on first interaction
  useEffect(() => {
    if (!soundEnabled || played || !clipsLoaded) return

    const handleFirst = () => {
      if (played) return
      setPlayed(true)
      playClip('not_leaving')
      window.removeEventListener('click', handleFirst)
      window.removeEventListener('touchstart', handleFirst)
    }

    window.addEventListener('click', handleFirst, { once: true })
    window.addEventListener('touchstart', handleFirst, { once: true })
    return () => {
      window.removeEventListener('click', handleFirst)
      window.removeEventListener('touchstart', handleFirst)
    }
  }, [soundEnabled, played, clipsLoaded, playClip])

  // Win / Loss sounds
  useEffect(() => {
    if (!soundEnabled || !lastTradeResult) return
    if (lastTradeResult === 'win') {
      playClip('sell_me_pen')
    } else {
      try {
        const ctx = getAudioCtx()
        playLossTone(ctx)
      } catch {}
    }
  }, [lastTradeResult, soundEnabled, playClip, getAudioCtx])

  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all border ${
        soundEnabled
          ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
          : 'bg-secondary border-border text-muted-foreground hover:bg-secondary/80'
      }`}
      title={soundEnabled ? 'WoWS Audio ON' : 'WoWS Audio OFF'}
    >
      {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{soundEnabled ? 'AUDIO' : 'MUTED'}</span>
    </button>
  )
}

export { playWinTone, playLossTone }
