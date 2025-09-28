import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { ThemeSettings } from '@/types'

const THEME_FILE = path.join(process.cwd(), 'src/data/theme.json')

// Ensure theme file exists
async function ensureThemeFile() {
  try {
    await fs.access(THEME_FILE)
  } catch {
    // Create default theme if file doesn't exist
    const defaultTheme: ThemeSettings = {
      id: "default-theme",
      name: "Default Fashion Affiliate Theme",
      logo: {
        url: null,
        width: 120,
        height: 40,
        position: "center",
        showWithTitle: true
      },
      colors: {
        primary: "#ec4899",
        secondary: "#9333ea",
        accent: "#f59e0b",
        background: "#fafafa",
        backgroundSecondary: "#f5f5f5",
        text: "#171717",
        textMuted: "#737373",
        button: "#ec4899",
        buttonHover: "#be185d",
        tagBackground: "#ec4899",
        tagText: "#ffffff",
        cardBackground: "#ffffff",
        cardOverlay: "rgba(0, 0, 0, 0.6)",
        headerBackground: "#ffffff",
        headerBorder: "#e5e7eb"
      },
      typography: {
        fontFamily: "Geist Sans",
        headingSize: "large",
        bodySize: "medium",
        fontWeight: "normal"
      },
      layout: {
        containerWidth: "normal",
        spacing: "normal",
        borderRadius: "medium"
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await fs.mkdir(path.dirname(THEME_FILE), { recursive: true })
    await fs.writeFile(THEME_FILE, JSON.stringify(defaultTheme, null, 2))
  }
}

// GET theme settings
export async function GET() {
  try {
    await ensureThemeFile()
    const data = await fs.readFile(THEME_FILE, 'utf8')
    const theme: ThemeSettings = JSON.parse(data)
    return NextResponse.json(theme)
  } catch (error) {
    console.error('Error reading theme:', error)
    return NextResponse.json({ error: 'Failed to load theme' }, { status: 500 })
  }
}

// POST/PUT update theme settings
export async function POST(request: NextRequest) {
  try {
    await ensureThemeFile()
    const updatedTheme: Partial<ThemeSettings> = await request.json()

    // Read current theme
    const data = await fs.readFile(THEME_FILE, 'utf8')
    const currentTheme: ThemeSettings = JSON.parse(data)

    // Merge with updates
    const newTheme: ThemeSettings = {
      ...currentTheme,
      ...updatedTheme,
      updatedAt: new Date().toISOString()
    }

    // Save updated theme
    await fs.writeFile(THEME_FILE, JSON.stringify(newTheme, null, 2))

    return NextResponse.json(newTheme, { status: 200 })
  } catch (error) {
    console.error('Error saving theme:', error)
    return NextResponse.json({ error: 'Failed to save theme' }, { status: 500 })
  }
}

// PUT reset to default theme
export async function PUT() {
  try {
    const defaultTheme: ThemeSettings = {
      id: "default-theme",
      name: "Default Fashion Affiliate Theme",
      logo: {
        url: null,
        width: 120,
        height: 40,
        position: "center",
        showWithTitle: true
      },
      colors: {
        primary: "#ec4899",
        secondary: "#9333ea",
        accent: "#f59e0b",
        background: "#fafafa",
        backgroundSecondary: "#f5f5f5",
        text: "#171717",
        textMuted: "#737373",
        button: "#ec4899",
        buttonHover: "#be185d",
        tagBackground: "#ec4899",
        tagText: "#ffffff",
        cardBackground: "#ffffff",
        cardOverlay: "rgba(0, 0, 0, 0.6)",
        headerBackground: "#ffffff",
        headerBorder: "#e5e7eb"
      },
      typography: {
        fontFamily: "Geist Sans",
        headingSize: "large",
        bodySize: "medium",
        fontWeight: "normal"
      },
      layout: {
        containerWidth: "normal",
        spacing: "normal",
        borderRadius: "medium"
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await fs.writeFile(THEME_FILE, JSON.stringify(defaultTheme, null, 2))
    return NextResponse.json(defaultTheme, { status: 200 })
  } catch (error) {
    console.error('Error resetting theme:', error)
    return NextResponse.json({ error: 'Failed to reset theme' }, { status: 500 })
  }
}