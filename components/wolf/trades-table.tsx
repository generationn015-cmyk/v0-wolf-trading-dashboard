'use client'

import { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Sparkles, TrendingUp, Target, Clock, DollarSign, Timer, AlertTriangle, Zap, Shield, X } from 'lucide-react'
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
  paperMode?: boolean
  onGoLive?: () => void
}

const MAX_HOLD_HOURS = 12 // Wolf force-exit threshold

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
  const diff = Date.now() - d.getTime()
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

// Returns { remaining: string, urgency: 'ok'|'warn'|'critical', pct: number }
const getTimeRemaining = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return { remaining: '—', urgency: 'ok' as const, pct: 0 }
  const elapsedMs = Date.now() - d.getTime()
  const maxMs = MAX_HOLD_HOURS * 3600000
  const remainingMs = maxMs - elapsedMs
  const pct = Math.min(100, Math.max(0, (elapsedMs / maxMs) * 100))

  if (remainingMs <= 0) return { remaining: 'FORCE EXIT', urgency: 'critical' as const, pct: 100 }

  const rh = Math.floor(remainingMs / 3600000)
  const rm = Math.floor((remainingMs % 3600000) / 60000)

  if (remainingMs < 3600000) return { remaining: `${rm}m left`, urgency: 'critical' as const, pct }
  if (remainingMs < 3 * 3600000) return { remaining: `${rh}h ${rm}m`, urgency: 'warn' as const, pct }
  return { remaining: `${rh}h ${rm}m`, urgency: 'ok' as const, pct }
}

const formatSymbol = (symbol: string) => {
  if (symbol.length <= 28) return symbol
  return symbol.slice(0, 26) + '…'
}

