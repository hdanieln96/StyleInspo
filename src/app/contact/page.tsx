import { ArrowLeft, Mail, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export const metadata = {
  title: 'Contact Us - StyleInspo',
  description: 'Get in touch with the StyleInspo team. We\'re here to help with questions, partnerships, and feedback.',
}

export default function ContactPage() {
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
          Contact Us
        </h1>

        <div className="space-y-6">
          <p className="text-lg" style={{ color: 'var(--theme-text-muted)' }}>
            We&apos;d love to hear from you! Whether you have questions, feedback, or partnership inquiries, feel free to reach out.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  General Inquiries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  For general questions, feedback, or support:
                </p>
                <a
                  href="mailto:hello@styleinspo.com"
                  className="text-blue-600 hover:underline font-medium"
                >
                  hello@styleinspo.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Brand Partnerships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Interested in partnering with us?
                </p>
                <a
                  href="mailto:partnerships@styleinspo.com"
                  className="text-blue-600 hover:underline font-medium"
                >
                  partnerships@styleinspo.com
                </a>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>What to Expect</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                <li>• We typically respond within 24-48 hours during business days</li>
                <li>• For partnership inquiries, please include details about your brand and proposal</li>
                <li>• For technical issues, please describe the problem and include screenshots if possible</li>
              </ul>
            </CardContent>
          </Card>

          <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'var(--theme-background-secondary)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--theme-text)' }}>
              Follow Us
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--theme-text-muted)' }}>
              Stay updated with the latest fashion trends and style inspiration on our social media channels.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Instagram
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Pinterest
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}