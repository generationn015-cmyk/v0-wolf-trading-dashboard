'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { MarketData } from '@/lib/wolf-types'

interface MarketTickerProps {
  data: MarketData[]
}

// Real Polymarket market categories Wolf is actively trading
const POLYMARKET_CATEGORIES = [
  { symbol: 'CRYPTO', label: 'Crypto Markets', color: 'text-amber-400' },
  { symbol: 'SPORTS', label: 'Sports Outcomes', color: 'text-blue-400' },
  { symbol: 'POLITICS', label: 'Political Events', color: 'text-purple-400' },
  { symbol: 'CULTURE', label: 'Pop Culture', color: 'text-pink-400' },
  { symbol: 'ECONOMY', label: 'Macro Events', color: 'text-emerald-400' },
]

export function MarketTicker({ data }: MarketTickerProps) {
  const [liveData, setLiveData] = useState<MarketData[]>(data)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [pulseIdx, setPulseIdx] = useState(0)

  // Fetch real BTC/ETH prices from CoinGecko (free, no key)
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_high_24h=true&include_low_24h=true',
          { cache: 'no-store' }
        )
        if (!res.ok) return
        const json = await res.json()
        const btc = json.bitcoin
        const eth = json.ethereum

        const enriched: MarketData[] = [
          {
            symbol: 'BTC',
            price: btc?.usd ?? 0,
            change: (btc?.usd ?? 0) * (btc?.usd_24h_change ?? 0) / 100,
            changePercent: btc?.usd_24h_change ?? 0,
            volume: btc?.usd_24h_vol ?? 0,
            high: btc?.usd_24h_high ?? 0,
            low: btc?.usd_24h_low ?? 0,
          },
          {
            symbol: 'ETH',
            price: eth?.usd ?? 0,
            change: (eth?.usd ?? 0) * (eth?.usd_24h_change ?? 0) / 100,
            changePercent: eth?.usd_24h_change ?? 0,
            volume: eth?.usd_24h_vol ?? 0,
            high: eth?.usd_24h_high ?? 0,
            low: eth?.usd_24h_low ?? 0,
          },
          // Polymarket overall market stats (from Wolf API data if available)
          ...data.filter(d => !['BTC','ETH'].includes(d.symbol))
        ]
        setLiveData(enriched)
        setLastUpdate(new Date())
      } catch {
        // Fallback to whatever Wolf pushed
        setLiveData(data)
      }
    }
    fetchPrices()
    const interval = setInterval(fetchPrices, 60000)
    return () => clearInterval(interval)
  }, [data])

  useEffect(() => {
    const interval = setInterval(() => setPulseIdx(i => (i + 1) % liveData.length), 2000)
    return () => clearInterval(interval)
  }, [liveData.length])

  const formatPrice = (price: number, symbol: string) => {
    if (price === 0) return '---'
    if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
    if (price >= 1) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    return price.toFixed(4)
  }

  const formatVol = (vol: number) => {
    if (!vol || vol === 0) return null
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(1)}B`
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(0)}M`
    return `$${(vol / 1e3).toFixed(0)}K`
  }

  return (
    <div className="space-y-2">
      {/* Polymarket category badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Wolf Active Markets</span>
        {POLYMARKET_CATEGORIES.map(cat => (
          <Badge key={cat.symbol} variant="outline" className={`text-[10px] font-bold ${cat.color} border-current/30`}>
            {cat.label}
          </Badge>
        ))}
        <div className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          <span>Updated {lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Price cards */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {liveData.map((market, idx) => (
          <Card
            key={market.symbol}
            className={`min-w-[200px] shrink-0 bg-card border-border transition-all duration-500 ${idx === pulseIdx ? 'border-amber-500/40 shadow-sm shadow-amber-500/10' : ''}`}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-foreground">{market.symbol}</span>
                  <Badge
                    className={`text-[9px] px-1 py-0 ${market.changePercent >= 0
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                  >
                    {market.changePercent >= 0 ? '▲' : '▼'} {Math.abs(market.changePercent).toFixed(2)}%
                  </Badge>
                </div>
                {market.changePercent >= 0
                  ? <TrendingUp className="h-4 w-4 text-emerald-500" />
                  : <TrendingDown className="h-4 w-4 text-red-500" />
                }
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-foreground font-mono">
                  ${formatPrice(market.price, market.symbol)}
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>H: ${(market.high ?? 0) > 0 ? formatPrice(market.high ?? 0, market.symbol) : '---'}</span>
                <span>L: ${(market.low ?? 0) > 0 ? formatPrice(market.low ?? 0, market.symbol) : '---'}</span>
                {formatVol(market.volume ?? 0) && (
                  <span className="text-amber-500/70 font-bold">{formatVol(market.volume ?? 0)}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Polymarket summary card */}
        <Card className="min-w-[200px] shrink-0 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-sm font-black text-amber-400">POLY</span>
              <Badge className="text-[9px] px-1 py-0 bg-amber-500/10 text-amber-400 border-amber-500/20">PREDICTION</Badge>
            </div>
            <div className="text-lg font-black text-foreground font-mono">Active</div>
            <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
              <div className="flex justify-between">
                <span>Wolf positions</span>
                <span className="text-amber-400 font-bold">16 open</span>
              </div>
              <div className="flex justify-between">
                <span>Avg confidence</span>
                <span className="text-emerald-400 font-bold">72%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
