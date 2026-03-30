import { NextRequest, NextResponse } from 'next/server'
import type { MarketDataUpdate } from '@/lib/api-types'
import { store, updateMarketData } from '@/lib/wolf-store'

// Get market data
export async function GET() {
  return NextResponse.json({
    success: true,
    data: store.marketData,
    timestamp: new Date().toISOString()
  })
}

// Update market data (can be single or batch)
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
      body.forEach((data: MarketDataUpdate) => {
        if (data.symbol && data.price !== undefined) {
          updateMarketData(data)
        }
      })
      
      return NextResponse.json({
        success: true,
        data: { updated: body.length },
        timestamp: new Date().toISOString()
      })
    }
    
    // Handle single update
    const data: MarketDataUpdate = body
    if (!data.symbol || data.price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: symbol, price', timestamp: new Date().toISOString() },
        { status: 400 }
      )
    }
    
    updateMarketData(data)
    
    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Market data update error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request body', timestamp: new Date().toISOString() },
      { status: 400 }
    )
  }
}
