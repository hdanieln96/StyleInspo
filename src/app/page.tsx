"use client"

import { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchBar } from '@/components/search-bar'
import { FashionLook } from '@/types'

export default function Home() {
  const [looks, setLooks] = useState<FashionLook[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter looks based on search query
  const filteredLooks = useMemo(() => {
    if (!searchQuery.trim()) {
      return looks
    }

    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0)

    return looks.filter(look => {
      // Search in tags
      const allTags = (look.tags || []).join(' ').toLowerCase()
      // Search in title
      const title = look.title.toLowerCase()
      // Search in item categories
      const categories = look.items.map(item => item.category).join(' ').toLowerCase()

      const searchContent = `${allTags} ${title} ${categories}`

      // All search terms must match (AND logic)
      return searchTerms.every(term => searchContent.includes(term))
    })
  }, [looks, searchQuery])

  useEffect(() => {
    const fetchLooks = async () => {
      try {
        const response = await fetch('/api/looks')
        if (response.ok) {
          const data = await response.json()
          setLooks(data)
        }
      } catch (error) {
        console.error('Error fetching looks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLooks()
  }, [])

  if (loading) {
    return (
      <div className="min-h-full" style={{ backgroundColor: 'var(--theme-background)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center text-center mb-8">
            <Skeleton className="h-6 w-[600px] mb-4" />
            <Skeleton className="h-12 w-96 mb-8" />
          </div>
          <div className="masonry-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="masonry-item">
                <Skeleton className={`w-full rounded-lg ${
                  i % 3 === 0 ? 'h-80' : i % 3 === 1 ? 'h-64' : 'h-72'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-12">
          {/* Search Bar */}
          <div className="w-full mb-8">
            <SearchBar
              onSearch={setSearchQuery}
              placeholder="Search fashion looks (e.g., red dress, white heels, summer style...)"
            />
          </div>
        </div>

        {/* Gallery Grid */}
        {looks.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-64 h-64 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 rounded-lg flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">👗</span>
                </div>
                <p className="text-muted-foreground">Coming Soon</p>
                <p className="text-sm text-muted-foreground">Amazing fashion looks will be available here</p>
              </div>
            </div>
          </div>
        ) : filteredLooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-64 h-64 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 rounded-lg flex items-center justify-center mb-6">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="text-muted-foreground">No results found</p>
                <p className="text-sm text-muted-foreground">Try different search terms or browse all looks</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="masonry-grid">
            {filteredLooks.map((look) => (
              <div key={look.id} className="masonry-item">
                <div
                  className="pinterest-card relative overflow-hidden rounded-lg cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 group"
                  onClick={() => window.location.href = `/look/${look.id}`}
                  onTouchStart={(e) => {
                    // Add touched class for mobile
                    e.currentTarget.classList.add('touched')
                    setTimeout(() => {
                      e.currentTarget.classList.remove('touched')
                    }, 3000)
                  }}
                >
                  <img
                    src={look.mainImage}
                    alt={look.title}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Hover Overlay */}
                  <div className="image-overlay">
                    <div className="overlay-content">
                      {look.title && (
                        <h3 className="font-semibold text-lg leading-tight mb-2 text-white">
                          {look.title}
                        </h3>
                      )}

                      {/* Display tags if available */}
                      {look.tags && look.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {look.tags.slice(0, 4).map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-pink-500/20 text-white border-pink-300/30 hover:bg-pink-500/30"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {look.tags.length > 4 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-pink-300/50 text-white hover:bg-pink-500/20"
                            >
                              +{look.tags.length - 4}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Display item categories */}
                      {look.items.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {look.items.slice(0, 3).map((item) => (
                            <Badge
                              key={item.id}
                              variant="secondary"
                              className="text-xs bg-white/20 text-white border-white/30 hover:bg-white/30"
                            >
                              {item.category}
                            </Badge>
                          ))}
                          {look.items.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs border-white/50 text-white hover:bg-white/20"
                            >
                              +{look.items.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
