'use client'

import { useEffect, useRef } from 'react'

const TICKER_ITEMS = [
  { text: "BUY OR FUCKING DIE", type: 'shout' },
  { text: "THE HUNT NEVER STOPS", type: 'wolf' },
  { text: "MONEY NEVER SLEEPS", type: 'quote' },
  { text: "STRATTON OAKMONT IS AMERICA", type: 'shout' },
  { text: "SELL ME THIS PEN", type: 'quote' },
  { text: "I'M NOT FUCKING LEAVING", type: 'shout' },
  { text: "THERE'S NO NOBILITY IN POVERTY", type: 'quote' },
  { text: "THE SHOW GOES ON", type: 'wolf' },
  { text: "ACT AS IF YOU'RE THE WOLF", type: 'quote' },
  { text: "16 OPEN POSITIONS · PAPER MODE ACTIVE", type: 'data' },
  { text: "WIN RATE TARGET: 72%", type: 'data' },
  { text: "KILL SWITCH ARMED: -40%", type: 'data' },
  { text: "BUY OR FUCKING DIE", type: 'shout' },
  { text: "I'VE BEEN A POOR MAN AND I'VE BEEN A RICH MAN · I CHOOSE RICH", type: 'quote' },
  { text: "PREDATORY PATTERN RECOGNITION: ONLINE", type: 'data' },
]

const getItemColor = (type: string) => {
  switch (type) {
    case 'shout': return 'text-amber-400 font-black'
    case 'wolf':  return 'text-white font-bold'
    case 'quote': return 'text-amber-300/80 font-medium italic'
    case 'data':  return 'text-emerald-400 font-bold'
    default:      return 'text-amber-400'
  }
}

export function TickerBanner() {
  const trackRef = useRef<HTMLDivElement>(null)

  // Duplicate items for seamless loop
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="relative overflow-hidden bg-black/60 border-b border-amber-500/20 h-7 flex items-center">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/80 to-transparent z-10 pointer-events-none" />

      {/* Scrolling track */}
      <div
        ref={trackRef}
        className="flex items-center gap-0 whitespace-nowrap"
        style={{
          animation: 'wolfTicker 60s linear infinite',
          willChange: 'transform',
        }}
      >
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3">
            <span className={`text-[11px] tracking-[0.15em] px-1 ${getItemColor(item.type)}`}>
              {item.text}
            </span>
            {/* Separator — stock market style */}
            <span className="text-amber-500/30 text-[10px] mx-1">◆</span>
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes wolfTicker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
