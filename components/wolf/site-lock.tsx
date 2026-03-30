'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const HASH_KEY = 'wolf_site_hash'
const SESSION_KEY = 'wolf_site_unlocked'

// CSS injected once — wolf animations + lock screen styles
const CSS = `
@keyframes lockWolfBreathe{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.03) translateY(-4px)}}
@keyframes lockWolfEye{0%,88%,100%{transform:scaleY(1)}93%{transform:scaleY(0.08)}}
@keyframes lockGlow{0%,100%{box-shadow:0 0 30px 8px rgba(245,158,11,0.15)}50%{box-shadow:0 0 60px 20px rgba(245,158,11,0.30)}}
@keyframes lockShake{0%,100%{transform:translateX(0)}15%{transform:translateX(-10px)}30%{transform:translateX(10px)}45%{transform:translateX(-7px)}60%{transform:translateX(7px)}75%{transform:translateX(-4px)}90%{transform:translateX(4px)}}
@keyframes lockPulse{0%,100%{opacity:0.5}50%{opacity:1}}
@keyframes lockFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.lock-wolf{animation:lockWolfBreathe 4s ease-in-out infinite}
.lock-eye{animation:lockWolfEye 5s ease-in-out infinite;transform-origin:center}
.lock-glow{animation:lockGlow 3s ease-in-out infinite}
.lock-pulse{animation:lockPulse 2s ease-in-out infinite}
.lock-shake{animation:lockShake 0.5s ease-in-out}
.lock-fadein{animation:lockFadeIn 0.6s ease-out forwards}
`
function injectCSS() {
  if (typeof document==='undefined') return
  if (document.getElementById('lock-css')) return
  const s=document.createElement('style'); s.id='lock-css'; s.textContent=CSS
  document.head.appendChild(s)
}

async function hashPw(pw: string): Promise<string> {
  const encoded = new TextEncoder().encode(pw + 'wolf-stratton-oakmont-site-v2')
  const buf = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')
}

