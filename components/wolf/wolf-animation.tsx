'use client'

import { useEffect, useState } from 'react'

// CSS animations injected into document head once — avoids styled-jsx / App Router issues
const WOLF_CSS = `
@keyframes wolfBodyBreathe {
  0%,100%{transform:scaleY(1)}
  50%{transform:scaleY(1.04)}
}
@keyframes wolfHeadSway {
  0%,100%{transform:rotate(0deg)}
  20%{transform:rotate(-9deg)}
  50%{transform:rotate(6deg)}
  80%{transform:rotate(-4deg)}
}
@keyframes wolfEyePulse {
  0%,100%{opacity:.85}
  50%{opacity:1;filter:drop-shadow(0 0 4px #f59e0b)}
}
@keyframes wolfTailSweep {
  0%,100%{transform:rotate(0deg)}
  30%{transform:rotate(14deg)}
  70%{transform:rotate(-14deg)}
}
@keyframes wolfGlowPulse {
  0%,100%{opacity:.12}
  50%{opacity:.28}
}
.wf-body{transform-origin:50px 65px;animation:wolfBodyBreathe 3s ease-in-out infinite}
.wf-head{transform-origin:50px 55px;animation:wolfHeadSway 4.5s ease-in-out infinite}
.wf-eye{animation:wolfEyePulse 2s ease-in-out infinite}
.wf-tail{transform-origin:68px 58px;animation:wolfTailSweep 2.2s ease-in-out infinite}
.wf-glow{animation:wolfGlowPulse 3s ease-in-out infinite}
`

function injectWolfCSS() {
  if (typeof document === 'undefined') return
  if (document.getElementById('wolf-anim-css')) return
  const el = document.createElement('style')
  el.id = 'wolf-anim-css'
  el.textContent = WOLF_CSS
  document.head.appendChild(el)
}

interface WolfAnimationProps {
  size?: number
  className?: string
}

