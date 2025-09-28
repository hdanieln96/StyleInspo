"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"
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

const CATEGORIES = [
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
  'Bags',
  'Jewelry',
  'Other'
]

export function EditItemModal({ item, look, isOpen, onClose, onSave }: EditItemModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(item.image)

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
        ...look.seo,
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
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Or paste image URL" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CATEGORIES.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}