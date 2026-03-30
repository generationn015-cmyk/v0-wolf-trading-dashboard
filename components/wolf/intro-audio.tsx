'use client'

/**
 * Wolf Audio Engine
 * - Auto-starts on first user interaction anywhere on the page
 * - Plays ambient background atmosphere while browsing
 * - Win/loss SFX fires on trade result changes
 * - soundEnabled state stored in localStorage — toggled from Config tab only
 * - No visible UI element — completely silent/invisible in the DOM
 */

import { useEffect, useRef } from 'react'

const STORAGE_KEY = 'wolf_sound_enabled'

// ── Shared AudioContext singleton ─────────────────────────────────────────
let ctx: AudioContext | null = null
let ambientNode: AudioBufferSourceNode | null = null
let ambientGain: GainNode | null = null
let ambientRunning = false

function getCtx(): AudioContext | null {
  if (ctx && ctx.state !== 'closed') {
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  }
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new Ctor()
    return ctx
  } catch { return null }
}

// ── Synth helpers ─────────────────────────────────────────────────────────
function playTone(
  freq: number,
  type: OscillatorType,
  gainVal: number,
  startOffset: number,
  duration: number,
  freqEnd?: number
) {
  const c = getCtx(); if (!c) return
  const t = c.currentTime + startOffset
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g); g.connect(c.destination)
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + duration)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gainVal, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.001, t + duration)
  o.start(t)
  o.stop(t + duration + 0.05)
}

// Ambient: low, brooding synth hum — plays while browsing
function startAmbient() {
  const c = getCtx(); if (!c || ambientRunning) return
  ambientRunning = true

  // Deep bass drone
  const drone = c.createOscillator()
  const droneGain = c.createGain()
  drone.connect(droneGain); droneGain.connect(c.destination)
  drone.type = 'sine'
  drone.frequency.value = 42
  droneGain.gain.setValueAtTime(0, c.currentTime)
  droneGain.gain.linearRampToValueAtTime(0.06, c.currentTime + 2)
  drone.start()

  // Mid rumble layer
  const mid = c.createOscillator()
  const midGain = c.createGain()
  mid.connect(midGain); midGain.connect(c.destination)
  mid.type = 'triangle'
  mid.frequency.value = 84
  midGain.gain.setValueAtTime(0, c.currentTime)
  midGain.gain.linearRampToValueAtTime(0.025, c.currentTime + 3)
  mid.start()

  // Subtle high shimmer
  const shimmer = c.createOscillator()
  const shimmerGain = c.createGain()
  shimmer.connect(shimmerGain); shimmerGain.connect(c.destination)
  shimmer.type = 'sine'
  shimmer.frequency.value = 528
  shimmerGain.gain.setValueAtTime(0, c.currentTime)
  shimmerGain.gain.linearRampToValueAtTime(0.008, c.currentTime + 4)
  shimmer.start()

  // LFO for subtle movement on drone
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()
  lfo.connect(lfoGain); lfoGain.connect(droneGain.gain)
  lfo.frequency.value = 0.15
  lfoGain.gain.value = 0.02
  lfo.start()

  ambientGain = droneGain
}

function stopAmbient() {
  if (!ctx || !ambientRunning) return
  ambientRunning = false
  try {
    // Fade out — ctx might be closed
    if (ctx.state !== 'closed' && ambientGain) {
      ambientGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5)
    }
  } catch { /* ignore */ }
}

// Boot sound — fires once when audio first activates
function playBoot() {
  // Bass thud
  playTone(55, 'sine', 0.5, 0, 0.6, 28)
  // Rising cinematic hit
  playTone(200, 'sawtooth', 0.08, 0.3, 0.9, 600)
  // Terminal ping
  playTone(1100, 'sine', 0.15, 0.75, 0.6)
  playTone(1320, 'sine', 0.10, 0.9, 0.5)
}

// Win SFX — ascending victory
export function synthWin() {
  [523, 659, 784, 1047].forEach((f, i) => playTone(f, 'sine', 0.18, i * 0.12, 0.55))
}

// Loss SFX — descending groan
export function synthLoss() {
  playTone(320, 'sawtooth', 0.12, 0, 0.6, 110)
  playTone(180, 'sine', 0.08, 0.15, 0.5)
}

// Navigation click tick — very subtle
export function synthClick() {
  playTone(880, 'sine', 0.04, 0, 0.08)
}

// ── Component — invisible, lives in page root ─────────────────────────────
interface IntroAudioProps {
  soundEnabled: boolean
  lastTradeResult?: 'win' | 'loss' | null
}

export function IntroAudio({ soundEnabled, lastTradeResult }: IntroAudioProps) {
  const bootedRef = useRef(false)
  const prevResult = useRef<string | null>(null)

  // Handle soundEnabled toggled ON or OFF from config
  useEffect(() => {
    if (soundEnabled) {
      if (!bootedRef.current) {
        bootedRef.current = true
        getCtx()
        playBoot()
        setTimeout(startAmbient, 1200)
      } else {
        getCtx() // resume if suspended
        if (!ambientRunning) startAmbient()
      }
    } else {
      stopAmbient()
    }
  }, [soundEnabled])

  // Auto-start on first user interaction if soundEnabled
  useEffect(() => {
    if (!soundEnabled) return

    const handler = () => {
      if (bootedRef.current) return
      bootedRef.current = true
      getCtx()
      playBoot()
      setTimeout(startAmbient, 1200)
      // Remove all listeners after first interaction
      ;['click', 'keydown', 'touchstart', 'scroll'].forEach(ev =>
        document.removeEventListener(ev, handler)
      )
    }

    ;['click', 'keydown', 'touchstart', 'scroll'].forEach(ev =>
      document.addEventListener(ev, handler, { passive: true, once: false })
    )

    return () => {
      ;['click', 'keydown', 'touchstart', 'scroll'].forEach(ev =>
        document.removeEventListener(ev, handler)
      )
    }
  }, [soundEnabled])

  // Win/loss reactive SFX
  useEffect(() => {
    if (!soundEnabled || !lastTradeResult) return
    if (lastTradeResult === prevResult.current) return
    prevResult.current = lastTradeResult
    if (lastTradeResult === 'win') synthWin()
    else if (lastTradeResult === 'loss') synthLoss()
  }, [lastTradeResult, soundEnabled])

  // Nothing rendered — completely invisible
  return null
}
