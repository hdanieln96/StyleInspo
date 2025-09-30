import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_POSTGRES_URL || process.env.DATABASE_URL || '')

// GET site settings
export async function GET() {
  try {
    let [settings] = await sql`
      SELECT * FROM site_settings WHERE id = 'default'
    `

    // If no settings exist, create default row
    if (!settings) {
      console.log('No settings found, creating default row...')
      const [newSettings] = await sql`
        INSERT INTO site_settings (id)
        VALUES ('default')
        ON CONFLICT (id) DO NOTHING
        RETURNING *
      `
      settings = newSettings
    }

    console.log('Fetched settings:', settings)

    return NextResponse.json(settings || {
      id: 'default',
      footer_logo_url: null,
      footer_logo_size: 150,
      footer_text_color: '#9ca3af',
      social_facebook: '',
      social_twitter: '',
      social_pinterest: '',
      social_instagram: '',
      social_tiktok: '',
      admin_email: ''
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT (update) site settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    console.log('Updating settings with:', body)

    // Ensure row exists first
    await sql`
      INSERT INTO site_settings (id)
      VALUES ('default')
      ON CONFLICT (id) DO NOTHING
    `

    const [updatedSettings] = await sql`
      UPDATE site_settings
      SET
        footer_logo_url = ${body.footer_logo_url || null},
        footer_logo_size = ${body.footer_logo_size || 150},
        footer_text_color = ${body.footer_text_color || '#9ca3af'},
        social_facebook = ${body.social_facebook || ''},
        social_twitter = ${body.social_twitter || ''},
        social_pinterest = ${body.social_pinterest || ''},
        social_instagram = ${body.social_instagram || ''},
        social_tiktok = ${body.social_tiktok || ''},
        admin_email = ${body.admin_email || ''},
        updated_at = NOW()
      WHERE id = 'default'
      RETURNING *
    `

    console.log('Settings updated successfully:', updatedSettings)
    return NextResponse.json({ success: true, data: updatedSettings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}