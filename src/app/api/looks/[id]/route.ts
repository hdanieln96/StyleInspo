import { NextRequest, NextResponse } from 'next/server'
import { FashionLook } from '@/types'
import { extractPublicId, deleteImage } from '@/lib/cloudinary'
import { getLookById, updateLook } from '@/lib/database'

// GET single look
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Fetching look from database:', id)

    const dbLook = await getLookById(id)

    if (!dbLook) {
      return NextResponse.json({ error: 'Look not found' }, { status: 404 })
    }

    // Transform database format to frontend format
    const look: FashionLook = {
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

    return NextResponse.json(look)
  } catch (error) {
    console.error('Error reading look from database:', error)
    return NextResponse.json({ error: 'Failed to read look' }, { status: 500 })
  }
}

// PUT update look
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updatedLook: FashionLook = await request.json()
    console.log('Updating look in database:', id)

    // Check if look exists
    const existingLook = await getLookById(id)
    if (!existingLook) {
      return NextResponse.json({ error: 'Look not found' }, { status: 404 })
    }

    // Update in database
    const dbLook = await updateLook(id, updatedLook)

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

    return NextResponse.json(transformedLook)
  } catch (error) {
    console.error('Error updating look in database:', error)
    return NextResponse.json({ error: 'Failed to update look' }, { status: 500 })
  }
}

// DELETE look
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Deleting look from database:', id)

    // Get the look to delete from database
    const dbLookToDelete = await getLookById(id)
    if (!dbLookToDelete) {
      return NextResponse.json({ error: 'Look not found' }, { status: 404 })
    }

    // Transform to frontend format for image processing
    const lookToDelete: FashionLook = {
      id: dbLookToDelete.id,
      title: dbLookToDelete.title,
      mainImage: dbLookToDelete.main_image,
      items: Array.isArray(dbLookToDelete.items) ? dbLookToDelete.items : [],
      tags: Array.isArray(dbLookToDelete.tags) ? dbLookToDelete.tags : [],
      createdAt: dbLookToDelete.created_at
    }

    // Collect all Cloudinary image URLs from the look
    const imageUrls: string[] = []

    // Add main image if it's from Cloudinary
    if (lookToDelete.mainImage) {
      imageUrls.push(lookToDelete.mainImage)
    }

    // Add all item images if they're from Cloudinary
    lookToDelete.items.forEach(item => {
      if (item.image) {
        imageUrls.push(item.image)
      }
    })

    // Delete images from Cloudinary
    console.log('Images to process:', imageUrls)
    const deletionPromises = imageUrls.map(async (imageUrl) => {
      console.log('Processing image URL:', imageUrl)
      const publicId = extractPublicId(imageUrl)
      console.log('Extracted public ID:', publicId)
      if (publicId) {
        console.log('Attempting to delete from Cloudinary:', publicId)
        const deleted = await deleteImage(publicId)
        console.log('Deletion result:', deleted)
        if (!deleted) {
          console.warn(`Failed to delete image: ${publicId}`)
        }
        return deleted
      } else {
        console.log('Not a Cloudinary image, skipping:', imageUrl)
      }
      return true // Not a Cloudinary image, skip
    })

    // Wait for all deletions to complete (but don't fail if some fail)
    await Promise.allSettled(deletionPromises)

    // Remove from database
    const { deleteLook } = await import('@/lib/database')
    await deleteLook(id)
    console.log('Look deleted from database:', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting look from database:', error)
    return NextResponse.json({ error: 'Failed to delete look' }, { status: 500 })
  }
}