'use client'

import { ArrowUpRight, ArrowDownRight, Sparkles, TrendingUp, Target, Clock, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Trade } from '@/lib/wolf-types'

interface TradesTableProps {
  trades: Trade[]
}

const getTradeMessage = (trade: Trade) => {
  if (trade.status !== 'CLOSED') return null
  if (trade.pnl >= 1000) return "🛥️ Yacht fuel!"
  if (trade.pnl >= 500) return "💰 Stratton approved!"
  if (trade.pnl >= 100) return "📈 Money never sleeps"
  if (trade.pnl >= 0) return "🐺 Wolf takes profit"
  if (trade.pnl >= -100) return "Minor scratch"
  if (trade.pnl >= -500) return "Shake it off"
  return "Part of the game"
}

const formatAge = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

// Truncate long prediction market names
const formatSymbol = (symbol: string) => {
  if (symbol.length <= 20) return symbol
  return symbol.slice(0, 18) + '…'
}

export function TradesTable({ trades }: TradesTableProps) {
  const openTrades = trades.filter(t => t.status === 'OPEN')
  const closedTrades = trades.filter(t => t.status === 'CLOSED')
  const totalOpenDeployed = openTrades.reduce((sum, t) => {
    // entry price × implied size (we store pnl not size, so estimate from pnl)
    return sum + (t.unrealizedPnl || 0)
  }, 0)
  const totalRealizedPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const wins = closedTrades.filter(t => t.pnl >= 0).length
  const wr = closedTrades.length > 0 ? (wins / closedTrades.length * 100).toFixed(0) : null

  const getStatusBadge = (status: Trade['status']) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold text-[10px]">🔴 Hunting</Badge>
      case 'CLOSED':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-[10px]">Closed</Badge>
      case 'PENDING':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">Stalking</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-black flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            THE HUNT LOG
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs flex items-center gap-1 font-bold">
              <Target className="h-3 w-3 text-amber-400" />
              {openTrades.length} Active
            </Badge>
            {wr && (
              <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold">
                WR {wr}%
              </Badge>
            )}
            {totalRealizedPnL !== 0 && (
              <Badge className={`text-xs font-bold ${totalRealizedPnL >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                <DollarSign className="h-3 w-3 mr-0.5" />
                Realized: {totalRealizedPnL >= 0 ? '+' : ''}${totalRealizedPnL.toFixed(2)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl mb-3">🐺</span>
            <p className="text-sm font-bold text-muted-foreground">Wolf is scanning the markets...</p>
            <p className="text-xs text-muted-foreground mt-1 italic">First positions loading — connect live data feed</p>
          </div>
        ) : (
          <ScrollArea className="h-[380px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Market</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Side</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Entry</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Exit</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">P&L</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Conviction</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">Age</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((trade) => {
                  const tradeMessage = getTradeMessage(trade)
                  const isWin = trade.status === 'CLOSED' && trade.pnl >= 0
                  const isBigWin = trade.status === 'CLOSED' && trade.pnl >= 200
                  const confidencePct = trade.confidence > 1 ? trade.confidence : Math.round(trade.confidence * 100)

                  return (
                    <TableRow
                      key={trade.id}
                      className={`border-border transition-colors ${isBigWin ? 'bg-emerald-500/5' : ''} ${trade.status === 'OPEN' ? 'hover:bg-amber-500/5' : ''}`}
                    >
                      <TableCell className="font-medium max-w-[180px]">
                        <div className="flex items-center gap-2">
                          <div>
                            <span className="font-mono text-xs font-bold block">{formatSymbol(trade.symbol)}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              {getStatusBadge(trade.status)}
                              {isBigWin && <Sparkles className="h-3 w-3 text-amber-400" />}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {trade.type === 'LONG' ? (
                            <>
                              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-xs text-emerald-400 font-bold">YES</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                              <span className="text-xs text-red-400 font-bold">NO</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold">${trade.entry.toFixed(3)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {trade.exit ? (
                          <span className={trade.exit >= trade.entry && trade.type === 'LONG' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            ${trade.exit.toFixed(3)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {trade.status === 'CLOSED' ? (
                          <div>
                            <span className={`font-mono text-sm font-black ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                            </span>
                            {tradeMessage && (
                              <span className={`block text-[9px] italic ${isWin ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
                                {tradeMessage}
                              </span>
                            )}
                          </div>
                        ) : trade.unrealizedPnl !== undefined ? (
                          <span className={`font-mono text-sm font-bold ${trade.unrealizedPnl >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                            {trade.unrealizedPnl >= 0 ? '+' : ''}${trade.unrealizedPnl.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={`h-full rounded-full ${confidencePct >= 80 ? 'bg-emerald-500' : confidencePct >= 70 ? 'bg-amber-500' : 'bg-orange-500'}`}
                              style={{ width: `${confidencePct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">{confidencePct}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatAge(trade.timestamp)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
