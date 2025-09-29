import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    DATABASE_POSTGRES_URL: !!process.env.DATABASE_POSTGRES_URL,
    DATABASE_POSTGRES_URL_NON_POOLING: !!process.env.DATABASE_POSTGRES_URL_NON_POOLING,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: !!process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV
  }

  // Try to import and test database connection
  let databaseStatus = 'unknown'
  try {
    const { getActiveTheme } = await import('@/lib/database')
    const theme = await getActiveTheme()
    databaseStatus = theme ? 'connected - theme found' : 'connected - no theme'
  } catch (error) {
    databaseStatus = `error: ${error instanceof Error ? error.message : 'unknown error'}`
  }

  return NextResponse.json({
    envVars,
    databaseStatus,
    timestamp: new Date().toISOString()
  })
}