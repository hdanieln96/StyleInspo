"use client"

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Facebook, Twitter, Instagram } from 'lucide-react'
import { FaPinterest, FaTiktok } from 'react-icons/fa'

export function Footer() {
  const router = useRouter()
  const { data: session } = useSession()
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: [
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Affiliate Disclosure', href: '/affiliate-disclosure' },
    ],
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
        {/* Logo and Tagline Section */}
        <div className="mb-8">
          <h2
            className="text-3xl font-serif font-bold mb-3"
            style={{ color: 'var(--theme-text)', letterSpacing: '0.1em' }}
          >
            STYLEINSPO
          </h2>
          <p
            className="text-sm max-w-2xl"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            The latest fashion looks, styling inspiration, and curated shopping.
          </p>
        </div>

        {/* Social Media Icons */}
        <div className="mb-12 flex gap-6">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-70"
            aria-label="Facebook"
          >
            <Facebook className="h-5 w-5" style={{ color: 'var(--theme-text)' }} />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-70"
            aria-label="Twitter/X"
          >
            <Twitter className="h-5 w-5" style={{ color: 'var(--theme-text)' }} />
          </a>
          <a
            href="https://pinterest.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-70"
            aria-label="Pinterest"
          >
            <FaPinterest className="h-5 w-5" style={{ color: 'var(--theme-text)' }} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-70"
            aria-label="Instagram"
          >
            <Instagram className="h-5 w-5" style={{ color: 'var(--theme-text)' }} />
          </a>
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-70"
            aria-label="TikTok"
          >
            <FaTiktok className="h-5 w-5" style={{ color: 'var(--theme-text)' }} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

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
                Affiliate Disclosure: We may earn commissions from qualifying purchases. Partner: Awin
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