export function TradesTable({ trades, paperMode = true, onGoLive }: TradesTableProps) {
  const [showGoLiveModal, setShowGoLiveModal] = useState(false)
  const openTrades = trades.filter(t => t.status === 'OPEN')
  const closedTrades = trades.filter(t => t.status === 'CLOSED')
  const totalRealizedPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
  const wins = closedTrades.filter(t => t.pnl >= 0).length
  const wr = closedTrades.length > 0 ? (wins / closedTrades.length * 100).toFixed(0) : null

  // Sort: open first (by age desc), then closed
  const sortedTrades = [
    ...openTrades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    ...closedTrades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
  ]

  const getStatusBadge = (status: Trade['status']) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold text-[10px] animate-pulse">● HUNTING</Badge>
      case 'CLOSED':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-[10px]">Closed</Badge>
      case 'PENDING':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">Pending</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="rounded-2xl bg-[#161624] border border-white/5 h-full flex flex-col">
      <CardHeader className="pb-2 shrink-0">
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
                {totalRealizedPnL >= 0 ? '+' : ''}${totalRealizedPnL.toFixed(2)}
              </Badge>
            )}
            <Badge className="text-xs bg-zinc-700 text-zinc-400 font-bold">
              <Timer className="h-3 w-3 mr-1" />
              Max hold: {MAX_HOLD_HOURS}h
            </Badge>
            {/* Go Live button */}
            {paperMode ? (
              <button
                onClick={() => setShowGoLiveModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/60 active:scale-95 transition-all px-3 py-1.5 text-xs font-black text-emerald-400 tracking-wider"
              >
                <Zap className="h-3.5 w-3.5" />
                GO LIVE
              </button>
            ) : (
              <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 px-3 py-1.5 text-xs font-black text-emerald-400 tracking-wider animate-pulse">
                <Zap className="h-3.5 w-3.5" />
                LIVE
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Go Live confirmation modal */}
      {showGoLiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 rounded-2xl bg-[#0d0d1a] border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 p-6">
            {/* Close */}
            <button
              onClick={() => setShowGoLiveModal(false)}
              className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Zap className="h-8 w-8 text-emerald-400" />
              </div>
            </div>

            <h2 className="text-xl font-black text-white text-center mb-1 tracking-tight">GO LIVE</h2>
            <p className="text-xs text-zinc-500 text-center mb-6">This will switch Wolf from paper trading to executing real trades with real money. There is no undo.</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
                <Shield className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-400">Risk Acknowledgment</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Real capital is at risk. Kill switch is armed at -40%. Ensure your Polymarket wallet is funded before proceeding.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-zinc-800/50 border border-white/5 p-3">
                <Zap className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">What happens next</p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Wolf will set WOLF_PAPER_MODE=false on the VPS and restart. First live trade entry alert will arrive on Telegram.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowGoLiveModal(false)}
                className="flex-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all py-3 text-sm font-bold text-zinc-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowGoLiveModal(false)
                  onGoLive?.()
                }}
                className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 transition-all py-3 text-sm font-black text-black tracking-wider"
              >
                ACTIVATE LIVE TRADING
              </button>
            </div>
          </div>
        </div>
      )}
      <CardContent className="p-0 flex-1 min-h-0">
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <span className="text-4xl mb-3">🐺</span>
            <p className="text-sm font-bold text-muted-foreground">Wolf is scanning the markets...</p>
            <p className="text-xs text-muted-foreground mt-1 italic">First positions loading</p>
          </div>
        ) : (
          <ScrollArea className="h-full max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold min-w-[200px]">Market</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Side</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Entry</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Size</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Exit</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold text-right">P&L</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Conf</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Age</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Time Left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTrades.map((trade) => {
                  const tradeMessage = getTradeMessage(trade)
                  const isWin = trade.status === 'CLOSED' && trade.pnl >= 0
                  const isBigWin = trade.status === 'CLOSED' && trade.pnl >= 200
                  const confidencePct = trade.confidence > 1 ? trade.confidence : Math.round(trade.confidence * 100)
                  const timeLeft = trade.status === 'OPEN' ? getTimeRemaining(trade.timestamp) : null

                  return (
                    <TableRow
                      key={trade.id}
                      className={`border-border transition-colors ${isBigWin ? 'bg-emerald-500/5' : ''} ${trade.status === 'OPEN' ? 'hover:bg-amber-500/5' : 'hover:bg-white/2'}`}
                    >
                      {/* Market name */}
                      <TableCell className="max-w-[200px]">
                        <div>
                          <span className="font-mono text-xs font-bold block leading-snug">{formatSymbol(trade.symbol)}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            {getStatusBadge(trade.status)}
                            {isBigWin && <Sparkles className="h-3 w-3 text-amber-400" />}
                          </div>
                        </div>
                      </TableCell>

                      {/* Side */}
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {trade.type === 'LONG' ? (
                            <><ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" /><span className="text-xs text-emerald-400 font-bold">YES</span></>
                          ) : (
                            <><ArrowDownRight className="h-3.5 w-3.5 text-red-500" /><span className="text-xs text-red-400 font-bold">NO</span></>
                          )}
                        </div>
                      </TableCell>

                      {/* Entry */}
                      <TableCell className="font-mono text-xs font-bold">${trade.entry.toFixed(3)}</TableCell>

                      {/* Exit */}
                      <TableCell className="font-mono text-xs">
                        {trade.exit ? (
                          <span className={trade.exit >= trade.entry && trade.type === 'LONG' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                            ${trade.exit.toFixed(3)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>

                      {/* P&L */}
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

                      {/* Confidence */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-10 overflow-hidden rounded-full bg-secondary">
                            <div
                              className={`h-full rounded-full ${confidencePct >= 80 ? 'bg-emerald-500' : confidencePct >= 70 ? 'bg-amber-500' : 'bg-orange-500'}`}
                              style={{ width: `${confidencePct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">{confidencePct}%</span>
                        </div>
                      </TableCell>

                      {/* Age */}
                      <TableCell>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatAge(trade.timestamp)}
                        </div>
                      </TableCell>

                      {/* Time Remaining — open trades only */}
                      <TableCell>
                        {timeLeft ? (
                          <div className="min-w-[80px]">
                            <div className="flex items-center gap-1 mb-0.5">
                              {timeLeft.urgency === 'critical' && <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />}
                              {timeLeft.urgency === 'warn' && <Timer className="h-3 w-3 text-amber-400 shrink-0" />}
                              <span className={`text-[10px] font-bold ${
                                timeLeft.urgency === 'critical' ? 'text-red-400' :
                                timeLeft.urgency === 'warn' ? 'text-amber-400' :
                                'text-zinc-400'
                              }`}>
                                {timeLeft.remaining}
                              </span>
                            </div>
                            <div className="h-1 w-16 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  timeLeft.urgency === 'critical' ? 'bg-red-500' :
                                  timeLeft.urgency === 'warn' ? 'bg-amber-500' :
                                  'bg-zinc-500'
                                }`}
                                style={{ width: `${timeLeft.pct}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-600">—</span>
                        )}
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
