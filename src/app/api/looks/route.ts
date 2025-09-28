import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { FashionLook } from '@/types'

const DATA_FILE = path.join(process.cwd(), 'src/data/looks.json')

// Ensure data directory exists
async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
    await fs.writeFile(DATA_FILE, '[]')
  }
}

// GET all looks
export async function GET() {
  try {
    await ensureDataFile()
    const data = await fs.readFile(DATA_FILE, 'utf8')
    const looks: FashionLook[] = JSON.parse(data)
    return NextResponse.json(looks)
  } catch (error) {
    console.error('Error reading looks:', error)
    return NextResponse.json([])
  }
}

// POST new look
export async function POST(request: NextRequest) {
  try {
    await ensureDataFile()
    const newLook: FashionLook = await request.json()

    const data = await fs.readFile(DATA_FILE, 'utf8')
    const looks: FashionLook[] = JSON.parse(data)

    // Check if this look already exists (prevent duplicates)
    const existingLook = looks.find(look => look.id === newLook.id)
    if (existingLook) {
      return NextResponse.json(existingLook, { status: 200 })
    }

    looks.unshift(newLook) // Add to beginning

    await fs.writeFile(DATA_FILE, JSON.stringify(looks, null, 2))

    return NextResponse.json(newLook, { status: 201 })
  } catch (error) {
    console.error('Error saving look:', error)
    return NextResponse.json({ error: 'Failed to save look' }, { status: 500 })
  }
}