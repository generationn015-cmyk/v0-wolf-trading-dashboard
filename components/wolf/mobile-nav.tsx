'use client'

import { LayoutDashboard, Crosshair, BarChart3, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const mobileNavItems = [
  { id: 'dashboard', label: 'Floor', icon: LayoutDashboard },
  { id: 'trades', label: 'Hunts', icon: Crosshair },
  { id: 'analytics', label: 'Intel', icon: BarChart3 },
  { id: 'history', label: 'Ledger', icon: History },
  { id: 'settings', label: 'Config', icon: Settings },
]

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card/95 backdrop-blur-sm px-2 pb-safe-bottom lg:hidden">
      {mobileNavItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-3 rounded-lg transition-all min-w-[56px]',
              isActive
                ? 'text-amber-400'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className={cn('h-5 w-5', isActive && 'text-amber-400')} />
            <span className={cn(
              'text-[10px] font-bold tracking-wide',
              isActive ? 'text-amber-400' : 'text-muted-foreground'
            )}>
              {item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-400" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
