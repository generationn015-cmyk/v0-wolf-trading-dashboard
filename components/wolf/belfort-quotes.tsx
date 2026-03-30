'use client'

import { useState, useEffect } from 'react'
import { Quote, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const WOLF_QUOTES = [
  {
    quote: "The only thing standing between you and your goal is the story you keep telling yourself.",
    context: "Stay focused on the charts"
  },
  {
    quote: "Winners use words that say 'must' and 'will'.",
    context: "72% win rate incoming"
  },
  {
    quote: "I've been a poor man, and I've been a rich man. And I choose rich every time.",
    context: "Keep stacking those profits"
  },
  {
    quote: "The easiest way to make money is to create something of such value that everybody wants and go out and give and create value.",
    context: "The D-Dub Index provides value"
  },
  {
    quote: "Act as if! Act as if you're a wealthy man, rich already.",
    context: "Trade with confidence"
  },
  {
    quote: "There is no nobility in poverty.",
    context: "Let Wolf hunt for gains"
  },
  {
    quote: "Without action, the best intentions in the world are nothing more than that: intentions.",
    context: "Execute the trades"
  },
  {
    quote: "I'm not f***ing leaving! The show goes on!",
    context: "Diamond hands activated"
  },
  {
    quote: "Sell me this pen.",
    context: "Classic negotiation"
  },
  {
    quote: "The wolf of Wall Street? No, I'm the Wolf of ALL Streets.",
    context: "We trade everything"
  },
  {
    quote: "On a daily basis, I consume enough drugs to sedate Manhattan. But the market? That's the real addiction.",
    context: "Trading is the ultimate high"
  },
  {
    quote: "Let me tell you something. There's no nobility in poverty. I've been rich and I've been poor. Rich is better.",
    context: "Profits > Losses"
  }
]

export function BelfortQuotes() {
  const [currentQuote, setCurrentQuote] = useState(WOLF_QUOTES[0])
  const [isChanging, setIsChanging] = useState(false)

  const getRandomQuote = () => {
    setIsChanging(true)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * WOLF_QUOTES.length)
      setCurrentQuote(WOLF_QUOTES[randomIndex])
      setIsChanging(false)
    }, 300)
  }

  useEffect(() => {
    const interval = setInterval(getRandomQuote, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-lg border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-transparent to-amber-500/5 p-4">
      <div className="absolute -right-4 -top-4 text-amber-500/10">
        <Quote className="h-24 w-24 rotate-180" />
      </div>
      
      <div className={`transition-all duration-300 ${isChanging ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        <p className="relative z-10 text-sm font-medium italic text-foreground">
          &quot;{currentQuote.quote}&quot;
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-500">Wolf of All Streets</p>
            <p className="text-[10px] text-muted-foreground">{currentQuote.context}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={getRandomQuote}
            className="h-6 w-6 text-muted-foreground hover:text-amber-500"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
