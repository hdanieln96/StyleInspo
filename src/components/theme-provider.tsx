"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ThemeSettings } from '@/types'

interface ThemeContextType {
  theme: ThemeSettings | null
  updateTheme: (updates: Partial<ThemeSettings>) => Promise<void>
  resetTheme: () => Promise<void>
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

function injectThemeVariables(theme: ThemeSettings) {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Inject color variables
  root.style.setProperty('--theme-primary', theme.colors.primary)
  root.style.setProperty('--theme-secondary', theme.colors.secondary)
  root.style.setProperty('--theme-accent', theme.colors.accent)
  root.style.setProperty('--theme-background', theme.colors.background)
  root.style.setProperty('--theme-background-secondary', theme.colors.backgroundSecondary)
  root.style.setProperty('--theme-text', theme.colors.text)
  root.style.setProperty('--theme-text-muted', theme.colors.textMuted)
  root.style.setProperty('--theme-button', theme.colors.button)
  root.style.setProperty('--theme-button-hover', theme.colors.buttonHover)
  root.style.setProperty('--theme-tag-background', theme.colors.tagBackground)
  root.style.setProperty('--theme-tag-text', theme.colors.tagText)
  root.style.setProperty('--theme-card-background', theme.colors.cardBackground)
  root.style.setProperty('--theme-card-overlay', theme.colors.cardOverlay)
  root.style.setProperty('--theme-header-background', theme.colors.headerBackground)
  root.style.setProperty('--theme-header-border', theme.colors.headerBorder)

  // Inject typography variables
  root.style.setProperty('--theme-font-family', theme.typography.fontFamily)

  // Set font sizes based on size settings
  const headingSizes = {
    small: '1.875rem', // text-3xl
    medium: '2.25rem', // text-4xl
    large: '3rem',     // text-5xl
    xl: '3.75rem'      // text-6xl
  }

  const bodySizes = {
    small: '0.875rem', // text-sm
    medium: '1rem',    // text-base
    large: '1.125rem'  // text-lg
  }

  root.style.setProperty('--theme-heading-size', headingSizes[theme.typography.headingSize])
  root.style.setProperty('--theme-body-size', bodySizes[theme.typography.bodySize])

  // Set container width
  const containerWidths = {
    narrow: '768px',   // max-w-3xl
    normal: '1024px',  // max-w-5xl
    wide: '1280px',    // max-w-7xl
    full: '100%'       // max-w-full
  }

  root.style.setProperty('--theme-container-width', containerWidths[theme.layout.containerWidth])

  // Set border radius
  const borderRadiusValues = {
    none: '0px',
    small: '0.25rem',  // rounded-sm
    medium: '0.5rem',  // rounded-lg
    large: '1rem'      // rounded-xl
  }

  root.style.setProperty('--theme-border-radius', borderRadiusValues[theme.layout.borderRadius])
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const response = await fetch('/api/theme')
        if (response.ok) {
          const themeData = await response.json()
          setTheme(themeData)
          injectThemeVariables(themeData)
        }
      } catch (error) {
        console.error('Failed to load theme:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [])

  const updateTheme = async (updates: Partial<ThemeSettings>) => {
    if (!theme) return

    const updatedTheme = { ...theme, ...updates }

    try {
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const savedTheme = await response.json()
        setTheme(savedTheme)
        injectThemeVariables(savedTheme)
      }
    } catch (error) {
      console.error('Failed to update theme:', error)
    }
  }

  const resetTheme = async () => {
    try {
      const response = await fetch('/api/theme', { method: 'PUT' })
      if (response.ok) {
        const defaultTheme = await response.json()
        setTheme(defaultTheme)
        injectThemeVariables(defaultTheme)
      }
    } catch (error) {
      console.error('Failed to reset theme:', error)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  )
}