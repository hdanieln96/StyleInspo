import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - StyleInspo',
  description: 'StyleInspo Privacy Policy - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>

        <p className="text-sm mb-8" style={{ color: 'var(--theme-text-muted)' }}>
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-gray max-w-none space-y-8" style={{ color: 'var(--theme-text-muted)' }}>
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              1. Introduction
            </h2>
            <p>
              Welcome to StyleInspo (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). We are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--theme-text)' }}>
              Information Automatically Collected
            </h3>
            <p>When you visit our website, we may automatically collect certain information about your device, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>IP address</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Device identifiers</li>
            </ul>

            <h3 className="text-xl font-medium mb-2 mt-4" style={{ color: 'var(--theme-text)' }}>
              Cookies and Tracking Technologies
            </h3>
            <p>
              We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and understand where our visitors are coming from. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, operate, and maintain our website</li>
              <li>Improve, personalize, and expand our website</li>
              <li>Understand and analyze how you use our website</li>
              <li>Develop new products, services, features, and functionality</li>
              <li>Track affiliate link clicks and conversions</li>
              <li>Communicate with you for customer service and support</li>
              <li>Detect, prevent, and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              4. Affiliate Links and Third-Party Services
            </h2>
            <p>
              Our website contains affiliate links to third-party websites and services. When you click on these links and make a purchase, we may receive a commission. These third-party sites have their own privacy policies, and we are not responsible for their practices.
            </p>
            <p className="mt-4">
              We work with affiliate networks including Awin and other partners. These networks may use cookies and tracking technologies to track conversions and attribute sales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              5. Data Sharing and Disclosure
            </h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Affiliate Partners:</strong> To track and attribute purchases made through our affiliate links</li>
              <li><strong>Service Providers:</strong> Third-party companies that help us operate our website and provide services</li>
              <li><strong>Analytics Providers:</strong> To understand website usage and improve our services</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              6. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              7. Your Privacy Rights
            </h2>
            <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to access your personal information</li>
              <li>The right to rectify inaccurate information</li>
              <li>The right to erase your personal information</li>
              <li>The right to restrict processing</li>
              <li>The right to data portability</li>
              <li>The right to object to processing</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at hello@styleinspo.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              8. Children&apos;s Privacy
            </h2>
            <p>
              Our website is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              9. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where privacy laws may differ. By using our website, you consent to such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              10. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              11. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              Email: <a href="mailto:hello@styleinspo.com" className="text-blue-600 hover:underline">hello@styleinspo.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}