import { NextRequest, NextResponse } from 'next/server'
import type { WolfStatusUpdate } from '@/lib/api-types'
import { store, updateStatus, addActivityLog } from '@/lib/wolf-store'

// Get Wolf status
export async function GET() {
  return NextResponse.json({
    success: true,
    data: store.status,
    timestamp: new Date().toISOString()
  })
}

// Update Wolf status
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
    const status: WolfStatusUpdate = await request.json()
    
    if (!status.status || !status.message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: status, message', timestamp: new Date().toISOString() },
        { status: 400 }
      )
    }
    
    const previousStatus = store.status.status
    updateStatus(status)
    
    // Log status change
    if (previousStatus !== status.status) {
      addActivityLog({
        id: `log-${Date.now()}`,
        type: 'SYSTEM',
        message: `Wolf status changed: ${previousStatus} → ${status.status}`,
        timestamp: new Date().toISOString(),
        priority: status.status === 'error' ? 'critical' : 'low'
      })
    }
    
    return NextResponse.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { success: false, error: 'Invalid request body', timestamp: new Date().toISOString() },
      { status: 400 }
    )
  }
}
