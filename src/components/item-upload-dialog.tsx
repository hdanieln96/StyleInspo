"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { FashionItem, UploadedImage } from '@/types'

const itemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100, 'Item name must be less than 100 characters'),
  price: z.string().min(1, 'Price is required').max(20, 'Price must be less than 20 characters'),
  affiliateLink: z.string().url('Please enter a valid URL').min(1, 'Affiliate link is required'),
  category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters')
})

type ItemFormData = z.infer<typeof itemSchema>

interface ItemUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddItem: (item: FashionItem) => void
}

export function ItemUploadDialog({ open, onOpenChange, onAddItem }: ItemUploadDialogProps) {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file')
  const [imageUrl, setImageUrl] = useState('')
  const [urlPreview, setUrlPreview] = useState('')

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      price: '',
      affiliateLink: '',
      category: ''
    }
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setUploadedImage({ file, preview })
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1
  })

  // Handle URL input and validation
  const handleUrlChange = async (url: string) => {
    setImageUrl(url)
    if (url && isValidImageUrl(url)) {
      // Test if the image is actually accessible
      try {
        await testImageAccessibility(url)
        setUrlPreview(url)
      } catch (error) {
        console.error('Image URL not accessible:', error)
        setUrlPreview('')
      }
    } else {
      setUrlPreview('')
    }
  }

  // Simple URL validation for images
  const isValidImageUrl = (url: string): boolean => {
    try {
      new URL(url)
      // Check for common image file extensions or known image hosting services
      return (
        /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url) || // File extensions with optional query params
        url.includes('cloudinary.com') ||
        url.includes('imgur.com') ||
        url.includes('unsplash.com') ||
        url.includes('pexels.com') ||
        url.includes('pixabay.com') ||
        url.includes('amazonaws.com') ||
        url.includes('googleusercontent.com') ||
        url.includes('cdn.') ||
        url.includes('/image') ||
        url.includes('/img') ||
        url.includes('/photo')
      )
    } catch {
      return false
    }
  }

  // Test if image URL is actually accessible
  const testImageAccessibility = (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        console.log('Image accessibility test passed:', url)
        resolve()
      }

      img.onerror = () => {
        console.error('Image accessibility test failed:', url)
        reject(new Error('Image not accessible'))
      }

      // Set timeout to avoid hanging
      setTimeout(() => {
        reject(new Error('Image load timeout'))
      }, 10000)

      img.src = url
    })
  }

  const onSubmit = async (data: ItemFormData) => {
    console.log('Submitting item data:', data)

    if (!uploadedImage && !urlPreview) {
      console.error('No image provided')
      alert('Please select an image or provide an image URL')
      return
    }

    setIsSubmitting(true)

    try {
      let finalImageUrl = ''

      if (uploadMethod === 'file' && uploadedImage) {
        console.log('Uploading file to Cloudinary...')
        // Upload image to Cloudinary
        const formData = new FormData()
        formData.append('file', uploadedImage.file)

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text()
          console.error('Upload failed:', errorText)
          throw new Error('Failed to upload image')
        }

        const { url } = await uploadResponse.json()
        finalImageUrl = url
        console.log('File uploaded successfully:', finalImageUrl)
      } else if (uploadMethod === 'url' && urlPreview) {
        // Use the provided URL directly
        finalImageUrl = imageUrl
        console.log('Using provided URL:', finalImageUrl)
      } else {
        throw new Error('No valid image provided')
      }

      // Ensure all required fields are present with validated data
      const newItem: FashionItem = {
        id: crypto.randomUUID(),
        name: data.name.trim(),
        price: data.price.trim(),
        affiliateLink: data.affiliateLink.trim(),
        category: data.category.trim(),
        image: finalImageUrl,
        backgroundColor: '#ffffff' // Default background color
      }

      console.log('Creating new item:', newItem)
      onAddItem(newItem)
      handleClose()
    } catch (error) {
      console.error('Failed to add item:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to add item: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setUploadedImage(null)
    setImageUrl('')
    setUrlPreview('')
    setUploadMethod('file')
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Fashion Item</DialogTitle>
          <DialogDescription>
            Add an individual clothing item with affiliate link
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive
                      ? 'Drop the item image here...'
                      : 'Drag & drop item image, or click to select'
                    }
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <AspectRatio ratio={1} className="overflow-hidden rounded-lg">
                    <img
                      src={uploadedImage.preview}
                      alt="Item preview"
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                  <Button
                    type="button"
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
                  <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">Image URL</label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
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
                    <AspectRatio ratio={1} className="overflow-hidden rounded-lg">
                      <img
                        src={urlPreview}
                        alt="Image preview"
                        className="object-cover w-full h-full"
                        onError={() => setUrlPreview('')}
                      />
                    </AspectRatio>
                    <Button
                      type="button"
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

            {/* Form Fields */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Vintage Denim Jacket" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Top, Dress, Shoes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., $59.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="affiliateLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Affiliate Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/product"
                      type="url"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={(!uploadedImage && !urlPreview) || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}