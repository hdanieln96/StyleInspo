"use client"

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Facebook, Twitter, Instagram } from 'lucide-react'
import { FaPinterest, FaTiktok } from 'react-icons/fa'
import { useState, useEffect } from 'react'

interface FooterSettings {
  footer_logo_url: string | null
  footer_logo_size: number
  footer_text_color: string
  social_facebook: string
  social_twitter: string
  social_pinterest: string
  social_instagram: string
  social_tiktok: string
}

export function Footer() {
  const router = useRouter()
  const { data: session } = useSession()
  const currentYear = new Date().getFullYear()
  const [settings, setSettings] = useState<FooterSettings>({
    footer_logo_url: null,
    footer_logo_size: 150,
    footer_text_color: '#9ca3af',
    social_facebook: '',
    social_twitter: '',
    social_pinterest: '',
    social_instagram: '',
    social_tiktok: ''
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        }
      } catch (error) {
        console.error('Error loading footer settings:', error)
      }
    }
    loadSettings()
  }, [])

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
          {settings.footer_logo_url ? (
            <img
              src={settings.footer_logo_url}
              alt="StyleInspo"
              style={{ width: `${settings.footer_logo_size}px` }}
              className="mb-3 object-contain"
            />
          ) : (
            <h2
              className="text-3xl font-serif font-bold mb-3"
              style={{ color: 'var(--theme-text)', letterSpacing: '0.1em' }}
            >
              STYLEINSPO
            </h2>
          )}
          <p
            className="text-sm max-w-2xl"
            style={{ color: settings.footer_text_color }}
          >
            The latest fashion looks, styling inspiration, and curated shopping.
          </p>
        </div>

        {/* Social Media Icons */}
        <div className="mb-12 flex gap-6">
          {settings.social_facebook && (
            <a
              href={settings.social_facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-70"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" style={{ color: settings.footer_text_color }} />
            </a>
          )}
          {settings.social_twitter && (
            <a
              href={settings.social_twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-70"
              aria-label="Twitter/X"
            >
              <Twitter className="h-5 w-5" style={{ color: settings.footer_text_color }} />
            </a>
          )}
          {settings.social_pinterest && (
            <a
              href={settings.social_pinterest}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-70"
              aria-label="Pinterest"
            >
              <FaPinterest className="h-5 w-5" style={{ color: settings.footer_text_color }} />
            </a>
          )}
          {settings.social_instagram && (
            <a
              href={settings.social_instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-70"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" style={{ color: settings.footer_text_color }} />
            </a>
          )}
          {settings.social_tiktok && (
            <a
              href={settings.social_tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-70"
              aria-label="TikTok"
            >
              <FaTiktok className="h-5 w-5" style={{ color: settings.footer_text_color }} />
            </a>
          )}
        </div>

        <div className="flex justify-end gap-16">
          {/* Company Links */}
          <div>
            <h3
              className="text-sm font-semibold mb-4 uppercase tracking-wider"
              style={{ color: settings.footer_text_color }}
            >
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => router.push(link.href)}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: settings.footer_text_color }}
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
              style={{ color: settings.footer_text_color }}
            >
              Legal
            </h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => router.push(link.href)}
                    className="text-sm transition-colors hover:opacity-80"
                    style={{ color: settings.footer_text_color }}
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
                style={{ color: settings.footer_text_color }}
              >
                © {currentYear} StyleInspo. All rights reserved.
              </p>
              <p
                className="text-xs"
                style={{ color: settings.footer_text_color }}
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