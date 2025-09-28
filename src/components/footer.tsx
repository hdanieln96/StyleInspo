"use client"

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Heart, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  const router = useRouter()
  const { data: session } = useSession()
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
    ],
    social: [
      { name: 'Instagram', href: 'https://instagram.com' },
      { name: 'Pinterest', href: 'https://pinterest.com' },
      { name: 'TikTok', href: 'https://tiktok.com' },
    ]
  }

  return (
    <footer
      className="border-t mt-auto"
      style={{
        backgroundColor: 'var(--theme-background-secondary)',
        borderColor: 'var(--theme-background)'
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <p
              className="text-sm mb-4"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              Discover stunning fashion looks and shop individual pieces through our curated affiliate partners.
            </p>
            <div className="flex items-center gap-1">
              <span
                className="text-sm"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Made with
              </span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span
                className="text-sm"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                for fashion lovers
              </span>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3
              className="text-sm font-semibold mb-4 uppercase tracking-wider"
              style={{ color: 'var(--theme-text)' }}
            >
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => router.push(link.href)}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3
              className="text-sm font-semibold mb-4 uppercase tracking-wider"
              style={{ color: 'var(--theme-text)' }}
            >
              Legal
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => router.push(link.href)}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3
              className="text-sm font-semibold mb-4 uppercase tracking-wider"
              style={{ color: 'var(--theme-text)' }}
            >
              Follow Us
            </h3>
            <ul className="space-y-2">
              {footerLinks.social.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: 'var(--theme-text-muted)' }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t" style={{ borderColor: 'var(--theme-background)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p
                className="text-sm"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                © {currentYear} StyleInspo. All rights reserved.
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                Affiliate Disclosure: We may earn commissions from qualifying purchases.
              </p>
            </div>

            {/* Admin Button - Bottom Right */}
            <div className="flex items-center">
              {session ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Admin
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => router.push('/admin/login')}
                  className="bg-black hover:bg-gray-800 text-white p-2 rounded-md border-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}