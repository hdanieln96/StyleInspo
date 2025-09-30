"use client"

import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/theme-provider'

export function Header() {
  const router = useRouter()
  const { theme } = useTheme()

  const brandName = "FashionAffiliate"

  const renderLogo = () => {
    if (!theme?.logo) return null

    const logoElement = theme.logo.url ? (
      <img
        src={theme.logo.url}
        alt={brandName}
        style={{
          width: `${theme.logo.width}px`,
          height: `${theme.logo.height}px`
        }}
        className="object-contain"
      />
    ) : null

    const textElement = null

    // Logo positioning logic
    const showBoth = theme.logo.showWithTitle && theme.logo.url
    const position = theme.logo.position || 'left'

    if (!theme.logo.url) {
      return null
    }

    if (!showBoth) {
      return logoElement
    }

    // Show both logo and text
    const flexDirection = position === 'right' ? 'flex-row-reverse' : 'flex-row'
    const gap = position === 'center' ? 'flex-col items-center gap-1' : `${flexDirection} items-center gap-3`

    return (
      <div className={`flex ${gap}`}>
        {logoElement}
        {textElement}
      </div>
    )
  }

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: 'var(--theme-header-background)',
        borderColor: 'var(--theme-header-border)'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left spacer for centering */}
          <div className="flex items-center flex-1">
          </div>

          {/* Centered Logo/Brand */}
          <div className="flex justify-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center"
            >
              {renderLogo()}
            </button>
          </div>

          {/* Right side spacer */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
          </div>
        </div>

      </div>
    </header>
  )
}