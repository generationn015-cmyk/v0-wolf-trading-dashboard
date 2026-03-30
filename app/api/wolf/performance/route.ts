import { NextRequest, NextResponse } from 'next/server'
import type { PerformanceUpdate, PnlDataPoint } from '@/lib/api-types'
import { store, updatePerformance, addPnlDataPoint, addActivityLog } from '@/lib/wolf-store'

// Get performance metrics
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      performance: store.performance,
      pnlHistory: store.pnlData
    },
    timestamp: new Date().toISOString()
  })
}

// Update performance metrics
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
    const body = await request.json()
    
    // Check if it's a performance update or PnL data point
    if (body.dailyPnl !== undefined) {
      const performance: PerformanceUpdate = body
      const previousWinRate = store.performance.winRate
      const previousStreak = store.performance.winStreak
      
      updatePerformance(performance)
      
      // Check for milestone achievements
      if (performance.winRate >= 72 && previousWinRate < 72) {
        addActivityLog({
          id: `log-${Date.now()}`,
          type: 'ALERT',
          message: 'Win rate threshold achieved: 72%+',
          timestamp: new Date().toISOString(),
          priority: 'high'
        })
      }
      
      if (performance.winStreak > previousStreak && performance.winStreak >= 5) {
        addActivityLog({
          id: `log-${Date.now()}`,
          type: 'ALERT',
          message: `Hot streak! ${performance.winStreak} consecutive wins`,
          timestamp: new Date().toISOString(),
          priority: 'high'
        })
      }
      
      return NextResponse.json({
        success: true,
        data: performance,
        timestamp: new Date().toISOString()
      })
      
    } else if (body.date !== undefined) {
      const pnlPoint: PnlDataPoint = body
      addPnlDataPoint(pnlPoint)
      
      return NextResponse.json({
        success: true,
        data: pnlPoint,
        timestamp: new Date().toISOString()
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid payload format', timestamp: new Date().toISOString() },
      { status: 400 }
    )

  } catch (error) {
    console.error('Performance update error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request body', timestamp: new Date().toISOString() },
      { status: 400 }
    )
  }
}
