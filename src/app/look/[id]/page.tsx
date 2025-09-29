import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { FashionLook } from '@/types'
import { LookDetailContent } from './LookDetailContent'
import { getLookById } from '@/lib/database'

// Fetch look data directly from database
async function getLook(id: string): Promise<FashionLook | null> {
  try {
    console.log('Fetching look directly from database:', id)

    // Check if database is properly configured (check all Vercel/Neon variants)
    const hasDatabase = process.env.DATABASE_POSTGRES_URL ||
                       process.env.DATABASE_POSTGRES_URL_NON_POOLING ||
                       process.env.DATABASE_URL

    if (!hasDatabase) {
      console.error('Database not configured - missing environment variables')
      return null
    }

    const dbLook = await getLookById(id)

    if (!dbLook) {
      console.log('Look not found in database:', id)
      return null
    }

    // Transform database format to frontend format
    const look: FashionLook = {
      id: dbLook.id,
      title: dbLook.title,
      mainImage: dbLook.main_image,
      items: Array.isArray(dbLook.items) ? dbLook.items : [],
      tags: Array.isArray(dbLook.tags) ? dbLook.tags : [],
      createdAt: dbLook.created_at,
      seo: dbLook.seo || undefined,
      aiAnalysis: dbLook.ai_analysis || undefined,
      occasion: dbLook.occasion || undefined,
      season: dbLook.season || undefined,
      seoLastUpdated: dbLook.seo_last_updated || undefined
    }

    console.log('Successfully fetched look from database:', look.title)
    return look
  } catch (error) {
    console.error('Error fetching look from database:', error)
    console.error('Database connection details:', {
      hasPostgresUrl: !!process.env.DATABASE_POSTGRES_URL,
      hasDbUrl: !!process.env.DATABASE_URL,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    })
    return null
  }
}

// Generate dynamic metadata for SEO
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const look = await getLook(id)

  if (!look) {
    return {
      title: 'Look not found - Fashion Affiliate',
      description: 'The fashion look you are looking for could not be found.'
    }
  }

  // Use SEO data if available, otherwise fall back to basic data
  if (look.seo) {
    return {
      title: look.seo.pageTitle,
      description: look.seo.metaDescription,
      alternates: {
        canonical: `/look/${look.id}`
      },
      openGraph: {
        title: look.seo.pageTitle,
        description: look.seo.metaDescription,
        images: [
          {
            url: look.mainImage,
            width: 800,
            height: 1200,
            alt: look.seo.imageAltText,
          }
        ],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: look.seo.pageTitle,
        description: look.seo.metaDescription,
        images: [look.mainImage],
      },
      keywords: [
        ...look.seo.keywords.primary,
        ...look.seo.keywords.secondary,
        ...look.seo.keywords.longTail
      ].join(', '),
      other: {
        'article:tag': look.tags.join(', '),
        'product:price:amount': look.items.length > 0 ? look.items[0].price : '',
        'product:price:currency': 'USD'
      }
    }
  }

  // Fallback metadata
  return {
    title: `${look.title} - Fashion Affiliate`,
    description: `Shop this ${look.title} look. ${look.items.length} items available from our affiliate partners.`,
    openGraph: {
      title: `${look.title} - Fashion Affiliate`,
      description: `Shop this ${look.title} look. ${look.items.length} items available.`,
      images: [look.mainImage],
    },
  }
}

// Generate JSON-LD schema markup
function generateJsonLd(look: FashionLook) {
  // Safely parse prices from items
  const validPrices = look.items
    .map(item => {
      if (!item.price) return null
      const cleanPrice = item.price.replace(/[^0-9.]/g, '')
      const parsedPrice = parseFloat(cleanPrice)
      return isNaN(parsedPrice) ? null : parsedPrice
    })
    .filter((price): price is number => price !== null && price > 0)

  return look.seo?.schemaMarkup || {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": look.title,
    "description": look.seo?.outfitDescription || `Shop this ${look.title} look with ${look.items.length} items.`,
    "image": look.mainImage,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": validPrices.length > 0 ? Math.min(...validPrices) : 0,
      "highPrice": validPrices.length > 0 ? Math.max(...validPrices) : 0
    }
  }
}

export default async function LookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const look = await getLook(id)

    if (!look) {
      console.log('Look not found, redirecting to 404')
      notFound()
    }

    const jsonLd = generateJsonLd(look)

    return (
      <>
        {/* JSON-LD Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LookDetailContent look={look} />
      </>
    )
  } catch (error) {
    console.error('Error in LookDetailPage:', error)

    // Check if it's a database connection error
    const hasDatabase = process.env.DATABASE_POSTGRES_URL ||
                       process.env.DATABASE_POSTGRES_URL_NON_POOLING ||
                       process.env.DATABASE_URL

    if (!hasDatabase) {
      console.log('Database not configured, redirecting to error page')
      redirect('/database-error')
    }

    // For other errors, show 404
    notFound()
  }
}