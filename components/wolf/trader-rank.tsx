'use client'

import { Crown, Star, TrendingUp, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface TraderRankProps {
  totalProfit: number
  totalTrades: number
  winRate: number
}

type RankTier = {
  name: string
  icon: React.ReactNode
  minProfit: number
  color: string
  bgColor: string
  borderColor: string
  title: string
}

const RANK_TIERS: RankTier[] = [
  {
    name: 'Street Hustler',
    icon: <TrendingUp className="h-5 w-5" />,
    minProfit: 0,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/20',
    borderColor: 'border-slate-500/50',
    title: 'Just getting started'
  },
  {
    name: 'Broker',
    icon: <TrendingUp className="h-5 w-5" />,
    minProfit: 1000,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/50',
    title: 'Making moves'
  },
  {
    name: 'Senior Broker',
    icon: <Star className="h-5 w-5" />,
    minProfit: 5000,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    title: 'Climbing the ladder'
  },
  {
    name: 'Vice President',
    icon: <Star className="h-5 w-5" />,
    minProfit: 10000,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50',
    title: 'Corner office incoming'
  },
  {
    name: 'Partner',
    icon: <Crown className="h-5 w-5" />,
    minProfit: 25000,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/50',
    title: 'Stratton Oakmont elite'
  },
  {
    name: 'Wolf of All Streets',
    icon: <Crown className="h-5 w-5" />,
    minProfit: 100000,
    color: 'text-amber-300',
    bgColor: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
    borderColor: 'border-amber-400',
    title: 'Legend status achieved'
  },
]

export function TraderRank({ totalProfit, totalTrades, winRate }: TraderRankProps) {
  const getCurrentRank = () => {
    for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
      if (totalProfit >= RANK_TIERS[i].minProfit) {
        return { rank: RANK_TIERS[i], index: i }
      }
    }
    return { rank: RANK_TIERS[0], index: 0 }
  }

  const { rank: currentRank, index: rankIndex } = getCurrentRank()
  const nextRank = RANK_TIERS[rankIndex + 1]
  
  const progressToNext = nextRank
    ? ((totalProfit - currentRank.minProfit) / (nextRank.minProfit - currentRank.minProfit)) * 100
    : 100

  return (
    <Card className={`bg-card border-2 ${currentRank.borderColor}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base font-medium">
          <span className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${currentRank.bgColor}`}>
              <span className={currentRank.color}>{currentRank.icon}</span>
            </div>
            Trader Rank
          </span>
          <Badge className={`${currentRank.bgColor} ${currentRank.color} border-0`}>
            Level {rankIndex + 1}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className={`text-xl font-bold ${currentRank.color}`}>{currentRank.name}</h3>
          <p className="text-xs text-muted-foreground">{currentRank.title}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-secondary p-2">
            <p className="text-lg font-bold text-foreground">${(totalProfit / 1000).toFixed(1)}k</p>
            <p className="text-[10px] text-muted-foreground">Total Profit</p>
          </div>
          <div className="rounded-lg bg-secondary p-2">
            <p className="text-lg font-bold text-foreground">{totalTrades}</p>
            <p className="text-[10px] text-muted-foreground">Trades</p>
          </div>
          <div className="rounded-lg bg-secondary p-2">
            <p className={`text-lg font-bold ${winRate >= 72 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {winRate.toFixed(1)}%
            </p>
            <p className="text-[10px] text-muted-foreground">Win Rate</p>
          </div>
        </div>

        {nextRank && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress to {nextRank.name}</span>
              <span className={nextRank.color}>
                ${(nextRank.minProfit - totalProfit).toLocaleString()} to go
              </span>
            </div>
            <div className="relative">
              <Progress value={progressToNext} className="h-2" />
              <ChevronUp 
                className={`absolute -top-1 h-4 w-4 ${nextRank.color} transition-all`}
                style={{ left: `${Math.min(progressToNext, 95)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>${currentRank.minProfit.toLocaleString()}</span>
              <span>${nextRank.minProfit.toLocaleString()}</span>
            </div>
          </div>
        )}

        {!nextRank && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center">
            <p className="text-sm font-medium text-amber-400">Maximum Rank Achieved!</p>
            <p className="text-xs text-muted-foreground">You are the Wolf of All Streets</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
