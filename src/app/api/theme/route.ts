import { NextRequest, NextResponse } from 'next/server'
import { ThemeSettings } from '@/types'
import { getActiveTheme, saveTheme, resetToDefaultTheme, initializeDatabase } from '@/lib/database'

// Initialize database on first request
let dbInitialized = false

async function ensureDatabase() {
  if (!dbInitialized) {
    await initializeDatabase()
    dbInitialized = true
  }
}

// GET theme settings
export async function GET() {
  try {
    await ensureDatabase()
    console.log('Fetching active theme from database')

    const dbTheme = await getActiveTheme()

    if (!dbTheme) {
      console.log('No active theme found, creating default theme')
      // Create default theme if none exists
      const defaultTheme = await resetToDefaultTheme()

      // Transform database format to frontend format
      const theme: ThemeSettings = {
        id: defaultTheme.id,
        name: defaultTheme.name,
        logo: defaultTheme.logo,
        colors: defaultTheme.colors,
        typography: defaultTheme.typography,
        layout: defaultTheme.layout,
        isActive: defaultTheme.is_active,
        createdAt: defaultTheme.created_at,
        updatedAt: defaultTheme.updated_at
      }
      return NextResponse.json(theme)
    }

    // Transform database format to frontend format
    const theme: ThemeSettings = {
      id: dbTheme.id,
      name: dbTheme.name,
      logo: dbTheme.logo,
      colors: dbTheme.colors,
      typography: dbTheme.typography,
      layout: dbTheme.layout,
      isActive: dbTheme.is_active,
      createdAt: dbTheme.created_at,
      updatedAt: dbTheme.updated_at
    }

    return NextResponse.json(theme)
  } catch (error) {
    console.error('Error reading theme from database:', error)
    return NextResponse.json({ error: 'Failed to load theme' }, { status: 500 })
  }
}

// POST/PUT update theme settings
export async function POST(request: NextRequest) {
  try {
    await ensureDatabase()
    const updatedTheme: Partial<ThemeSettings> = await request.json()
    console.log('Updating theme in database:', updatedTheme)

    // Get current theme
    let currentTheme = await getActiveTheme()

    if (!currentTheme) {
      // Create default theme if none exists
      currentTheme = await resetToDefaultTheme()
    }

    // Transform current theme to frontend format
    const currentThemeFormatted: ThemeSettings = {
      id: currentTheme.id,
      name: currentTheme.name,
      logo: currentTheme.logo,
      colors: currentTheme.colors,
      typography: currentTheme.typography,
      layout: currentTheme.layout,
      isActive: currentTheme.is_active,
      createdAt: currentTheme.created_at,
      updatedAt: currentTheme.updated_at
    }

    // Merge with updates
    const newTheme: ThemeSettings = {
      ...currentThemeFormatted,
      ...updatedTheme,
      updatedAt: new Date().toISOString()
    }

    // Save updated theme
    const savedTheme = await saveTheme(newTheme)

    // Transform back to frontend format
    const responseTheme: ThemeSettings = {
      id: savedTheme.id,
      name: savedTheme.name,
      logo: savedTheme.logo,
      colors: savedTheme.colors,
      typography: savedTheme.typography,
      layout: savedTheme.layout,
      isActive: savedTheme.is_active,
      createdAt: savedTheme.created_at,
      updatedAt: savedTheme.updated_at
    }

    return NextResponse.json(responseTheme, { status: 200 })
  } catch (error) {
    console.error('Error saving theme to database:', error)
    return NextResponse.json({ error: 'Failed to save theme' }, { status: 500 })
  }
}

// PUT reset to default theme
export async function PUT() {
  try {
    await ensureDatabase()
    console.log('Resetting theme to default in database')

    const defaultTheme = await resetToDefaultTheme()

    // Transform to frontend format
    const responseTheme: ThemeSettings = {
      id: defaultTheme.id,
      name: defaultTheme.name,
      logo: defaultTheme.logo,
      colors: defaultTheme.colors,
      typography: defaultTheme.typography,
      layout: defaultTheme.layout,
      isActive: defaultTheme.is_active,
      createdAt: defaultTheme.created_at,
      updatedAt: defaultTheme.updated_at
    }

    return NextResponse.json(responseTheme, { status: 200 })
  } catch (error) {
    console.error('Error resetting theme in database:', error)
    return NextResponse.json({ error: 'Failed to reset theme' }, { status: 500 })
  }
}