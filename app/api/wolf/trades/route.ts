import { NextRequest, NextResponse } from 'next/server'
import type { TradeUpdate } from '@/lib/api-types'
import { store, updateTrade, addActivityLog } from '@/lib/wolf-store'

// Get all trades
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'OPEN', 'CLOSED', 'PENDING'
  const limit = parseInt(searchParams.get('limit') || '50')
  
  let trades = [...store.trades]
  
  if (status) {
    trades = trades.filter(t => t.status === status)
  }
  
  trades = trades.slice(0, limit)
  
  return NextResponse.json({
    success: true,
    data: {
      trades,
      total: store.trades.length,
      openPositions: store.trades.filter(t => t.status === 'OPEN').length
    },
    timestamp: new Date().toISOString()
  })
}

// Add or update a trade
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-wolf-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
  const expectedKey = process.env.WOLF_API_KEY
  
  if (expectedKey && apiKey !== expectedKey) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', timestamp: new Date().toISOString() },
      { status: 401 }
    )
  }

  try {
    const trade: TradeUpdate = await request.json()
    
    // Validate required fields
    if (!trade.id || !trade.symbol || !trade.side) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, symbol, side', timestamp: new Date().toISOString() },
        { status: 400 }
      )
    }
    
    updateTrade(trade)
    
    // Add activity log
    const action = trade.status === 'CLOSED' ? 'closed' : trade.status === 'OPEN' ? 'opened' : 'updated'
    addActivityLog({
      id: `log-${Date.now()}`,
      type: 'TRADE',
      message: `${trade.side} ${trade.symbol} ${action} @ $${trade.entryPrice}${trade.pnl ? ` | P&L: $${trade.pnl.toFixed(2)}` : ''}`,
      timestamp: new Date().toISOString(),
      priority: trade.status === 'CLOSED' ? (trade.pnl && trade.pnl > 0 ? 'high' : 'medium') : 'medium'
    })
    
    return NextResponse.json({
      success: true,
      data: trade,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Trade update error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request body', timestamp: new Date().toISOString() },
      { status: 400 }
    )
  }
}
