import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_POSTGRES_URL || process.env.DATABASE_URL || '')

// GET single page
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [page] = await sql`
      SELECT * FROM pages WHERE id = ${params.id}
    `

    if (!page) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    )
  }
}

// PUT (update) page content
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const [updatedPage] = await sql`
      UPDATE pages
      SET
        title = ${body.title},
        content = ${body.content},
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `

    if (!updatedPage) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedPage)
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    )
  }
}