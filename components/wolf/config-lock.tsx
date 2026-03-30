'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Eye, EyeOff, Shield } from 'lucide-react'

// Config page password lock — stored in localStorage (client-side only)
// Not server-auth — this is a UI gate to prevent casual viewers
const CONFIG_KEY = 'wolf_config_unlocked'
const CONFIG_HASH_KEY = 'wolf_config_hash'

// Simple hash — not crypto security, just UI gate
async function hashPassword(pw: string): Promise<string> {
  const encoded = new TextEncoder().encode(pw + 'wolf-stratton-oakmont')
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

interface ConfigLockProps {
  children: React.ReactNode
}

export function ConfigLock({ children }: ConfigLockProps) {
  const [unlocked, setUnlocked] = useState(false)
  const [hasPassword, setHasPassword] = useState(false)
  const [mode, setMode] = useState<'check' | 'set' | 'enter'>('check')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(CONFIG_HASH_KEY)
    const session = sessionStorage.getItem(CONFIG_KEY)
    setHasPassword(!!stored)
    if (session === 'true' && stored) setUnlocked(true)
    setMode(stored ? 'enter' : 'set')
  }, [])

  const handleSet = async () => {
    if (pw.length < 4) { setError('Password must be at least 4 characters'); return }
    if (pw !== pw2) { setError('Passwords do not match'); return }
    const hash = await hashPassword(pw)
    localStorage.setItem(CONFIG_HASH_KEY, hash)
    sessionStorage.setItem(CONFIG_KEY, 'true')
    setHasPassword(true)
    setUnlocked(true)
    setPw(''); setPw2(''); setError('')
  }

  const handleEnter = async () => {
    const stored = localStorage.getItem(CONFIG_HASH_KEY)
    if (!stored) { setMode('set'); return }
    const hash = await hashPassword(pw)
    if (hash === stored) {
      sessionStorage.setItem(CONFIG_KEY, 'true')
      setUnlocked(true)
      setPw(''); setError('')
    } else {
      setError('Wrong password')
      setPw('')
    }
  }

  const handleLock = () => {
    sessionStorage.removeItem(CONFIG_KEY)
    setUnlocked(false)
    setMode('enter')
  }

  const handleReset = () => {
    localStorage.removeItem(CONFIG_HASH_KEY)
    sessionStorage.removeItem(CONFIG_KEY)
    setHasPassword(false)
    setUnlocked(false)
    setMode('set')
    setPw(''); setPw2(''); setError('')
  }

  if (!mounted) return null

  if (unlocked) {
    return (
      <div>
        {/* Lock bar at top of config */}
        <div className="flex items-center justify-between mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Unlock className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">CONFIG UNLOCKED</span>
          </div>
          <button
            onClick={handleLock}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-amber-400 transition-colors font-bold"
          >
            <Lock className="h-3.5 w-3.5" />
            Lock
          </button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center">
            <Shield className="h-10 w-10 text-amber-400" />
          </div>
        </div>

        <h2 className="text-xl font-black text-white text-center mb-1">
          {mode === 'set' ? 'Secure Configure' : 'Enter Password'}
        </h2>
        <p className="text-xs text-zinc-500 text-center mb-8">
          {mode === 'set'
            ? 'Set a password to protect system configuration'
            : 'This section is restricted. Enter your password to continue.'}
        </p>

        <div className="space-y-3">
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={pw}
              onChange={e => { setPw(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && (mode === 'set' ? undefined : handleEnter())}
              placeholder="Password"
              className="w-full rounded-xl bg-[#161624] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50 pr-10"
            />
            <button
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {mode === 'set' && (
            <input
              type={showPw ? 'text' : 'password'}
              value={pw2}
              onChange={e => { setPw2(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSet()}
              placeholder="Confirm password"
              className="w-full rounded-xl bg-[#161624] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/50"
            />
          )}

          {error && (
            <p className="text-xs text-red-400 font-bold text-center">{error}</p>
          )}

          <button
            onClick={mode === 'set' ? handleSet : handleEnter}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all py-3 text-sm font-black text-black tracking-wider"
          >
            {mode === 'set' ? 'SET PASSWORD & ENTER' : 'UNLOCK'}
          </button>

          {mode === 'enter' && (
            <button
              onClick={handleReset}
              className="w-full text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-2"
            >
              Forgot password? Reset (clears stored password)
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
