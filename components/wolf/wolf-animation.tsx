'use client'

import { useEffect, useRef } from 'react'

// Realistic animated wolf using CSS keyframe animations on SVG paths
// Howling wolf silhouette — aggressive, realistic body pose
export function WolfAnimation({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <style>{`
          @keyframes wolfHowl {
            0%   { transform: rotate(0deg); transform-origin: 50px 70px; }
            15%  { transform: rotate(-8deg); transform-origin: 50px 70px; }
            30%  { transform: rotate(5deg); transform-origin: 50px 70px; }
            45%  { transform: rotate(-5deg); transform-origin: 50px 70px; }
            60%  { transform: rotate(3deg); transform-origin: 50px 70px; }
            75%  { transform: rotate(-3deg); transform-origin: 50px 70px; }
            100% { transform: rotate(0deg); transform-origin: 50px 70px; }
          }
          @keyframes wolfBreath {
            0%, 100% { transform: scaleY(1); transform-origin: 50px 60px; }
            50%      { transform: scaleY(1.04); transform-origin: 50px 60px; }
          }
          @keyframes eyeGlow {
            0%, 100% { opacity: 0.8; }
            50%      { opacity: 1; filter: drop-shadow(0 0 3px #f59e0b); }
          }
          @keyframes tailWag {
            0%   { transform: rotate(0deg);   transform-origin: 72px 62px; }
            25%  { transform: rotate(12deg);  transform-origin: 72px 62px; }
            75%  { transform: rotate(-12deg); transform-origin: 72px 62px; }
            100% { transform: rotate(0deg);   transform-origin: 72px 62px; }
          }
          @keyframes ambientGlow {
            0%, 100% { opacity: 0.15; }
            50%      { opacity: 0.3; }
          }
          .wolf-body    { animation: wolfBreath 3s ease-in-out infinite; }
          .wolf-head    { animation: wolfHowl 4s ease-in-out infinite; }
          .wolf-eye     { animation: eyeGlow 2s ease-in-out infinite; }
          .wolf-tail    { animation: tailWag 2s ease-in-out infinite; }
          .wolf-glow    { animation: ambientGlow 3s ease-in-out infinite; }
        `}</style>

        {/* Ambient glow */}
        <ellipse cx="50" cy="85" rx="28" ry="6" fill="#f59e0b" className="wolf-glow"/>

        {/* Body */}
        <g className="wolf-body">
          {/* Main torso */}
          <path d="M28 55 Q22 65 20 78 L30 78 Q32 68 36 62 Q42 72 50 75 Q58 72 64 62 Q68 68 70 78 L80 78 Q78 65 72 55 Q65 48 50 46 Q35 48 28 55Z" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="0.8"/>
          {/* Front legs */}
          <rect x="30" y="72" width="8" height="16" rx="3" fill="#151525" stroke="#374151" strokeWidth="0.6"/>
          <rect x="62" y="72" width="8" height="16" rx="3" fill="#151525" stroke="#374151" strokeWidth="0.6"/>
          {/* Paws */}
          <ellipse cx="34" cy="89" rx="5" ry="3" fill="#0d0d1a" stroke="#374151" strokeWidth="0.5"/>
          <ellipse cx="66" cy="89" rx="5" ry="3" fill="#0d0d1a" stroke="#374151" strokeWidth="0.5"/>
          {/* Back legs hint */}
          <path d="M25 65 Q18 72 20 82" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <path d="M75 65 Q82 72 80 82" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          {/* Chest fur */}
          <path d="M38 60 Q50 66 62 60" stroke="#2d2d4a" strokeWidth="2" fill="none"/>
        </g>

        {/* Tail */}
        <g className="wolf-tail">
          <path d="M72 62 Q85 52 88 42 Q90 35 86 30" stroke="#1a1a2e" strokeWidth="5" strokeLinecap="round" fill="none"/>
          <path d="M72 62 Q85 52 88 42 Q90 35 86 30" stroke="#f59e0b" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4"/>
        </g>

        {/* Head — howling pose (tilted up) */}
        <g className="wolf-head">
          {/* Neck */}
          <path d="M42 48 Q50 44 58 48 L56 38 Q50 32 44 38Z" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="0.8"/>
          {/* Head shape */}
          <path d="M38 32 Q32 24 34 16 L42 12 Q50 8 58 12 L66 16 Q68 24 62 32 Q58 38 50 40 Q42 38 38 32Z" fill="#1a1a2e" stroke="#f59e0b" strokeWidth="1"/>
          {/* Ear left — sharp */}
          <path d="M38 22 L32 6 L44 16Z" fill="#151525" stroke="#f59e0b" strokeWidth="0.8"/>
          <path d="M38 22 L34 10 L43 18Z" fill="#4c1d95" opacity="0.5"/>
          {/* Ear right — sharp */}
          <path d="M62 22 L68 6 L56 16Z" fill="#151525" stroke="#f59e0b" strokeWidth="0.8"/>
          <path d="M62 22 L66 10 L57 18Z" fill="#4c1d95" opacity="0.5"/>
          {/* Snout / muzzle */}
          <ellipse cx="50" cy="34" rx="9" ry="7" fill="#0d0d1a" stroke="#374151" strokeWidth="0.6"/>
          {/* Nose */}
          <ellipse cx="50" cy="30" rx="4" ry="3" fill="#111" stroke="#374151" strokeWidth="0.5"/>
          {/* Open mouth — howling */}
          <path d="M42 36 Q50 42 58 36" fill="#0a0014" stroke="#374151" strokeWidth="0.8"/>
          <path d="M44 37 Q47 40 50 40 Q53 40 56 37" fill="#1a0033"/>
          {/* Teeth — top */}
          <rect x="46" y="36" width="2.5" height="3.5" rx="0.5" fill="white" opacity="0.9"/>
          <rect x="50.5" y="36" width="2.5" height="3.5" rx="0.5" fill="white" opacity="0.9"/>
          {/* Tongue */}
          <path d="M47 39 Q50 43 53 39" fill="#ef4444" opacity="0.8"/>
          {/* Brow furrow — angry */}
          <path d="M38 24 Q42 22 45 25" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M62 24 Q58 22 55 25" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Eyes — amber glowing */}
          <ellipse cx="43" cy="26" rx="4.5" ry="4" fill="#92400e" className="wolf-eye"/>
          <ellipse cx="43" cy="26" rx="2.5" ry="2.8" fill="#000"/>
          <circle  cx="44.2" cy="25" r="0.9" fill="white" opacity="0.8"/>
          <ellipse cx="43" cy="26" rx="4.5" ry="4" fill="#f59e0b" opacity="0.12" className="wolf-eye"/>

          <ellipse cx="57" cy="26" rx="4.5" ry="4" fill="#92400e" className="wolf-eye"/>
          <ellipse cx="57" cy="26" rx="2.5" ry="2.8" fill="#000"/>
          <circle  cx="58.2" cy="25" r="0.9" fill="white" opacity="0.8"/>
          <ellipse cx="57" cy="26" rx="4.5" ry="4" fill="#f59e0b" opacity="0.12" className="wolf-eye"/>
          {/* Fur texture — forehead */}
          <path d="M44 18 Q50 15 56 18" stroke="#2d2d4a" strokeWidth="1.2" fill="none"/>
        </g>
      </svg>
    </div>
  )
}
