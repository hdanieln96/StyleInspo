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
import { Upload } from "lucide-react"
import { FashionLook, SEOData } from "@/types"
import { toast } from "sonner"

interface EditMainLookModalProps {
  look: FashionLook
  isOpen: boolean
  onClose: () => void
  onSave: (updatedLook: FashionLook) => Promise<void>
}

interface FormData extends Omit<SEOData, 'keywords' | 'internalLinks' | 'contentSections'> {
  mainImage: string
  title: string
  tags: string
  // Convert arrays to easier-to-handle formats
  primaryKeywords: string
  secondaryKeywords: string
  longTailKeywords: string
  h2s: string
  stylingTips: string
  // Internal links and content sections as JSON strings for form handling
  internalLinksJson: string
  contentSectionsJson: string
}

export function EditMainLookModal({ look, isOpen, onClose, onSave }: EditMainLookModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(look.mainImage)

  const form = useForm<FormData>({
    defaultValues: {
      mainImage: look.mainImage,
      title: look.title,
      tags: look.tags?.join(', ') || '',
      pageTitle: look.seo?.pageTitle || '',
      metaDescription: look.seo?.metaDescription || '',
      urlSlug: look.seo?.urlSlug || '',
      h1: look.seo?.h1 || '',
      h2s: look.seo?.h2s?.join('\n') || '',
      outfitDescription: look.seo?.outfitDescription || '',
      stylingTips: look.seo?.stylingTips?.join('\n') || '',
      occasionGuide: look.seo?.occasionGuide || '',
      imageAltText: look.seo?.imageAltText || '',
      primaryKeywords: look.seo?.keywords?.primary?.join(', ') || '',
      secondaryKeywords: look.seo?.keywords?.secondary?.join(', ') || '',
      longTailKeywords: look.seo?.keywords?.longTail?.join(', ') || '',
      internalLinksJson: JSON.stringify(look.seo?.internalLinks || []),
      contentSectionsJson: JSON.stringify(look.seo?.contentSections || []),
      itemDescriptions: look.seo?.itemDescriptions || {},
      itemAltTexts: look.seo?.itemAltTexts || {},
      schemaMarkup: look.seo?.schemaMarkup || {}
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

      form.setValue('mainImage', imageUrl)
      setImagePreview(imageUrl)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)

      // Convert form data back to the expected format
      const updatedSEO: SEOData = {
        pageTitle: data.pageTitle,
        metaDescription: data.metaDescription,
        urlSlug: data.urlSlug,
        h1: data.h1,
        h2s: data.h2s.split('\n').filter(h => h.trim()),
        outfitDescription: data.outfitDescription,
        stylingTips: data.stylingTips.split('\n').filter(tip => tip.trim()),
        occasionGuide: data.occasionGuide,
        itemDescriptions: data.itemDescriptions,
        keywords: {
          primary: data.primaryKeywords.split(',').map(k => k.trim()).filter(Boolean),
          secondary: data.secondaryKeywords.split(',').map(k => k.trim()).filter(Boolean),
          longTail: data.longTailKeywords.split(',').map(k => k.trim()).filter(Boolean),
        },
        imageAltText: data.imageAltText,
        itemAltTexts: data.itemAltTexts,
        schemaMarkup: data.schemaMarkup,
        internalLinks: JSON.parse(data.internalLinksJson || '[]'),
        contentSections: JSON.parse(data.contentSectionsJson || '[]'),
      }

      const updatedLook: FashionLook = {
        ...look,
        title: data.title,
        mainImage: data.mainImage,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        seo: updatedSEO,
      }

      await onSave(updatedLook)
      toast.success('Look updated successfully')
      onClose()
    } catch (error) {
      console.error('Error saving look:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Look & SEO</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Content & Display - What Users See */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📄 Content & Display</CardTitle>
                <p className="text-sm text-muted-foreground">These fields appear on the public page</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Main Image</label>
                  <div className="flex gap-4">
                    <div className="relative w-48 h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Upload className="h-8 w-8 text-gray-400" />
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
                    <div className="flex-1 space-y-2">
                      <FormField
                        control={form.control}
                        name="mainImage"
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
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Look Title - Main heading displayed on page (HIGH SEO impact)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Example: 'Chic Summer Office Outfit' - This appears as the main title on your page and is crucial for SEO ranking" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags - Shown as #hashtag blue badges on page (MEDIUM SEO impact)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Example: 'business casual, summer, professional, trendy' - Helps users find your content and improves search categorization" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="h1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>⚠️ H1 Override - CURRENTLY OVERRIDING YOUR TITLE! Clear this to show title instead</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="🚨 CLEAR THIS FIELD to show your title on the page! This field overrides your title when filled. Only use if you want a different heading than your title above." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="h2s"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>H2 Subheadings - Displayed on page (HIGH SEO impact)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Example (one per line):\nHow to Style This Look\nWhen to Wear\nShopping Guide\n\nThese appear as section headings on your page and are very important for SEO structure" rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outfitDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outfit Description - Main content shown on page (HIGH SEO impact)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Example: 'This sophisticated business casual ensemble combines comfort with professionalism. Perfect for summer office settings, featuring breathable fabrics and modern silhouettes that transition from meetings to after-work events.'\n\nThis is the main content users read - keep it engaging and keyword-rich for better SEO ranking" rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SEO & Metadata - Backend Only */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔍 SEO & Metadata</CardTitle>
                <p className="text-sm text-muted-foreground">These fields are for search engines and page metadata only</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="pageTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Title - Browser tab & Google search results (CRITICAL SEO impact)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Example: 'Chic Summer Office Outfit Ideas - Professional Business Casual Look' - This appears in Google search results and browser tab. Keep under 60 characters for best SEO" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description - Google search snippet (CRITICAL SEO impact)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Example: 'Discover the perfect summer office outfit that balances professionalism with comfort. Shop this chic business casual look featuring modern pieces ideal for warm weather workdays.'\n\nThis appears under your link in Google search results. MUST be 150-160 characters for optimal SEO impact" rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urlSlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug - Web address path (MEDIUM SEO impact)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Example: 'summer-office-outfit-business-casual' - This becomes part of your page URL. Use hyphens, keep it short and keyword-rich" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageAltText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Alt Text - Hidden but CRITICAL for SEO & accessibility</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Example: 'Professional woman wearing beige blazer and black trousers for summer office outfit' - Describes image for screen readers and Google image search" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Style & Occasion - Displayed Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Style & Occasion</CardTitle>
                <p className="text-sm text-muted-foreground">Content sections displayed on the page</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="stylingTips"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Styling Tips - Shows as bullet list on page (MEDIUM SEO impact)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Example (one tip per line):\nPair with nude heels for a leg-lengthening effect\nAdd a statement watch for professional polish\nLayer with a blazer for air-conditioned offices\nChoose breathable fabrics for summer comfort\n\nThese appear as helpful tips on your page and add valuable content for SEO" rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="occasionGuide"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occasion Guide - &apos;When to Wear&apos; section on page (MEDIUM SEO impact)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Example: 'Perfect for office meetings, business lunches, client presentations, and professional networking events. This versatile look transitions seamlessly from boardroom to happy hour.'\n\nHelps users understand when to wear the outfit and adds contextual content for SEO" rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Advanced SEO */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚙️ Advanced SEO</CardTitle>
                <p className="text-sm text-muted-foreground">Technical SEO fields for search optimization</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="primaryKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Keywords (comma-separated)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="fashion, outfit, style" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secondaryKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Keywords (comma-separated)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="trendy, chic, modern" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="longTailKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Long-tail Keywords (comma-separated)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="summer office outfit ideas, casual weekend style" />
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