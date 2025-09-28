import { neon } from '@neondatabase/serverless'

// Database connection - try multiple possible environment variable names
const databaseUrl = process.env.DATABASE_URL || process.env.STORAGE_URL || process.env.NEON_DATABASE_URL
console.log('Database URL status:', databaseUrl ? 'Found' : 'Missing')
const sql = neon(databaseUrl!)

// Initialize database schema
export async function initializeDatabase() {
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
    console.log('Table created/verified successfully')

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