export function WolfAnimation({ size = 48, className = '' }: WolfAnimationProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    injectWolfCSS()
    setReady(true)
  }, [])

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        {/* Ground glow */}
        <ellipse cx="50" cy="92" rx="24" ry="5" fill="#f59e0b" className="wf-glow" />

        {/* ── Body ── */}
        <g className="wf-body">
          {/* Torso */}
          <path
            d="M30 58 Q24 70 22 82 L32 82 Q34 72 38 65 Q44 74 50 77 Q56 74 62 65 Q66 72 68 82 L78 82 Q76 70 70 58 Q63 50 50 48 Q37 50 30 58Z"
            fill="#1a1a2e" stroke="#f59e0b" strokeWidth="0.9"
          />
          {/* Front-left leg */}
          <rect x="31" y="75" width="8" height="17" rx="3" fill="#12121f" stroke="#374151" strokeWidth="0.6" />
          {/* Front-right leg */}
          <rect x="61" y="75" width="8" height="17" rx="3" fill="#12121f" stroke="#374151" strokeWidth="0.6" />
          {/* Paw left */}
          <ellipse cx="35" cy="93" rx="5.5" ry="3" fill="#0d0d1a" stroke="#4b5563" strokeWidth="0.5" />
          {/* Paw right */}
          <ellipse cx="65" cy="93" rx="5.5" ry="3" fill="#0d0d1a" stroke="#4b5563" strokeWidth="0.5" />
          {/* Chest fur highlight */}
          <path d="M39 63 Q50 68 61 63" stroke="#2a2a45" strokeWidth="1.8" fill="none" />
        </g>

        {/* Tail */}
        <g className="wf-tail">
          <path
            d="M70 60 Q84 50 88 40 Q91 32 87 26"
            stroke="#1a1a2e" strokeWidth="6" strokeLinecap="round" fill="none"
          />
          <path
            d="M70 60 Q84 50 88 40 Q91 32 87 26"
            stroke="#f59e0b" strokeWidth="0.7" strokeLinecap="round" fill="none" opacity="0.35"
          />
        </g>

        {/* ── Head ── */}
        <g className="wf-head">
          {/* Neck */}
          <path
            d="M42 50 Q50 46 58 50 L57 40 Q50 34 43 40Z"
            fill="#1a1a2e" stroke="#f59e0b" strokeWidth="0.8"
          />
          {/* Skull */}
          <path
            d="M36 34 Q30 25 33 16 L42 11 Q50 7 58 11 L67 16 Q70 25 64 34 Q59 40 50 42 Q41 40 36 34Z"
            fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1.1"
          />
          {/* Ear left */}
          <path d="M36 24 L28 5 L44 17Z" fill="#12121f" stroke="#f59e0b" strokeWidth="0.9" />
          <path d="M36 24 L31 9 L43 19Z" fill="#3b0764" opacity="0.55" />
          {/* Ear right */}
          <path d="M64 24 L72 5 L56 17Z" fill="#12121f" stroke="#f59e0b" strokeWidth="0.9" />
          <path d="M64 24 L69 9 L57 19Z" fill="#3b0764" opacity="0.55" />
          {/* Muzzle */}
          <ellipse cx="50" cy="35" rx="10" ry="8" fill="#0d0d1a" stroke="#374151" strokeWidth="0.7" />
          {/* Nose */}
          <ellipse cx="50" cy="30" rx="4.5" ry="3.5" fill="#111827" stroke="#4b5563" strokeWidth="0.5" />
          {/* Nostrils */}
          <ellipse cx="47.5" cy="30.5" rx="1.2" ry="0.8" fill="#000" />
          <ellipse cx="52.5" cy="30.5" rx="1.2" ry="0.8" fill="#000" />
          {/* Snarl / open mouth */}
          <path d="M41 37 Q50 44 59 37" fill="#0a0010" stroke="#374151" strokeWidth="0.8" />
          <path d="M43 38 Q50 43 57 38" fill="#1a0028" />
          {/* Upper teeth */}
          <rect x="45.5" y="37" width="2.5" height="4" rx="0.6" fill="white" opacity="0.92" />
          <rect x="50.5" y="37" width="2.5" height="4" rx="0.6" fill="white" opacity="0.92" />
          {/* Fangs */}
          <path d="M43 37 L41.5 41.5 L44 37" fill="white" opacity="0.88" />
          <path d="M57 37 L58.5 41.5 L56 37" fill="white" opacity="0.88" />
          {/* Tongue */}
          <path d="M46 41 Q50 46 54 41" fill="#dc2626" opacity="0.85" />
          {/* Brow lines — angry */}
          <path d="M36 26 Q40 23 44 26" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M64 26 Q60 23 56 26" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
          {/* Eye left */}
          <ellipse cx="42" cy="27" rx="5" ry="4.5" fill="#92400e" />
          <ellipse cx="42" cy="27" rx="5" ry="4.5" fill="#f59e0b" opacity="0.15" className="wf-eye" />
          <ellipse cx="42" cy="27" rx="2.8" ry="3.2" fill="#000" />
          <circle  cx="43.2" cy="25.5" r="1" fill="white" opacity="0.85" />
          <ellipse cx="42" cy="27" rx="5" ry="4.5" fill="none" stroke="#f59e0b" strokeWidth="0.6" opacity="0.5" className="wf-eye" />
          {/* Eye right */}
          <ellipse cx="58" cy="27" rx="5" ry="4.5" fill="#92400e" />
          <ellipse cx="58" cy="27" rx="5" ry="4.5" fill="#f59e0b" opacity="0.15" className="wf-eye" />
          <ellipse cx="58" cy="27" rx="2.8" ry="3.2" fill="#000" />
          <circle  cx="59.2" cy="25.5" r="1" fill="white" opacity="0.85" />
          <ellipse cx="58" cy="27" rx="5" ry="4.5" fill="none" stroke="#f59e0b" strokeWidth="0.6" opacity="0.5" className="wf-eye" />
          {/* Forehead fur */}
          <path d="M43 19 Q50 16 57 19" stroke="#2a2a45" strokeWidth="1.3" fill="none" />
        </g>
      </svg>

      {/* Amber eye glow rings — rendered outside SVG for CSS filter support */}
      {ready && (
        <>
          <div
            className="absolute rounded-full bg-amber-500/20 wf-eye pointer-events-none"
            style={{
              width: size * 0.18,
              height: size * 0.14,
              top: '25%',
              left: '35%',
            }}
          />
          <div
            className="absolute rounded-full bg-amber-500/20 wf-eye pointer-events-none"
            style={{
              width: size * 0.18,
              height: size * 0.14,
              top: '25%',
              left: '52%',
            }}
          />
        </>
      )}
    </div>
  )
}
