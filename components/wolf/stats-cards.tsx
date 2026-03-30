'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, Target, Brain, AlertTriangle, DollarSign, Briefcase } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { WolfStatus } from '@/lib/wolf-types'

interface StatsCardsProps {
  wolfStatus: WolfStatus
}

// Wall Street motivational labels based on performance
const getPerformanceLabel = (value: number, type: 'daily' | 'weekly' | 'monthly') => {
  if (value >= 5000) return 'Yacht Money!'
  if (value >= 2000) return 'Stratton Approved'
  if (value >= 1000) return 'Money Never Sleeps'
  if (value >= 500) return 'The Hunt Pays Off'
  if (value >= 0) return 'Staying Sharp'
  if (value >= -500) return 'Temporary Setback'
  return 'Recalibrating...'
}

const getWinRateLabel = (rate: number) => {
  if (rate >= 80) return 'Elite Predator'
  if (rate >= 72) return 'Threshold Breaker'
  if (rate >= 65) return 'Pack Leader'
  if (rate >= 50) return 'Lone Wolf'
  return 'Pup in Training'
}

export function StatsCards({ wolfStatus }: StatsCardsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  
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

  const getRiskLabel = (risk: WolfStatus['riskLevel']) => {
    switch (risk) {
      case 'LOW':
        return 'Playing it Safe'
      case 'MEDIUM':
        return 'Calculated Risk'
      case 'HIGH':
        return 'Fortune Favors Bold'
      default:
        return ''
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {/* Daily P&L */}
      <Card 
        className="bg-card border-border transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        onMouseEnter={() => setHoveredCard('daily')}
        onMouseLeave={() => setHoveredCard(null)}
      >
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
          <p className="mt-1 text-[10px] text-muted-foreground italic">
            {hoveredCard === 'daily' ? getPerformanceLabel(wolfStatus.dailyPnL, 'daily') : 'Today'}
          </p>
        </CardContent>
      </Card>

      {/* Weekly P&L */}
      <Card 
        className="bg-card border-border transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        onMouseEnter={() => setHoveredCard('weekly')}
        onMouseLeave={() => setHoveredCard(null)}
      >
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
          <p className="mt-1 text-[10px] text-muted-foreground italic">
            {hoveredCard === 'weekly' ? getPerformanceLabel(wolfStatus.weeklyPnL, 'weekly') : 'This Week'}
          </p>
        </CardContent>
      </Card>

      {/* Monthly P&L */}
      <Card 
        className="bg-card border-border transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        onMouseEnter={() => setHoveredCard('monthly')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Monthly P&L</span>
            {wolfStatus.monthlyPnL >= 0 ? (
              <DollarSign className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className={`mt-2 text-xl font-semibold ${wolfStatus.monthlyPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(wolfStatus.monthlyPnL)}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground italic">
            {hoveredCard === 'monthly' ? getPerformanceLabel(wolfStatus.monthlyPnL, 'monthly') : 'This Month'}
          </p>
        </CardContent>
      </Card>

      {/* Total Trades */}
      <Card 
        className="bg-card border-border transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        onMouseEnter={() => setHoveredCard('trades')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total Trades</span>
            <Briefcase className="h-4 w-4 text-accent" />
          </div>
          <p className="mt-2 text-xl font-semibold text-foreground">{wolfStatus.totalTrades}</p>
          <p className="mt-1 text-[10px] text-muted-foreground italic">
            {hoveredCard === 'trades' 
              ? wolfStatus.totalTrades >= 100 ? 'Sell Me This Pen!' : 'Building the empire' 
              : 'Lifetime'
            }
          </p>
        </CardContent>
      </Card>

      {/* Win Rate with Progress */}
      <Card 
        className={`bg-card border-border transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 ${wolfStatus.winRate >= 72 ? 'ring-1 ring-emerald-500/30' : ''}`}
        onMouseEnter={() => setHoveredCard('winrate')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Win Rate</span>
            <Target className={`h-4 w-4 ${wolfStatus.winRate >= 72 ? 'text-emerald-500' : 'text-primary'}`} />
          </div>
          <p className={`mt-2 text-xl font-semibold ${wolfStatus.winRate >= 72 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {wolfStatus.winRate.toFixed(1)}%
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Progress value={wolfStatus.winRate} className="h-1.5" />
            <span className="text-[10px] text-muted-foreground">72%</span>
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground italic">
            {hoveredCard === 'winrate' ? getWinRateLabel(wolfStatus.winRate) : ''}
          </p>
        </CardContent>
      </Card>

      {/* Learning Progress */}
      <Card 
        className="bg-card border-border transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
        onMouseEnter={() => setHoveredCard('learning')}
        onMouseLeave={() => setHoveredCard(null)}
      >
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
          <p className="mt-1 text-[10px] text-muted-foreground italic">
            {hoveredCard === 'learning' ? getRiskLabel(wolfStatus.riskLevel) : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
