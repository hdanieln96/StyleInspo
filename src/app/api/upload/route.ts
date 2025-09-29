import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    console.log('Upload request started')
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY ? '***set***' : 'missing',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '***set***' : 'missing'
    })

    const data = await request.formData()
    const file = data.get('file') as File

    if (!file) {
      console.error('No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File details:', { name: file.name, size: file.size, type: file.type })

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('Buffer created, size:', buffer.length)

    // Upload to Cloudinary
    const response = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'styleinspo',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error)
            reject(error)
          } else {
            console.log('Cloudinary success:', result?.secure_url)
            resolve(result)
          }
        }
      ).end(buffer)
    })

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      url: (response as Record<string, any>).secure_url
    })
  } catch (error) {
    console.error('Upload error details:', error)
    return NextResponse.json(
      { error: `Failed to upload image: ${error}` },
      { status: 500 }
    )
  }
}