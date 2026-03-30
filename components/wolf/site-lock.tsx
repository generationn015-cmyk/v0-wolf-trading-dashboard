'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const HASH_KEY = 'wolf_site_hash'
const SESSION_KEY = 'wolf_site_unlocked'

const CSS = `
@keyframes wolfBreathe{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.025) translateY(-3px)}}
@keyframes wolfEyeBlink{0%,88%,100%{transform:scaleY(1)}93%{transform:scaleY(0.06)}}
@keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
@keyframes bannerSlide{from{transform:translateY(-100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes contentRise{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes lockShake{0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(8px)}45%{transform:translateX(-5px)}60%{transform:translateX(5px)}80%{transform:translateX(-3px)}}
@keyframes glowPulse{0%,100%{opacity:0.12}50%{opacity:0.28}}
@keyframes tickerScroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.wl-wolf{animation:wolfBreathe 4s ease-in-out infinite}
.wl-eye{animation:wolfEyeBlink 5s ease-in-out infinite;transform-origin:center}
.wl-banner{animation:bannerSlide 0.5s cubic-bezier(0.22,1,0.36,1) forwards}
.wl-content{animation:contentRise 0.7s 0.3s cubic-bezier(0.22,1,0.36,1) both}
.wl-shake{animation:lockShake 0.5s ease-in-out}
.wl-glow{animation:glowPulse 3s ease-in-out infinite}
.wl-ticker{animation:tickerScroll 18s linear infinite}
.wl-confetti{animation:confettiFall var(--dur) var(--delay) linear infinite}
`

async function hashPw(pw: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw + 'wolf-stratton-v3'))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function WolfHead() {
  return (
    <div className="wl-wolf relative inline-block">
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ width: 140, height: 140 }}>
        {/* Glow */}
        <circle cx="60" cy="58" r="50" fill="#f59e0b" opacity="0.06" className="wl-glow" />
        {/* Neck */}
        <path d="M44 96 Q60 90 76 96 L78 120 L42 120Z" fill="#0c0c18" />
        {/* Skull */}
        <path d="M28 68 Q20 52 24 36 Q30 18 60 14 Q90 18 96 36 Q100 52 92 68 Q85 80 72 86 L60 90 L48 86 Q35 80 28 68Z"
          fill="#10101e" stroke="#f59e0b" strokeWidth="1.5" />
        {/* Left ear */}
        <path d="M29 58 L11 14 L42 38Z" fill="#10101e" stroke="#f59e0b" strokeWidth="1.5" />
        <path d="M29 56 L16 18 L40 39Z" fill="#3b0764" opacity="0.8" />
        {/* Right ear */}
        <path d="M91 58 L109 14 L78 38Z" fill="#10101e" stroke="#f59e0b" strokeWidth="1.5" />
        <path d="M91 56 L104 18 L80 39Z" fill="#3b0764" opacity="0.8" />
        {/* Brows — aggressive V */}
        <path d="M26 50 Q38 40 48 48" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M94 50 Q82 40 72 48" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Left eye */}
        <ellipse cx="40" cy="56" rx="9" ry="8" fill="#080814" stroke="#f59e0b" strokeWidth="1.2" />
        <ellipse cx="40" cy="56" rx="6.5" ry="6" fill="#7c2d12" className="wl-eye" />
        <ellipse cx="40" cy="56" rx="3" ry="4.5" fill="#000" />
        <circle cx="42" cy="53" r="1.8" fill="white" opacity="0.9" />
        <ellipse cx="40" cy="56" rx="6.5" ry="6" fill="#f59e0b" opacity="0.15" className="wl-eye" />
        {/* Right eye */}
        <ellipse cx="80" cy="56" rx="9" ry="8" fill="#080814" stroke="#f59e0b" strokeWidth="1.2" />
        <ellipse cx="80" cy="56" rx="6.5" ry="6" fill="#7c2d12" className="wl-eye" />
        <ellipse cx="80" cy="56" rx="3" ry="4.5" fill="#000" />
        <circle cx="82" cy="53" r="1.8" fill="white" opacity="0.9" />
        <ellipse cx="80" cy="56" rx="6.5" ry="6" fill="#f59e0b" opacity="0.15" className="wl-eye" />
        {/* Muzzle */}
        <ellipse cx="60" cy="74" rx="15" ry="12" fill="#0c0c18" stroke="#1f2937" strokeWidth="0.8" />
        {/* Nose */}
        <path d="M53 67 Q60 63 67 67 Q65 73 60 74 Q55 73 53 67Z" fill="#0a0a14" stroke="#374151" strokeWidth="0.6" />
        {/* Snarling mouth */}
        <path d="M46 78 Q53 73 60 73 Q67 73 74 78 Q72 87 60 90 Q48 87 46 78Z" fill="#06060f" />
        {/* Fangs */}
        <path d="M46 77 L43 87 L49 76Z" fill="white" opacity="0.95" />
        <path d="M74 77 L77 87 L71 76Z" fill="white" opacity="0.95" />
        {/* Upper teeth */}
        <rect x="50" y="74" width="3" height="5" rx="1" fill="white" opacity="0.9" />
        <rect x="55" y="73.5" width="3.5" height="5.5" rx="1" fill="white" opacity="0.9" />
        <rect x="61.5" y="73.5" width="3.5" height="5.5" rx="1" fill="white" opacity="0.9" />
        <rect x="67" y="74" width="3" height="5" rx="1" fill="white" opacity="0.9" />
        {/* Tongue */}
        <path d="M52 83 Q60 93 68 83" fill="#dc2626" opacity="0.85" />
        {/* Cheek lines */}
        <path d="M18 64 Q27 68 32 76" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M15 73 Q24 76 28 83" stroke="#1f2937" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M102 64 Q93 68 88 76" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M105 73 Q96 76 92 83" stroke="#1f2937" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
      </svg>
    </div>
  )
}

