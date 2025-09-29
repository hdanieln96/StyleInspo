"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { FashionLook, UploadedImage } from '@/types'

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (look: FashionLook) => void
}

export function UploadDialog({ open, onOpenChange, onUpload }: UploadDialogProps) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file')
  const [imageUrl, setImageUrl] = useState('')
  const [urlPreview, setUrlPreview] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setUploadedImage({ file, preview })

      // Auto-generate title from filename if title is empty
      if (!title.trim()) {
        const fileName = file.name.replace(/\.[^/.]+$/, "") // Remove file extension
        const cleanTitle = fileName
          .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
          .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
        setTitle(cleanTitle)
      }
    }
  }, [title])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1
  })

  // Handle URL input and validation
  const handleUrlChange = (url: string) => {
    setImageUrl(url)
    if (url && isValidImageUrl(url)) {
      setUrlPreview(url)
      // Auto-generate title from URL if title is empty
      if (!title.trim()) {
        const urlTitle = url.split('/').pop()?.split('.')[0] || ''
        const cleanTitle = urlTitle
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
        setTitle(cleanTitle)
      }
    } else {
      setUrlPreview('')
    }
  }

  // Simple URL validation for images
  const isValidImageUrl = (url: string): boolean => {
    try {
      new URL(url)
      return /\.(jpg|jpeg|png|webp|gif)$/i.test(url) || url.includes('cloudinary.com')
    } catch {
      return false
    }
  }

  // Reset form
  const resetForm = () => {
    setUploadedImage(null)
    setTitle('')
    setTags('')
    setImageUrl('')
    setUrlPreview('')
    setUploadMethod('file')
  }

  const handleUpload = async () => {
    if ((!uploadedImage && !urlPreview) || isUploading) return

    setIsUploading(true)

    try {
      let finalImageUrl = ''

      if (uploadMethod === 'file' && uploadedImage) {
        // Upload image to Cloudinary
        const formData = new FormData()
        formData.append('file', uploadedImage.file)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image')
        }

        const { url } = await uploadResponse.json()
        finalImageUrl = url
      } else if (uploadMethod === 'url' && urlPreview) {
        // Use the provided URL directly
        finalImageUrl = imageUrl
      } else {
        throw new Error('No valid image provided')
      }

      // Process tags - split by comma, trim, filter empty, and convert to lowercase
      const processedTags = tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0)

      // Create the new look with image URL
      const newLook: FashionLook = {
        id: crypto.randomUUID(),
        title: title.trim() || '',
        mainImage: finalImageUrl,
        items: [],
        tags: processedTags,
        createdAt: new Date().toISOString()
      }

      // Save to API
      const response = await fetch('/api/looks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLook)
      })

      if (!response.ok) {
        throw new Error('Failed to save look')
      }

      const savedLook = await response.json()
      onUpload(savedLook)

      // Reset form
      resetForm()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload look. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Fashion Look</DialogTitle>
          <DialogDescription>
            Upload a photo of a complete fashion look to get started
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Upload Method Selection */}
          <div className="flex space-x-2 border rounded-lg p-1">
            <button
              type="button"
              onClick={() => setUploadMethod('file')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                uploadMethod === 'file'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod('url')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                uploadMethod === 'url'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              Use URL
            </button>
          </div>

          {/* File Upload */}
          {uploadMethod === 'file' && (
            !uploadedImage ? (
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                  ${isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? 'Drop the image here...'
                    : 'Drag & drop an image here, or click to select'
                  }
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <AspectRatio ratio={3/4} className="overflow-hidden rounded-lg">
                  <img
                    src={uploadedImage.preview}
                    alt="Uploaded fashion look"
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setUploadedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          )}

          {/* URL Input */}
          {uploadMethod === 'url' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="mt-1"
                />
                {imageUrl && !isValidImageUrl(imageUrl) && (
                  <p className="text-sm text-red-500 mt-1">
                    Please enter a valid image URL (.jpg, .jpeg, .png, .webp, .gif)
                  </p>
                )}
              </div>

              {/* URL Preview */}
              {urlPreview && (
                <div className="relative">
                  <AspectRatio ratio={3/4} className="overflow-hidden rounded-lg">
                    <img
                      src={urlPreview}
                      alt="Image preview"
                      className="object-cover w-full h-full"
                      onError={() => setUrlPreview('')}
                    />
                  </AspectRatio>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImageUrl('')
                      setUrlPreview('')
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="title">Look Title (optional)</Label>
            <Input
              id="title"
              placeholder="Auto-generated from filename or enter custom title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="e.g., red dress, white heels, blue bag"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separate tags with commas to help users find your look
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={(!uploadedImage && !urlPreview) || isUploading}
              className="flex-1"
            >
              {isUploading ? 'Uploading...' : 'Upload Look'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}