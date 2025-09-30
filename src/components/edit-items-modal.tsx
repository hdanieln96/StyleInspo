"use client"

import { useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Plus, Trash2 } from 'lucide-react'
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
import { Card } from '@/components/ui/card'
import { FashionLook, FashionItem } from '@/types'

const itemSchema = z.object({
  name: z.string().optional(),
  price: z.string().optional(),
  affiliateLink: z.string().optional(),
  category: z.string().optional(),
  image: z.string().optional()
})

const editItemsSchema = z.object({
  items: z.array(itemSchema)
})

type EditItemsFormData = z.infer<typeof editItemsSchema>

interface EditItemsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  look: FashionLook
  onSave: (updatedLook: FashionLook) => void
}

export function EditItemsModal({ open, onOpenChange, look, onSave }: EditItemsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<{ [key: number]: string }>({})

  const form = useForm<EditItemsFormData>({
    resolver: zodResolver(editItemsSchema),
    defaultValues: {
      items: look.items.length > 0 ? look.items.map(item => ({
        name: item.name,
        price: item.price,
        affiliateLink: item.affiliateLink,
        category: item.category,
        image: item.image
      })) : [{
        name: '',
        price: '',
        affiliateLink: '',
        category: '',
        image: ''
      }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  })

  const handleImageDrop = useCallback((acceptedFiles: File[], index: number) => {
    const file = acceptedFiles[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setUploadedImages(prev => ({ ...prev, [index]: preview }))
      form.setValue(`items.${index}.image`, preview)

      // Upload to Cloudinary in background
      const formData = new FormData()
      formData.append('file', file)

      fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.url) {
          form.setValue(`items.${index}.image`, data.url)
        }
      })
      .catch(error => {
        console.error('Failed to upload image:', error)
      })
    }
  }, [form])

  const onSubmit = async (data: EditItemsFormData) => {
    setIsSubmitting(true)

    try {
      const updatedItems: FashionItem[] = data.items.map((item, index) => ({
        id: look.items[index]?.id || crypto.randomUUID(),
        name: item.name || '',
        price: item.price || '',
        affiliateLink: item.affiliateLink || '',
        category: item.category || '',
        image: item.image || ''
      }))

      const updatedLook: FashionLook = {
        ...look,
        items: updatedItems
      }

      // Save to API
      const response = await fetch(`/api/looks/${look.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLook)
      })

      if (!response.ok) {
        throw new Error('Failed to update look')
      }

      const savedLook = await response.json()
      onSave(savedLook)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save items:', error)
      alert('Failed to save items. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addNewItem = () => {
    append({
      name: '',
      price: '',
      affiliateLink: '',
      category: '',
      image: ''
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Items for &quot;{look.title}&quot;</DialogTitle>
          <DialogDescription>
            Add clothing items with affiliate links for this fashion look
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((field, index) => {
              const hasImage = uploadedImages[index] || look.items[index]?.image

              return (
                <Card key={field.id} className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Item #{index + 1}</h3>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Image Upload */}
                    <div>
                      <FormLabel>Item Image</FormLabel>
                      {!hasImage ? (
                        <div className="border-2 border-dashed rounded-lg p-4 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleImageDrop([file], index)
                              }
                            }}
                            className="hidden"
                            id={`image-upload-${index}`}
                          />
                          <label
                            htmlFor={`image-upload-${index}`}
                            className="cursor-pointer block"
                          >
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload image
                            </p>
                          </label>
                        </div>
                      ) : (
                        <div className="relative">
                          <AspectRatio ratio={1} className="overflow-hidden rounded-lg">
                            <img
                              src={uploadedImages[index] || look.items[index]?.image}
                              alt={`Item ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          </AspectRatio>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setUploadedImages(prev => {
                                const newImages = { ...prev }
                                delete newImages[index]
                                return newImages
                              })
                              form.setValue(`items.${index}.image`, '')
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name={`items.${index}.name`}
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
                        name={`items.${index}.category`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Top, Dress, Shoes" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`items.${index}.price`}
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
                        name={`items.${index}.affiliateLink`}
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
                    </div>
                  </div>
                </Card>
              )
            })}

            {/* Add New Item Button */}
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={addNewItem}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Another Item
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Saving...' : 'Save Items'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}