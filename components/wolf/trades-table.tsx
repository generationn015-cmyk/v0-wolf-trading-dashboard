'use client'

import { ArrowUpRight, ArrowDownRight, Sparkles, TrendingUp, Target } from 'lucide-react'
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

// Wolf-themed trade result messages
const getTradeMessage = (trade: Trade) => {
  if (trade.status !== 'CLOSED') return null
  if (trade.pnl >= 1000) return 'Yacht fuel money!'
  if (trade.pnl >= 500) return 'Stratton approved!'
  if (trade.pnl >= 100) return 'Money never sleeps'
  if (trade.pnl >= 0) return 'Wolf takes profit'
  if (trade.pnl >= -100) return 'Minor scratch'
  if (trade.pnl >= -500) return 'Shake it off'
  return 'Part of the game'
}

export function TradesTable({ trades }: TradesTableProps) {
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`
    }
    return `${minutes}m ago`
  }

  const getStatusBadge = (status: Trade['status']) => {
    switch (status) {
      case 'OPEN':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Hunting</Badge>
      case 'CLOSED':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Closed</Badge>
      case 'PENDING':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Stalking</Badge>
      default:
        return null
    }
  }

  const openTrades = trades.filter(t => t.status === 'OPEN')
  const totalOpenPnL = openTrades.reduce((sum, t) => sum + (t.unrealizedPnl || 0), 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            The Hunt Log
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Target className="h-3 w-3" />
              {openTrades.length} Active
            </Badge>
            {totalOpenPnL !== 0 && (
              <Badge 
                className={`text-xs ${totalOpenPnL >= 0 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
                }`}
              >
                {totalOpenPnL >= 0 ? '+' : ''}${totalOpenPnL.toFixed(2)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground">Target</TableHead>
                <TableHead className="text-xs text-muted-foreground">Position</TableHead>
                <TableHead className="text-xs text-muted-foreground">Entry</TableHead>
                <TableHead className="text-xs text-muted-foreground">Exit</TableHead>
                <TableHead className="text-xs text-muted-foreground text-right">P&L</TableHead>
                <TableHead className="text-xs text-muted-foreground">Conviction</TableHead>
                <TableHead className="text-xs text-muted-foreground text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => {
                const tradeMessage = getTradeMessage(trade)
                const isWin = trade.status === 'CLOSED' && trade.pnl >= 0
                const isBigWin = trade.status === 'CLOSED' && trade.pnl >= 500
                
                return (
                  <TableRow 
                    key={trade.id} 
                    className={`border-border transition-colors ${isBigWin ? 'bg-emerald-500/5' : ''}`}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{trade.symbol}</span>
                        {getStatusBadge(trade.status)}
                        {isBigWin && <Sparkles className="h-3 w-3 text-amber-400" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {trade.type === 'LONG' ? (
                          <>
                            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-xs text-emerald-400">LONG</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                            <span className="text-xs text-red-400">SHORT</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">${trade.entry.toFixed(2)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {trade.exit ? `$${trade.exit.toFixed(2)}` : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {trade.status === 'CLOSED' ? (
                        <div>
                          <span className={`font-mono text-sm font-medium ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                          </span>
                          {tradeMessage && (
                            <span className={`block text-[9px] ${isWin ? 'text-emerald-400/60' : 'text-red-400/60'} italic`}>
                              {tradeMessage}
                            </span>
                          )}
                        </div>
                      ) : trade.unrealizedPnl !== undefined ? (
                        <span className={`font-mono text-sm ${trade.unrealizedPnl >= 0 ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
                          {trade.unrealizedPnl >= 0 ? '+' : ''}${trade.unrealizedPnl.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-secondary">
                          <div 
                            className={`h-full ${trade.confidence >= 80 ? 'bg-emerald-500' : trade.confidence >= 60 ? 'bg-primary' : 'bg-amber-500'}`}
                            style={{ width: `${trade.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{trade.confidence}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatTime(trade.timestamp)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
