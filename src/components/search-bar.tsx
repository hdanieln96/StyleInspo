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
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-12 h-14 text-base bg-background/90 backdrop-blur-md border-muted-foreground/30
                     focus:border-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-2
                     shadow-md hover:shadow-lg focus:shadow-xl
                     transition-all duration-300
                     rounded-lg hover:scale-[1.01] focus:scale-[1.01]
                     placeholder:text-muted-foreground/60"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-9 w-9 p-0 hover:bg-muted/80 rounded-full transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-background/95 backdrop-blur-md rounded-xl border border-muted-foreground/20 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-sm text-muted-foreground">
            Searching for: <span className="font-medium text-foreground">&ldquo;{searchQuery}&rdquo;</span>
          </p>
        </div>
      )}
    </div>
  )
}