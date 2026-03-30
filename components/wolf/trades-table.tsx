'use client'

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
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
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Open</Badge>
      case 'CLOSED':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Closed</Badge>
      case 'PENDING':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Pending</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Recent Trades</CardTitle>
          <Badge variant="outline" className="text-xs">
            {trades.filter(t => t.status === 'OPEN').length} Open
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground">Symbol</TableHead>
                <TableHead className="text-xs text-muted-foreground">Type</TableHead>
                <TableHead className="text-xs text-muted-foreground">Entry</TableHead>
                <TableHead className="text-xs text-muted-foreground">Exit</TableHead>
                <TableHead className="text-xs text-muted-foreground text-right">P&L</TableHead>
                <TableHead className="text-xs text-muted-foreground">Confidence</TableHead>
                <TableHead className="text-xs text-muted-foreground text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trades.map((trade) => (
                <TableRow key={trade.id} className="border-border">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{trade.symbol}</span>
                      {getStatusBadge(trade.status)}
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
                      <span className={`font-mono text-sm font-medium ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-secondary">
                        <div 
                          className="h-full bg-primary" 
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
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
