'use client'

import { useState, useEffect, useCallback } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { WolfAnimation } from '@/components/wolf/wolf-animation'

const HASH_KEY    = 'wolf_site_hash'
const SESSION_KEY = 'wolf_site_unlocked'

const QUOTES = [
  { text: "The only thing standing between you and your goal is the story you keep telling yourself.", attr: "Jordan Belfort" },
  { text: "My name is Jordan Belfort. The year I turned 26 I made 49 million dollars — three shy of a million a week.", attr: "Jordan Belfort" },
  { text: "Act as if! Act as if you're a wealthy man, rich already, and then you'll surely become rich.", attr: "Jordan Belfort" },
  { text: "I've been a poor man and I've been a rich man. And I choose rich every fucking time.", attr: "Jordan Belfort" },
  { text: "There's no nobility in poverty. I've been a poor man, and I've been a rich man. I choose rich every fucking time.", attr: "Jordan Belfort" },
  { text: "Winners use words that say 'must' and 'will'. Losers use words that say 'should' and 'might'.", attr: "Jordan Belfort" },
  { text: "Without action, the best intentions in the world are nothing more than that — intentions.", attr: "Jordan Belfort" },
  { text: "I want you to deal with your problems by becoming rich.", attr: "Jordan Belfort" },
  { text: "The easiest way to make money is to create something of such value that everybody wants it.", attr: "Jordan Belfort" },
  { text: "Sell me this pen.", attr: "Jordan Belfort" },
]

const TICKER_ITEMS = [
  "BUY OR FUCKING DIE",
  "CLIENT EITHER BUYS OR I'M COMING TO THEIR HOUSE",
  "I'M NOT FUCKING LEAVING",
  "STRATTON OAKMONT — RESTRICTED ACCESS",
  "WOLF SYSTEM ACTIVE",
  "THE SHOW GOES ON",
  "ACT AS IF",
  "50 MILLION BEFORE 30",
  "AUTHORIZED PERSONNEL ONLY",
  "BTC ◆ ETH ◆ POLYMARKET ◆ KALSHI",
]

const CSS = `
@keyframes wlFadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes wlShake{0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(8px)}45%{transform:translateX(-5px)}60%{transform:translateX(5px)}80%{transform:translateX(-3px)}}
@keyframes wlTicker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.wl-fadein{animation:wlFadeIn 0.55s cubic-bezier(0.22,1,0.36,1) both}
.wl-shake{animation:wlShake 0.5s ease-in-out}
.wl-ticker{animation:wlTicker 20s linear infinite}
`

async function hashPw(pw: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + 'wolf-stratton-v3'))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface SiteLockProps { children: React.ReactNode }

