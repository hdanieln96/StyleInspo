import { neon } from '@neondatabase/serverless'

// Database connection - use Vercel's auto-generated Neon environment variables
const databaseUrl = process.env.DATABASE_POSTGRES_URL ||
                   process.env.DATABASE_POSTGRES_URL_NON_POOLING ||
                   process.env.DATABASE_URL

console.log('Database URL status:', {
  hasPostgresUrl: !!process.env.DATABASE_POSTGRES_URL,
  hasNonPoolingUrl: !!process.env.DATABASE_POSTGRES_URL_NON_POOLING,
  hasGenericUrl: !!process.env.DATABASE_URL,
  selectedUrl: databaseUrl ? 'Connection string found' : 'No connection string'
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sql: any = null

if (databaseUrl) {
  sql = neon(databaseUrl)
} else {
  console.warn('Database not configured - environment variables missing')
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')))
}

// Initialize database schema
export async function initializeDatabase() {
  if (!sql) {
    console.error('Cannot initialize database - no connection available')
    return false
  }

  try {
    console.log('Initializing database schema...')

    // Create fashion_looks table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS fashion_looks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        main_image TEXT NOT NULL,
        items JSONB NOT NULL DEFAULT '[]',
        tags JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        seo JSONB,
        ai_analysis JSONB,
        occasion TEXT,
        season TEXT,
        seo_last_updated TIMESTAMP WITH TIME ZONE
      )
    `

    // Create themes table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS themes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        logo JSONB NOT NULL DEFAULT '{}',
        colors JSONB NOT NULL DEFAULT '{}',
        typography JSONB NOT NULL DEFAULT '{}',
        layout JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `
    console.log('Tables created/verified successfully')

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_fashion_looks_created_at
      ON fashion_looks(created_at DESC)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_fashion_looks_tags
      ON fashion_looks USING GIN(tags)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_fashion_looks_occasion
      ON fashion_looks(occasion)
      WHERE occasion IS NOT NULL
    `
    console.log('Database indexes created/verified successfully')

    // Test the connection by counting rows
    const result = await sql`SELECT COUNT(*) as count FROM fashion_looks`
    console.log('Database connection verified, current looks count:', result[0]?.count || 0)

    console.log('Database schema initialized successfully')
    return true
  } catch (error) {
    console.error('Database initialization error:', error)
    console.error('Error details:', error)
    return false
  }
}

// Get all fashion looks
export async function getAllLooks() {
  if (!sql) {
    console.error('Cannot fetch looks - no database connection available')
    return []
  }

  try {
    // Ensure table exists before querying
    await initializeDatabase()

    const looks = await sql`
      SELECT * FROM fashion_looks
      ORDER BY created_at DESC
    `
    console.log('Database query successful, found looks:', looks.length)
    return looks
  } catch (error) {
    console.error('Error fetching looks:', error)
    console.error('Error details:', error)
    return []
  }
}

// Get a single look by ID
export async function getLookById(id: string) {
  if (!sql) {
    console.error('Cannot fetch look by ID - no database connection available')
    return null
  }

  try {
    const [look] = await sql`
      SELECT * FROM fashion_looks
      WHERE id = ${id}
    `
    return look || null
  } catch (error) {
    console.error('Error fetching look:', error)
    return null
  }
}

// Create a new fashion look
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createLook(look: any) {
  try {
    const [newLook] = await sql`
      INSERT INTO fashion_looks (
        id, title, main_image, items, tags,
        seo, ai_analysis, occasion, season, seo_last_updated
      ) VALUES (
        ${look.id},
        ${look.title},
        ${look.mainImage},
        ${JSON.stringify(look.items)},
        ${JSON.stringify(look.tags)},
        ${look.seo ? JSON.stringify(look.seo) : null},
        ${look.aiAnalysis ? JSON.stringify(look.aiAnalysis) : null},
        ${look.occasion || null},
        ${look.season || null},
        ${look.seoLastUpdated || null}
      )
      RETURNING *
    `
    return newLook
  } catch (error) {
    console.error('Error creating look:', error)
    throw error
  }
}

// Update a fashion look
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateLook(id: string, updates: any) {
  try {
    const [updatedLook] = await sql`
      UPDATE fashion_looks
      SET
        title = COALESCE(${updates.title}, title),
        main_image = COALESCE(${updates.mainImage}, main_image),
        items = COALESCE(${updates.items ? JSON.stringify(updates.items) : null}, items),
        tags = COALESCE(${updates.tags ? JSON.stringify(updates.tags) : null}, tags),
        seo = COALESCE(${updates.seo ? JSON.stringify(updates.seo) : null}, seo),
        ai_analysis = COALESCE(${updates.aiAnalysis ? JSON.stringify(updates.aiAnalysis) : null}, ai_analysis),
        occasion = COALESCE(${updates.occasion}, occasion),
        season = COALESCE(${updates.season}, season),
        seo_last_updated = COALESCE(${updates.seoLastUpdated}, seo_last_updated)
      WHERE id = ${id}
      RETURNING *
    `
    return updatedLook
  } catch (error) {
    console.error('Error updating look:', error)
    throw error
  }
}

// Delete a fashion look
export async function deleteLook(id: string) {
  try {
    await sql`
      DELETE FROM fashion_looks
      WHERE id = ${id}
    `
    return true
  } catch (error) {
    console.error('Error deleting look:', error)
    throw error
  }
}

// Search looks by tags or title
export async function searchLooks(query: string) {
  try {
    const looks = await sql`
      SELECT * FROM fashion_looks
      WHERE
        title ILIKE ${`%${query}%`} OR
        tags::text ILIKE ${`%${query}%`}
      ORDER BY created_at DESC
    `
    return looks
  } catch (error) {
    console.error('Error searching looks:', error)
    return []
  }
}

// Theme management functions

// Get active theme
export async function getActiveTheme() {
  if (!sql) {
    console.error('Cannot fetch theme - no database connection available')
    return null
  }

  try {
    const [theme] = await sql`
      SELECT * FROM themes
      WHERE is_active = true
      ORDER BY updated_at DESC
      LIMIT 1
    `
    return theme || null
  } catch (error) {
    console.error('Error fetching active theme:', error)
    return null
  }
}

// Create or update theme
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveTheme(theme: any) {
  try {
    // First deactivate all existing themes
    await sql`
      UPDATE themes SET is_active = false
    `

    // Then create or update the new theme
    const [savedTheme] = await sql`
      INSERT INTO themes (
        id, name, logo, colors, typography, layout, is_active, created_at, updated_at
      ) VALUES (
        ${theme.id},
        ${theme.name},
        ${JSON.stringify(theme.logo)},
        ${JSON.stringify(theme.colors)},
        ${JSON.stringify(theme.typography)},
        ${JSON.stringify(theme.layout)},
        true,
        ${theme.createdAt || new Date().toISOString()},
        ${new Date().toISOString()}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        logo = EXCLUDED.logo,
        colors = EXCLUDED.colors,
        typography = EXCLUDED.typography,
        layout = EXCLUDED.layout,
        is_active = EXCLUDED.is_active,
        updated_at = EXCLUDED.updated_at
      RETURNING *
    `
    return savedTheme
  } catch (error) {
    console.error('Error saving theme:', error)
    throw error
  }
}

// Reset to default theme
export async function resetToDefaultTheme() {
  try {
    const defaultTheme = {
      id: "default-theme",
      name: "Default StyleInspo Theme",
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
      createdAt: new Date().toISOString()
    }

    return await saveTheme(defaultTheme)
  } catch (error) {
    console.error('Error resetting to default theme:', error)
    throw error
  }
}