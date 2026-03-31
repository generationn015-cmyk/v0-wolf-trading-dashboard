import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/wolf-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const apiKey = request.headers.get('x-wolf-api-key')
    if (process.env.WOLF_API_KEY && apiKey !== process.env.WOLF_API_KEY) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    // Accept single point or array
    const points = Array.isArray(body) ? body : [body]
    for (const p of points) {
      store.pnlData.push({
        date: p.date ?? new Date().toISOString().split('T')[0],
        pnl: Number(p.pnl ?? 0),
        cumulative: Number(p.cumulative ?? p.pnl ?? 0),
        trades: Number(p.trades ?? 0),
      })
    }
    // Keep last 90 data points
    if (store.pnlData.length > 90) store.pnlData = store.pnlData.slice(-90)
    store.lastUpdated = new Date().toISOString()
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Bad request' }, { status: 400 })
  }
}

export async function GET() {
  return NextResponse.json({ success: true, data: store.pnlData })
}
