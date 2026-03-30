import { NextRequest, NextResponse } from 'next/server'

const CLIP_MAP: Record<string, string> = {
  'not-leaving':  'https://www.myinstants.com/media/sounds/im-not-leaving.mp3',
  'not-leaving2': 'https://www.myinstants.com/media/sounds/not-leaving.mp3',
  'poverty':      'https://www.myinstants.com/media/sounds/poverty.mp3',
  'show-goes-on': 'https://www.myinstants.com/media/sounds/the-show-goes-on.mp3',
  'pen':          'https://www.myinstants.com/media/sounds/pen.mp3',
}

export async function GET(
  request: NextRequest,
  { params }: { params: { clip: string } }
) {
  const url = CLIP_MAP[params.clip]
  if (!url) return new NextResponse('Not found', { status: 404 })
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return new NextResponse('Upstream error', { status: 502 })
    const buf = await res.arrayBuffer()
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
        'Content-Length': String(buf.byteLength),
      },
    })
  } catch {
    return new NextResponse('Failed to fetch audio', { status: 502 })
  }
}
