import { NextResponse } from 'next/server'
import { getAnalyticsSummary } from '@/lib/database'

export async function GET() {
  try {
    const analyticsData = await getAnalyticsSummary()

    if (analyticsData) {
      return NextResponse.json({
        success: true,
        data: analyticsData
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch analytics data'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in analytics summary API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}