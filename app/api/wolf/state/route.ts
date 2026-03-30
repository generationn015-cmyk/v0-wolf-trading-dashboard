import { NextRequest, NextResponse } from 'next/server'
import { getFullState, resetStore } from '@/lib/wolf-store'

// Get full dashboard state
export async function GET() {
  const state = getFullState()
  
  return NextResponse.json({
    success: true,
    data: state,
    timestamp: new Date().toISOString()
  })
}

// Reset state (for debugging/testing)
export async function DELETE(request: NextRequest) {
  const apiKey = request.headers.get('x-wolf-api-key') || request.headers.get('authorization')?.replace('Bearer ', '')
  const expectedKey = process.env.WOLF_API_KEY
  
  if (expectedKey && apiKey !== expectedKey) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', timestamp: new Date().toISOString() },
      { status: 401 }
    )
  }
  
  resetStore()
  
  return NextResponse.json({
    success: true,
    data: { message: 'Store reset successfully' },
    timestamp: new Date().toISOString()
  })
}
