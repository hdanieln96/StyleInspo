export interface FashionItem {
  id: string
  name: string
  price: string
  affiliateLink: string
  image: string
  category: string
  backgroundColor?: string
}

export interface SEOData {
  pageTitle: string
  metaDescription: string
  urlSlug: string
  h1: string
  h2s: string[]
  outfitDescription: string
  stylingTips: string[]
  occasionGuide: string
  itemDescriptions: { [itemId: string]: string }
  keywords: {
    primary: string[]
    secondary: string[]
    longTail: string[]
  }
  imageAltText: string
  itemAltTexts: { [itemId: string]: string }
  schemaMarkup: Record<string, unknown>
  internalLinks: Array<{
    text: string
    url: string
  }>
  contentSections: Array<{
    heading: string
    content: string
  }>
}

export interface AIAnalysis {
  detectedItems: string[]
  colors: string[]
  styleAesthetic: string
  occasion: string
  season: string
  priceRange: string
  bodyTypeSuitability: string[]
  confidence: number
}

export interface FashionLook {
  id: string
  title: string
  mainImage: string
  items: FashionItem[]
  tags: string[]
  createdAt: string
  // SEO Enhancement Fields
  seo?: SEOData
  aiAnalysis?: AIAnalysis
  // User Override Fields
  occasion?: 'professional' | 'casual' | 'date-night' | 'formal' | 'street-style'
  season?: 'spring' | 'summer' | 'fall' | 'winter'
  seoLastUpdated?: string
}

export interface UploadedImage {
  file: File
  preview: string
}

export interface LogoSettings {
  url: string | null
  width: number
  height: number
  position: 'left' | 'center' | 'right'
  showWithTitle: boolean
}

export interface ColorSettings {
  primary: string
  secondary: string
  accent: string
  background: string
  backgroundSecondary: string
  text: string
  textMuted: string
  button: string
  buttonHover: string
  tagBackground: string
  tagText: string
  cardBackground: string
  cardOverlay: string
  headerBackground: string
  headerBorder: string
}

export interface TypographySettings {
  fontFamily: string
  headingSize: 'small' | 'medium' | 'large' | 'xl'
  bodySize: 'small' | 'medium' | 'large'
  fontWeight: 'light' | 'normal' | 'medium' | 'bold'
}

export interface LayoutSettings {
  containerWidth: 'narrow' | 'normal' | 'wide' | 'full'
  spacing: 'tight' | 'normal' | 'relaxed'
  borderRadius: 'none' | 'small' | 'medium' | 'large'
}

export interface ThemeSettings {
  id: string
  name: string
  logo: LogoSettings
  colors: ColorSettings
  typography: TypographySettings
  layout: LayoutSettings
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// AI SEO Generation Types
export interface SEOGenerationRequest {
  lookId: string
  mainImage: string
  title: string
  tags: string[]
  items: FashionItem[]
  userOccasion?: string
  userSeason?: string
}

export interface SEOGenerationResponse {
  success: boolean
  seoData?: SEOData
  aiAnalysis?: AIAnalysis
  error?: string
}