import { NextRequest, NextResponse } from 'next/server'
import { FashionLook } from '@/types'
import { initializeDatabase, getAllLooks, createLook, getLookById } from '@/lib/database'

// Initialize database on first request
let dbInitialized = false

async function ensureDatabase() {
  if (!dbInitialized) {
    await initializeDatabase()
    dbInitialized = true
  }
}

// GET all looks
export async function GET() {
  try {
    await ensureDatabase()
    console.log('Fetching all looks from database')

    const dbLooks = await getAllLooks()

    // Transform database format to frontend format
    const looks: FashionLook[] = dbLooks.map((look: any) => ({
      id: look.id,
      title: look.title,
      mainImage: look.main_image,
      items: Array.isArray(look.items) ? look.items : [],
      tags: Array.isArray(look.tags) ? look.tags : [],
      createdAt: look.created_at,
      seo: look.seo || undefined,
      aiAnalysis: look.ai_analysis || undefined,
      occasion: look.occasion || undefined,
      season: look.season || undefined,
      seoLastUpdated: look.seo_last_updated || undefined
    }))

    console.log('Successfully fetched looks, count:', looks.length)
    return NextResponse.json(looks)
  } catch (error) {
    console.error('Error reading looks from database:', error)
    return NextResponse.json([])
  }
}

// POST new look
export async function POST(request: NextRequest) {
  try {
    await ensureDatabase()
    const newLook: FashionLook = await request.json()
    console.log('Saving new look to database:', newLook.id)

    // Check if this look already exists (prevent duplicates)
    const existingLook = await getLookById(newLook.id)
    if (existingLook) {
      console.log('Look already exists:', newLook.id)
      // Transform back to frontend format
      const transformedLook: FashionLook = {
        id: existingLook.id,
        title: existingLook.title,
        mainImage: existingLook.main_image,
        items: Array.isArray(existingLook.items) ? existingLook.items : [],
        tags: Array.isArray(existingLook.tags) ? existingLook.tags : [],
        createdAt: existingLook.created_at,
        seo: existingLook.seo || undefined,
        aiAnalysis: existingLook.ai_analysis || undefined,
        occasion: existingLook.occasion || undefined,
        season: existingLook.season || undefined,
        seoLastUpdated: existingLook.seo_last_updated || undefined
      }
      return NextResponse.json(transformedLook, { status: 200 })
    }

    // Create new look in database
    const dbLook = await createLook(newLook)
    console.log('Look saved successfully to database:', newLook.id)

    // Transform back to frontend format
    const transformedLook: FashionLook = {
      id: dbLook.id,
      title: dbLook.title,
      mainImage: dbLook.main_image,
      items: Array.isArray(dbLook.items) ? dbLook.items : [],
      tags: Array.isArray(dbLook.tags) ? dbLook.tags : [],
      createdAt: dbLook.created_at,
      seo: dbLook.seo || undefined,
      aiAnalysis: dbLook.ai_analysis || undefined,
      occasion: dbLook.occasion || undefined,
      season: dbLook.season || undefined,
      seoLastUpdated: dbLook.seo_last_updated || undefined
    }

    return NextResponse.json(transformedLook, { status: 201 })
  } catch (error) {
    console.error('Error saving look to database:', error)
    return NextResponse.json({ error: 'Failed to save look' }, { status: 500 })
  }
}