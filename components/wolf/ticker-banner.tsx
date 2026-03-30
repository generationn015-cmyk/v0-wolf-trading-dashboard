'use client'

import { useEffect } from 'react'

const CSS = `
@keyframes wolfTickerScroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes wolfRunLegs {
  0%,100% { d: path("M18 28 L14 38 L18 38 L20 30 M26 28 L30 38 L26 38 L24 30"); }
  25%     { d: path("M18 28 L12 36 L16 37 L20 29 M26 28 L32 36 L28 37 L24 29"); }
  50%     { d: path("M18 28 L15 39 L19 39 L21 30 M26 28 L29 39 L25 39 L23 30"); }
  75%     { d: path("M18 28 L13 37 L17 38 L21 29 M26 28 L31 37 L27 38 L23 29"); }
}
@keyframes wolfBodyBob {
  0%,100% { transform: translateY(0px); }
  50%     { transform: translateY(-2px); }
}
@keyframes wolfTailWag {
  0%,100% { transform: rotate(0deg); }
  50%     { transform: rotate(20deg); }
}
@keyframes wolfPreyDangle {
  0%,100% { transform: rotate(-8deg); }
  50%     { transform: rotate(-14deg); }
}
.wtb-body   { animation: wolfBodyBob 0.35s ease-in-out infinite; transform-origin: center; }
.wtb-tail   { animation: wolfTailWag 0.35s ease-in-out infinite; transform-origin: 8px 22px; }
.wtb-prey   { animation: wolfPreyDangle 0.35s ease-in-out infinite; transform-origin: 35px 18px; }
`

function injectCSS() {
  if (typeof document === 'undefined') return
  if (document.getElementById('wtb-css')) return
  const s = document.createElement('style')
  s.id = 'wtb-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

// ── Inline running wolf SVG ───────────────────────────────────────────────
function RunningWolf() {
  return (
    <svg
      viewBox="0 0 80 44"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 80, height: 44, display: 'inline-block', verticalAlign: 'middle', overflow: 'visible' }}
    >
      {/* ── Body group — bobs up/down ── */}
      <g className="wtb-body">

        {/* Tail (behind body) */}
        <g className="wtb-tail">
          <path
            d="M10 22 Q2 14 4 6 Q5 2 8 4"
            stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8"
          />
        </g>

        {/* Body */}
        <ellipse cx="24" cy="24" rx="14" ry="9" fill="#111827" stroke="#1f2937" strokeWidth="0.8"/>

        {/* Hind legs */}
        {/* Back-left */}
        <path d="M14 28 Q10 34 8 42" stroke="#0d1117" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M8 42 L5 42" stroke="#0d1117" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Back-right */}
        <path d="M16 30 Q16 36 18 42" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M18 42 L21 42" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Front legs */}
        {/* Front-left */}
        <path d="M30 28 Q28 34 26 42" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" fill="none"/>
        <path d="M26 42 L23 42" stroke="#1f2937" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Front-right (extended forward — running stride) */}
        <path d="M32 27 Q36 32 38 40" stroke="#0d1117" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M38 40 L41 40" stroke="#0d1117" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Neck */}
        <path d="M34 22 Q38 16 40 14" stroke="#111827" strokeWidth="6" strokeLinecap="round" fill="none"/>
        <path d="M34 22 Q38 16 40 14" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" fill="none"/>

        {/* Head */}
        <ellipse cx="42" cy="12" rx="8" ry="7" fill="#111827" stroke="#1f2937" strokeWidth="0.8"/>

        {/* Ear */}
        <path d="M40 7 L37 1 L44 6Z" fill="#111827" stroke="#f59e0b" strokeWidth="0.7"/>
        <path d="M40 7 L38 3 L43 6.5Z" fill="#4c1d95" opacity="0.6"/>

        {/* Eye — amber glow */}
        <circle cx="46" cy="11" r="2.5" fill="#92400e"/>
        <circle cx="46" cy="11" r="1.2" fill="#000"/>
        <circle cx="46.8" cy="10.2" r="0.7" fill="white" opacity="0.9"/>
        <circle cx="46" cy="11" r="2.5" fill="#f59e0b" opacity="0.15"/>

        {/* Brow — angry */}
        <path d="M43 8 Q46 6.5 49 8" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" fill="none"/>

        {/* Muzzle open — holding prey */}
        <path d="M48 13 L54 11 L54 16 L48 17Z" fill="#0a0a18" stroke="#374151" strokeWidth="0.6"/>
        {/* Teeth visible */}
        <path d="M49 13 L49 15" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.9"/>
        <path d="M51 13 L51 15" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.9"/>
        {/* Fang */}
        <path d="M48.5 13 L47.5 16" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.9"/>

        {/* ── Prey (rat/small animal dangling from mouth) ── */}
        <g className="wtb-prey">
          {/* Body */}
          <ellipse cx="58" cy="16" rx="5" ry="3" fill="#374151" stroke="#4b5563" strokeWidth="0.5"/>
          {/* Head */}
          <ellipse cx="63" cy="15" rx="2.8" ry="2.2" fill="#374151" stroke="#4b5563" strokeWidth="0.5"/>
          {/* Ears */}
          <circle cx="63" cy="12.8" r="1.2" fill="#4b5563" stroke="#6b7280" strokeWidth="0.4"/>
          <circle cx="65" cy="13" r="1" fill="#4b5563" stroke="#6b7280" strokeWidth="0.4"/>
          {/* Eye (dead X) */}
          <text x="62.5" y="16" fontSize="3" fill="#dc2626" fontWeight="bold">×</text>
          {/* Tail curling down */}
          <path d="M53 18 Q51 22 54 25 Q56 27 54 30" stroke="#4b5563" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
          {/* Legs dangling */}
          <path d="M56 18 L55 23" stroke="#374151" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M59 18 L59 23" stroke="#374151" strokeWidth="1.2" strokeLinecap="round"/>
          {/* Blood drip — subtle */}
          <path d="M55 17 Q54.5 20 55 22" stroke="#dc2626" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.5"/>
        </g>

        {/* Fur lines on body */}
        <path d="M20 20 Q24 18 28 20" stroke="#1f2937" strokeWidth="1" fill="none"/>
        <path d="M18 24 Q22 22 26 24" stroke="#1f2937" strokeWidth="0.8" fill="none" opacity="0.6"/>
      </g>
    </svg>
  )
}

