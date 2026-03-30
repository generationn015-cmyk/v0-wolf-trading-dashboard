import { NextRequest, NextResponse } from 'next/server'
import type { DdubDataPoint } from '@/lib/api-types'
import { store, addDdubDataPoint, addActivityLog } from '@/lib/wolf-store'

// Get D-Dub index data
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '100')
  
  const data = store.ddubData.slice(-limit)
  const latestSignal = data.length > 0 ? data[data.length - 1] : null
  
  return NextResponse.json({
    success: true,
    data: {
      history: data,
      latestSignal,
      total: store.ddubData.length
    },
    timestamp: new Date().toISOString()
  })
}

// Add D-Dub data point
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
    
    // Handle batch update
    if (Array.isArray(body)) {
      body.forEach((point: DdubDataPoint) => {
        addDdubDataPoint(point)
      })
      
      return NextResponse.json({
        success: true,
        data: { added: body.length },
        timestamp: new Date().toISOString()
      })
    }
    
    // Handle single point
    const point: DdubDataPoint = body
    
    if (!point.time || point.value === undefined || !point.signal) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: time, value, signal', timestamp: new Date().toISOString() },
        { status: 400 }
      )
    }
    
    // Check for signal changes
    const lastPoint = store.ddubData.length > 0 ? store.ddubData[store.ddubData.length - 1] : null
    if (lastPoint && lastPoint.signal !== point.signal) {
      addActivityLog({
        id: `log-${Date.now()}`,
        type: 'ANALYSIS',
        message: `D-Dub signal changed: ${lastPoint.signal} → ${point.signal} (value: ${point.value.toFixed(2)})`,
        timestamp: new Date().toISOString(),
        priority: point.signal === 'BUY' || point.signal === 'SELL' ? 'high' : 'medium'
      })
    }
    
    addDdubDataPoint(point)
    
    return NextResponse.json({
      success: true,
      data: point,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('D-Dub update error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request body', timestamp: new Date().toISOString() },
      { status: 400 }
    )
  }
}
