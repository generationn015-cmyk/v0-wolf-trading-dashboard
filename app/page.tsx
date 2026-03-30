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
import { Achievements } from '@/components/wolf/achievements'
import { StreakCounter } from '@/components/wolf/streak-counter'
import { BelfortQuotes } from '@/components/wolf/belfort-quotes'
import { TraderRank } from '@/components/wolf/trader-rank'
import { Confetti } from '@/components/wolf/confetti'
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
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Gamification state
  const [winStreak, setWinStreak] = useState(7)
  const [bestStreak, setBestStreak] = useState(12)
  const [totalProfit, setTotalProfit] = useState(15623.80)
  
  // Data state
  const [pnlData, setPnlData] = useState<PnLDataPoint[]>([])
  const [ddubData, setDdubData] = useState<DdubIndexData[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [wolfStatus, setWolfStatus] = useState<WolfStatus>(getWolfStatus())
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [marketData, setMarketData] = useState<MarketData[]>([])

  // Track mounted state to avoid hydration mismatches
  useEffect(() => {
    setMounted(true)
    setLastRefresh(new Date())
  }, [])

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

      // Simulate occasional wins (for demo purposes)
      if (Math.random() > 0.95) {
        setWinStreak(prev => {
          const newStreak = prev + 1
          if (newStreak > bestStreak) {
            setBestStreak(newStreak)
            setShowConfetti(true)
          }
          return newStreak
        })
        setTotalProfit(prev => prev + Math.random() * 500)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [bestStreak])

  const handleRefresh = useCallback(() => {
    setPnlData(generatePnLData())
    setDdubData(generateDdubData())
    setTrades(generateTrades())
    setWolfStatus(getWolfStatus())
    setActivityLogs(generateActivityLogs())
    setMarketData(getMarketData())
    setLastRefresh(new Date())
  }, [])

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev)
  }, [])

  // Trigger celebration for big wins
  const triggerCelebration = useCallback(() => {
    setShowConfetti(true)
  }, [])

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Confetti overlay */}
      <Confetti active={showConfetti} duration={4000} />
      
      {/* Header */}
      <Header 
        wolfStatus={wolfStatus} 
        onRefresh={handleRefresh} 
        isConnected={isConnected}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
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

              {/* Motivational Quote */}
              <BelfortQuotes />

              {/* Stats Cards */}
              <StatsCards wolfStatus={wolfStatus} />

              {/* Gamification Row */}
              <div className="grid gap-6 lg:grid-cols-3">
                <StreakCounter 
                  currentStreak={winStreak} 
                  bestStreak={bestStreak}
                  lastTradeWin={true}
                />
                <div className="lg:col-span-2">
                  <Achievements 
                    winStreak={winStreak}
                    totalProfit={totalProfit}
                    winRate={wolfStatus.winRate}
                  />
                </div>
              </div>

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
                <div className="space-y-6">
                  <TraderRank 
                    totalProfit={totalProfit}
                    totalTrades={wolfStatus.totalTrades}
                    winRate={wolfStatus.winRate}
                  />
                  <ActivityFeed logs={activityLogs} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trades' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Trade Management</h2>
                  <p className="text-sm text-muted-foreground">&quot;The only thing standing between you and your goal...&quot;</p>
                </div>
                <StreakCounter 
                  currentStreak={winStreak} 
                  bestStreak={bestStreak}
                  lastTradeWin={true}
                />
              </div>
              <TradesTable trades={trades} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Performance Analytics</h2>
                <p className="text-sm text-muted-foreground">Tracking the path to Wall Street domination</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <PnLChart data={pnlData} />
                <DdubIndexChart data={ddubData} />
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <TraderRank 
                  totalProfit={totalProfit}
                  totalTrades={wolfStatus.totalTrades}
                  winRate={wolfStatus.winRate}
                />
                <Achievements 
                  winStreak={winStreak}
                  totalProfit={totalProfit}
                  winRate={wolfStatus.winRate}
                />
              </div>
              <StatsCards wolfStatus={wolfStatus} />
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Learning Engine</h2>
                <p className="text-sm text-muted-foreground">The Wolf is always learning, always adapting</p>
              </div>
              <BelfortQuotes />
              <div className="grid gap-6 lg:grid-cols-2">
                <LearningPanel progress={wolfStatus.learningProgress} />
                <ActivityFeed logs={activityLogs.filter(l => l.type === 'LEARNING')} />
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Trade History</h2>
                <p className="text-sm text-muted-foreground">Every trade tells a story of conquest</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <TradesTable trades={trades.filter(t => t.status === 'CLOSED')} />
                </div>
                <TraderRank 
                  totalProfit={totalProfit}
                  totalTrades={wolfStatus.totalTrades}
                  winRate={wolfStatus.winRate}
                />
              </div>
            </div>
          )}

          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Risk Management</h2>
                <p className="text-sm text-muted-foreground">Fortune favors the bold, but respects the smart</p>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <DdubIndexChart data={ddubData} />
                <LearningPanel progress={wolfStatus.learningProgress} />
              </div>
              <StatsCards wolfStatus={wolfStatus} />
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Automation Controls</h2>
                <p className="text-sm text-muted-foreground">Let the Wolf hunt while you sleep</p>
              </div>
              <BelfortQuotes />
              <div className="grid gap-6 lg:grid-cols-2">
                <LearningPanel progress={wolfStatus.learningProgress} />
                <ActivityFeed logs={activityLogs.filter(l => l.type === 'SYSTEM')} />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Settings</h2>
                <p className="text-sm text-muted-foreground">Configure your trading empire</p>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent p-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">🐺</span>
                  <div>
                    <h3 className="font-bold text-foreground">Wolf of All Streets v1.0</h3>
                    <p className="text-sm text-muted-foreground">
                      Settings panel coming soon. Configure Wolf parameters, API connections, 
                      win rate thresholds, risk limits, and notification preferences here.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={triggerCelebration}
                    className="rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-500 transition-colors hover:bg-amber-500/30"
                  >
                    Test Celebration
                  </button>
                  <button className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/80">
                    Export Data
                  </button>
                </div>
              </div>
              <Achievements 
                winStreak={winStreak}
                totalProfit={totalProfit}
                winRate={wolfStatus.winRate}
              />
            </div>
          )}

          {/* Footer with last refresh time */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">
              Last updated: {mounted && lastRefresh ? lastRefresh.toLocaleTimeString() : '--:--:--'}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-xs text-amber-500/70">
                &quot;I&apos;m not f***ing leaving!&quot;
              </span>
              <span className="text-xs text-muted-foreground">
                Wolf of All Streets v1.0 | NYSE Live
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
