import { NextRequest, NextResponse } from 'next/server'
import type { OpenClawWebhook, TradeUpdate, WolfStatusUpdate, PerformanceUpdate, MarketDataUpdate, ActivityLogEntry, DdubDataPoint, LearningUpdate } from '@/lib/api-types'
import {
  updateTrade,
  updateStatus,
  updatePerformance,
  updateMarketData,
  addActivityLog,
  addDdubDataPoint,
  updateLearning
} from '@/lib/wolf-store'

// Verify API key from OpenClaw agent
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-wolf-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
  const expectedKey = process.env.WOLF_API_KEY
  
  // If no key is set, allow all requests (development mode)
  if (!expectedKey) {
    return true
  }
  
  return apiKey === expectedKey
}

export async function POST(request: NextRequest) {
  // Verify API key
  if (!verifyApiKey(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', timestamp: new Date().toISOString() },
      { status: 401 }
    )
  }

  try {
    const webhook: OpenClawWebhook = await request.json()
    
    // Process webhook based on event type
    switch (webhook.event) {
      case 'trade_opened':
      case 'trade_closed':
        updateTrade(webhook.payload as TradeUpdate)
        break
        
      case 'status_change':
        updateStatus(webhook.payload as WolfStatusUpdate)
        break
        
      case 'performance_update':
        updatePerformance(webhook.payload as PerformanceUpdate)
        break
        
      case 'market_update':
        updateMarketData(webhook.payload as MarketDataUpdate)
        break
        
      case 'alert':
        addActivityLog(webhook.payload as ActivityLogEntry)
        break
        
      case 'ddub_signal':
        addDdubDataPoint(webhook.payload as DdubDataPoint)
        break
        
      case 'learning_update':
        updateLearning(webhook.payload as LearningUpdate)
        break
        
      default:
        return NextResponse.json(
          { success: false, error: `Unknown event type: ${webhook.event}`, timestamp: new Date().toISOString() },
          { status: 400 }
        )
    }

    // Log the activity
    addActivityLog({
      id: `log-${Date.now()}`,
      type: 'SYSTEM',
      message: `Received ${webhook.event} from OpenClaw`,
      timestamp: new Date().toISOString(),
      priority: 'low'
    })

    return NextResponse.json({
      success: true,
      data: { event: webhook.event, processed: true },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request body', timestamp: new Date().toISOString() },
      { status: 400 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'Wolf Mission Control API is running',
      version: '1.0.0',
      endpoints: {
        webhook: 'POST /api/wolf/webhook',
        state: 'GET /api/wolf/state',
        trades: 'GET/POST /api/wolf/trades',
        status: 'GET/POST /api/wolf/status',
        performance: 'GET/POST /api/wolf/performance'
      }
    },
    timestamp: new Date().toISOString()
  })
}
