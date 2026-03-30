'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { MarketData } from '@/lib/wolf-types'

interface MarketTickerProps {
  data: MarketData[]
}

export function MarketTicker({ data }: MarketTickerProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {data.map((market) => (
        <Card key={market.symbol} className="min-w-[180px] bg-card border-border shrink-0">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-medium text-foreground">{market.symbol}</span>
              {market.change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-lg font-semibold text-foreground">
                ${market.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className={`text-xs font-medium ${market.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {market.change >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>H: ${market.high.toLocaleString()}</span>
              <span>L: ${market.low.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