export function SiteLock({ children }: SiteLockProps) {
  const [state, setState]         = useState<'loading' | 'set' | 'enter' | 'unlocked'>('loading')
  const [pw, setPw]               = useState('')
  const [pw2, setPw2]             = useState('')
  const [showPw, setShowPw]       = useState(false)
  const [error, setError]         = useState('')
  const [shaking, setShaking]     = useState(false)
  const [quoteIdx, setQuoteIdx]   = useState(0)
  const [quoteFade, setQuoteFade] = useState(true)

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('wl-css')) {
      const s = document.createElement('style'); s.id = 'wl-css'; s.textContent = CSS
      document.head.appendChild(s)
    }
    const stored  = localStorage.getItem(HASH_KEY)
    const session = sessionStorage.getItem(SESSION_KEY)
    if (!stored)            { setState('set');      return }
    if (session === 'true') { setState('unlocked'); return }
    setState('enter')
  }, [])

  // Rotate quote every 7 seconds
  useEffect(() => {
    if (state === 'unlocked' || state === 'loading') return
    const id = setInterval(() => {
      setQuoteFade(false)
      setTimeout(() => { setQuoteIdx(i => (i + 1) % QUOTES.length); setQuoteFade(true) }, 350)
    }, 7000)
    return () => clearInterval(id)
  }, [state])

  const shake = () => { setShaking(true); setTimeout(() => setShaking(false), 600) }

  // Play unlock sound — called inside the button onClick so it has user-gesture context
  const playUnlockSound = useCallback(() => {
    try {
      const audio = new Audio('/sounds/not-leaving.mp3')
      audio.volume = 0.85
      audio.play().catch(() => {/* silently ignore autoplay blocks */})
    } catch { /* ignore */ }
  }, [])

  const handleSet = useCallback(async () => {
    if (pw.length < 4) { setError('At least 4 characters'); shake(); return }
    if (pw !== pw2)    { setError('Passwords do not match'); shake(); return }
    localStorage.setItem(HASH_KEY, await hashPw(pw))
    sessionStorage.setItem(SESSION_KEY, 'true')
    playUnlockSound()           // ← inside user gesture ✓
    setState('unlocked')
  }, [pw, pw2, playUnlockSound])

  const handleEnter = useCallback(async () => {
    const stored = localStorage.getItem(HASH_KEY)
    if (!stored) { setState('set'); return }
    if (await hashPw(pw) === stored) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setPw('')
      playUnlockSound()         // ← inside user gesture ✓
      setState('unlocked')
    } else {
      setError('Access denied'); setPw(''); shake()
    }
  }, [pw, playUnlockSound])

  if (state === 'loading') return (
    <div className="fixed inset-0 bg-[#06060e] flex items-center justify-center z-[9999]">
      <div className="h-8 w-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
    </div>
  )
  if (state === 'unlocked') return <>{children}</>

  const quote = QUOTES[quoteIdx]

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#06060e] overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 54%, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />

      {/* ── Ticker — top bar, same quotes as floor ── */}
      <div className="relative z-10 w-full bg-black/80 border-b border-amber-500/20 h-7 flex items-center overflow-hidden shrink-0">
        <div className="wl-ticker whitespace-nowrap flex items-center gap-10 text-[10px] font-mono font-bold tracking-[0.15em] text-amber-500/75 px-4">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="shrink-0">◆ {t}</span>
          ))}
        </div>
      </div>

      {/* ── Main centered content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 wl-fadein overflow-y-auto py-8">

        {/* Wolf — same component used throughout the platform */}
        <div className="mb-5">
          <WolfAnimation size={120} />
        </div>

        {/* Title */}
        <div className="text-center mb-1">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">
            WOLF <span className="text-amber-500">OF ALL STREETS</span>
          </h1>
          <p className="text-[10px] text-zinc-600 tracking-[0.3em] uppercase mt-1.5">
            Mission Control · Restricted Access
          </p>
        </div>

        {/* Rotating quote */}
        <div className="h-20 flex flex-col items-center justify-center text-center max-w-sm mb-6 mt-4 px-2">
          <blockquote
            key={quoteIdx}
            style={{ opacity: quoteFade ? 1 : 0, transform: quoteFade ? 'translateY(0)' : 'translateY(4px)', transition: 'opacity 0.35s ease, transform 0.35s ease' }}
          >
            <p className="text-amber-400/75 text-sm italic leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
            <cite className="text-zinc-600 text-[10px] mt-1.5 block not-italic tracking-widest">— {quote.attr}</cite>
          </blockquote>
        </div>

        {/* Form */}
        <div className={`w-full max-w-xs space-y-3 ${shaking ? 'wl-shake' : ''}`}>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={pw}
              onChange={e => { setPw(e.target.value); setError('') }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (state === 'set') { if (pw2) handleSet() }
                  else handleEnter()
                }
              }}
              placeholder={state === 'set' ? 'Create access code' : 'Access code'}
              autoFocus
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.07] transition-all pr-12"
            />
            <button
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {state === 'set' && (
            <input
              type={showPw ? 'text' : 'password'}
              value={pw2}
              onChange={e => { setPw2(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSet()}
              placeholder="Confirm access code"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all"
            />
          )}

          {error && <p className="text-xs text-red-400 font-bold text-center tracking-wide">{error}</p>}

          <button
            onClick={state === 'set' ? handleSet : handleEnter}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] transition-all py-3.5 text-sm font-black text-black tracking-[0.18em] uppercase shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
          >
            {state === 'set' ? 'SECURE THE TERMINAL' : 'ENTER THE FLOOR'}
          </button>
        </div>
      </div>

      {/* ── Bottom footer ── */}
      <div className="relative z-10 w-full border-t border-white/5 bg-black/50 px-6 py-2 flex items-center justify-between shrink-0">
        <span className="text-[9px] text-zinc-700 tracking-[0.3em] uppercase font-bold">Stratton Oakmont Inc.</span>
        <span className="text-[9px] text-zinc-700 tracking-[0.2em] uppercase">Authorized Access Only</span>
        <span className="text-[9px] text-zinc-700 tracking-[0.3em] uppercase font-bold">Wolf System v2</span>
      </div>
    </div>
  )
}

export function resetSiteLock() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(HASH_KEY)
  sessionStorage.removeItem(SESSION_KEY)
  window.location.reload()
}