// Falling money confetti
const CONFETTI = Array.from({ length: 20 }, (_, i) => ({
  left: `${(i * 5.1 + 1.3) % 100}%`,
  dur: `${3 + (i % 5) * 0.8}s`,
  delay: `${(i * 0.4) % 3}s`,
  rotate: i % 2 === 0 ? '12deg' : '-8deg',
  char: i % 3 === 0 ? '$' : i % 3 === 1 ? '💵' : '$',
  size: `${10 + (i % 4) * 3}px`,
  color: i % 2 === 0 ? '#f59e0b' : '#d97706',
}))

interface SiteLockProps { children: React.ReactNode }

export function SiteLock({ children }: SiteLockProps) {
  const [state, setState] = useState<'loading' | 'set' | 'enter' | 'unlocked'>('loading')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!document.getElementById('wl-css')) {
      const s = document.createElement('style'); s.id = 'wl-css'; s.textContent = CSS
      document.head.appendChild(s)
    }
    const stored = localStorage.getItem(HASH_KEY)
    const session = sessionStorage.getItem(SESSION_KEY)
    if (!stored) { setState('set'); return }
    if (session === 'true') { setState('unlocked'); return }
    setState('enter')
  }, [])

  const shake = () => { setShaking(true); setTimeout(() => setShaking(false), 600) }

  const handleSet = async () => {
    if (pw.length < 4) { setError('At least 4 characters'); shake(); return }
    if (pw !== pw2) { setError('Passwords do not match'); shake(); return }
    localStorage.setItem(HASH_KEY, await hashPw(pw))
    sessionStorage.setItem(SESSION_KEY, 'true')
    setState('unlocked')
  }

  const handleEnter = async () => {
    const stored = localStorage.getItem(HASH_KEY)
    if (!stored) { setState('set'); return }
    if (await hashPw(pw) === stored) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setState('unlocked'); setPw('')
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

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col overflow-hidden bg-[#06060e]">

      {/* ── Falling money confetti ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {CONFETTI.map((c, i) => (
          <span key={i} className="wl-confetti absolute top-0 select-none"
            style={{
              left: c.left,
              fontSize: c.size,
              color: c.color,
              transform: `rotate(${c.rotate})`,
              ['--dur' as string]: c.dur,
              ['--delay' as string]: c.delay,
            }}>
            {c.char}
          </span>
        ))}
      </div>

      {/* ── Radial glow behind content ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 55%, rgba(245,158,11,0.07) 0%, transparent 70%)' }} />

      {/* ── TOP BANNER — WoWS yellow ── */}
      <div className="wl-banner relative z-10 w-full bg-[#f59e0b] px-6 py-3 flex flex-col items-center shadow-2xl shadow-amber-500/30">
        {/* Thin black rule above title */}
        <div className="w-full border-t border-black/20 mb-1" />
        <div className="flex flex-col items-center leading-none">
          <span className="text-[11px] font-bold text-black/70 tracking-[0.35em] uppercase mb-0.5">Restricted Terminal</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-black tracking-tight leading-none">THE WOLF</span>
          </div>
          <span className="text-base font-black text-black/80 tracking-[0.2em] uppercase mt-0.5">OF ALL STREETS</span>
        </div>
        <div className="w-full border-b border-black/20 mt-1" />
      </div>

      {/* ── Ticker tape under banner ── */}
      <div className="relative z-10 bg-black w-full overflow-hidden h-6 flex items-center border-b border-amber-500/20">
        <div className="wl-ticker whitespace-nowrap flex gap-12 text-[10px] font-mono text-amber-500/70 font-bold tracking-wider px-4">
          {['BTC +4.2%', 'ETH +3.1%', 'STRATTON OAKMONT', 'AUTHORIZED PERSONNEL ONLY', 'WOLF SYSTEM ACTIVE', 'PAPER MODE ENGAGED', 'BTC +4.2%', 'ETH +3.1%', 'STRATTON OAKMONT', 'AUTHORIZED PERSONNEL ONLY', 'WOLF SYSTEM ACTIVE', 'PAPER MODE ENGAGED'].map((t, i) => (
            <span key={i}>◆ {t}</span>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 wl-content">

        {/* Wolf */}
        <div className="mb-4">
          <WolfHead />
        </div>

        {/* Quote */}
        <blockquote className="text-center max-w-xs mb-8">
          <p className="text-amber-400/80 text-sm italic leading-relaxed font-medium">
            &ldquo;The only thing standing between you and your goal is the story you keep telling yourself.&rdquo;
          </p>
          <cite className="text-zinc-600 text-[10px] mt-1 block not-italic tracking-widest">— Jordan Belfort</cite>
        </blockquote>

        {/* Form */}
        <div className={`w-full max-w-xs space-y-3 ${shaking ? 'wl-shake' : ''}`}>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={pw}
              onChange={e => { setPw(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && (state === 'set' ? (pw2 ? handleSet() : undefined) : handleEnter())}
              placeholder={state === 'set' ? 'Create access code' : 'Access code'}
              autoFocus
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.07] transition-all pr-12"
            />
            <button onClick={() => setShowPw(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
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
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] transition-all py-3.5 text-sm font-black text-black tracking-[0.18em] uppercase shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40">
            {state === 'set' ? 'SECURE THE TERMINAL' : 'ENTER THE FLOOR'}
          </button>
        </div>
      </div>

      {/* ── Bottom bar — mimics WoWS poster footer ── */}
      <div className="relative z-10 w-full border-t border-white/5 bg-black/60 px-6 py-2.5 flex items-center justify-between">
        <span className="text-[9px] text-zinc-700 tracking-[0.3em] uppercase font-bold">Stratton Oakmont Inc.</span>
        <span className="text-[9px] text-zinc-700 tracking-[0.2em] uppercase">Authorized Access Only</span>
        <span className="text-[9px] text-zinc-700 tracking-[0.3em] uppercase font-bold">Wolf System v2</span>
      </div>
    </div>
  )
}

// Export reset function — callable by Wolf when Jefe requests it
export function resetSiteLock() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('wolf_site_hash')
  sessionStorage.removeItem('wolf_site_unlocked')
  window.location.reload()
}
