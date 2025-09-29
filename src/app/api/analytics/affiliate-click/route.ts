import { NextRequest, NextResponse } from 'next/server'
import { trackAffiliateClick } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lookId, itemId, itemName, affiliateUrl } = body

    // Validate required fields
    if (!lookId || !itemId || !affiliateUrl) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: lookId, itemId, affiliateUrl'
      }, { status: 400 })
    }

    // Get user data from headers
    const userAgent = request.headers.get('user-agent') || undefined
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || undefined

    // Track the affiliate click
    const result = await trackAffiliateClick({
      lookId,
      itemId,
      itemName,
      affiliateUrl,
      userAgent,
      ipAddress
    })

    if (result) {
      return NextResponse.json({ success: true, id: result.id })
    } else {
      return NextResponse.json({ success: false, error: 'Failed to track affiliate click' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in affiliate click tracking API:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}