// Animated wolf SVG — aggressive howling pose
function LockWolf() {
  return (
    <div className="lock-wolf relative">
      {/* Outer glow ring */}
      <div className="lock-glow absolute inset-0 rounded-full pointer-events-none" />
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{width:160,height:160,display:'block'}}>

        {/* ── Neck / body suggestion ── */}
        <path d="M44 95 Q60 88 76 95 L78 120 L42 120Z" fill="#0d0d1a" stroke="#1f2937" strokeWidth="0.8"/>

        {/* ── Skull ── */}
        <path d="M28 65 Q20 50 24 35 Q30 18 60 14 Q90 18 96 35 Q100 50 92 65 Q85 78 72 84 L60 88 L48 84 Q35 78 28 65Z"
          fill="#111827" stroke="#f59e0b" strokeWidth="1.2"/>

        {/* ── Ears ── */}
        {/* Left ear */}
        <path d="M28 55 L12 15 L40 38Z" fill="#111827" stroke="#f59e0b" strokeWidth="1.2"/>
        <path d="M28 53 L16 19 L38 39Z" fill="#4c1d95" opacity="0.7"/>
        {/* Right ear */}
        <path d="M92 55 L108 15 L80 38Z" fill="#111827" stroke="#f59e0b" strokeWidth="1.2"/>
        <path d="M92 53 L104 19 L82 39Z" fill="#4c1d95" opacity="0.7"/>

        {/* ── Forehead fur ── */}
        <path d="M38 28 Q60 20 82 28" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M42 23 Q60 16 78 23" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

        {/* ── Angry brows ── */}
        <path d="M28 48 Q38 40 48 47" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M92 48 Q82 40 72 47" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

        {/* ── Eyes ── */}
        {/* Left */}
        <ellipse cx="40" cy="54" rx="9" ry="8" fill="#0a0a18" stroke="#f59e0b" strokeWidth="1"/>
        <ellipse cx="40" cy="54" rx="7" ry="6" fill="#92400e" className="lock-eye"/>
        <ellipse cx="40" cy="54" rx="3.5" ry="5" fill="#000"/>
        <circle cx="42" cy="51.5" r="1.5" fill="white" opacity="0.9"/>
        <circle cx="38.5" cy="56" r="0.8" fill="white" opacity="0.5"/>
        <ellipse cx="40" cy="54" rx="7" ry="6" fill="#f59e0b" opacity="0.18" className="lock-eye"/>
        {/* Right */}
        <ellipse cx="80" cy="54" rx="9" ry="8" fill="#0a0a18" stroke="#f59e0b" strokeWidth="1"/>
        <ellipse cx="80" cy="54" rx="7" ry="6" fill="#92400e" className="lock-eye"/>
        <ellipse cx="80" cy="54" rx="3.5" ry="5" fill="#000"/>
        <circle cx="82" cy="51.5" r="1.5" fill="white" opacity="0.9"/>
        <circle cx="78.5" cy="56" r="0.8" fill="white" opacity="0.5"/>
        <ellipse cx="80" cy="54" rx="7" ry="6" fill="#f59e0b" opacity="0.18" className="lock-eye"/>

        {/* ── Muzzle ── */}
        <ellipse cx="60" cy="72" rx="16" ry="13" fill="#0d0d1a" stroke="#374151" strokeWidth="0.8"/>

        {/* ── Nose ── */}
        <path d="M52 66 Q60 62 68 66 Q66 72 60 73 Q54 72 52 66Z" fill="#111827" stroke="#4b5563" strokeWidth="0.7"/>
        <ellipse cx="56" cy="67.5" rx="2" ry="1.5" fill="#000" opacity="0.7"/>
        <ellipse cx="64" cy="67.5" rx="2" ry="1.5" fill="#000" opacity="0.7"/>

        {/* ── Open snarling mouth ── */}
        <path d="M45 77 Q53 72 60 72 Q67 72 75 77 Q73 85 60 88 Q47 85 45 77Z" fill="#0a0010"/>
        {/* Upper teeth */}
        <rect x="50" y="73" width="3" height="5.5" rx="1" fill="white" opacity="0.95"/>
        <rect x="55" y="72.5" width="3.5" height="6" rx="1" fill="white" opacity="0.95"/>
        <rect x="61" y="72.5" width="3.5" height="6" rx="1" fill="white" opacity="0.95"/>
        <rect x="66.5" y="73" width="3" height="5.5" rx="1" fill="white" opacity="0.95"/>
        {/* Fangs */}
        <path d="M46 76 L43 84 L48 76" fill="white" opacity="0.92"/>
        <path d="M74 76 L77 84 L72 76" fill="white" opacity="0.92"/>
        {/* Lower teeth */}
        <rect x="52" y="82" width="3" height="4" rx="0.8" fill="#e5e7eb" opacity="0.7"/>
        <rect x="57" y="83" width="3" height="3.5" rx="0.8" fill="#e5e7eb" opacity="0.7"/>
        <rect x="62" y="83" width="3" height="3.5" rx="0.8" fill="#e5e7eb" opacity="0.7"/>
        {/* Tongue */}
        <path d="M52 81 Q60 90 68 81" fill="#dc2626" opacity="0.9" stroke="#b91c1c" strokeWidth="0.5"/>

        {/* ── Cheek fur ── */}
        <path d="M20 62 Q28 65 33 72" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M17 70 Q25 72 30 79" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M100 62 Q92 65 87 72" stroke="#1f2937" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M103 70 Q95 72 90 79" stroke="#1f2937" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6"/>

        {/* ── Ambient outer ring ── */}
        <circle cx="60" cy="55" r="54" fill="none" stroke="#f59e0b" strokeWidth="0.5" opacity="0.12" className="lock-eye"/>
      </svg>
    </div>
  )
}

interface SiteLockProps { children: React.ReactNode }

