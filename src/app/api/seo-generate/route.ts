import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Replicate from 'replicate'
import { SEOGenerationRequest, SEOGenerationResponse } from '@/types'

// OpenAI for vision analysis (backup option) - only initialize if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

// Note: We use template-based SEO generation powered by Replicate vision analysis

// Replicate for DeepSeek VL2 vision analysis
const replicate = process.env.REPLICATE_API_TOKEN ? new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
}) : null

// Helper functions to parse DeepSeek VL2 text responses
function extractItems(text: string): string[] {
  const itemMatch = text.toLowerCase().match(/(?:clothing items?|garments?|pieces?)[^:]*:?\s*([^.]*)/i)
  if (!itemMatch) return []

  const items = itemMatch[1]
    .split(/[,;]/)
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .slice(0, 5) // Limit to 5 items

  return items
}

function extractColors(text: string): string[] {
  const colorMatch = text.toLowerCase().match(/colors?[^:]*:?\s*([^.]*)/i)
  if (!colorMatch) return []

  const colors = colorMatch[1]
    .split(/[,;]/)
    .map(color => color.trim())
    .filter(color => color.length > 0)
    .slice(0, 4) // Limit to 4 colors

  return colors
}

function extractStyle(text: string): string {
  const styleMatch = text.match(/(?:style|aesthetic)[^:]*:?\s*([^.]*)/i)
  return styleMatch ? styleMatch[1].trim() : 'modern fashion'
}

function extractOccasion(text: string): string {
  const lowerText = text.toLowerCase()

  if (lowerText.includes('professional') || lowerText.includes('office') || lowerText.includes('business')) {
    return 'professional'
  } else if (lowerText.includes('formal') || lowerText.includes('evening') || lowerText.includes('gala')) {
    return 'formal'
  } else if (lowerText.includes('date') || lowerText.includes('night out')) {
    return 'date-night'
  } else if (lowerText.includes('street') || lowerText.includes('trendy') || lowerText.includes('urban')) {
    return 'street-style'
  } else {
    return 'casual'
  }
}

function extractSeason(text: string): string {
  const lowerText = text.toLowerCase()

  if (lowerText.includes('winter') || lowerText.includes('cold')) {
    return 'winter'
  } else if (lowerText.includes('summer') || lowerText.includes('hot')) {
    return 'summer'
  } else if (lowerText.includes('spring')) {
    return 'spring'
  } else if (lowerText.includes('fall') || lowerText.includes('autumn')) {
    return 'fall'
  } else {
    return 'current'
  }
}

