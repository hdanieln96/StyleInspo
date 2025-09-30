import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_POSTGRES_URL || process.env.DATABASE_URL || '')

// GET all pages
export async function GET() {
  try {
    const pages = await sql`
      SELECT * FROM pages ORDER BY id
    `

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Error fetching pages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    )
  }
}