"use client"

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchBar({ onSearch, placeholder = "Search fashion looks..." }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Debounce search to avoid excessive filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, onSearch])

  const handleClear = () => {
    setSearchQuery('')
    onSearch('')
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-12 text-base bg-background/80 backdrop-blur-sm border-muted-foreground/20 focus:border-primary transition-colors"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-background/95 backdrop-blur-sm rounded-lg border border-muted-foreground/20 shadow-lg">
          <p className="text-sm text-muted-foreground">
            Searching for: <span className="font-medium text-foreground">&ldquo;{searchQuery}&rdquo;</span>
          </p>
        </div>
      )}
    </div>
  )
}