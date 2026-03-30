import type { Trade, WolfStatus, ActivityLog, PnLDataPoint, DdubIndexData, MarketData } from './wolf-types'

// Generate realistic P&L data for the last 30 days
export function generatePnLData(): PnLDataPoint[] {
  const data: PnLDataPoint[] = []
  let cumulative = 0
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dailyPnl = (Math.random() - 0.35) * 500 // Slightly positive bias
    cumulative += dailyPnl
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pnl: Math.round(dailyPnl * 100) / 100,
      cumulative: Math.round(cumulative * 100) / 100,
      trades: Math.floor(Math.random() * 8) + 2
    })
  }
  return data
}

// Generate D-Dub Index data
export function generateDdubData(): DdubIndexData[] {
  const data: DdubIndexData[] = []
  const now = new Date()
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now)
    timestamp.setHours(timestamp.getHours() - i)
    const value = 45 + Math.random() * 30
    const signal: 'BUY' | 'SELL' | 'HOLD' = value > 65 ? 'BUY' : value < 45 ? 'SELL' : 'HOLD'
    data.push({
      timestamp: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      value: Math.round(value * 100) / 100,
      signal,
      strength: Math.round((Math.abs(value - 50) / 25) * 100)
    })
  }
  return data
}

// Mock trades
export function generateTrades(): Trade[] {
  const symbols = ['ES', 'NQ', 'SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'AMZN']
  const strategies = ['Momentum', 'Mean Reversion', 'Breakout', 'Scalp', 'Swing']
  const trades: Trade[] = []
  
  for (let i = 0; i < 15; i++) {
    const isWin = Math.random() > 0.28 // ~72% win rate
    const type = Math.random() > 0.5 ? 'LONG' : 'SHORT'
    const entry = 100 + Math.random() * 400
    const pnlAmount = isWin ? Math.random() * 200 + 50 : -(Math.random() * 100 + 20)
    const exit = type === 'LONG' 
      ? entry + (pnlAmount / 10)
      : entry - (pnlAmount / 10)
    
    const timestamp = new Date()
    timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 48))
    
    trades.push({
      id: `trade-${i + 1}`,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      type,
      entry: Math.round(entry * 100) / 100,
      exit: i < 2 ? null : Math.round(exit * 100) / 100,
      pnl: i < 2 ? 0 : Math.round(pnlAmount * 100) / 100,
      status: i < 2 ? 'OPEN' : 'CLOSED',
      timestamp,
      confidence: Math.round((0.6 + Math.random() * 0.35) * 100),
      strategy: strategies[Math.floor(Math.random() * strategies.length)]
    })
  }
  
  return trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Wolf status
export function getWolfStatus(): WolfStatus {
  return {
    status: 'ACTIVE',
    winRate: 71.4,
    totalTrades: 847,
    dailyPnL: 342.50,
    weeklyPnL: 1847.25,
    monthlyPnL: 5623.80,
    learningProgress: 87,
    lastActivity: new Date(),
    openPositions: 2,
    riskLevel: 'MEDIUM'
  }
}

// Activity logs
export function generateActivityLogs(): ActivityLog[] {
  const logs: ActivityLog[] = [
    {
      id: '1',
      type: 'TRADE',
      message: 'Opened LONG position on ES at 5,245.50',
      timestamp: new Date(),
      priority: 'HIGH'
    },
    {
      id: '2',
      type: 'ANALYSIS',
      message: 'D-Dub Index crossed above 65 - Bullish signal detected',
      timestamp: new Date(Date.now() - 15 * 60000),
      priority: 'MEDIUM'
    },
    {
      id: '3',
      type: 'LEARNING',
      message: 'Self-correction applied: Tightened stop-loss parameters by 2.5%',
      timestamp: new Date(Date.now() - 32 * 60000),
      priority: 'MEDIUM'
    },
    {
      id: '4',
      type: 'TRADE',
      message: 'Closed SHORT position on NQ at 18,432.00 | P&L: +$187.50',
      timestamp: new Date(Date.now() - 45 * 60000),
      priority: 'HIGH'
    },
    {
      id: '5',
      type: 'ALERT',
      message: 'Win rate approaching 72% threshold (Current: 71.4%)',
      timestamp: new Date(Date.now() - 60 * 60000),
      priority: 'HIGH'
    },
    {
      id: '6',
      type: 'SYSTEM',
      message: 'Learning engine checkpoint saved - State persisted',
      timestamp: new Date(Date.now() - 90 * 60000),
      priority: 'LOW'
    },
    {
      id: '7',
      type: 'ANALYSIS',
      message: 'Market volatility increased - Adjusting position sizing',
      timestamp: new Date(Date.now() - 120 * 60000),
      priority: 'MEDIUM'
    },
    {
      id: '8',
      type: 'LEARNING',
      message: 'Pattern recognition model updated with 24 new samples',
      timestamp: new Date(Date.now() - 180 * 60000),
      priority: 'LOW'
    }
  ]
  return logs
}

// Market data
export function getMarketData(): MarketData[] {
  return [
    { symbol: 'ES', price: 5245.50, change: 12.25, changePercent: 0.23, volume: 1245000, high: 5258.00, low: 5230.25 },
    { symbol: 'NQ', price: 18432.00, change: -45.50, changePercent: -0.25, volume: 892000, high: 18510.00, low: 18380.00 },
    { symbol: 'SPY', price: 524.85, change: 1.42, changePercent: 0.27, volume: 45000000, high: 526.10, low: 523.40 },
    { symbol: 'QQQ', price: 448.20, change: -0.85, changePercent: -0.19, volume: 32000000, high: 450.50, low: 447.00 },
  ]
}
