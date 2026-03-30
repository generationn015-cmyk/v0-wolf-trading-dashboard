'use client'

import { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'
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

// API fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function WolfMissionControl() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isConnected, setIsConnected] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [useApiData, setUseApiData] = useState(true)
  
  // Gamification state
  const [winStreak, setWinStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  
  // Mock data state (fallback) - initialize empty to avoid hydration mismatch
  const [mockPnlData, setMockPnlData] = useState<PnLDataPoint[]>([])
  const [mockDdubData, setMockDdubData] = useState<DdubIndexData[]>([])
  const [mockTrades, setMockTrades] = useState<Trade[]>([])
  const [mockWolfStatus, setMockWolfStatus] = useState<WolfStatus>({
    status: 'ACTIVE',
    winRate: 0,
    totalTrades: 0,
    dailyPnL: 0,
    weeklyPnL: 0,
    monthlyPnL: 0,
    learningProgress: 0,
    lastActivity: null,
    openPositions: 0,
    riskLevel: 'MEDIUM'
  })
  const [mockActivityLogs, setMockActivityLogs] = useState<ActivityLog[]>([])
  const [mockMarketData, setMockMarketData] = useState<MarketData[]>([])

  // SWR hooks for API data with auto-refresh
  const { data: apiState, mutate: refreshApiState } = useSWR(
    useApiData ? '/api/wolf/state' : null,
    fetcher,
    { refreshInterval: 2000 }
  )

  // Derived state from API or mock data
  const pnlData = useApiData && apiState?.data?.pnlData?.length > 0 
    ? apiState.data.pnlData.map((p: { date: string; pnl: number; cumulative: number; trades: number }) => ({
        date: p.date,
        pnl: p.pnl,
        cumulative: p.cumulative,
        trades: p.trades
      }))
    : mockPnlData

  const ddubData = useApiData && apiState?.data?.ddubData?.length > 0
    ? apiState.data.ddubData.map((d: { time: string; value: number; signal: string }) => ({
        timestamp: d.time,
        value: d.value,
        signal: d.signal,
        strength: Math.round((Math.abs(d.value - 50) / 25) * 100)
      }))
    : mockDdubData

  const trades: Trade[] = useApiData && apiState?.data?.trades?.length > 0
    ? apiState.data.trades.map((t: { id: string; symbol: string; side: string; entryPrice: number; exitPrice?: number; quantity: number; status: string; pnl?: number; pnlPercent?: number; entryTime: string; exitTime?: string; strategy?: string }) => ({
        id: t.id,
        symbol: t.symbol,
        side: t.side,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        quantity: t.quantity,
        status: t.status,
        pnl: t.pnl,
        pnlPercent: t.pnlPercent,
        entryTime: t.entryTime,
        exitTime: t.exitTime,
        strategy: t.strategy
      }))
    : mockTrades

  const wolfStatus: WolfStatus = useApiData && apiState?.data?.status
    ? {
        status: apiState.data.status.status,
        message: apiState.data.status.message,
        currentPosition: apiState.data.status.currentPosition,
        ddubSignal: apiState.data.status.ddubSignal?.value ?? 55,
        ddubDirection: apiState.data.status.ddubSignal?.direction ?? 'HOLD',
        winRate: apiState.data.performance?.winRate ?? 0,
        totalTrades: apiState.data.performance?.totalTrades ?? 0,
        learningProgress: apiState.data.learning?.progress ?? 0
      }
    : mockWolfStatus

  const activityLogs: ActivityLog[] = useApiData && apiState?.data?.activityLogs?.length > 0
    ? apiState.data.activityLogs.map((l: { id: string; type: string; message: string; timestamp: string; priority: string }) => ({
        id: l.id,
        type: l.type,
        message: l.message,
        timestamp: l.timestamp,
        priority: l.priority
      }))
    : mockActivityLogs

  const marketData: MarketData[] = useApiData && apiState?.data?.marketData?.length > 0
    ? apiState.data.marketData.map((m: { symbol: string; price: number; change: number; changePercent: number }) => ({
        symbol: m.symbol,
        price: m.price,
        change: m.change,
        changePercent: m.changePercent
      }))
    : mockMarketData

  // Update gamification from API
  useEffect(() => {
    if (useApiData && apiState?.data?.performance) {
      const perf = apiState.data.performance
      setWinStreak(perf.winStreak ?? winStreak)
      setBestStreak(perf.bestStreak ?? bestStreak)
      setTotalProfit(perf.totalProfit ?? totalProfit)
    }
  }, [apiState, useApiData, winStreak, bestStreak, totalProfit])

  // Track mounted state to avoid hydration mismatches
  useEffect(() => {
    setMounted(true)
    setLastRefresh(new Date())
  }, [])

  // Initialize mock data
  useEffect(() => {
    setMockPnlData(generatePnLData())
    setMockDdubData(generateDdubData())
    setMockTrades(generateTrades())
    setMockWolfStatus(getWolfStatus())
    setMockActivityLogs(generateActivityLogs())
    setMockMarketData(getMarketData())
  }, [])

  // Check API connection status
  useEffect(() => {
    if (useApiData) {
      setIsConnected(!!apiState?.success)
    }
  }, [apiState, useApiData])

  // Simulate live updates for mock data only
  useEffect(() => {
    if (useApiData) return // Skip mock updates when using API

    const interval = setInterval(() => {
      // Update market data with slight variations
      setMockMarketData(prev => prev.map(m => ({
        ...m,
        price: m.price + (Math.random() - 0.5) * 2,
        change: m.change + (Math.random() - 0.5) * 0.1,
        changePercent: m.changePercent + (Math.random() - 0.5) * 0.05,
      })))
      
      // Occasionally update D-Dub index
      if (Math.random() > 0.7) {
        setMockDdubData(prev => {
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
  }, [bestStreak, useApiData])

  const handleRefresh = useCallback(() => {
    if (useApiData) {
      refreshApiState()
    } else {
      setMockPnlData(generatePnLData())
      setMockDdubData(generateDdubData())
      setMockTrades(generateTrades())
      setMockWolfStatus(getWolfStatus())
      setMockActivityLogs(generateActivityLogs())
      setMockMarketData(getMarketData())
    }
    setLastRefresh(new Date())
  }, [useApiData, refreshApiState])

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev)
  }, [])

  // Trigger celebration for big wins
  const triggerCelebration = useCallback(() => {
    setShowConfetti(true)
  }, [])

  const toggleDataSource = useCallback(() => {
    setUseApiData(prev => !prev)
    setLastRefresh(new Date())
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
              
              {/* Data Source Toggle */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-bold text-foreground mb-4">Data Source</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleDataSource}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      !useApiData 
                        ? 'bg-amber-500 text-background' 
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Demo Mode
                  </button>
                  <button
                    onClick={toggleDataSource}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      useApiData 
                        ? 'bg-emerald-500 text-background' 
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Live API
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {useApiData 
                      ? 'Connected to OpenClaw agent via API' 
                      : 'Using simulated demo data'}
                  </span>
                </div>
                {useApiData && (
                  <div className="mt-4 rounded bg-secondary/50 p-3 text-xs font-mono text-muted-foreground">
                    <p>API Endpoint: <span className="text-emerald-500">/api/wolf/webhook</span></p>
                    <p>Status: <span className={isConnected ? 'text-emerald-500' : 'text-red-500'}>{isConnected ? 'Connected' : 'Disconnected'}</span></p>
                    <p>Last Update: {apiState?.data?.lastUpdated ?? 'Never'}</p>
                  </div>
                )}
              </div>

              {/* API Documentation */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-bold text-foreground mb-4">OpenClaw API Integration</h3>
                <div className="space-y-3 text-sm">
                  <div className="rounded bg-secondary/50 p-3 font-mono">
                    <p className="text-amber-500 mb-2"># Main webhook endpoint (receives all updates)</p>
                    <p>POST /api/wolf/webhook</p>
                    <p className="text-muted-foreground mt-1">Header: x-wolf-api-key: YOUR_API_KEY</p>
                  </div>
                  <div className="rounded bg-secondary/50 p-3 font-mono">
                    <p className="text-amber-500 mb-2"># Individual endpoints</p>
                    <p>GET/POST /api/wolf/trades</p>
                    <p>GET/POST /api/wolf/status</p>
                    <p>GET/POST /api/wolf/performance</p>
                    <p>GET/POST /api/wolf/market</p>
                    <p>GET/POST /api/wolf/ddub</p>
                    <p>GET /api/wolf/state <span className="text-muted-foreground">(full dashboard state)</span></p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent p-6">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">&#x1F43A;</span>
                  <div>
                    <h3 className="font-bold text-foreground">Wolf of All Streets v1.0</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure Wolf parameters, API connections, win rate thresholds (72%), 
                      risk limits, and notification preferences.
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
              {useApiData && <span className="ml-2 text-emerald-500">(Live)</span>}
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
