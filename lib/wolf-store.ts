// In-memory store for Wolf dashboard data
// In production, replace with Redis/database for persistence

import type {
  TradeUpdate,
  WolfStatusUpdate,
  PerformanceUpdate,
  MarketDataUpdate,
  ActivityLogEntry,
  DdubDataPoint,
  PnlDataPoint,
  LearningUpdate
} from './api-types'

interface WolfStore {
  trades: TradeUpdate[]
  status: WolfStatusUpdate
  performance: PerformanceUpdate
  marketData: MarketDataUpdate[]
  activityLogs: ActivityLogEntry[]
  ddubData: DdubDataPoint[]
  pnlData: PnlDataPoint[]
  learning: LearningUpdate
  lastUpdated: string
}

// Initialize with default values
const defaultStore: WolfStore = {
  trades: [],
  status: {
    status: 'resting',
    message: 'Waiting for OpenClaw connection...'
  },
  performance: {
    dailyPnl: 0,
    weeklyPnl: 0,
    monthlyPnl: 0,
    totalTrades: 0,
    winRate: 0,
    winStreak: 0,
    bestStreak: 0,
    totalProfit: 0
  },
  marketData: [
    { symbol: 'ES', price: 0, change: 0, changePercent: 0 },
    { symbol: 'NQ', price: 0, change: 0, changePercent: 0 },
    { symbol: 'SPY', price: 0, change: 0, changePercent: 0 },
    { symbol: 'QQQ', price: 0, change: 0, changePercent: 0 }
  ],
  activityLogs: [],
  ddubData: [],
  pnlData: [],
  learning: {
    progress: 0,
    modulesCompleted: 0,
    totalModules: 5,
    currentModule: 'Awaiting initialization',
    accuracy: 0,
    lessonsLearned: []
  },
  lastUpdated: new Date().toISOString()
}

// Global store instance (persists across requests in development)
declare global {
  // eslint-disable-next-line no-var
  var wolfStore: WolfStore | undefined
}

export const store: WolfStore = global.wolfStore ?? { ...defaultStore }

if (process.env.NODE_ENV !== 'production') {
  global.wolfStore = store
}

// Store operations
export function updateTrade(trade: TradeUpdate) {
  const existingIndex = store.trades.findIndex(t => t.id === trade.id)
  if (existingIndex >= 0) {
    store.trades[existingIndex] = trade
  } else {
    store.trades.unshift(trade)
  }
  // Keep only last 100 trades in memory
  if (store.trades.length > 100) {
    store.trades = store.trades.slice(0, 100)
  }
  store.lastUpdated = new Date().toISOString()
}

export function updateStatus(status: WolfStatusUpdate) {
  store.status = status
  store.lastUpdated = new Date().toISOString()
}

export function updatePerformance(performance: PerformanceUpdate) {
  store.performance = performance
  store.lastUpdated = new Date().toISOString()
}

export function updateMarketData(data: MarketDataUpdate) {
  const index = store.marketData.findIndex(m => m.symbol === data.symbol)
  if (index >= 0) {
    store.marketData[index] = data
  } else {
    store.marketData.push(data)
  }
  store.lastUpdated = new Date().toISOString()
}

export function addActivityLog(log: ActivityLogEntry) {
  store.activityLogs.unshift(log)
  // Keep only last 50 logs
  if (store.activityLogs.length > 50) {
    store.activityLogs = store.activityLogs.slice(0, 50)
  }
  store.lastUpdated = new Date().toISOString()
}

export function addDdubDataPoint(point: DdubDataPoint) {
  store.ddubData.push(point)
  // Keep only last 24 hours of data (assuming 1 point per minute = 1440 points)
  if (store.ddubData.length > 1440) {
    store.ddubData = store.ddubData.slice(-1440)
  }
  store.lastUpdated = new Date().toISOString()
}

export function addPnlDataPoint(point: PnlDataPoint) {
  const existingIndex = store.pnlData.findIndex(p => p.date === point.date)
  if (existingIndex >= 0) {
    store.pnlData[existingIndex] = point
  } else {
    store.pnlData.push(point)
  }
  // Keep only last 30 days
  if (store.pnlData.length > 30) {
    store.pnlData = store.pnlData.slice(-30)
  }
  store.lastUpdated = new Date().toISOString()
}

export function updateLearning(learning: LearningUpdate) {
  store.learning = learning
  store.lastUpdated = new Date().toISOString()
}

export function getFullState(): WolfStore {
  return { ...store }
}

export function resetStore() {
  Object.assign(store, defaultStore)
  store.lastUpdated = new Date().toISOString()
}
