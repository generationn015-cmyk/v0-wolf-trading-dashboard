'use client'

import { Bell, Settings, RefreshCw, Wifi, WifiOff } from 'lucide-react'
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
}

export function Header({ wolfStatus, onRefresh, isConnected }: HeaderProps) {
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

  return (
    <header className="border-b border-border bg-card px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-2xl">🐺</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Wolf Mission Control</h1>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${getStatusColor(wolfStatus.status)} ${wolfStatus.status === 'ACTIVE' ? 'status-pulse' : ''}`} />
                <span className="text-xs text-muted-foreground">{wolfStatus.status}</span>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="ml-4 flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
            {isConnected ? (
              <>
                <Wifi className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-emerald-500">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 text-red-500" />
                <span className="text-xs text-red-500">Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Win Rate Badge */}
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
            <span className="text-xs text-muted-foreground">Win Rate</span>
            <Badge
              variant={wolfStatus.winRate >= 72 ? 'default' : 'secondary'}
              className={wolfStatus.winRate >= 72 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}
            >
              {wolfStatus.winRate.toFixed(1)}%
            </Badge>
          </div>

          {/* Open Positions */}
          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
            <span className="text-xs text-muted-foreground">Open</span>
            <Badge variant="outline">{wolfStatus.openPositions}</Badge>
          </div>

          {/* Refresh Button */}
          <Button variant="ghost" size="icon" onClick={onRefresh} className="text-muted-foreground hover:text-foreground">
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">Win Rate Alert</span>
                <span className="text-xs text-muted-foreground">Approaching 72% threshold</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">New Trade Opened</span>
                <span className="text-xs text-muted-foreground">LONG ES @ 5,245.50</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium">Learning Complete</span>
                <span className="text-xs text-muted-foreground">Model updated with new patterns</span>
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
