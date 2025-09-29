"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Trash2, X } from "lucide-react"
import { FashionItem, FashionLook } from "@/types"
import { toast } from "sonner"

interface EditItemModalProps {
  item: FashionItem
  look: FashionLook
  isOpen: boolean
  onClose: () => void
  onSave: (updatedLook: FashionLook) => Promise<void>
}

interface ItemFormData {
  name: string
  price: string
  category: string
  affiliateLink: string
  image: string
  description: string
  altText: string
  backgroundColor: string
}


export function EditItemModal({ item, look, isOpen, onClose, onSave }: EditItemModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(item.image)
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file')
  const [imageUrl, setImageUrl] = useState('')
  const [urlPreview, setUrlPreview] = useState('')

  const form = useForm<ItemFormData>({
    defaultValues: {
      name: item.name,
      price: item.price,
      category: item.category,
      affiliateLink: item.affiliateLink,
      image: item.image,
      description: look.seo?.itemDescriptions?.[item.id] || '',
      altText: look.seo?.itemAltTexts?.[item.id] || '',
      backgroundColor: item.backgroundColor || '#ffffff',
    }
  })

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

  // Handle URL input and validation
  const handleUrlChange = (url: string) => {
    setImageUrl(url)
    if (url && isValidImageUrl(url)) {
      setUrlPreview(url)
      form.setValue('image', url)
      setImagePreview(url)
    } else {
      setUrlPreview('')
      if (!url) {
        form.setValue('image', '')
        setImagePreview('')
      }
    }
  }

  // Watch for changes to the image field to update preview
  React.useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.image && value.image !== imagePreview) {
        setImagePreview(value.image)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, imagePreview])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      const imageUrl = data.url

      form.setValue('image', imageUrl)
      setImagePreview(imageUrl)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ItemFormData) => {
    try {
      setIsLoading(true)

      // Update the item in the look
      const updatedItems = look.items.map(i =>
        i.id === item.id
          ? {
              ...i,
              name: data.name,
              price: data.price,
              category: data.category,
              affiliateLink: data.affiliateLink,
              image: data.image,
              backgroundColor: data.backgroundColor,
            }
          : i
      )

      // Update SEO data for this item
      const updatedSEO = {
        ...(look.seo || {}),
        itemDescriptions: {
          ...look.seo?.itemDescriptions,
          [item.id]: data.description,
        },
        itemAltTexts: {
          ...look.seo?.itemAltTexts,
          [item.id]: data.altText,
        },
      }

      const updatedLook: FashionLook = {
        ...look,
        items: updatedItems,
        seo: updatedSEO,
      }

      await onSave(updatedLook)
      toast.success('Item updated successfully')
      onClose()
    } catch (error) {
      console.error('Error saving item:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteItem = async () => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return
    }

    try {
      setIsLoading(true)

      // Remove the item from the look
      const updatedItems = look.items.filter(i => i.id !== item.id)

      // Remove SEO data for this item
      const updatedItemDescriptions = { ...look.seo?.itemDescriptions }
      const updatedItemAltTexts = { ...look.seo?.itemAltTexts }
      delete updatedItemDescriptions[item.id]
      delete updatedItemAltTexts[item.id]

      const updatedSEO = {
        ...(look.seo || {}),
        itemDescriptions: updatedItemDescriptions,
        itemAltTexts: updatedItemAltTexts,
      }

      const updatedLook: FashionLook = {
        ...look,
        items: updatedItems,
        seo: updatedSEO,
      }

      await onSave(updatedLook)
      toast.success('Item deleted successfully')
      onClose()
    } catch (error) {
      console.error('Error deleting item:', error)
      toast.error('Failed to delete item')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Item Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Item Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <div className="flex gap-4">
                    <div className="relative w-32 h-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Upload className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="flex-1 flex items-center">
                      <p className="text-sm text-muted-foreground">
                        Click the preview area to upload a new image file
                      </p>
                    </div>
                  </div>
                )}

                {/* URL Input */}
                {uploadMethod === 'url' && (
                  <div className="space-y-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                onChange={(e) => {
                                  field.onChange(e)
                                  handleUrlChange(e.target.value)
                                }}
                              />
                            </FormControl>
                            {field.value && !isValidImageUrl(field.value) && (
                              <p className="text-sm text-red-500 mt-1">
                                Please enter a valid image URL (.jpg, .jpeg, .png, .webp, .gif)
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* URL Preview */}
                    {imagePreview && (
                      <div className="relative w-32 h-40 border-2 border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Image preview"
                          className="w-full h-full object-cover"
                          onError={() => {
                            setImagePreview('')
                            form.setValue('image', '')
                          }}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => {
                            setImageUrl('')
                            setUrlPreview('')
                            setImagePreview('')
                            form.setValue('image', '')
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basic Item Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Item name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="$99.99" />
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
                </div>

                <FormField
                  control={form.control}
                  name="affiliateLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affiliate Link</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="color"
                            {...field}
                            className="w-16 h-10 p-1 border rounded"
                          />
                          <Input
                            {...field}
                            placeholder="#ffffff"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SEO Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SEO Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="altText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alt Text</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Descriptive alt text for this item" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO Description</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="SEO-optimized description for this item"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <DialogFooter className="flex justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteItem}
                disabled={isLoading}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Item
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}