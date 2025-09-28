import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FashionLook } from '@/types'
import { LookDetailContent } from './LookDetailContent'

// Fetch look data
async function getLook(id: string): Promise<FashionLook | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/looks/${id}`, {
      cache: 'no-store'
    })
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching look:', error)
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
  return look.seo?.schemaMarkup || {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": look.title,
    "description": look.seo?.outfitDescription || `Shop this ${look.title} look with ${look.items.length} items.`,
    "image": look.mainImage,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": look.items.length > 0 ? Math.min(...look.items.map(item => parseFloat(item.price.replace(/[^0-9.]/g, '')))) : 0,
      "highPrice": look.items.length > 0 ? Math.max(...look.items.map(item => parseFloat(item.price.replace(/[^0-9.]/g, '')))) : 0
    }
  }
}

export default async function LookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const look = await getLook(id)

  if (!look) {
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
}