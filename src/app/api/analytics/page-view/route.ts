import { NextRequest, NextResponse } from 'next/server'
import { trackPageView } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pagePath, lookId } = body

    // Get user data from headers
    const userAgent = request.headers.get('user-agent') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || undefined
    const referrer = request.headers.get('referer') || undefined

    // Track the page view
    const result = await trackPageView({
      pagePath,
      lookId,
      userAgent,
      ipAddress,
      referrer
    })

    if (result) {
      return NextResponse.json({ success: true, id: result.id })
    } else {
      return NextResponse.json({ success: false, error: 'Failed to track page view' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in page view tracking API:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}