// POST - Generate SEO content for a fashion look
export async function POST(request: NextRequest) {
  console.log('=== SEO Generation API Called ===')

  try {
    console.log('Parsing request body...')
    const body: SEOGenerationRequest = await request.json()
    console.log('Request body parsed successfully:', {
      lookId: body.lookId,
      title: body.title,
      hasMainImage: !!body.mainImage,
      itemCount: body.items?.length || 0
    })

    const { mainImage, items, userOccasion, userSeason } = body

    if (!mainImage) {
      console.log('No main image provided')
      return NextResponse.json(
        { success: false, error: 'Main image is required' },
        { status: 400 }
      )
    }

    // No API key required - we use Replicate for vision and template-based SEO generation

    // Step 1: Vision Analysis - Try DeepSeek VL2 first, then OpenAI as backup
    let visionAnalysis = null

    // Try DeepSeek VL2 via Replicate first (cheaper and better)
    if (replicate) {
      try {
        console.log('Using DeepSeek VL2 for vision analysis...')

        const visionPrompt = `Analyze this fashion outfit image and provide a detailed analysis. Focus on:
1. Clothing items visible (specific garments)
2. Colors and color palette
3. Style aesthetic (minimalist, bold, vintage, etc.)
4. Suggested occasion (professional, casual, formal, date-night, street-style)
5. Seasonal appropriateness (spring, summer, fall, winter)
6. Overall visual description

Provide your analysis in a structured format covering each point above.`

        const output = await replicate.run("deepseek-ai/deepseek-vl2:e5caf557dd9e5dcee46442e1315291ef1867f027991ede8ff95e304d4f734200", {
          input: {
            image: mainImage,
            prompt: visionPrompt,
            temperature: 0.3,
            max_length_tokens: 1000
          }
        })

        console.log('DeepSeek VL2 raw output:', output)

        // Parse DeepSeek VL2 response into structured format
        const analysisText = Array.isArray(output) ? output.join('') : (typeof output === 'string' ? output : JSON.stringify(output))

        if (!analysisText || analysisText.length < 10) {
          throw new Error('Empty or invalid response from DeepSeek VL2')
        }

        // Extract structured data from the analysis text
        visionAnalysis = {
          detectedItems: extractItems(analysisText),
          colors: extractColors(analysisText),
          styleAesthetic: extractStyle(analysisText),
          occasion: extractOccasion(analysisText),
          season: extractSeason(analysisText),
          visualDescription: analysisText
        }

        console.log('DeepSeek VL2 analysis successful:', visionAnalysis)
      } catch (error) {
        console.log('DeepSeek VL2 analysis failed:', error)
        console.log('Error details:', error instanceof Error ? error.message : String(error))
      }
    } else {
      console.log('Replicate not configured, skipping DeepSeek VL2 vision analysis')
    }

    // Fallback to OpenAI if DeepSeek VL2 failed or not available
    if (!visionAnalysis && openai) {
      try {
        const visionPrompt = `Analyze this fashion outfit image and provide a basic analysis. Return only valid JSON:

{
  "detectedItems": ["list of clothing items seen"],
  "colors": ["main colors in the outfit"],
  "styleAesthetic": "brief style description",
  "occasion": "suggested occasion (professional/casual/formal/date-night/street-style)",
  "season": "suggested season (spring/summer/fall/winter)",
  "visualDescription": "detailed description of what you see in the image"
}

Keep the response focused and brief.`

        const visionResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: visionPrompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: mainImage,
                    detail: 'low'
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })

        const visionContent = visionResponse.choices[0]?.message?.content
        if (visionContent) {
          try {
            visionAnalysis = JSON.parse(visionContent)
            console.log('OpenAI backup vision analysis successful:', visionAnalysis)
          } catch (parseError) {
            console.log('Failed to parse OpenAI vision response:', visionContent, parseError)
          }
        }
      } catch (error) {
        console.log('OpenAI vision analysis failed:', error)
        console.log('Error details:', error instanceof Error ? error.message : String(error))
      }
    } else if (!visionAnalysis) {
      console.log('No vision analysis available - OpenAI not configured and DeepSeek VL2 failed/unavailable')
    }

    // Step 2: Generate comprehensive SEO content using vision analysis + templates
    console.log('Generating SEO content using template-based system with vision analysis...')

    // Extract data from vision analysis and user inputs
    const colors = visionAnalysis?.colors || ['stylish']
    const occasion = userOccasion || visionAnalysis?.occasion || 'casual'
    const season = userSeason || visionAnalysis?.season || 'versatile'
    const itemCount = items.length
    const styleAesthetic = visionAnalysis?.styleAesthetic || 'modern fashion'
    const detectedItems = visionAnalysis?.detectedItems || items.map(item => item.name).filter(Boolean)

    // Calculate price range from actual items
    const prices = items.map(item => parseInt(item.price?.replace(/[^0-9]/g, '') || '0')).filter(p => p > 0)
    const minPrice = prices.length > 0 ? Math.min(...prices) : 50
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 200
    const priceRange = `$${minPrice} - $${maxPrice}`

    // Generate SEO-optimized title
    const primaryColor = colors[0] || 'Stylish'
    const capitalizedOccasion = occasion.charAt(0).toUpperCase() + occasion.slice(1)
    const baseTitle = `${primaryColor} ${capitalizedOccasion} Outfit - ${itemCount} Piece Look`
    const optimizedTitle = baseTitle.length > 60 ? baseTitle.substring(0, 57) + '...' : baseTitle

    // Generate URL slug
    const urlSlug = optimizedTitle.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Generate comprehensive SEO content
    const parsedResponse = {
      aiAnalysis: {
        detectedItems: detectedItems,
        colors: colors,
        styleAesthetic: styleAesthetic,
        occasion: occasion,
        season: season,
        priceRange: priceRange,
        bodyTypeSuitability: getBodyTypeSuitability(styleAesthetic, occasion),
        confidence: visionAnalysis ? 0.85 : 0.70
      },
      seoData: {
        pageTitle: optimizedTitle,
        metaDescription: generateMetaDescription(primaryColor, occasion, itemCount, styleAesthetic),
        urlSlug: urlSlug,
        h1: `${primaryColor} ${capitalizedOccasion} Outfit Inspiration`,
        h2s: ['How to Style This Look', 'When to Wear', 'Shop the Items', 'Complete the Look'],
        outfitDescription: generateOutfitDescription(primaryColor, occasion, season, itemCount, styleAesthetic, detectedItems),
        stylingTips: generateStylingTips(primaryColor, occasion, season, styleAesthetic),
        occasionGuide: generateOccasionGuide(occasion),
        itemDescriptions: {},
        keywords: generateKeywords(primaryColor, occasion, season, styleAesthetic, itemCount),
        imageAltText: `${primaryColor} ${occasion} outfit featuring ${itemCount} coordinated pieces in ${styleAesthetic} style`,
        itemAltTexts: {},
        schemaMarkup: {
          '@context': 'https://schema.org/',
          '@type': 'Product',
          name: optimizedTitle,
          description: `${primaryColor} ${occasion} outfit with ${itemCount} pieces in ${styleAesthetic} style. Perfect for ${season} styling and ${occasion} occasions.`,
          image: mainImage,
          category: `${occasion} fashion outfit`,
          color: primaryColor,
          style: styleAesthetic,
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: minPrice.toString(),
            highPrice: maxPrice.toString(),
            availability: 'https://schema.org/InStock',
            offerCount: itemCount
          },
          brand: {
            '@type': 'Brand',
            name: 'Fashion Affiliate'
          },
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Occasion',
              value: occasion
            },
            {
              '@type': 'PropertyValue',
              name: 'Season',
              value: season
            },
            {
              '@type': 'PropertyValue',
              name: 'Style',
              value: styleAesthetic
            },
            {
              '@type': 'PropertyValue',
              name: 'Pieces',
              value: itemCount.toString()
            }
          ],
          keywords: `${primaryColor}, ${occasion}, ${styleAesthetic}, ${season}, fashion, outfit, style`
        },
        internalLinks: [
          { text: `Similar ${capitalizedOccasion} Outfits`, url: `/${occasion.toLowerCase()}-outfits` },
          { text: `More ${season} Looks`, url: `/${season.toLowerCase()}-outfits` },
          { text: `${primaryColor} Fashion Inspiration`, url: `/${primaryColor.toLowerCase()}-outfits` }
        ],
        contentSections: generateContentSections(primaryColor, occasion, season, styleAesthetic, itemCount)
      }
    }

