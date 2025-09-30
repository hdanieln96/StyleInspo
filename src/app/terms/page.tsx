import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - StyleInspo',
  description: 'StyleInspo Terms of Service - Read our terms and conditions for using our website.',
}

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>

        <p className="text-sm mb-8" style={{ color: 'var(--theme-text-muted)' }}>
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="prose prose-gray max-w-none space-y-8" style={{ color: 'var(--theme-text-muted)' }}>
          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using StyleInspo ("the Website"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this Website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              2. Use License
            </h2>
            <p>
              Permission is granted to temporarily access the materials (information or software) on StyleInspo's website for personal, non-commercial viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or public display</li>
              <li>Attempt to decompile or reverse engineer any software on the Website</li>
              <li>Remove any copyright or proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              3. Affiliate Links and Purchases
            </h2>
            <p>
              StyleInspo contains affiliate links to third-party websites and products. When you click on these links and make a purchase, we may earn a commission at no additional cost to you.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>We are not responsible for the quality, accuracy, or reliability of products or services purchased through affiliate links</li>
              <li>All purchases are subject to the terms and conditions of the third-party retailer</li>
              <li>We do not process payments or handle customer service for purchases made through affiliate links</li>
              <li>Product availability, pricing, and shipping are determined by third-party retailers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              4. Content Accuracy
            </h2>
            <p>
              The materials appearing on StyleInspo's website may include technical, typographical, or photographic errors. StyleInspo does not warrant that any of the materials on its website are accurate, complete, or current. StyleInspo may make changes to the materials at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              5. Intellectual Property
            </h2>
            <p>
              All content on this Website, including but not limited to text, graphics, logos, images, and software, is the property of StyleInspo or its content suppliers and is protected by international copyright laws.
            </p>
            <p className="mt-4">
              The AI-generated fashion model images and styling presented on this Website are owned by StyleInspo. Unauthorized use, reproduction, or distribution of these materials is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              6. Disclaimer of Warranties
            </h2>
            <p>
              The materials on StyleInspo's website are provided on an 'as is' basis. StyleInspo makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              7. Limitations of Liability
            </h2>
            <p>
              In no event shall StyleInspo or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on StyleInspo's website, even if StyleInspo or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
            <p className="mt-4">
              StyleInspo is not responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Product quality, delivery, or customer service from affiliate retailers</li>
              <li>Pricing errors or changes made by third-party retailers</li>
              <li>Returns, refunds, or exchanges of products purchased through affiliate links</li>
              <li>Any disputes between users and third-party retailers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              8. User Conduct
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the Website for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any portion of the Website</li>
              <li>Interfere with or disrupt the Website or servers</li>
              <li>Collect or store personal data about other users</li>
              <li>Impersonate any person or entity</li>
              <li>Use automated systems to access the Website without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              9. Links to Third-Party Sites
            </h2>
            <p>
              StyleInspo has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by StyleInspo of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              10. Modifications to Terms
            </h2>
            <p>
              StyleInspo may revise these Terms of Service at any time without notice. By using this Website, you agree to be bound by the current version of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              11. Governing Law
            </h2>
            <p>
              These Terms of Service and any separate agreements whereby we provide you services shall be governed by and construed in accordance with the laws of the United States.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--theme-text)' }}>
              12. Contact Information
            </h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
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