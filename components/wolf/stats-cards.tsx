'use client'

import { TrendingUp, TrendingDown, Activity, Target, Brain, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { WolfStatus } from '@/lib/wolf-types'

interface StatsCardsProps {
  wolfStatus: WolfStatus
}

export function StatsCards({ wolfStatus }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getRiskColor = (risk: WolfStatus['riskLevel']) => {
    switch (risk) {
      case 'LOW':
        return 'text-emerald-400'
      case 'MEDIUM':
        return 'text-amber-400'
      case 'HIGH':
        return 'text-red-400'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {/* Daily P&L */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Daily P&L</span>
            {wolfStatus.dailyPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className={`mt-2 text-xl font-semibold ${wolfStatus.dailyPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(wolfStatus.dailyPnL)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Today</p>
        </CardContent>
      </Card>

      {/* Weekly P&L */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Weekly P&L</span>
            {wolfStatus.weeklyPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className={`mt-2 text-xl font-semibold ${wolfStatus.weeklyPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(wolfStatus.weeklyPnL)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">This Week</p>
        </CardContent>
      </Card>

      {/* Monthly P&L */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Monthly P&L</span>
            {wolfStatus.monthlyPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className={`mt-2 text-xl font-semibold ${wolfStatus.monthlyPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(wolfStatus.monthlyPnL)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">This Month</p>
        </CardContent>
      </Card>

      {/* Total Trades */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total Trades</span>
            <Activity className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 text-xl font-semibold text-foreground">{wolfStatus.totalTrades}</p>
          <p className="mt-1 text-xs text-muted-foreground">Lifetime</p>
        </CardContent>
      </Card>

      {/* Win Rate with Progress */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Win Rate</span>
            <Target className="h-4 w-4 text-primary" />
          </div>
          <p className={`mt-2 text-xl font-semibold ${wolfStatus.winRate >= 72 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {wolfStatus.winRate.toFixed(1)}%
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Progress value={wolfStatus.winRate} className="h-1.5" />
            <span className="text-[10px] text-muted-foreground">72%</span>
          </div>
        </CardContent>
      </Card>

      {/* Learning Progress */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Learning</span>
            <Brain className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 text-xl font-semibold text-foreground">{wolfStatus.learningProgress}%</p>
          <div className="mt-2 flex items-center gap-2">
            <Progress value={wolfStatus.learningProgress} className="h-1.5" />
            <AlertTriangle className={`h-3 w-3 ${getRiskColor(wolfStatus.riskLevel)}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
