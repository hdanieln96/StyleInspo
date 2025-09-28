"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Copy, Check, Eye, Code, Sparkles } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FashionLook, SEOData } from '@/types'
import { toast } from 'sonner'

const seoSchema = z.object({
  pageTitle: z.string().min(1, 'Page title is required'),
  metaDescription: z.string().min(1, 'Meta description is required'),
  urlSlug: z.string().min(1, 'URL slug is required'),
  h1: z.string().min(1, 'H1 is required'),
  outfitDescription: z.string().min(1, 'Description is required'),
  imageAltText: z.string().min(1, 'Alt text is required'),
})

type SEOFormData = z.infer<typeof seoSchema>

interface SEOPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  look: FashionLook | null
  onSave: (updatedLook: FashionLook) => void
}

export function SEOPreviewModal({ open, onOpenChange, look, onSave }: SEOPreviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'preview' | 'edit' | 'technical'>('preview')

  const form = useForm<SEOFormData>({
    resolver: zodResolver(seoSchema),
    defaultValues: look?.seo ? {
      pageTitle: look.seo.pageTitle,
      metaDescription: look.seo.metaDescription,
      urlSlug: look.seo.urlSlug,
      h1: look.seo.h1,
      outfitDescription: look.seo.outfitDescription,
      imageAltText: look.seo.imageAltText,
    } : undefined
  })

  if (!look?.seo) {
    return null
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const onSubmit = async (data: SEOFormData) => {
    if (!look) return

    setIsSubmitting(true)

    try {
      const updatedSEO: SEOData = {
        ...look.seo,
        pageTitle: data.pageTitle,
        metaDescription: data.metaDescription,
        urlSlug: data.urlSlug,
        h1: data.h1,
        outfitDescription: data.outfitDescription,
        imageAltText: data.imageAltText,
      }

      const updatedLook: FashionLook = {
        ...look,
        seo: updatedSEO,
        seoLastUpdated: new Date().toISOString()
      }

      await onSave(updatedLook)
      toast.success('SEO content updated successfully!')
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to update SEO:', error)
      toast.error('Failed to update SEO content')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderPreviewTab = () => (
    <div className="space-y-6">
      {/* Search Result Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Search Result Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white border rounded-lg p-4 max-w-2xl">
            <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
              {look.seo.pageTitle}
            </div>
            <div className="text-green-700 text-sm mt-1">
              yoursite.com/{look.seo.urlSlug}
            </div>
            <div className="text-gray-600 text-sm mt-2 leading-relaxed">
              {look.seo.metaDescription}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Primary Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {look.seo.keywords.primary.map((keyword, index) => (
                    <Badge key={index} variant="default">{keyword}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-2">Long-tail Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {look.seo.keywords.longTail.map((keyword, index) => (
                    <Badge key={index} variant="outline">{keyword}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {look.aiAnalysis && (
              <div className="space-y-2 text-sm">
                <div><strong>Style:</strong> {look.aiAnalysis.styleAesthetic}</div>
                <div><strong>Occasion:</strong> {look.aiAnalysis.occasion}</div>
                <div><strong>Season:</strong> {look.aiAnalysis.season}</div>
                <div><strong>Colors:</strong> {look.aiAnalysis.colors.join(', ')}</div>
                <div><strong>Price Range:</strong> {look.aiAnalysis.priceRange}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Styling Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Styling Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {look.seo.stylingTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )

  const renderEditTab = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="pageTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  Page Title
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(field.value, 'pageTitle')}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === 'pageTitle' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <div className="text-xs text-muted-foreground">
                  Length: {field.value?.length || 0}/60 characters
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  Meta Description
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(field.value, 'metaDescription')}
                    className="h-6 w-6 p-0"
                  >
                    {copiedField === 'metaDescription' ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </FormLabel>
                <FormControl>
                  <textarea
                    {...field}
                    className="w-full p-2 border border-gray-300 rounded-md resize-none"
                    rows={3}
                  />
                </FormControl>
                <div className="text-xs text-muted-foreground">
                  Length: {field.value?.length || 0}/160 characters
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="urlSlug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL Slug</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <div className="text-xs text-muted-foreground">
                  Preview: yoursite.com/{field.value}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="h1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>H1 Heading</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>Image Alt Text</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )

  const renderTechnicalTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Schema Markup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
            {JSON.stringify(look.seo.schemaMarkup, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Internal Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {look.seo.internalLinks.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{link.text}</span>
                <span className="text-xs text-muted-foreground">{link.url}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            SEO Content for &quot;{look.title}&quot;
          </DialogTitle>
          <DialogDescription>
            Review and edit the AI-generated SEO content for this fashion look
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex gap-1 border-b">
          <Button
            variant={activeTab === 'preview' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </Button>
          <Button
            variant={activeTab === 'edit' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('edit')}
          >
            Edit
          </Button>
          <Button
            variant={activeTab === 'technical' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('technical')}
          >
            Technical
          </Button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'preview' && renderPreviewTab()}
          {activeTab === 'edit' && renderEditTab()}
          {activeTab === 'technical' && renderTechnicalTab()}
        </div>
      </DialogContent>
    </Dialog>
  )
}