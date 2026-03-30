'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/wolf/header'
import { Sidebar } from '@/components/wolf/sidebar'
import { StatsCards } from '@/components/wolf/stats-cards'
import { PnLChart } from '@/components/wolf/pnl-chart'
import { DdubIndexChart } from '@/components/wolf/ddub-index-chart'
import { TradesTable } from '@/components/wolf/trades-table'
import { ActivityFeed } from '@/components/wolf/activity-feed'
import { MarketTicker } from '@/components/wolf/market-ticker'
import { LearningPanel } from '@/components/wolf/learning-panel'
import { 
  generatePnLData, 
  generateDdubData, 
  generateTrades, 
  getWolfStatus, 
  generateActivityLogs,
  getMarketData 
} from '@/lib/mock-data'
import type { PnLDataPoint, DdubIndexData, Trade, WolfStatus, ActivityLog, MarketData } from '@/lib/wolf-types'

export default function WolfMissionControl() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isConnected, setIsConnected] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  
  // Data state
  const [pnlData, setPnlData] = useState<PnLDataPoint[]>([])
  const [ddubData, setDdubData] = useState<DdubIndexData[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [wolfStatus, setWolfStatus] = useState<WolfStatus>(getWolfStatus())
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [marketData, setMarketData] = useState<MarketData[]>([])

  // Initialize data
  useEffect(() => {
    setPnlData(generatePnLData())
    setDdubData(generateDdubData())
    setTrades(generateTrades())
    setWolfStatus(getWolfStatus())
    setActivityLogs(generateActivityLogs())
    setMarketData(getMarketData())
  }, [])

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update market data with slight variations
      setMarketData(prev => prev.map(m => ({
        ...m,
        price: m.price + (Math.random() - 0.5) * 2,
        change: m.change + (Math.random() - 0.5) * 0.1,
        changePercent: m.changePercent + (Math.random() - 0.5) * 0.05,
      })))
      
      // Occasionally update D-Dub index
      if (Math.random() > 0.7) {
        setDdubData(prev => {
          const newData = [...prev.slice(1)]
          const lastValue = newData[newData.length - 1]?.value ?? 55
          const newValue = Math.max(35, Math.min(75, lastValue + (Math.random() - 0.5) * 5))
          const signal: 'BUY' | 'SELL' | 'HOLD' = newValue > 65 ? 'BUY' : newValue < 45 ? 'SELL' : 'HOLD'
          newData.push({
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            value: Math.round(newValue * 100) / 100,
            signal,
            strength: Math.round((Math.abs(newValue - 50) / 25) * 100)
          })
          return newData
        })
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = useCallback(() => {
    setPnlData(generatePnLData())
    setDdubData(generateDdubData())
    setTrades(generateTrades())
    setWolfStatus(getWolfStatus())
    setActivityLogs(generateActivityLogs())
    setMarketData(getMarketData())
    setLastRefresh(new Date())
  }, [])

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <Header 
        wolfStatus={wolfStatus} 
        onRefresh={handleRefresh} 
        isConnected={isConnected} 
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Market Ticker */}
              <MarketTicker data={marketData} />

              {/* Stats Cards */}
              <StatsCards wolfStatus={wolfStatus} />

              {/* Charts Row */}
              <div className="grid gap-6 lg:grid-cols-2">
                <PnLChart data={pnlData} />
                <DdubIndexChart data={ddubData} />
              </div>

              {/* Bottom Row */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <TradesTable trades={trades} />
                </div>
                <ActivityFeed logs={activityLogs} />
              </div>
            </div>
          )}

          {activeTab === 'trades' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Trade Management</h2>
              <TradesTable trades={trades} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Performance Analytics</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <PnLChart data={pnlData} />
                <DdubIndexChart data={ddubData} />
              </div>
              <StatsCards wolfStatus={wolfStatus} />
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Learning Engine</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <LearningPanel progress={wolfStatus.learningProgress} />
                <ActivityFeed logs={activityLogs.filter(l => l.type === 'LEARNING')} />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Trade History</h2>
              <TradesTable trades={trades.filter(t => t.status === 'CLOSED')} />
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Risk Management</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <DdubIndexChart data={ddubData} />
                <LearningPanel progress={wolfStatus.learningProgress} />
              </div>
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Automation Controls</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <LearningPanel progress={wolfStatus.learningProgress} />
                <ActivityFeed logs={activityLogs.filter(l => l.type === 'SYSTEM')} />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Settings</h2>
              <div className="rounded-lg border border-border bg-card p-6">
                <p className="text-muted-foreground">Settings panel coming soon. Configure Wolf parameters, API connections, and notification preferences here.</p>
              </div>
            </div>
          )}

          {/* Footer with last refresh time */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <span className="text-xs text-muted-foreground">
              Wolf Mission Control v1.0 | Data refreshes every 3s
            </span>
          </div>
        </main>
      </div>
    </div>
  )
}