// Helper functions for SEO content generation
function getBodyTypeSuitability(style: string, occasion: string): string[] {
  const suitability = ['all body types']

  if (style.includes('structured') || style.includes('tailored')) {
    suitability.push('straight body type', 'apple body type')
  }
  if (style.includes('flowy') || style.includes('loose')) {
    suitability.push('pear body type', 'hourglass body type')
  }
  if (occasion === 'professional') {
    suitability.push('petite', 'tall')
  }

  return suitability.slice(0, 4)
}

function generateMetaDescription(color: string, occasion: string, itemCount: number, style: string): string {
  // Ultra-concise meta descriptions optimized for clicks
  const templates = [
    `${color} ${occasion} outfit - ${itemCount} ${style} pieces. Shop the complete look now.`,
    `${itemCount}-piece ${color} ${occasion} ensemble. Perfect ${style} styling inspiration.`,
    `Shop ${color} ${occasion} look: ${itemCount} ${style} pieces for any season.`
  ]

  const description = templates[Math.floor(Math.random() * templates.length)]
  return description.length > 160 ? description.substring(0, 157) + '...' : description
}

function generateOutfitDescription(color: string, occasion: string, season: string, itemCount: number, style: string, items: string[]): string {
  // Ultra-minimal 50-word description focused on keywords
  const itemList = items.length > 0 ? items.slice(0, 3).join(', ') : 'coordinated pieces'
  const seasonText = season === 'current' ? 'year-round' : season

  return `${color} ${occasion} outfit featuring ${itemCount} ${style} pieces. Includes ${itemList}. Perfect for ${seasonText} styling. Versatile, high-quality items that transition seamlessly from day to night. Complete your ${style} wardrobe with this coordinated ${occasion} ensemble.`
}

function generateStylingTips(color: string, occasion: string, season: string, style: string): string[] {
  // Ultra-concise 3-5 word styling tips
  const baseTips = [
    `Add ${color.toLowerCase()} accessories`,
    `Layer for ${season} weather`,
    `Mix textures and patterns`,
    `Choose ${style} shoes`,
    `Accessorize with minimal jewelry`
  ]

  // Add occasion-specific tips (3-5 words each)
  const occasionTips: { [key: string]: string[] } = {
    professional: ['Keep makeup subtle', 'Choose structured handbag', 'Add blazer layer'],
    casual: ['Mix and match pieces', 'Add sneakers or flats', 'Layer with cardigan'],
    formal: ['Add statement jewelry', 'Choose elegant heels', 'Include evening clutch'],
    'date-night': ['Add bold lipstick', 'Choose romantic accessories', 'Include strappy heels'],
    'street-style': ['Add trendy sneakers', 'Layer multiple pieces', 'Include bold accessories']
  }

  const specificTips = occasionTips[occasion] || occasionTips.casual
  return [...baseTips.slice(0, 3), ...specificTips.slice(0, 2)]
}

