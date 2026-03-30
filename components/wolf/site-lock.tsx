'use client'

import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const HASH_KEY    = 'wolf_site_hash'
const SESSION_KEY = 'wolf_site_unlocked'

// WoWS quotes — rotate on the lock screen
const QUOTES = [
  { text: "The only thing standing between you and your goal is the story you keep telling yourself.", attr: "Jordan Belfort" },
  { text: "My name is Jordan Belfort. The year I turned 26 I made 49 million dollars, which really pissed me off because it was three shy of a million a week.", attr: "Jordan Belfort" },
  { text: "Act as if! Act as if you're a wealthy man, rich already, and then you'll surely become rich.", attr: "Jordan Belfort" },
  { text: "Winners use words that say 'must' and 'will'. Losers use words that say 'should' and 'might'.", attr: "Jordan Belfort" },
  { text: "I've been a poor man and I've been a rich man. And I choose rich every fucking time.", attr: "Jordan Belfort" },
  { text: "Without action, the best intentions in the world are nothing more than that — intentions.", attr: "Jordan Belfort" },
  { text: "Let me tell you something. There's no nobility in poverty. I've been a poor man, and I've been a rich man. And I choose rich every fucking time.", attr: "Jordan Belfort" },
  { text: "The easiest way to make money is — create something of such value that everybody wants and go out and give and create value, the money comes automatically.", attr: "Jordan Belfort" },
  { text: "I want you to deal with your problems by becoming rich.", attr: "Jordan Belfort" },
  { text: "sell me this pen.", attr: "Jordan Belfort" },
]

// Ticker quotes — same pool as the home screen floor ticker
const TICKER_ITEMS = [
  "BUY OR FUCKING DIE",
  "CLIENT EITHER BUYS STOCK OR I'M COMING TO THEIR HOUSE",
  "I'M NOT FUCKING LEAVING",
  "STRATTON OAKMONT — RESTRICTED ACCESS",
  "WOLF SYSTEM ACTIVE — PAPER MODE",
  "THE SHOW GOES ON",
  "MONEY IS THE OXYGEN OF CAPITALISM",
  "ACT AS IF",
  "50 MILLION BEFORE 30",
  "BTC ◆ ETH ◆ POLYMARKET ◆ KALSHI",
  "AUTHORIZED PERSONNEL ONLY",
]

const CSS = `
@keyframes wlBreathe{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.02) translateY(-3px)}}
@keyframes wlBlink{0%,88%,100%{transform:scaleY(1)}93%{transform:scaleY(0.07)}}
@keyframes wlFadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes wlShake{0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(8px)}45%{transform:translateX(-5px)}60%{transform:translateX(5px)}80%{transform:translateX(-3px)}}
@keyframes wlTicker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes wlQuoteFade{0%{opacity:0;transform:translateY(6px)}15%,85%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-4px)}}
@keyframes wlGlow{0%,100%{opacity:0.08}50%{opacity:0.20}}
.wl-wolf{animation:wlBreathe 4s ease-in-out infinite}
.wl-blink{animation:wlBlink 5s ease-in-out infinite;transform-origin:center}
.wl-fadein{animation:wlFadeIn 0.6s cubic-bezier(0.22,1,0.36,1) both}
.wl-shake{animation:wlShake 0.5s ease-in-out}
.wl-ticker{animation:wlTicker 22s linear infinite}
.wl-quote{animation:wlQuoteFade 6s ease-in-out both}
.wl-glow{animation:wlGlow 3s ease-in-out infinite}
`

