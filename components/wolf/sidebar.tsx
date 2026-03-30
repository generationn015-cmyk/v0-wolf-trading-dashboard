'use client'

import { 
  LayoutDashboard, 
  TrendingUp, 
  Brain, 
  Settings, 
  History,
  BarChart3,
  Shield,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'trades', label: 'Trades', icon: TrendingUp },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'learning', label: 'Learning', icon: Brain },
  { id: 'history', label: 'History', icon: History },
  { id: 'risk', label: 'Risk', icon: Shield },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="flex h-full w-16 flex-col border-r border-border bg-sidebar lg:w-56">
      <nav className="flex flex-1 flex-col gap-1 p-2 lg:p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary')} />
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          )
        })}
      </nav>
      
      {/* Wolf Status at Bottom */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-xl">🐺</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-sidebar-foreground">Wolf v2.4</p>
            <p className="text-xs text-sidebar-foreground/60">Self-learning active</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
