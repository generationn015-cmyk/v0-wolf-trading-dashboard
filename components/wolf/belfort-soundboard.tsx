'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Square, Volume2, VolumeX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Inject CSS once
const CSS = `
@keyframes sbPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(245,158,11,0)}50%{transform:scale(1.04);box-shadow:0 0 0 6px rgba(245,158,11,0)}}
.sb-playing{animation:sbPulse 0.8s ease-in-out infinite}
`
function injectCSS() {
  if (typeof document === 'undefined') return
  if (document.getElementById('sb-css')) return
  const s = document.createElement('style'); s.id = 'sb-css'; s.textContent = CSS
  document.head.appendChild(s)
}

// Web Audio synth fallbacks
let _ctx: AudioContext | null = null
function getCtx() {
  if (_ctx && _ctx.state !== 'closed') { if (_ctx.state === 'suspended') _ctx.resume(); return _ctx }
  try {
    const C = window.AudioContext ?? (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext
    _ctx = new C(); return _ctx
  } catch { return null }
}
function synthTone(freq: number, type: OscillatorType, gain: number, start: number, dur: number, endFreq?: number) {
  const c = getCtx(); if (!c) return
  const t = c.currentTime + start
  const o = c.createOscillator(); const g = c.createGain()
  o.connect(g); g.connect(c.destination)
  o.type = type; o.frequency.setValueAtTime(freq, t)
  if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur)
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  o.start(t); o.stop(t + dur + 0.05)
}

interface Sound {
  id: string
  label: string
  quote: string        // short quote shown on button
  emoji: string
  urls: string[]       // CDN URLs to try in order
  synth: () => void    // fallback synth
  color: string        // tailwind color class
}

const SOUNDS: Sound[] = [
  {
    id: 'not-leaving',
    label: "I'M NOT LEAVING",
    quote: '"I\'m not fucking leaving!"',
    emoji: '🚫',
    urls: [
      'https://www.myinstants.com/media/sounds/im-not-leaving.mp3',
      'https://www.myinstants.com/media/sounds/wolf-of-wall-street-not-leaving.mp3',
    ],
    synth: () => { synthTone(55,'sine',0.5,0,0.5,28); synthTone(200,'sawtooth',0.08,0.3,0.8,600); synthTone(1100,'sine',0.15,0.7,0.5) },
    color: 'amber',
  },
  {
    id: 'sell-pen',
    label: 'SELL ME THIS PEN',
    quote: '"Sell me this pen."',
    emoji: '🖊️',
    urls: [
      'https://www.myinstants.com/media/sounds/sell-me-this-pen.mp3',
      'https://www.myinstants.com/media/sounds/sell-me-this-pen_1.mp3',
    ],
    synth: () => { [523,659,784,1047].forEach((f,i) => synthTone(f,'sine',0.18,i*0.12,0.55)) },
    color: 'emerald',
  },
  {
    id: 'stratton',
    label: 'STRATTON OAKMONT',
    quote: '"Stratton Oakmont IS America."',
    emoji: '🇺🇸',
    urls: [
      'https://www.myinstants.com/media/sounds/stratton-oakmont-is-america.mp3',
    ],
    synth: () => { synthTone(110,'sawtooth',0.12,0,0.4); synthTone(220,'sawtooth',0.08,0.3,0.6); synthTone(440,'sine',0.15,0.7,0.8) },
    color: 'blue',
  },
  {
    id: 'poor-rich',
    label: "POOR MAN / RICH MAN",
    quote: '"I\'ve been poor. I\'ve been rich. I choose rich."',
    emoji: '💰',
    urls: [
      'https://www.myinstants.com/media/sounds/wolf-of-wall-street-poor-rich.mp3',
    ],
    synth: () => { synthTone(80,'sine',0.3,0,0.6,40); synthTone(440,'triangle',0.1,0.5,0.8,880) },
    color: 'yellow',
  },
  {
    id: 'show-goes-on',
    label: 'THE SHOW GOES ON',
    quote: '"The show goes on!"',
    emoji: '🎭',
    urls: [
      'https://www.myinstants.com/media/sounds/the-show-goes-on-wolf.mp3',
    ],
    synth: () => { [330,440,550,660].forEach((f,i) => synthTone(f,'triangle',0.12,i*0.15,0.6)) },
    color: 'purple',
  },
  {
    id: 'drug-money',
    label: 'DRUG MONEY SPEECH',
    quote: '"I take Quaaludes ten to fifteen times a day..."',
    emoji: '💊',
    urls: [
      'https://www.myinstants.com/media/sounds/wolf-quaaludes.mp3',
    ],
    synth: () => { synthTone(150,'sawtooth',0.1,0,1.2,60); synthTone(300,'sine',0.05,0.3,0.9) },
    color: 'red',
  },
  {
    id: 'nobility',
    label: 'NO NOBILITY IN POVERTY',
    quote: '"There\'s no nobility in poverty."',
    emoji: '👑',
    urls: [
      'https://www.myinstants.com/media/sounds/wolf-nobility-poverty.mp3',
    ],
    synth: () => { synthTone(220,'sine',0.15,0,0.8); synthTone(330,'sine',0.1,0.4,0.6) },
    color: 'orange',
  },
  {
    id: 'were-all-gonna',
    label: "WE'RE ALL GONNA BE RICH",
    quote: '"I want you to deal with your problems by becoming rich!"',
    emoji: '🤑',
    urls: [
      'https://www.myinstants.com/media/sounds/wolf-rich-problems.mp3',
    ],
    synth: () => { [261,329,392,523,659].forEach((f,i) => synthTone(f,'sine',0.15,i*0.1,0.5)) },
    color: 'emerald',
  },
]

