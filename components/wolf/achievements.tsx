'use client'

import { useState } from 'react'
import { Trophy, Star, Flame, Target, Crown, Zap, TrendingUp, Award, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress?: number
  maxProgress?: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
}

interface AchievementsProps {
  winStreak: number
  totalProfit: number
  winRate: number
}

export function Achievements({ winStreak, totalProfit, winRate }: AchievementsProps) {
  const achievements: Achievement[] = [
    {
      id: 'first-blood',
      title: 'First Blood',
      description: 'Close your first winning trade',
      icon: <Target className="h-5 w-5" />,
      unlocked: true,
      rarity: 'common',
      unlockedAt: new Date('2024-01-15'),
    },
    {
      id: 'wolf-pup',
      title: 'Wolf Pup',
      description: 'Achieve 5 consecutive winning trades',
      icon: <Flame className="h-5 w-5" />,
      unlocked: winStreak >= 5,
      progress: Math.min(winStreak, 5),
      maxProgress: 5,
      rarity: 'common',
    },
    {
      id: 'sell-me-this-pen',
      title: 'Sell Me This Pen',
      description: 'Execute 100 total trades',
      icon: <Zap className="h-5 w-5" />,
      unlocked: true,
      rarity: 'rare',
      unlockedAt: new Date('2024-02-20'),
    },
    {
      id: 'money-never-sleeps',
      title: 'Money Never Sleeps',
      description: 'Trade during pre-market hours',
      icon: <Star className="h-5 w-5" />,
      unlocked: true,
      rarity: 'rare',
    },
    {
      id: 'stratton-oakmont',
      title: 'Stratton Oakmont',
      description: 'Achieve $10,000 in total profits',
      icon: <TrendingUp className="h-5 w-5" />,
      unlocked: totalProfit >= 10000,
      progress: Math.min(totalProfit, 10000),
      maxProgress: 10000,
      rarity: 'epic',
    },
    {
      id: 'im-not-leaving',
      title: "I'm Not F***ing Leaving!",
      description: 'Maintain 72%+ win rate for 30 days',
      icon: <Award className="h-5 w-5" />,
      unlocked: winRate >= 72,
      progress: winRate >= 72 ? 30 : 18,
      maxProgress: 30,
      rarity: 'epic',
    },
    {
      id: 'wolf-of-all-streets',
      title: 'Wolf of All Streets',
      description: 'Achieve 15 consecutive winning trades',
      icon: <Crown className="h-5 w-5" />,
      unlocked: winStreak >= 15,
      progress: Math.min(winStreak, 15),
      maxProgress: 15,
      rarity: 'legendary',
    },
    {
      id: 'yacht-money',
      title: 'Yacht Money',
      description: 'Reach $100,000 in total profits',
      icon: <Trophy className="h-5 w-5" />,
      unlocked: false,
      progress: totalProfit,
      maxProgress: 100000,
      rarity: 'legendary',
    },
  ]

  const getRarityStyles = (rarity: Achievement['rarity'], unlocked: boolean) => {
    if (!unlocked) return 'bg-muted/50 border-border text-muted-foreground'
    switch (rarity) {
      case 'common':
        return 'bg-slate-500/20 border-slate-500/50 text-slate-300'
      case 'rare':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-300'
      case 'epic':
        return 'bg-purple-500/20 border-purple-500/50 text-purple-300'
      case 'legendary':
        return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50 text-amber-300'
      default:
        return 'bg-muted border-border'
    }
  }

  const getRarityBadge = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return <Badge variant="secondary" className="text-[10px]">Common</Badge>
      case 'rare':
        return <Badge className="bg-blue-500/20 text-blue-300 text-[10px]">Rare</Badge>
      case 'epic':
        return <Badge className="bg-purple-500/20 text-purple-300 text-[10px]">Epic</Badge>
      case 'legendary':
        return <Badge className="bg-amber-500/20 text-amber-300 text-[10px]">Legendary</Badge>
    }
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Trophy className="h-5 w-5 text-amber-500" />
            Achievements
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {unlockedCount}/{achievements.length} Unlocked
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-4 gap-3">
            {achievements.map((achievement) => (
              <Tooltip key={achievement.id}>
                <TooltipTrigger asChild>
                  <div
                    className={`relative flex flex-col items-center justify-center rounded-lg border p-3 transition-all hover:scale-105 cursor-pointer ${getRarityStyles(achievement.rarity, achievement.unlocked)}`}
                  >
                    {!achievement.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className={`${achievement.unlocked ? '' : 'opacity-30'}`}>
                      {achievement.icon}
                    </div>
                    {achievement.progress !== undefined && achievement.maxProgress && !achievement.unlocked && (
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="mt-2 h-1 w-full" 
                      />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{achievement.title}</p>
                      {getRarityBadge(achievement.rarity)}
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    {achievement.progress !== undefined && achievement.maxProgress && (
                      <p className="text-xs text-primary">
                        Progress: {achievement.progress.toLocaleString()}/{achievement.maxProgress.toLocaleString()}
                      </p>
                    )}
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-[10px] text-muted-foreground">
                        Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
