import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'fashion_affiliate')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  const data = await response.json()
  return data.secure_url
}

export const extractPublicId = (cloudinaryUrl: string): string | null => {
  try {
    const url = new URL(cloudinaryUrl)
    if (!url.hostname.includes('cloudinary.com')) {
      return null
    }

    const pathParts = url.pathname.split('/')
    const uploadIndex = pathParts.indexOf('upload')
    if (uploadIndex === -1 || uploadIndex + 2 >= pathParts.length) {
      return null
    }

    const publicIdWithExtension = pathParts.slice(uploadIndex + 2).join('/')
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '')

    return publicId
  } catch {
    return null
  }
}

export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error)
    return false
  }
}