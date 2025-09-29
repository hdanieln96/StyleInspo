"use client"

import { useState } from 'react'
import { ArrowLeft, ExternalLink, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { FashionLook, FashionItem } from '@/types'
import Link from 'next/link'
import { EditButton } from '@/components/EditButton'
import { EditMainLookModal } from '@/components/EditMainLookModal'
import { EditItemModal } from '@/components/EditItemModal'
import { ItemUploadDialog } from '@/components/item-upload-dialog'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface LookDetailContentProps {
  look: FashionLook
}

export function LookDetailContent({ look: initialLook }: LookDetailContentProps) {
  const [look, setLook] = useState<FashionLook>(initialLook)
  const [isMainEditOpen, setIsMainEditOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const { isAdmin } = useAuth()

  const handleSaveLook = async (updatedLook: FashionLook) => {
    try {
      const response = await fetch(`/api/looks/${look.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedLook),
      })

      if (!response.ok) {
        throw new Error('Failed to update look')
      }

      setLook(updatedLook)
    } catch (error) {
      console.error('Error updating look:', error)
      throw error
    }
  }

  const handleEditItem = (itemId: string) => {
    setEditingItem(itemId)
  }

  const handleAddItem = async (newItem: FashionItem) => {
    try {
      const updatedLook: FashionLook = {
        ...look,
        items: [...look.items, newItem]
      }

      await handleSaveLook(updatedLook)
      toast.success('Item added successfully')
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add item')
    }
  }

  const editingItemData = editingItem ? look.items.find(item => item.id === editingItem) : null

  return (
    <>
      <div className="min-h-full" style={{ backgroundColor: 'var(--theme-background)' }}>
        <div className="px-4 py-8">
          <Button asChild variant="ghost" className="mb-8">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery
            </Link>
          </Button>

          {/* Side-by-side Layout: Main image on left, items on right */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-8">
            {/* Left Side - Main Image and Text */}
            <div className="lg:w-1/2">
              {/* Main Image */}
              <div className="flex justify-center mb-6">
                <div className="group w-full max-w-md relative overflow-hidden rounded-xl shadow-lg">
                  <img
                    src={look.mainImage}
                    alt={look.seo?.imageAltText || `${look.title} fashion outfit - shop the look`}
                    className="w-full h-auto object-cover"
                  />
                  {isAdmin && (
                    <EditButton
                      onClick={() => setIsMainEditOpen(true)}
                      className="top-2 right-2"
                      aria-label="Edit main image and SEO"
                    />
                  )}
                </div>
              </div>

              {/* Text Content - Under Image */}
              <div className="w-full max-w-2xl mx-auto">
                {(look.seo?.h1 || (look.title && look.title !== 'Untitled Look')) && (
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-3 text-center">
                      {look.seo?.h1 && look.seo.h1.trim() ? look.seo.h1 : look.title}
                    </h1>

                    {/* H2 Headings */}
                    {look.seo?.h2s && look.seo.h2s.length > 0 && (
                      <div className="mb-4 space-y-3">
                        {look.seo.h2s.map((h2, index) => (
                          <h2 key={index} className="text-lg font-semibold text-center text-gray-800">
                            {h2}
                          </h2>
                        ))}
                      </div>
                    )}

                  {/* SEO-optimized description */}
                  {look.seo?.outfitDescription && (
                    <div className="prose prose-gray max-w-none mb-4">
                      <p className="text-base leading-relaxed text-muted-foreground text-center">
                        {look.seo.outfitDescription}
                      </p>
                    </div>
                  )}

                  {/* User Tags */}
                  {look.tags && look.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {look.tags.map((tag, index) => (
                          <Badge key={index} variant="default" className="text-xs bg-blue-600 text-white hover:bg-blue-700 font-medium px-3 py-1">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Tags */}
                  {look.aiAnalysis && (
                    <div className="flex flex-wrap gap-2 mb-4 justify-center">
                      <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">{look.aiAnalysis.occasion}</Badge>
                      <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">{look.aiAnalysis.season}</Badge>
                      <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">{look.aiAnalysis.styleAesthetic}</Badge>
                      {look.aiAnalysis.colors.map((color, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">{color}</Badge>
                      ))}
                    </div>
                  )}

                  </div>
                )}

                {/* Styling Tips */}
                {look.seo?.stylingTips && look.seo.stylingTips.length > 0 && (
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Styling Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {look.seo.stylingTips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1 text-xs">•</span>
                            <span className="text-xs">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Occasion Guide */}
                {look.seo?.occasionGuide && (
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">When to Wear</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs leading-relaxed">{look.seo.occasionGuide}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Right Side - Items Section */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                {/* Add Item Button - Only show for admins */}
                {isAdmin && (
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={() => setIsAddItemOpen(true)}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                )}

                {look.items.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="w-10 h-10 mx-auto bg-muted rounded-full flex items-center justify-center mb-2">
                      <span className="text-base">🛍️</span>
                    </div>
                    <p className="text-muted-foreground mb-1 text-sm">Items coming soon</p>
                    <p className="text-xs text-muted-foreground">We&apos;re preparing the shopping details for this look</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {look.items.map((item) => (
                      <div
                        key={item.id}
                        className="group relative overflow-hidden rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                        style={{ backgroundColor: item.backgroundColor || '#ffffff' }}
                      >
                        <AspectRatio
                          ratio={4/3}
                          className="relative overflow-hidden rounded-lg"
                          style={{ backgroundColor: item.backgroundColor || '#ffffff' }}
                        >
                          <img
                            src={item.image}
                            alt={look.seo?.itemAltTexts?.[item.id] || `${item.name} ${item.category} - buy now for ${item.price}`}
                            className="object-contain w-full h-full"
                          />

                          {/* Edit Button - Top Left */}
                          {isAdmin && (
                            <EditButton
                              onClick={() => handleEditItem(item.id)}
                              className="top-2 left-2"
                              aria-label={`Edit ${item.name}`}
                            />
                          )}

                          {/* View Button - Top Right */}
                          <Button
                            asChild
                            size="sm"
                            className="absolute top-2 right-2 bg-white text-black hover:bg-gray-50 text-xs px-2 py-1 h-auto border border-gray-200"
                          >
                            <a
                              href={item.affiliateLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Item
                            </a>
                          </Button>

                          {/* Item Info - Bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95">
                            <div className="flex items-start justify-between mb-1">
                              <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                                {item.category}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-sm leading-tight mb-1 text-black">
                              {item.name}
                            </h3>
                            {/* SEO-optimized item description */}
                            {look.seo?.itemDescriptions?.[item.id] && (
                              <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                                {look.seo.itemDescriptions[item.id]}
                              </p>
                            )}
                            <p className="text-sm font-bold text-black">{item.price}</p>
                          </div>
                        </AspectRatio>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SEO Content Sections - Below main layout */}
          <div className="mt-8">
            {look.seo?.contentSections && look.seo.contentSections.length > 0 && (
              <div className="mt-6 space-y-4">
                {look.seo.contentSections.map((section, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{section.heading}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-xs">{section.content}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Internal Links */}
            {look.seo?.internalLinks && look.seo.internalLinks.length > 0 && (
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Related Looks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {look.seo.internalLinks.map((link, index) => (
                      <Link
                        key={index}
                        href={link.url}
                        className="block p-2 rounded hover:bg-gray-50 text-blue-600 hover:text-blue-700 text-xs"
                      >
                        {link.text} →
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      <EditMainLookModal
        look={look}
        isOpen={isMainEditOpen}
        onClose={() => setIsMainEditOpen(false)}
        onSave={handleSaveLook}
      />

      {editingItemData && (
        <EditItemModal
          item={editingItemData}
          look={look}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveLook}
        />
      )}

      <ItemUploadDialog
        open={isAddItemOpen}
        onOpenChange={setIsAddItemOpen}
        onAddItem={handleAddItem}
      />
    </>
  )
}