'use client'

import { useState, useEffect } from 'react'
import { Bell, Settings, RefreshCw, Wifi, WifiOff, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import type { WolfStatus } from '@/lib/wolf-types'

interface HeaderProps {
  wolfStatus: WolfStatus
  onRefresh: () => void
  isConnected: boolean
  soundEnabled?: boolean
  onToggleSound?: () => void
}

export function Header({ wolfStatus, onRefresh, isConnected, soundEnabled = false, onToggleSound }: HeaderProps) {
  const [nyseTime, setNyseTime] = useState<string | null>(null)

  useEffect(() => {
    const updateTime = () => {
      setNyseTime(new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: WolfStatus['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500'
      case 'LEARNING':
        return 'bg-amber-500'
      case 'IDLE':
        return 'bg-slate-400'
      case 'ERROR':
        return 'bg-red-500'
      default:
        return 'bg-slate-400'
    }
  }

  const getStatusMessage = (status: WolfStatus['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'Hunting for profits...'
      case 'LEARNING':
        return 'Sharpening the claws...'
      case 'IDLE':
        return 'The wolf rests...'
      case 'ERROR':
        return 'Wolf needs attention!'
      default:
        return ''
    }
  }

  return (
    <header className="border-b border-border bg-card px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30">
              <span className="text-3xl">🐺</span>
              <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-card ${getStatusColor(wolfStatus.status)} ${wolfStatus.status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Wolf <span className="text-amber-500">of All Streets</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{getStatusMessage(wolfStatus.status)}</span>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="ml-4 flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-emerald-500">Wall St. Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-500">Offline</span>
              </>
            )}
          </div>

          {/* NYC Time */}
          <div className="hidden md:flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
            <span className="text-[10px] text-muted-foreground">NYSE</span>
            <span className="text-xs font-mono text-foreground">
              {nyseTime ?? '--:--'}
            </span>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Win Rate Badge - Styled like trading terminal */}
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Win Rate</span>
            <Badge
              variant={wolfStatus.winRate >= 72 ? 'default' : 'secondary'}
              className={`font-mono text-sm ${wolfStatus.winRate >= 72 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-amber-500/20 text-amber-400 border border-amber-500/50'}`}
            >
              {wolfStatus.winRate.toFixed(1)}%
            </Badge>
            {wolfStatus.winRate >= 72 && (
              <span className="text-[10px] text-emerald-500">TARGET HIT</span>
            )}
          </div>

          {/* Open Positions */}
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Open</span>
            <Badge variant="outline" className="font-mono">{wolfStatus.openPositions}</Badge>
          </div>

          {/* Sound Toggle */}
          {onToggleSound && (
            <Button variant="ghost" size="icon" onClick={onToggleSound} className="text-muted-foreground hover:text-foreground">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          )}

          {/* Refresh Button */}
          <Button variant="ghost" size="icon" onClick={onRefresh} className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium">🎯 Win Rate Alert</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Target</Badge>
                </div>
                <span className="text-xs text-muted-foreground">Approaching 72% threshold - almost there!</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium">📈 New Trade Opened</span>
                  <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">Trade</Badge>
                </div>
                <span className="text-xs text-muted-foreground">LONG ES @ 5,245.50 | Confidence: 87%</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-medium">🏆 Achievement Unlocked!</span>
                  <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">New!</Badge>
                </div>
                <span className="text-xs text-muted-foreground">&quot;Hot Streak&quot; - 5 consecutive wins!</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings */}
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