// ── Ticker items ──────────────────────────────────────────────────────────
type TickerItem =
  | { type: 'text'; text: string; style: string }
  | { type: 'wolf' }

const TICKER_ITEMS: TickerItem[] = [
  { type: 'text', text: "BUY OR FUCKING DIE",                                          style: 'text-amber-400 font-black' },
  { type: 'text', text: "THE HUNT NEVER STOPS",                                        style: 'text-white font-bold' },
  { type: 'wolf' },
  { type: 'text', text: "MONEY NEVER SLEEPS",                                          style: 'text-amber-300/80 font-medium italic' },
  { type: 'text', text: "STRATTON OAKMONT IS AMERICA",                                 style: 'text-amber-400 font-black' },
  { type: 'text', text: "SELL ME THIS PEN",                                            style: 'text-amber-300/80 font-medium italic' },
  { type: 'text', text: "I'M NOT FUCKING LEAVING",                                     style: 'text-amber-400 font-black' },
  { type: 'wolf' },
  { type: 'text', text: "THERE'S NO NOBILITY IN POVERTY",                             style: 'text-amber-300/80 font-medium italic' },
  { type: 'text', text: "ACT AS IF YOU'RE THE WOLF",                                  style: 'text-white font-bold' },
  { type: 'text', text: "16 OPEN POSITIONS · PAPER MODE ACTIVE",                      style: 'text-emerald-400 font-bold' },
  { type: 'wolf' },
  { type: 'text', text: "WIN RATE TARGET: 72%",                                        style: 'text-emerald-400 font-bold' },
  { type: 'text', text: "KILL SWITCH ARMED: -40%",                                     style: 'text-emerald-400 font-bold' },
  { type: 'text', text: "I'VE BEEN A POOR MAN AND I'VE BEEN A RICH MAN · I CHOOSE RICH", style: 'text-amber-300/80 font-medium italic' },
  { type: 'text', text: "PREDATORY PATTERN RECOGNITION: ONLINE",                       style: 'text-emerald-400 font-bold' },
]

export function TickerBanner() {
  useEffect(() => { injectCSS() }, [])

  // Duplicate for seamless loop
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="relative overflow-hidden bg-black/60 border-b border-amber-500/20 h-12 flex items-center">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />

      {/* Scrolling track */}
      <div
        className="flex items-center whitespace-nowrap"
        style={{
          animation: 'wolfTickerScroll 70s linear infinite',
          willChange: 'transform',
        }}
      >
        {items.map((item, i) =>
          item.type === 'wolf' ? (
            <span key={i} className="inline-flex items-center mx-6">
              <RunningWolf />
            </span>
          ) : (
            <span key={i} className="inline-flex items-center gap-3">
              <span className={`text-[11px] tracking-[0.15em] px-1 ${item.style}`}>
                {item.text}
              </span>
              <span className="text-amber-500/30 text-[10px] mx-1">◆</span>
            </span>
          )
        )}
      </div>
    </div>
  )
}
