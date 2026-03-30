// Wolf store with Vercel KV persistence
// Falls back to in-memory if KV not configured (local dev)

import { kv } from '@vercel/kv'
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

const KV_KEY = 'wolf:dashboard:state'

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

const defaultStore: WolfStore = {
  trades: [],
  status: { status: 'hunting', message: 'Wolf is hunting...' },
  performance: { dailyPnl: 0, weeklyPnl: 0, monthlyPnl: 0, totalTrades: 0, winRate: 0, winStreak: 0, bestStreak: 0, totalProfit: 0 },
  marketData: [
    { symbol: 'BTC', price: 0, change: 0, changePercent: 0 },
    { symbol: 'ETH', price: 0, change: 0, changePercent: 0 },
  ],
  activityLogs: [],
  ddubData: [],
  pnlData: [],
  learning: { progress: 0, modulesCompleted: 0, totalModules: 5, currentModule: 'Paper trading active', accuracy: 0, lessonsLearned: [] },
  lastUpdated: new Date().toISOString()
}

// In-memory fallback for local dev
declare global { var wolfStore: WolfStore | undefined }
let _mem: WolfStore = global.wolfStore ?? { ...defaultStore }
if (process.env.NODE_ENV !== 'production') global.wolfStore = _mem

async function load(): Promise<WolfStore> {
  try {
    const saved = await kv.get<WolfStore>(KV_KEY)
    if (saved) return saved
  } catch { /* KV not configured — use memory */ }
  return _mem
}

async function save(s: WolfStore): Promise<void> {
  s.lastUpdated = new Date().toISOString()
  _mem = s
  if (process.env.NODE_ENV !== 'production') global.wolfStore = s
  try {
    await kv.set(KV_KEY, s)
  } catch { /* KV not configured */ }
}

// --- Public API (all async now) ---

export async function updateTrade(trade: TradeUpdate) {
  const s = await load()
  const idx = s.trades.findIndex(t => t.id === trade.id)
  if (idx >= 0) s.trades[idx] = trade
  else s.trades.unshift(trade)
  if (s.trades.length > 100) s.trades = s.trades.slice(0, 100)
  // Activity log
  const action = trade.status === 'CLOSED' ? 'closed' : 'opened'
  s.activityLogs.unshift({
    id: `log-${Date.now()}`,
    type: 'TRADE',
    message: `${trade.side} ${trade.symbol} ${action} @ $${trade.entryPrice}${trade.pnl != null ? ` | P&L: $${Number(trade.pnl).toFixed(2)}` : ''}`,
    timestamp: new Date().toISOString(),
    priority: trade.status === 'CLOSED' ? (trade.pnl && trade.pnl > 0 ? 'high' : 'medium') : 'medium'
  })
  if (s.activityLogs.length > 50) s.activityLogs = s.activityLogs.slice(0, 50)
  await save(s)
}

export async function updateStatus(status: WolfStatusUpdate) {
  const s = await load()
  s.status = status
  await save(s)
}

export async function updatePerformance(performance: PerformanceUpdate) {
  const s = await load()
  s.performance = { ...s.performance, ...performance }
  await save(s)
}

export async function updateMarketData(data: MarketDataUpdate) {
  const s = await load()
  const idx = s.marketData.findIndex(m => m.symbol === data.symbol)
  if (idx >= 0) s.marketData[idx] = data
  else s.marketData.push(data)
  await save(s)
}

export async function addActivityLog(log: ActivityLogEntry) {
  const s = await load()
  s.activityLogs.unshift(log)
  if (s.activityLogs.length > 50) s.activityLogs = s.activityLogs.slice(0, 50)
  await save(s)
}

export async function addDdubDataPoint(point: DdubDataPoint) {
  const s = await load()
  s.ddubData.push(point)
  if (s.ddubData.length > 1440) s.ddubData = s.ddubData.slice(-1440)
  await save(s)
}

export async function addPnlDataPoint(point: PnlDataPoint) {
  const s = await load()
  const idx = s.pnlData.findIndex(p => p.date === point.date)
  if (idx >= 0) s.pnlData[idx] = point
  else s.pnlData.push(point)
  if (s.pnlData.length > 30) s.pnlData = s.pnlData.slice(-30)
  await save(s)
}

export async function updateLearning(learning: LearningUpdate) {
  const s = await load()
  s.learning = learning
  await save(s)
}

export async function getFullState(): Promise<WolfStore> {
  return load()
}

export async function resetStore() {
  await save({ ...defaultStore, lastUpdated: new Date().toISOString() })
}

// Sync shim for legacy callers (not used in new routes)
export const store: WolfStore = _mem
