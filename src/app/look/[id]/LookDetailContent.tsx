"use client"

import { useState, useCallback, useEffect } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  // Debug logging
  console.log('LookDetailContent rendering with look:', {
    id: initialLook.id,
    title: initialLook.title,
    mainImage: initialLook.mainImage,
    itemsCount: initialLook.items?.length || 0,
    tagsCount: initialLook.tags?.length || 0,
    hasSeo: !!initialLook.seo,
    hasAiAnalysis: !!initialLook.aiAnalysis
  })

  const [look, setLook] = useState<FashionLook>(initialLook)
  const [isMainEditOpen, setIsMainEditOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [isAddItemOpen, setIsAddItemOpen] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const { isAdmin } = useAuth()

  // Track affiliate click
  const trackAffiliateClick = useCallback(async (item: FashionItem) => {
    try {
      await fetch('/api/analytics/affiliate-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lookId: look.id,
          itemId: item.id,
          itemName: item.name,
          affiliateUrl: item.affiliateLink
        })
      })
    } catch (error) {
      console.error('Failed to track affiliate click:', error)
    }
  }, [look.id])

  // Handle affiliate link click with tracking
  const handleAffiliateClick = useCallback((item: FashionItem) => {
    // Track the click
    trackAffiliateClick(item)

    // Let the default link behavior continue (opening in new tab)
    // The tracking will happen in background
  }, [trackAffiliateClick])

  // Handle image loading errors
  const handleImageError = useCallback((imageUrl: string, type: 'main' | 'item') => {
    console.error(`${type} image failed to load:`, imageUrl)
    setImageErrors(prev => new Set(prev).add(imageUrl))
  }, [])

  // Track page view when component mounts
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch('/api/analytics/page-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pagePath: `/look/${look.id}`,
            lookId: look.id
          })
        })
      } catch (error) {
        console.error('Failed to track page view:', error)
      }
    }

    trackView()
  }, [look.id])

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

  // Helper function to ensure proper SEO structure
  const ensureDefaultSeoFields = (look: FashionLook): FashionLook => {
    const defaultSeo = {
      pageTitle: look.seo?.pageTitle || `${look.title} - Fashion Affiliate`,
      metaDescription: look.seo?.metaDescription || `Shop this ${look.title} look. ${look.items?.length || 0} items available from our affiliate partners.`,
      urlSlug: look.seo?.urlSlug || look.id,
      h1: look.seo?.h1 || look.title,
      h2s: look.seo?.h2s || [],
      outfitDescription: look.seo?.outfitDescription || '',
      stylingTips: look.seo?.stylingTips || [],
      occasionGuide: look.seo?.occasionGuide || '',
      itemDescriptions: look.seo?.itemDescriptions || {},
      keywords: look.seo?.keywords || {
        primary: [],
        secondary: [],
        longTail: []
      },
      imageAltText: look.seo?.imageAltText || `${look.title} fashion outfit - shop the look`,
      itemAltTexts: look.seo?.itemAltTexts || {},
      schemaMarkup: look.seo?.schemaMarkup || {},
      internalLinks: look.seo?.internalLinks || [],
      contentSections: look.seo?.contentSections || []
    }

    return {
      ...look,
      seo: defaultSeo
    }
  }

  const handleAddItem = async (newItem: FashionItem) => {
    try {
      console.log('Adding new item:', newItem)

      const updatedLook: FashionLook = {
        ...look,
        items: [...look.items, newItem]
      }

      // Ensure proper SEO structure
      const lookWithDefaults = ensureDefaultSeoFields(updatedLook)

      // Add default alt text and description for the new item
      if (lookWithDefaults.seo) {
        lookWithDefaults.seo.itemAltTexts = {
          ...lookWithDefaults.seo.itemAltTexts,
          [newItem.id]: `${newItem.name} ${newItem.category} - buy now for ${newItem.price}`
        }

        lookWithDefaults.seo.itemDescriptions = {
          ...lookWithDefaults.seo.itemDescriptions,
          [newItem.id]: `Shop this ${newItem.name} in ${newItem.category} category for ${newItem.price}`
        }
      }

      console.log('Saving updated look with defaults:', lookWithDefaults)
      await handleSaveLook(lookWithDefaults)
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
                <div className="group w-full max-w-md relative overflow-hidden rounded-xl shadow-lg bg-gray-100">
                  {!imageErrors.has(look.mainImage) ? (
                    <img
                      src={look.mainImage}
                      alt={look.seo?.imageAltText || `${look.title} fashion outfit - shop the look`}
                      className="w-full h-auto object-cover"
                      onError={() => handleImageError(look.mainImage, 'main')}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-96 flex items-center justify-center bg-gray-100 text-gray-500">
                      <div className="text-center">
                        <div className="text-4xl mb-2">👗</div>
                        <p className="text-sm">Image not available</p>
                        <p className="text-xs text-gray-400 mt-1">Fashion look preview</p>
                      </div>
                    </div>
                  )}
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
                    {look.seo?.h2s && Array.isArray(look.seo.h2s) && look.seo.h2s.length > 0 && (
                      <div className="mb-4 space-y-3">
                        {look.seo.h2s.filter(h2 => h2 && typeof h2 === 'string').map((h2, index) => (
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
                      {look.aiAnalysis.occasion && (
                        <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">{look.aiAnalysis.occasion}</Badge>
                      )}
                      {look.aiAnalysis.season && (
                        <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">{look.aiAnalysis.season}</Badge>
                      )}
                      {look.aiAnalysis.styleAesthetic && (
                        <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">{look.aiAnalysis.styleAesthetic}</Badge>
                      )}
                      {look.aiAnalysis.colors && Array.isArray(look.aiAnalysis.colors) && look.aiAnalysis.colors.map((color, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">{color}</Badge>
                      ))}
                    </div>
                  )}

                  </div>
                )}

                {/* Styling Tips */}
                {look.seo?.stylingTips && Array.isArray(look.seo.stylingTips) && look.seo.stylingTips.length > 0 && (
                  <Card className="mb-6">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Styling Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {look.seo.stylingTips.filter(tip => tip && typeof tip === 'string').map((tip, index) => (
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
                <div className="text-center py-8">
                  <div className="w-10 h-10 mx-auto bg-muted rounded-full flex items-center justify-center mb-2">
                    <span className="text-base">🛍️</span>
                  </div>
                  <p className="text-muted-foreground mb-1 text-sm">Items coming soon</p>
                  <p className="text-xs text-muted-foreground">We&apos;re preparing the shopping details for this look</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {look.items.map((item) => {
                    console.log('Rendering item:', {
                      id: item.id,
                      name: item.name,
                      image: item.image,
                      hasAffiliateLink: !!item.affiliateLink,
                      hasSeoAltText: !!look.seo?.itemAltTexts?.[item.id],
                      hasSeoDescription: !!look.seo?.itemDescriptions?.[item.id]
                    })
                    return (
                      <div
                        key={item.id}
                        className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                      >
                        {/* Clickable Image Area */}
                        <a
                          href={item.affiliateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block relative"
                          aria-label={`Shop ${item.name} - ${item.price}`}
                          onClick={(e) => handleAffiliateClick(item, e)}
                        >
                          <div
                            className="relative h-80 overflow-hidden"
                            style={{ backgroundColor: item.backgroundColor || '#ffffff' }}
                          >
                            {!imageErrors.has(item.image) ? (
                              <img
                                src={item.image}
                                alt={look.seo?.itemAltTexts?.[item.id] || `${item.name} ${item.category} - buy now for ${item.price}`}
                                className="w-full h-80 object-contain hover:scale-105 transition-transform duration-300"
                                onError={() => handleImageError(item.image, 'item')}
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-80 flex items-center justify-center bg-gray-50 text-gray-400">
                                <div className="text-center">
                                  <div className="text-3xl mb-2">🛍️</div>
                                  <p className="text-sm">Image unavailable</p>
                                </div>
                              </div>
                            )}

                            {/* Edit Button - Top Left (Admin only) */}
                            {isAdmin && (
                              <EditButton
                                onClick={(e) => {
                                  e.preventDefault() // Prevent navigation
                                  e.stopPropagation()
                                  handleEditItem(item.id)
                                }}
                                className="top-2 left-2 z-10"
                                aria-label={`Edit ${item.name}`}
                              />
                            )}

                            {/* Shop Button - Top Right */}
                            <Button
                              asChild
                              size="sm"
                              className="absolute top-2 right-2 bg-black hover:bg-gray-800 text-white text-xs px-3 py-1.5 h-auto z-10"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <a
                                href={item.affiliateLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => handleAffiliateClick(item, e)}
                              >
                                Shop
                              </a>
                            </Button>
                          </div>
                        </a>

                        {/* Product Information Below Image */}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                              {item.category}
                            </Badge>
                          </div>

                          <h3 className="font-semibold text-base leading-tight mb-2 text-black">
                            {item.name}
                          </h3>

                          {/* SEO-optimized item description */}
                          {look.seo?.itemDescriptions?.[item.id] && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {look.seo.itemDescriptions[item.id]}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-black">{item.price}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SEO Content Sections - Below main layout */}
          <div className="mt-8">
            {look.seo?.contentSections && Array.isArray(look.seo.contentSections) && look.seo.contentSections.length > 0 && (
              <div className="mt-6 space-y-4">
                {look.seo.contentSections.filter(section => section && section.heading && section.content).map((section, index) => (
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
            {look.seo?.internalLinks && Array.isArray(look.seo.internalLinks) && look.seo.internalLinks.length > 0 && (
              <Card className="mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Related Looks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {look.seo.internalLinks.filter(link => link && link.url && link.text).map((link, index) => (
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