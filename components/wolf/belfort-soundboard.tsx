'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Square, Volume2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const CSS = `
@keyframes sbPulse{0%,100%{opacity:1}50%{opacity:0.4}}
@keyframes sbBar{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}
.sb-bar{display:inline-block;width:2px;background:currentColor;height:10px;border-radius:1px;margin:0 1px;transform-origin:bottom}
.sb-bar:nth-child(1){animation:sbBar 0.5s ease-in-out infinite}
.sb-bar:nth-child(2){animation:sbBar 0.5s ease-in-out infinite 0.15s}
.sb-bar:nth-child(3){animation:sbBar 0.5s ease-in-out infinite 0.3s}
`
function injectCSS() {
  if (typeof document === 'undefined') return
  if (document.getElementById('sb-css')) return
  const s = document.createElement('style'); s.id='sb-css'; s.textContent=CSS
  document.head.appendChild(s)
}

let _ctx: AudioContext | null = null
function getCtx() {
  if (_ctx && _ctx.state !== 'closed') { if (_ctx.state==='suspended') _ctx.resume(); return _ctx }
  try {
    const C = window.AudioContext ?? (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext
    _ctx = new C(); return _ctx
  } catch { return null }
}
function tone(freq: number, type: OscillatorType, gain: number, start: number, dur: number, endFreq?: number) {
  const c=getCtx(); if (!c) return
  const t=c.currentTime+start, o=c.createOscillator(), g=c.createGain()
  o.connect(g); g.connect(c.destination); o.type=type
  o.frequency.setValueAtTime(freq,t)
  if(endFreq) o.frequency.exponentialRampToValueAtTime(endFreq,t+dur)
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(gain,t+0.02); g.gain.exponentialRampToValueAtTime(0.001,t+dur)
  o.start(t); o.stop(t+dur+0.05)
}

interface Sound { id:string; label:string; emoji:string; proxyClip?:string; synth:()=>void; color:string }

const SOUNDS: Sound[] = [
  {
    id:'not-leaving', label:"I'M NOT LEAVING", emoji:'🚫',
    proxyClip: 'not-leaving',
    synth:()=>{ tone(55,'sine',0.5,0,0.5,28); tone(200,'sawtooth',0.08,0.3,0.8,600); tone(1100,'sine',0.15,0.7,0.5) },
    color:'amber',
  },
  {
    id:'sell-pen', label:'SELL ME THIS PEN', emoji:'🖊️',
    // No CDN clip found — Web Audio synth (ascending victory arpeggio)
    synth:()=>{ [523,659,784,1047].forEach((f,i)=>tone(f,'sine',0.2,i*0.13,0.6)) },
    color:'emerald',
  },
  {
    id:'stratton', label:'STRATTON OAKMONT', emoji:'🇺🇸',
    // No CDN clip found — patriotic trumpet synth
    synth:()=>{ [330,440,550,440,550,660].forEach((f,i)=>tone(f,'triangle',0.15,i*0.18,0.25)) },
    color:'blue',
  },
  {
    id:'poverty', label:'NO NOBILITY IN POVERTY', emoji:'👑',
    proxyClip: 'poverty',
    synth:()=>{ tone(220,'sine',0.15,0,0.8); tone(330,'sine',0.1,0.4,0.6) },
    color:'yellow',
  },
  {
    id:'show-goes-on', label:'THE SHOW GOES ON', emoji:'🎭',
    proxyClip: 'show-goes-on',
    synth:()=>{ [330,440,550,660].forEach((f,i)=>tone(f,'triangle',0.12,i*0.15,0.6)) },
    color:'purple',
  },
  {
    id:'choose-rich', label:'I CHOOSE RICH', emoji:'💰',
    // No CDN — triumphant ascending synth
    synth:()=>{ tone(80,'sine',0.3,0,0.6,40); [440,554,659,880].forEach((f,i)=>tone(f,'sine',0.12,0.5+i*0.15,0.5)) },
    color:'orange',
  },
  {
    id:'drugs', label:'DRUG MONEY SPEECH', emoji:'💊',
    // No CDN — brooding low synth
    synth:()=>{ tone(55,'sawtooth',0.15,0,1.5,35); tone(110,'sine',0.06,0.3,1.2) },
    color:'red',
  },
  {
    id:'were-rich', label:"WE'RE ALL GONNA BE RICH", emoji:'🤑',
    // No CDN — hypeman crowd chant synth
    synth:()=>{ [261,329,392,523,659,784].forEach((f,i)=>tone(f,'sine',0.15,i*0.1,0.5)) },
    color:'emerald',
  },
]

const COLORS: Record<string,string> = {
  amber:   'border-amber-500/25 hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400',
  emerald: 'border-emerald-500/25 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400',
  blue:    'border-blue-500/25 hover:border-blue-500/50 hover:bg-blue-500/10 text-blue-400',
  yellow:  'border-yellow-500/25 hover:border-yellow-500/50 hover:bg-yellow-500/10 text-yellow-400',
  purple:  'border-purple-500/25 hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-400',
  red:     'border-red-500/25 hover:border-red-500/50 hover:bg-red-500/10 text-red-400',
  orange:  'border-orange-500/25 hover:border-orange-500/50 hover:bg-orange-500/10 text-orange-400',
}

export function BelfortSoundboard() {
  const [playing, setPlaying] = useState<string|null>(null)
  const audioRef = useRef<HTMLAudioElement|null>(null)

  useEffect(()=>{ injectCSS() },[])

  function stop() {
    if(audioRef.current){ audioRef.current.pause(); audioRef.current=null }
    setPlaying(null)
  }

  function play(sound: Sound) {
    stop()
    getCtx() // unlock AudioContext on this gesture

    if (sound.proxyClip) {
      const audio = new Audio(`/api/wolf/audio/${sound.proxyClip}`)
      audio.volume = 0.9
      audioRef.current = audio
      let timedOut = false
      const t = setTimeout(()=>{ timedOut=true; sound.synth(); setPlaying(sound.id); setTimeout(()=>setPlaying(null),2000) }, 3000)
      audio.oncanplaythrough = ()=>{
        if(timedOut) return
        clearTimeout(t)
        audio.play().then(()=>{ setPlaying(sound.id); audio.onended=()=>setPlaying(null) }).catch(()=>{ sound.synth(); setPlaying(sound.id); setTimeout(()=>setPlaying(null),2000) })
      }
      audio.onerror = ()=>{ if(!timedOut){ clearTimeout(t); sound.synth(); setPlaying(sound.id); setTimeout(()=>setPlaying(null),2000) } }
    } else {
      sound.synth()
      setPlaying(sound.id)
      setTimeout(()=>setPlaying(null), 1800)
    }
  }

  return (
    <Card className="rounded-2xl bg-[#161624] border border-white/5">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm font-black flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-amber-500" />
          BELFORT BOARD
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="grid grid-cols-2 gap-1.5">
          {SOUNDS.map(sound=>{
            const isPlaying = playing===sound.id
            const colors = COLORS[sound.color]??COLORS.amber
            return (
              <button
                key={sound.id}
                onClick={()=>isPlaying ? stop() : play(sound)}
                className={`relative flex items-center gap-2 rounded-lg border bg-white/3 px-2.5 py-2 text-left transition-all active:scale-95 ${colors}`}
              >
                <span className="text-base shrink-0">{sound.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-black tracking-wider leading-tight truncate">{sound.label}</div>
                </div>
                <div className="shrink-0 w-5 flex justify-center">
                  {isPlaying
                    ? <span className="flex items-end gap-px"><span className="sb-bar"/><span className="sb-bar"/><span className="sb-bar"/></span>
                    : <Play className="h-2.5 w-2.5 opacity-30"/>
                  }
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
