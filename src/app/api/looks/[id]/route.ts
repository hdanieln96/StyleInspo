import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { FashionLook } from '@/types'
import { extractPublicId, deleteImage } from '@/lib/cloudinary'

const DATA_FILE = path.join(process.cwd(), 'src/data/looks.json')

// GET single look
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await fs.readFile(DATA_FILE, 'utf8')
    const looks: FashionLook[] = JSON.parse(data)
    const look = looks.find(l => l.id === id)

    if (!look) {
      return NextResponse.json({ error: 'Look not found' }, { status: 404 })
    }

    return NextResponse.json(look)
  } catch (error) {
    console.error('Error reading look:', error)
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

    const data = await fs.readFile(DATA_FILE, 'utf8')
    const looks: FashionLook[] = JSON.parse(data)

    const index = looks.findIndex(l => l.id === id)
    if (index === -1) {
      return NextResponse.json({ error: 'Look not found' }, { status: 404 })
    }

    looks[index] = updatedLook

    await fs.writeFile(DATA_FILE, JSON.stringify(looks, null, 2))

    return NextResponse.json(updatedLook)
  } catch (error) {
    console.error('Error updating look:', error)
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
    const data = await fs.readFile(DATA_FILE, 'utf8')
    const looks: FashionLook[] = JSON.parse(data)

    const lookToDelete = looks.find(l => l.id === id)
    if (!lookToDelete) {
      return NextResponse.json({ error: 'Look not found' }, { status: 404 })
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

    // Remove from JSON data
    const filteredLooks = looks.filter(l => l.id !== id)
    await fs.writeFile(DATA_FILE, JSON.stringify(filteredLooks, null, 2))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting look:', error)
    return NextResponse.json({ error: 'Failed to delete look' }, { status: 500 })
  }
}