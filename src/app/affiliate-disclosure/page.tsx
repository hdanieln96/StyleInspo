import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Affiliate Disclosure - StyleInspo',
  description: 'StyleInspo Affiliate Disclosure - Learn about our affiliate partnerships and how we earn commissions.',
}

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-background)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>
          Affiliate Disclosure
        </h1>

        <p className="text-sm mb-8" style={{ color: 'var(--theme-text-muted)' }}>
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-gray max-w-none space-y-8" style={{ color: 'var(--theme-text-muted)' }}>
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              FTC Disclosure
            </h2>
            <p className="text-lg">
              In accordance with the Federal Trade Commission's 16 CFR Part 255 ("Guides Concerning the Use of Endorsements and Testimonials in Advertising"), we are required to inform you that StyleInspo has financial relationships with some of the products and services mentioned on this website, and StyleInspo may be compensated if consumers choose to click these links and make a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              What Are Affiliate Links?
            </h2>
            <p>
              Affiliate links are special tracking links that allow us to earn a commission when you click through our website and make a purchase from our partner retailers. These links contain unique identifiers that track the traffic we send to our partners.
            </p>
            <p className="mt-4">
              <strong>Important:</strong> Using our affiliate links does not cost you anything extra. The price you pay is the same whether you use our link or go directly to the retailer's website. We simply earn a small commission from the retailer for referring you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              Our Affiliate Partnerships
            </h2>
            <p>
              StyleInspo participates in various affiliate marketing programs, including but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Awin:</strong> We are proud partners with the Awin affiliate network</li>
              <li><strong>Fashion Retailers:</strong> Direct partnerships with various fashion brands and online retailers</li>
              <li><strong>Other Affiliate Networks:</strong> We may partner with other reputable affiliate networks as we grow</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              How We Choose Products
            </h2>
            <p>
              We strive to maintain editorial integrity and only feature products and brands that we believe will provide value to our audience. Our fashion looks and product selections are based on:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Style appeal and fashion trends</li>
              <li>Quality and reputation of brands</li>
              <li>Price points accessible to our audience</li>
              <li>Availability and shipping options</li>
              <li>Overall aesthetic fit with our platform</li>
            </ul>
            <p className="mt-4">
              While we do earn commissions, our product selections are made independently and are not influenced solely by commission rates. We prioritize providing valuable fashion inspiration and quality recommendations to our users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              Your Trust Matters
            </h2>
            <p>
              We take our relationship with you seriously. Here's our commitment to you:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li><strong>Transparency:</strong> We clearly disclose our affiliate relationships</li>
              <li><strong>Honest Recommendations:</strong> We only feature products and styles we genuinely believe in</li>
              <li><strong>No Hidden Costs:</strong> You never pay more by using our links</li>
              <li><strong>Quality First:</strong> Commission potential does not override quality considerations</li>
              <li><strong>User Privacy:</strong> We protect your information (see our Privacy Policy for details)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              Commission Structure
            </h2>
            <p>
              When you make a purchase through our affiliate links, we typically earn a commission ranging from 4% to 15% of the purchase price, depending on the retailer and product category. These commissions help us:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Maintain and improve our website</li>
              <li>Create fresh fashion content regularly</li>
              <li>Cover hosting and operational costs</li>
              <li>Continue providing free fashion inspiration to our community</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              Third-Party Responsibility
            </h2>
            <p>
              Please note that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>We are not responsible for the quality, delivery, or customer service of products purchased through affiliate links</li>
              <li>All purchases are subject to the terms and conditions of the respective retailers</li>
              <li>Product availability, pricing, and shipping are determined by the retailers, not by StyleInspo</li>
              <li>For issues with orders, returns, or refunds, please contact the retailer directly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              Cookies and Tracking
            </h2>
            <p>
              Affiliate links use cookies to track your clicks and purchases. These cookies typically expire after 30-90 days, depending on the retailer's affiliate program. This means if you click our link and make a purchase within that timeframe, we may earn a commission.
            </p>
            <p className="mt-4">
              For more information about how we use cookies and tracking technologies, please see our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              Updates to This Disclosure
            </h2>
            <p>
              We may update this Affiliate Disclosure from time to time to reflect changes in our partnerships or practices. We encourage you to review this page periodically for the latest information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              Questions?
            </h2>
            <p>
              If you have any questions about our affiliate relationships or this disclosure, please don't hesitate to contact us:
            </p>
            <p className="mt-2">
              Email: <a href="mailto:hello@styleinspo.com" className="text-blue-600 hover:underline">hello@styleinspo.com</a>
            </p>
          </section>

          <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--theme-background-secondary)' }}>
            <p className="text-sm">
              <strong>Thank you for supporting StyleInspo!</strong> Your purchases through our affiliate links help us continue providing free fashion inspiration and maintain this platform. We appreciate your trust and support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}