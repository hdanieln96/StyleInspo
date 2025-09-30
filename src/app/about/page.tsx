import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'About Us - StyleInspo',
  description: 'Learn about StyleInspo, your destination for AI-powered fashion discovery and curated style inspiration.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--theme-text)' }}>
          About StyleInspo
        </h1>

        <div className="space-y-8" style={{ color: 'var(--theme-text-muted)' }}>
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              Our Mission
            </h2>
            <p className="text-lg leading-relaxed">
              StyleInspo is your destination for discovering stunning fashion looks and shopping individual pieces through our carefully curated affiliate partners. We combine AI-powered fashion discovery with expert curation to help you find and shop the perfect looks for any occasion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              How It Works
            </h2>
            <div className="space-y-4 text-lg leading-relaxed">
              <p>
                <strong>Discover:</strong> Browse through our collection of complete fashion looks featuring AI models showcasing various styles, from casual everyday wear to elegant evening attire.
              </p>
              <p>
                <strong>Shop:</strong> Click on any look to see detailed breakdowns of individual items. Each piece is shoppable through our trusted affiliate partners.
              </p>
              <p>
                <strong>Style:</strong> Get inspired by our curated collections and styling tips to create your own unique fashion statements.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              Our Approach
            </h2>
            <p className="text-lg leading-relaxed">
              We leverage cutting-edge AI technology to create diverse, inclusive fashion content that represents style for everyone. Our platform focuses on accessibility, making high-fashion inspiration available to fashion enthusiasts worldwide.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              Affiliate Partnerships
            </h2>
            <p className="text-lg leading-relaxed">
              StyleInspo partners with leading fashion retailers and brands to bring you the best shopping experience. When you purchase through our affiliate links, we may earn a commission at no additional cost to you. This helps us continue providing free fashion inspiration and maintain our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              Contact Us
            </h2>
            <p className="text-lg leading-relaxed">
              Have questions or feedback? We'd love to hear from you.{' '}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Get in touch
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}