async function hashPw(pw: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + 'wolf-stratton-v3'))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// The canonical wolf logo SVG — same as /public/wolf-logo.svg
function WolfLogo({ size = 130 }: { size?: number }) {
  return (
    <div className="wl-wolf relative inline-block">
      <div className="wl-glow absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.3) 0%, transparent 70%)' }} />
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"
        style={{ width: size, height: size, display: 'block' }}>
        {/* Outer head silhouette */}
        <path d="M60 8 L20 22 L10 50 L14 70 L22 85 L38 100 L60 108 L82 100 L98 85 L106 70 L110 50 L100 22 Z" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1.5"/>
        {/* Ear left */}
        <path d="M20 22 L8 2 L30 18 Z" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1.5"/>
        <path d="M20 22 L11 6 L28 20 Z" fill="#7c3aed" opacity="0.6"/>
        {/* Ear right */}
        <path d="M100 22 L112 2 L90 18 Z" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1.5"/>
        <path d="M100 22 L109 6 L92 20 Z" fill="#7c3aed" opacity="0.6"/>
        {/* Face */}
        <path d="M60 30 L44 42 L38 58 L42 72 L60 78 L78 72 L82 58 L76 42 Z" fill="#0d0d1a"/>
        {/* Brow furrow */}
        <path d="M44 38 L52 44" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M76 38 L68 44" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round"/>
        {/* Left eye */}
        <ellipse cx="44" cy="52" rx="9" ry="6" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1.2"/>
        <ellipse cx="44" cy="52" rx="6" ry="4" fill="#b45309" className="wl-blink"/>
        <ellipse cx="44" cy="52" rx="3.5" ry="3.5" fill="#000"/>
        <ellipse cx="44" cy="52" rx="7" ry="5" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.6"/>
        <ellipse cx="44" cy="52" rx="9" ry="6" fill="#f59e0b" opacity="0.12"/>
        <circle cx="46" cy="50" r="1.2" fill="white" opacity="0.8"/>
        {/* Right eye */}
        <ellipse cx="76" cy="52" rx="9" ry="6" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1.2"/>
        <ellipse cx="76" cy="52" rx="6" ry="4" fill="#b45309" className="wl-blink"/>
        <ellipse cx="76" cy="52" rx="3.5" ry="3.5" fill="#000"/>
        <ellipse cx="76" cy="52" rx="7" ry="5" fill="none" stroke="#fbbf24" strokeWidth="0.8" opacity="0.6"/>
        <ellipse cx="76" cy="52" rx="9" ry="6" fill="#f59e0b" opacity="0.12"/>
        <circle cx="78" cy="50" r="1.2" fill="white" opacity="0.8"/>
        {/* Brows — angry slant */}
        <path d="M35 46 L53 49" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" opacity="0.9"/>
        <path d="M85 46 L67 49" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" opacity="0.9"/>
        {/* Nose */}
        <path d="M56 58 L60 64 L64 58" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <ellipse cx="60" cy="66" rx="7" ry="5" fill="#111827"/>
        <ellipse cx="60" cy="65" rx="6" ry="4" fill="#1f2937"/>
        <path d="M54 66 Q60 62 66 66" stroke="#374151" strokeWidth="1" fill="none"/>
        {/* Snarl */}
        <path d="M38 78 Q45 74 52 76 Q56 77 60 76 Q64 77 68 76 Q75 74 82 78" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        {/* Fangs */}
        <path d="M47 76 L44 86 L48 76" fill="white" stroke="#e5e7eb" strokeWidth="0.5"/>
        <path d="M54 76 L53 83 L56 76" fill="white" stroke="#e5e7eb" strokeWidth="0.5"/>
        <path d="M64 76 L67 83 L66 76" fill="white" stroke="#e5e7eb" strokeWidth="0.5"/>
        <path d="M73 76 L76 86 L72 76" fill="white" stroke="#e5e7eb" strokeWidth="0.5"/>
        {/* Lower jaw */}
        <path d="M38 78 Q45 95 60 100 Q75 95 82 78" fill="#0d0d1a" stroke="#374151" strokeWidth="1"/>
        {/* Cheek fur */}
        <path d="M22 55 Q30 58 36 60" stroke="#374151" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
        <path d="M20 62 Q28 64 34 68" stroke="#374151" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        <path d="M98 55 Q90 58 84 60" stroke="#374151" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
        <path d="M100 62 Q92 64 86 68" stroke="#374151" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
        {/* Amber glow rings */}
        <circle cx="60" cy="60" r="56" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.15"/>
        <circle cx="60" cy="60" r="52" fill="none" stroke="#f59e0b" strokeWidth="0.5" opacity="0.10"/>
      </svg>
    </div>
  )
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
  const audioRef                  = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Inject CSS once
    if (typeof document === 'undefined') return
    if (!document.getElementById('wl-css')) {
      const s = document.createElement('style'); s.id = 'wl-css'; s.textContent = CSS
      document.head.appendChild(s)
    }
    // Auth state
    const stored  = localStorage.getItem(HASH_KEY)
    const session = sessionStorage.getItem(SESSION_KEY)
    if (!stored)          { setState('set');      return }
    if (session === 'true') { setState('unlocked'); return }
    setState('enter')
  }, [])

  // Rotate quote every 7 seconds
  useEffect(() => {
    if (state === 'unlocked' || state === 'loading') return
    const interval = setInterval(() => {
      setQuoteFade(false)
      setTimeout(() => {
        setQuoteIdx(i => (i + 1) % QUOTES.length)
        setQuoteFade(true)
      }, 400)
    }, 7000)
    return () => clearInterval(interval)
  }, [state])

  const shake = () => { setShaking(true); setTimeout(() => setShaking(false), 600) }

  const playUnlockSound = () => {
    // Randomly pick 'buy' or 'die'
    const clip = Math.random() < 0.5 ? 'unlock-buy' : 'unlock-die'
    try {
      const audio = new Audio(`/api/wolf/audio/${clip}`)
      audio.volume = 0.8
      audioRef.current = audio
      audio.play().catch(() => {/* autoplay blocked — silent fail */})
    } catch { /* silent fail */ }
  }

  const handleSet = async () => {
    if (pw.length < 4) { setError('At least 4 characters'); shake(); return }
    if (pw !== pw2)    { setError('Passwords do not match'); shake(); return }
    localStorage.setItem(HASH_KEY, await hashPw(pw))
    sessionStorage.setItem(SESSION_KEY, 'true')
    playUnlockSound()
    setState('unlocked')
  }

  const handleEnter = async () => {
    const stored = localStorage.getItem(HASH_KEY)
    if (!stored) { setState('set'); return }
    if (await hashPw(pw) === stored) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setPw('')
      playUnlockSound()
      setState('unlocked')
    } else {
      setError('Access denied'); setPw(''); shake()
    }
  }

  if (state === 'loading') return (
    <div className="fixed inset-0 bg-[#06060e] flex items-center justify-center z-[9999]">
      <div className="h-8 w-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
    </div>
  )
  if (state === 'unlocked') return <>{children}</>

  const quote = QUOTES[quoteIdx]

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#06060e] overflow-hidden">

      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 52%, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />

      {/* ── Ticker tape — top of screen, same quotes as floor home screen ── */}
      <div className="relative z-10 w-full bg-black border-b border-amber-500/25 h-7 flex items-center overflow-hidden shrink-0">
        <div className="wl-ticker whitespace-nowrap flex items-center gap-10 text-[11px] font-mono font-bold tracking-widest text-amber-500/80 px-4">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="shrink-0">◆ {t}</span>
          ))}
        </div>
      </div>

      {/* ── Main body — centered ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 wl-fadein overflow-y-auto py-6">

        {/* Wolf logo */}
        <div className="mb-4">
          <WolfLogo size={120} />
        </div>

        {/* Title */}
        <div className="text-center mb-1">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">
            WOLF <span className="text-amber-500">OF ALL STREETS</span>
          </h1>
          <p className="text-[10px] text-zinc-600 tracking-[0.3em] uppercase mt-1">Mission Control · Restricted Access</p>
        </div>

        {/* Rotating quote */}
        <div className="h-20 flex flex-col items-center justify-center text-center max-w-xs mb-6 mt-3">
          <blockquote
            key={quoteIdx}
            className="wl-quote"
            style={{ opacity: quoteFade ? 1 : 0, transition: 'opacity 0.4s ease' }}
          >
            <p className="text-amber-400/75 text-sm italic leading-relaxed font-medium">
              &ldquo;{quote.text}&rdquo;
            </p>
            <cite className="text-zinc-600 text-[10px] mt-1.5 block not-italic tracking-widest">
              — {quote.attr}
            </cite>
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
                  if (state === 'set') { pw2 && handleSet() }
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

          {error && (
            <p className="text-xs text-red-400 font-bold text-center tracking-wide">{error}</p>
          )}

          <button
            onClick={state === 'set' ? handleSet : handleEnter}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] transition-all py-3.5 text-sm font-black text-black tracking-[0.18em] uppercase shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40"
          >
            {state === 'set' ? 'SECURE THE TERMINAL' : 'ENTER THE FLOOR'}
          </button>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative z-10 w-full border-t border-white/5 bg-black/60 px-6 py-2 flex items-center justify-between shrink-0">
        <span className="text-[9px] text-zinc-700 tracking-[0.3em] uppercase font-bold">Stratton Oakmont Inc.</span>
        <span className="text-[9px] text-zinc-700 tracking-[0.2em] uppercase">Authorized Access Only</span>
        <span className="text-[9px] text-zinc-700 tracking-[0.3em] uppercase font-bold">Wolf System v2</span>
      </div>
    </div>
  )
}

// Call this to wipe the lock (Wolf resets on Jefe's instruction only)
export function resetSiteLock() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(HASH_KEY)
  sessionStorage.removeItem(SESSION_KEY)
  window.location.reload()
}