export function SiteLock({ children }: SiteLockProps) {
  const [state, setState] = useState<'loading'|'set'|'enter'|'unlocked'>('loading')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [resetConfirm, setResetConfirm] = useState('')

  useEffect(()=>{
    injectCSS()
    const stored = localStorage.getItem(HASH_KEY)
    const session = sessionStorage.getItem(SESSION_KEY)
    if (!stored) { setState('set'); return }
    if (session==='true') { setState('unlocked'); return }
    setState('enter')
  },[])

  const shake = () => { setShaking(true); setTimeout(()=>setShaking(false),600) }

  const handleSet = async () => {
    if (pw.length<4) { setError('At least 4 characters'); shake(); return }
    if (pw!==pw2) { setError('Passwords do not match'); shake(); return }
    const hash = await hashPw(pw)
    localStorage.setItem(HASH_KEY, hash)
    sessionStorage.setItem(SESSION_KEY,'true')
    setState('unlocked')
  }

  const handleEnter = async () => {
    const stored = localStorage.getItem(HASH_KEY)
    if (!stored) { setState('set'); return }
    const hash = await hashPw(pw)
    if (hash===stored) {
      sessionStorage.setItem(SESSION_KEY,'true')
      setState('unlocked'); setPw('')
    } else {
      setError('Wrong password'); setPw(''); shake()
    }
  }

  const handleReset = () => {
    if (resetConfirm.toUpperCase() !== 'RESET') { setError('Type RESET to confirm'); return }
    localStorage.removeItem(HASH_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    setPw(''); setPw2(''); setError(''); setResetConfirm('')
    setShowReset(false)
    setState('set')
  }

  if (state==='loading') return (
    <div className="fixed inset-0 bg-[#080810] flex items-center justify-center z-[9999]">
      <div className="h-8 w-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin"/>
    </div>
  )

  if (state==='unlocked') return <>{children}</>

  return (
    <div className="fixed inset-0 bg-[#060610] flex items-center justify-center z-[9999] overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/4 rounded-full blur-[120px]"/>
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.015]"
          style={{backgroundImage:'repeating-linear-gradient(0deg,#f59e0b,#f59e0b 1px,transparent 1px,transparent 60px),repeating-linear-gradient(90deg,#f59e0b,#f59e0b 1px,transparent 1px,transparent 60px)'}}/>
      </div>

      <div className="relative w-full max-w-sm mx-4 lock-fadein">

        {/* Wolf */}
        <div className="flex justify-center mb-4">
          <LockWolf />
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">
            WOLF <span className="text-amber-500">OF ALL STREETS</span>
          </h1>
        </div>

        {/* WoWS quote */}
        <div className="text-center mb-8 px-2">
          <p className="text-amber-400/60 text-sm italic font-medium leading-relaxed lock-pulse">
            "The only thing standing between you and your goal is the bullshit story you keep telling yourself."
          </p>
          <p className="text-zinc-700 text-[10px] mt-1">— Jordan Belfort</p>
        </div>

        {/* Form */}
        {!showReset ? (
          <div className={`space-y-3 ${shaking ? 'lock-shake' : ''}`}>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={pw}
                onChange={e=>{ setPw(e.target.value); setError('') }}
                onKeyDown={e=>e.key==='Enter' && (state==='set' ? (pw2 ? handleSet() : undefined) : handleEnter())}
                placeholder="Password"
                autoFocus
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 focus:bg-white/7 transition-all pr-11"
              />
              <button onClick={()=>setShowPw(v=>!v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                {showPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
              </button>
            </div>

            {state==='set' && (
              <input
                type={showPw ? 'text' : 'password'}
                value={pw2}
                onChange={e=>{ setPw2(e.target.value); setError('') }}
                onKeyDown={e=>e.key==='Enter' && handleSet()}
                placeholder="Confirm password"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 transition-all"
              />
            )}

            {error && <p className="text-xs text-red-400 font-bold text-center">{error}</p>}

            <button
              onClick={state==='set' ? handleSet : handleEnter}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all py-3.5 text-sm font-black text-black tracking-widest"
            >
              {state==='set' ? 'SECURE & ENTER' : 'ENTER THE TERMINAL'}
            </button>

            {state==='enter' && (
              <button
                onClick={()=>{ setShowReset(true); setError('') }}
                className="w-full text-[11px] text-zinc-700 hover:text-zinc-500 transition-colors py-1 text-center"
              >
                Forgot password?
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-xs font-bold text-red-400 mb-1">Reset Site Password</p>
              <p className="text-[11px] text-zinc-500">This clears your stored password. You will set a new one. Type <span className="font-bold text-white">RESET</span> to confirm.</p>
            </div>
            <input
              type="text"
              value={resetConfirm}
              onChange={e=>{ setResetConfirm(e.target.value); setError('') }}
              onKeyDown={e=>e.key==='Enter' && handleReset()}
              placeholder="Type RESET to confirm"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/40 transition-all"
            />
            {error && <p className="text-xs text-red-400 font-bold text-center">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={()=>{ setShowReset(false); setResetConfirm(''); setError('') }}
                className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all py-3 text-sm font-bold text-zinc-400"
              >Cancel</button>
              <button
                onClick={handleReset}
                className="flex-1 rounded-xl bg-red-500/80 hover:bg-red-500 active:scale-95 transition-all py-3 text-sm font-black text-white"
              >RESET</button>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-zinc-800 mt-8 tracking-widest">STRATTON OAKMONT · RESTRICTED ACCESS</p>
      </div>
    </div>
  )
}