const COLOR_MAP: Record<string, string> = {
  amber:   'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/60 text-amber-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/60 text-emerald-400',
  blue:    'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 hover:border-blue-500/60 text-blue-400',
  yellow:  'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20 hover:border-yellow-500/60 text-yellow-400',
  purple:  'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-500/60 text-purple-400',
  red:     'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 hover:border-red-500/60 text-red-400',
  orange:  'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/60 text-orange-400',
}

export function BelfortSoundboard() {
  const [playing, setPlaying] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => { injectCSS() }, [])

  function stop() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    setPlaying(null)
  }

  function play(sound: Sound) {
    // Stop anything currently playing
    stop()

    // Create AudioContext on this click (browser policy)
    getCtx()

    function tryCDN(idx: number) {
      if (idx >= sound.urls.length) {
        // All CDN failed — use synth
        sound.synth()
        setPlaying(sound.id)
        setTimeout(() => setPlaying(null), 2000)
        return
      }
      const audio = new Audio()
      audio.volume = 0.85
      audio.crossOrigin = 'anonymous'
      audioRef.current = audio

      let fired = false
      const timeout = setTimeout(() => {
        if (!fired) { fired = true; tryCDN(idx + 1) }
      }, 2500)

      audio.oncanplaythrough = () => {
        if (!fired) {
          fired = true; clearTimeout(timeout)
          audio.play().then(() => {
            setPlaying(sound.id)
            audio.onended = () => setPlaying(null)
          }).catch(() => tryCDN(idx + 1))
        }
      }
      audio.onerror = () => {
        if (!fired) { fired = true; clearTimeout(timeout); tryCDN(idx + 1) }
      }
      audio.src = sound.urls[idx]
    }

    tryCDN(0)
  }

  return (
    <Card className="rounded-2xl bg-[#161624] border border-white/5 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-black flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-amber-500" />
          BELFORT SOUNDBOARD
          <span className="text-xs text-zinc-600 font-normal italic ml-1">Wolf of Wall Street</span>
        </CardTitle>
        <p className="text-[11px] text-zinc-600 italic">"I am a Stratton Oakmont man."</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {SOUNDS.map(sound => {
            const isPlaying = playing === sound.id
            const colors = COLOR_MAP[sound.color] ?? COLOR_MAP.amber
            return (
              <button
                key={sound.id}
                onClick={() => isPlaying ? stop() : play(sound)}
                className={`relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all active:scale-95 ${colors} ${isPlaying ? 'sb-playing' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg">{sound.emoji}</span>
                  {isPlaying
                    ? <Square className="h-3.5 w-3.5 opacity-70" />
                    : <Play className="h-3.5 w-3.5 opacity-40" />
                  }
                </div>
                <span className="text-[10px] font-black tracking-wider leading-tight">{sound.label}</span>
                <span className="text-[9px] opacity-50 italic leading-tight line-clamp-2">{sound.quote}</span>
                {isPlaying && (
                  <div className="absolute bottom-1.5 right-2 flex gap-0.5">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-0.5 bg-current rounded-full"
                        style={{height: 8, animation: `sbBar${i} 0.5s ease-in-out infinite`, animationDelay: `${i*0.12}s`}} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <p className="text-center text-[10px] text-zinc-800 mt-4 italic">
          Click any quote to play · Click again to stop
        </p>
      </CardContent>
    </Card>
  )
}