function generateOccasionGuide(occasion: string): string {
  // Ultra-minimal occasion guides (7-10 words)
  const guides = {
    professional: `Perfect for office meetings, presentations, business events.`,
    casual: `Ideal for weekend outings, coffee dates, social gatherings.`,
    formal: `Great for special events, dinner parties, upscale occasions.`,
    'date-night': `Perfect for romantic dinners, cocktail bars, evening events.`,
    'street-style': `Ideal for urban adventures, festivals, creative events.`
  }

  return guides[occasion as keyof typeof guides] || guides.casual
}

function generateKeywords(color: string, occasion: string, season: string, style: string, itemCount: number): { primary: string[], secondary: string[], longTail: string[] } {
  return {
    primary: [
      `${color.toLowerCase()} ${occasion} outfit`,
      `${style} ${occasion} look`,
      `${season} fashion outfit`
    ],
    secondary: [
      `${itemCount} piece outfit`,
      `${color.toLowerCase()} ${style} style`,
      `${occasion} outfit inspiration`,
      `${season} wardrobe essentials`
    ],
    longTail: [
      `how to style ${color.toLowerCase()} ${occasion} outfit`,
      `${season} ${occasion} fashion inspiration`,
      `${style} outfit ideas for ${occasion}`,
      `${color.toLowerCase()} ${occasion} look styling tips`
    ]
  }
}

function generateContentSections(color: string, occasion: string, season: string, style: string, itemCount: number): { heading: string, content: string }[] {
  // Ultra-minimal content sections (15-25 words each)
  return [
    {
      heading: `Shop This ${occasion.charAt(0).toUpperCase() + occasion.slice(1)} Look`,
      content: `${color} ${occasion} outfit with ${itemCount} ${style} pieces. Perfect for ${season} styling and everyday wear.`
    },
    {
      heading: 'Complete the Look',
      content: `Add accessories, shoes, and layers to personalize this ${style} ${occasion} ensemble for any occasion.`
    }
  ]
}

    // Add item-specific descriptions and alt texts
    const itemDescriptions: { [itemId: string]: string } = {}
    const itemAltTexts: { [itemId: string]: string } = {}

    items.forEach((item) => {
      if (item.name) {
        // Generate SEO-optimized item name
        const optimizedName = `${parsedResponse.aiAnalysis.colors[0] || ''} ${item.category || ''} ${item.name}`.trim()
        itemDescriptions[item.id] = `This ${optimizedName.toLowerCase()} features ${parsedResponse.aiAnalysis.styleAesthetic} styling perfect for ${parsedResponse.aiAnalysis.occasion} occasions. ${item.price ? `Available for ${item.price}.` : ''}`
        itemAltTexts[item.id] = `${optimizedName} - ${parsedResponse.aiAnalysis.styleAesthetic} style for ${parsedResponse.aiAnalysis.occasion}`
      }
    })

    parsedResponse.seoData.itemDescriptions = itemDescriptions
    parsedResponse.seoData.itemAltTexts = itemAltTexts

    console.log('Building final response...')
    const result: SEOGenerationResponse = {
      success: true,
      seoData: parsedResponse.seoData,
      aiAnalysis: parsedResponse.aiAnalysis
    }

    console.log('Final result structure:', {
      success: result.success,
      hasSeoData: !!result.seoData,
      hasAiAnalysis: !!result.aiAnalysis,
      pageTitle: result.seoData?.pageTitle?.substring(0, 50) + '...'
    })

    // Validate the response is actually JSON-serializable
    try {
      JSON.stringify(result)
      console.log('Response validation passed, sending JSON response')
      return NextResponse.json(result)
    } catch (serializationError) {
      console.error('Response serialization failed:', serializationError)
      return NextResponse.json(
        { success: false, error: 'Failed to serialize response data' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('=== SEO Generation Error ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')

    // Make sure we return valid JSON even on error
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate SEO content',
      debug: {
        errorType: typeof error,
        timestamp: new Date().toISOString()
      }
    }

    console.log('Returning error response:', errorResponse)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}