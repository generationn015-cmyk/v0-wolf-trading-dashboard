'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'

const HASH_KEY = 'wolf_site_hash'
const SESSION_KEY = 'wolf_site_unlocked'

async function hashPw(pw: string): Promise<string> {
  const encoded = new TextEncoder().encode(pw + 'wolf-stratton-oakmont-site')
  const buf = await crypto.subtle.digest('SHA-256', encoded)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface SiteLockProps {
  children: React.ReactNode
}

export function SiteLock({ children }: SiteLockProps) {
  const [state, setState] = useState<'loading' | 'set' | 'enter' | 'unlocked'>('loading')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(HASH_KEY)
    const session = sessionStorage.getItem(SESSION_KEY)
    if (!stored) { setState('set'); return }
    if (session === 'true') { setState('unlocked'); return }
    setState('enter')
  }, [])

  const shake = () => {
    setShaking(true)
    setTimeout(() => setShaking(false), 500)
  }

  const handleSet = async () => {
    if (pw.length < 4) { setError('At least 4 characters'); shake(); return }
    if (pw !== pw2) { setError('Passwords do not match'); shake(); return }
    const hash = await hashPw(pw)
    localStorage.setItem(HASH_KEY, hash)
    sessionStorage.setItem(SESSION_KEY, 'true')
    setState('unlocked')
  }

  const handleEnter = async () => {
    const stored = localStorage.getItem(HASH_KEY)
    if (!stored) { setState('set'); return }
    const hash = await hashPw(pw)
    if (hash === stored) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setState('unlocked')
      setPw('')
    } else {
      setError('Wrong password')
      setPw('')
      shake()
    }
  }

  if (state === 'loading') {
    return (
      <div className="fixed inset-0 bg-[#080810] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
      </div>
    )
  }

  if (state === 'unlocked') return <>{children}</>

  return (
    <div className="fixed inset-0 bg-[#080810] flex items-center justify-center z-[9999]">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div
        className={`relative w-full max-w-sm mx-4 transition-transform ${shaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        style={shaking ? { animation: 'siteLockShake 0.5s ease-in-out' } : {}}
      >
        {/* Wolf badge */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shadow-2xl shadow-amber-500/10">
              <span className="text-5xl">🐺</span>
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Lock className="h-3 w-3 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight">
            WOLF <span className="text-amber-500">OF ALL STREETS</span>
          </h1>
          <p className="text-xs text-zinc-600 mt-2 italic">
            {state === 'set'
              ? 'Set a password to secure the terminal'
              : 'Enter your password to access the terminal'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={pw}
              onChange={e => { setPw(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && (state === 'set' ? (pw2 ? handleSet() : undefined) : handleEnter())}
              placeholder="Password"
              autoFocus
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all pr-10"
            />
            <button
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
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
              placeholder="Confirm password"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all"
            />
          )}

          {error && (
            <p className="text-xs text-red-400 font-bold text-center">{error}</p>
          )}

          <button
            onClick={state === 'set' ? handleSet : handleEnter}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all py-3.5 text-sm font-black text-black tracking-widest mt-1"
          >
            {state === 'set' ? 'SECURE & ENTER' : 'ENTER'}
          </button>

          {state === 'enter' && (
            <button
              onClick={() => {
                localStorage.removeItem(HASH_KEY)
                sessionStorage.removeItem(SESSION_KEY)
                setState('set')
                setPw(''); setPw2(''); setError('')
              }}
              className="w-full text-[11px] text-zinc-700 hover:text-zinc-500 transition-colors py-1"
            >
              Forgot password? Reset
            </button>
          )}
        </div>

        <p className="text-center text-[10px] text-zinc-800 mt-8">
          STRATTON OAKMONT · RESTRICTED ACCESS
        </p>
      </div>

      <style>{`
        @keyframes siteLockShake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
      `}</style>
    </div>
  )
}
