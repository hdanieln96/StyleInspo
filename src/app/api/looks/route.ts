import { NextRequest, NextResponse } from 'next/server'
import { FashionLook } from '@/types'

// In-memory storage for demo (will reset on each deployment)
// TODO: Replace with database in production
let looks: FashionLook[] = []

// GET all looks
export async function GET() {
  try {
    console.log('Getting looks, count:', looks.length)
    return NextResponse.json(looks)
  } catch (error) {
    console.error('Error reading looks:', error)
    return NextResponse.json([])
  }
}

// POST new look
export async function POST(request: NextRequest) {
  try {
    const newLook: FashionLook = await request.json()
    console.log('Saving new look:', newLook.id)

    // Check if this look already exists (prevent duplicates)
    const existingLook = looks.find(look => look.id === newLook.id)
    if (existingLook) {
      console.log('Look already exists:', newLook.id)
      return NextResponse.json(existingLook, { status: 200 })
    }

    looks.unshift(newLook) // Add to beginning
    console.log('Look saved successfully, total count:', looks.length)

    return NextResponse.json(newLook, { status: 201 })
  } catch (error) {
    console.error('Error saving look:', error)
    return NextResponse.json({ error: 'Failed to save look' }, { status: 500 })
  }
}