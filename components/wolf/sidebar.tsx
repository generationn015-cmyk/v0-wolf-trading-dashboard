'use client'

import { 
  LayoutDashboard, 
  TrendingUp, 
  Brain, 
  Settings, 
  History,
  BarChart3,
  Shield,
  Zap,
  Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: 'dashboard', label: 'The Floor', icon: LayoutDashboard, subtitle: 'Mission Control' },
  { id: 'trades', label: 'Positions', icon: TrendingUp, subtitle: 'Active Hunts' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, subtitle: 'Market Intel' },
  { id: 'learning', label: 'Evolution', icon: Brain, subtitle: 'Self-Improving' },
  { id: 'history', label: 'Ledger', icon: History, subtitle: 'Trade History' },
  { id: 'risk', label: 'Risk Mgmt', icon: Shield, subtitle: 'Stay Sharp' },
  { id: 'automation', label: 'Autopilot', icon: Zap, subtitle: 'Set & Forget' },
  { id: 'settings', label: 'Settings', icon: Settings, subtitle: 'Configure' },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="flex h-full w-16 flex-col border-r border-border bg-sidebar lg:w-56">
      {/* Stratton Oakmont Badge */}
      <div className="hidden lg:block border-b border-sidebar-border p-3">
        <div className="flex items-center gap-2 px-2">
          <Building2 className="h-5 w-5 text-amber-500" />
          <div>
            <p className="text-xs font-semibold text-sidebar-foreground">STRATTON</p>
            <p className="text-[10px] text-sidebar-foreground/50">Trading Division</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2 lg:p-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary')} />
              <div className="hidden lg:block text-left">
                <span className="block">{item.label}</span>
                {isActive && (
                  <span className="text-[10px] text-sidebar-foreground/50">{item.subtitle}</span>
                )}
              </div>
            </button>
          )
        })}
      </nav>
      
      {/* Wolf Status at Bottom */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-sidebar-accent to-sidebar-accent/50 p-3 relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full border-4 border-amber-500" />
            <div className="absolute -right-2 -bottom-2 h-10 w-10 rounded-full border-2 border-amber-500" />
          </div>
          
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30">
            <span className="text-xl">🐺</span>
          </div>
          <div className="hidden lg:block relative z-10">
            <p className="text-sm font-bold text-sidebar-foreground">Wolf v2.4</p>
            <p className="text-[10px] text-amber-400/80 italic">&quot;The Hunt Never Stops&quot;</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
