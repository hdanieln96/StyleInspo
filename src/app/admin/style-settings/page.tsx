"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { ArrowLeft, Palette, Type, Layout, Image as ImageIcon, RotateCcw, Save, Upload, X, Settings2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTheme } from '@/components/theme-provider'

export default function StyleSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, updateTheme, resetTheme, isLoading } = useTheme()
  const [activeTab, setActiveTab] = useState<'colors' | 'logo' | 'typography' | 'layout' | 'footer'>('colors')
  const [isSaving, setIsSaving] = useState(false)
  const [localColors, setLocalColors] = useState({
    primary: "#ec4899",
    secondary: "#9333ea",
    accent: "#f59e0b",
    background: "#fafafa",
    backgroundSecondary: "#f5f5f5",
    text: "#171717",
    textMuted: "#737373",
    button: "#ec4899",
    buttonHover: "#be185d",
    tagBackground: "#ec4899",
    tagText: "#ffffff",
    cardBackground: "#ffffff",
    cardOverlay: "rgba(0, 0, 0, 0.6)",
    headerBackground: "#ffffff",
    headerBorder: "#e5e7eb"
  })
  const [localTypography, setLocalTypography] = useState<{
    fontFamily: string;
    headingSize: 'small' | 'medium' | 'large' | 'xl';
    bodySize: 'small' | 'medium' | 'large';
    fontWeight: 'light' | 'normal' | 'medium' | 'bold';
  }>({
    fontFamily: "Geist Sans",
    headingSize: "large",
    bodySize: "medium",
    fontWeight: "normal"
  })
  const [localLayout, setLocalLayout] = useState<{
    containerWidth: 'narrow' | 'normal' | 'wide' | 'full';
    spacing: 'tight' | 'normal' | 'relaxed';
    borderRadius: 'none' | 'small' | 'medium' | 'large';
  }>({
    containerWidth: "normal",
    spacing: "normal",
    borderRadius: "medium"
  })
  const [localLogo, setLocalLogo] = useState<{
    url: string | null;
    width: number;
    height: number;
    position: string;
    showWithTitle: boolean;
  }>({
    url: null,
    width: 120,
    height: 40,
    position: "center",
    showWithTitle: true
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  // Footer settings state
  const [footerSettings, setFooterSettings] = useState({
    footerLogoUrl: null as string | null,
    footerLogoSize: 150,
    footerTextColor: '#9ca3af',
    socialFacebook: '',
    socialTwitter: '',
    socialPinterest: '',
    socialInstagram: '',
    socialTiktok: '',
    adminEmail: ''
  })
  const [footerLogoFile, setFooterLogoFile] = useState<File | null>(null)
  const [footerLogoPreview, setFooterLogoPreview] = useState<string | null>(null)
  const [isUploadingFooterLogo, setIsUploadingFooterLogo] = useState(false)

  // Logo upload callback - must be defined before useDropzone
  const onLogoDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setLogoFile(file)
      setLogoPreview(preview)
    }
  }, [])

  // Footer logo upload callback
  const onFooterLogoDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setFooterLogoFile(file)
      setFooterLogoPreview(preview)
    }
  }, [])

  // Dropzone hook - must be called unconditionally
  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps, isDragActive: isLogoDragActive } = useDropzone({
    onDrop: onLogoDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg']
    },
    maxFiles: 1
  })

  const { getRootProps: getFooterLogoRootProps, getInputProps: getFooterLogoInputProps, isDragActive: isFooterLogoDragActive } = useDropzone({
    onDrop: onFooterLogoDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg']
    },
    maxFiles: 1
  })

  // Load footer settings from API
  useEffect(() => {
    const loadFooterSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const data = await response.json()
          setFooterSettings({
            footerLogoUrl: data.footer_logo_url,
            footerLogoSize: data.footer_logo_size || 150,
            footerTextColor: data.footer_text_color || '#9ca3af',
            socialFacebook: data.social_facebook || '',
            socialTwitter: data.social_twitter || '',
            socialPinterest: data.social_pinterest || '',
            socialInstagram: data.social_instagram || '',
            socialTiktok: data.social_tiktok || '',
            adminEmail: data.admin_email || ''
          })
        }
      } catch (error) {
        console.error('Error loading footer settings:', error)
      }
    }
    loadFooterSettings()
  }, [])

  // Update local state when theme loads
  useEffect(() => {
    if (theme?.colors) {
      setLocalColors(theme.colors)
    }
    if (theme?.typography) {
      setLocalTypography(theme.typography)
    }
    if (theme?.layout) {
      setLocalLayout(theme.layout)
    }
    if (theme?.logo) {
      setLocalLogo(theme.logo)
    }
  }, [theme])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-16 w-96 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/admin/login')
    return null
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save theme settings
      await updateTheme({
        colors: localColors,
        typography: localTypography,
        layout: localLayout,
        logo: localLogo
      })

      // Save footer settings
      const settingsResponse = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          footer_logo_url: footerSettings.footerLogoUrl,
          footer_logo_size: footerSettings.footerLogoSize,
          footer_text_color: footerSettings.footerTextColor,
          social_facebook: footerSettings.socialFacebook,
          social_twitter: footerSettings.socialTwitter,
          social_pinterest: footerSettings.socialPinterest,
          social_instagram: footerSettings.socialInstagram,
          social_tiktok: footerSettings.socialTiktok,
          admin_email: footerSettings.adminEmail
        })
      })

      if (!settingsResponse.ok) {
        throw new Error('Failed to save footer settings')
      }

      const result = await settingsResponse.json()
      console.log('Settings saved:', result)

      alert('Settings saved successfully! Please refresh the page to see the changes in the footer.')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please check the console for details and try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset to default theme? This will undo all customizations.')) {
      await resetTheme()
    }
  }

  const handleLogoUpload = async (file: File) => {
    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload logo')
      }

      const { url: logoUrl } = await uploadResponse.json()
      setLocalLogo(prev => ({ ...prev, url: logoUrl }))
      setLogoFile(null)
      setLogoPreview(null)
    } catch (error) {
      console.error('Logo upload failed:', error)
      alert('Failed to upload logo. Please try again.')
    } finally {
      setIsUploadingLogo(false)
    }
  }


  const handleLogoRemove = () => {
    setLocalLogo(prev => ({ ...prev, url: null }))
    setLogoFile(null)
    setLogoPreview(null)
  }

  const handleFooterLogoUpload = async (file: File) => {
    setIsUploadingFooterLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload footer logo')
      }

      const { url: logoUrl } = await uploadResponse.json()
      setFooterSettings(prev => ({ ...prev, footerLogoUrl: logoUrl }))
      setFooterLogoFile(null)
      setFooterLogoPreview(null)
    } catch (error) {
      console.error('Footer logo upload failed:', error)
      alert('Failed to upload footer logo. Please try again.')
    } finally {
      setIsUploadingFooterLogo(false)
    }
  }

  const handleFooterLogoRemove = () => {
    setFooterSettings(prev => ({ ...prev, footerLogoUrl: null }))
    setFooterLogoFile(null)
    setFooterLogoPreview(null)
  }

  const tabs = [
    { id: 'colors' as const, label: 'Colors', icon: Palette },
    { id: 'logo' as const, label: 'Header Logo', icon: ImageIcon },
    { id: 'typography' as const, label: 'Typography', icon: Type },
    { id: 'layout' as const, label: 'Layout', icon: Layout },
    { id: 'footer' as const, label: 'Footer', icon: Settings2 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Style Settings</h1>
              <p className="text-muted-foreground">Customize your fashion affiliate site appearance</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customization Options</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary/10 text-primary border-r-2 border-primary'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: localColors.cardBackground,
                      borderColor: localColors.backgroundSecondary
                    }}
                  >
                    <h3
                      className="font-bold mb-2"
                      style={{
                        color: localColors.text,
                        fontFamily: localTypography.fontFamily
                      }}
                    >
                      Sample Fashion Look
                    </h3>
                    <p
                      className="text-sm mb-3"
                      style={{ color: localColors.textMuted }}
                    >
                      This is how your content will look
                    </p>
                    <div className="flex gap-2">
                      <Badge
                        style={{
                          backgroundColor: localColors.tagBackground,
                          color: localColors.tagText
                        }}
                      >
                        summer
                      </Badge>
                      <Badge
                        style={{
                          backgroundColor: localColors.tagBackground,
                          color: localColors.tagText
                        }}
                      >
                        casual
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="mt-3"
                      style={{
                        backgroundColor: localColors.button,
                        color: localColors.tagText
                      }}
                    >
                      Shop This Look
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const activeTabData = tabs.find(tab => tab.id === activeTab)
                    if (activeTabData?.icon) {
                      const Icon = activeTabData.icon
                      return <Icon className="h-5 w-5" />
                    }
                    return null
                  })()}
                  {tabs.find(tab => tab.id === activeTab)?.label} Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTab === 'colors' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Brand Colors */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Brand Colors</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="primary">Primary Color</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={localColors.primary}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, primary: e.target.value }))}
                                className="w-12 h-10 p-1 rounded border"
                              />
                              <Input
                                type="text"
                                value={localColors.primary}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, primary: e.target.value }))}
                                placeholder="#ec4899"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="secondary">Secondary Color</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={localColors.secondary}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, secondary: e.target.value }))}
                                className="w-12 h-10 p-1 rounded border"
                              />
                              <Input
                                type="text"
                                value={localColors.secondary}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, secondary: e.target.value }))}
                                placeholder="#9333ea"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="accent">Accent Color</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={localColors.accent}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, accent: e.target.value }))}
                                className="w-12 h-10 p-1 rounded border"
                              />
                              <Input
                                type="text"
                                value={localColors.accent}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, accent: e.target.value }))}
                                placeholder="#f59e0b"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Background Colors */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Background Colors</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="background">Main Background</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={localColors.background}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, background: e.target.value }))}
                                className="w-12 h-10 p-1 rounded border"
                              />
                              <Input
                                type="text"
                                value={localColors.background}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, background: e.target.value }))}
                                placeholder="#fafafa"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="backgroundSecondary">Secondary Background</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={localColors.backgroundSecondary}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, backgroundSecondary: e.target.value }))}
                                className="w-12 h-10 p-1 rounded border"
                              />
                              <Input
                                type="text"
                                value={localColors.backgroundSecondary}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, backgroundSecondary: e.target.value }))}
                                placeholder="#f5f5f5"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="headerBackground">Header Background</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={localColors.headerBackground || "#ffffff"}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, headerBackground: e.target.value }))}
                                className="w-12 h-10 p-1 rounded border"
                              />
                              <Input
                                type="text"
                                value={localColors.headerBackground || "#ffffff"}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, headerBackground: e.target.value }))}
                                placeholder="#ffffff"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="headerBorder">Header Border</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={localColors.headerBorder}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, headerBorder: e.target.value }))}
                                className="w-12 h-10 p-1 rounded border"
                              />
                              <Input
                                type="text"
                                value={localColors.headerBorder}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, headerBorder: e.target.value }))}
                                placeholder="#e5e7eb"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Text Colors */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Text Colors</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="text">Primary Text</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={localColors.text}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, text: e.target.value }))}
                                className="w-12 h-10 p-1 rounded border"
                              />
                              <Input
                                type="text"
                                value={localColors.text}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, text: e.target.value }))}
                                placeholder="#171717"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="textMuted">Muted Text</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={localColors.textMuted}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, textMuted: e.target.value }))}
                                className="w-12 h-10 p-1 rounded border"
                              />
                              <Input
                                type="text"
                                value={localColors.textMuted}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, textMuted: e.target.value }))}
                                placeholder="#737373"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Elements */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Interactive Elements</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="button">Button Color</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={localColors.button}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, button: e.target.value }))}
                                className="w-12 h-10 p-1 rounded border"
                              />
                              <Input
                                type="text"
                                value={localColors.button}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, button: e.target.value }))}
                                placeholder="#ec4899"
                                className="flex-1"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="tagBackground">Tag Background</Label>
                            <div className="flex gap-2 mt-1">
                              <Input
                                type="color"
                                value={localColors.tagBackground}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, tagBackground: e.target.value }))}
                                className="w-12 h-10 p-1 rounded border"
                              />
                              <Input
                                type="text"
                                value={localColors.tagBackground}
                                onChange={(e) => setLocalColors(prev => ({ ...prev, tagBackground: e.target.value }))}
                                placeholder="#ec4899"
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'typography' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="fontFamily">Font Family</Label>
                        <Select
                          value={localTypography.fontFamily}
                          onValueChange={(value) => setLocalTypography(prev => ({ ...prev, fontFamily: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Geist Sans">Geist Sans (Default)</SelectItem>
                            <SelectItem value="Inter">Inter</SelectItem>
                            <SelectItem value="Roboto">Roboto</SelectItem>
                            <SelectItem value="Open Sans">Open Sans</SelectItem>
                            <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                            <SelectItem value="Montserrat">Montserrat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="headingSize">Heading Size</Label>
                        <Select
                          value={localTypography.headingSize}
                          onValueChange={(value: string) => setLocalTypography(prev => ({ ...prev, headingSize: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large (Default)</SelectItem>
                            <SelectItem value="xl">Extra Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="bodySize">Body Text Size</Label>
                        <Select
                          value={localTypography.bodySize}
                          onValueChange={(value: string) => setLocalTypography(prev => ({ ...prev, bodySize: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium (Default)</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="fontWeight">Font Weight</Label>
                        <Select
                          value={localTypography.fontWeight}
                          onValueChange={(value: string) => setLocalTypography(prev => ({ ...prev, fontWeight: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="normal">Normal (Default)</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'layout' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="containerWidth">Container Width</Label>
                        <Select
                          value={localLayout.containerWidth}
                          onValueChange={(value: string) => setLocalLayout(prev => ({ ...prev, containerWidth: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="narrow">Narrow (768px)</SelectItem>
                            <SelectItem value="normal">Normal (1024px)</SelectItem>
                            <SelectItem value="wide">Wide (1280px)</SelectItem>
                            <SelectItem value="full">Full Width</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="spacing">Spacing</Label>
                        <Select
                          value={localLayout.spacing}
                          onValueChange={(value: string) => setLocalLayout(prev => ({ ...prev, spacing: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tight">Tight</SelectItem>
                            <SelectItem value="normal">Normal (Default)</SelectItem>
                            <SelectItem value="relaxed">Relaxed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="borderRadius">Border Radius</Label>
                        <Select
                          value={localLayout.borderRadius}
                          onValueChange={(value: string) => setLocalLayout(prev => ({ ...prev, borderRadius: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None (Sharp)</SelectItem>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium (Default)</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'logo' && (
                  <div className="space-y-6">
                    {/* Current Logo Display */}
                    {localLogo.url && !logoPreview && (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium">Current Logo</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogoRemove}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                        <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                          <img
                            src={localLogo.url}
                            alt="Current logo"
                            style={{
                              width: `${localLogo.width}px`,
                              height: `${localLogo.height}px`
                            }}
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {/* Logo Upload Area */}
                    {logoPreview ? (
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium">Logo Preview</h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLogoFile(null)
                                setLogoPreview(null)
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => logoFile && handleLogoUpload(logoFile)}
                              disabled={isUploadingLogo}
                            >
                              {isUploadingLogo ? 'Uploading...' : 'Save Logo'}
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            style={{
                              width: `${localLogo.width}px`,
                              height: `${localLogo.height}px`
                            }}
                            className="object-contain"
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        {...getLogoRootProps()}
                        className={`
                          text-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                          ${isLogoDragActive
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
                          }
                        `}
                      >
                        <input {...getLogoInputProps()} />
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">
                          {localLogo.url ? 'Replace Logo' : 'Upload Logo'}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {isLogoDragActive
                            ? 'Drop the logo here...'
                            : 'Drag & drop a logo, or click to select'
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, JPEG, WebP, SVG up to 5MB
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="logoWidth">Logo Width (px)</Label>
                        <Input
                          type="number"
                          value={localLogo.width}
                          onChange={(e) => setLocalLogo(prev => ({ ...prev, width: parseInt(e.target.value) || 120 }))}
                          min="20"
                          max="400"
                        />
                      </div>

                      <div>
                        <Label htmlFor="logoHeight">Logo Height (px)</Label>
                        <Input
                          type="number"
                          value={localLogo.height}
                          onChange={(e) => setLocalLogo(prev => ({ ...prev, height: parseInt(e.target.value) || 40 }))}
                          min="20"
                          max="200"
                        />
                      </div>

                      <div>
                        <Label htmlFor="logoPosition">Position</Label>
                        <Select
                          value={localLogo.position}
                          onValueChange={(value: string) => setLocalLogo(prev => ({ ...prev, position: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Left</SelectItem>
                            <SelectItem value="center">Center</SelectItem>
                            <SelectItem value="right">Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'footer' && (
                  <div className="space-y-6">
                    {/* Footer Logo Upload */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Footer Logo</h3>

                      {footerSettings.footerLogoUrl && !footerLogoPreview && (
                        <div className="p-4 border rounded-lg mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium">Current Footer Logo</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleFooterLogoRemove}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                          <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                            <img
                              src={footerSettings.footerLogoUrl}
                              alt="Current footer logo"
                              style={{ width: `${footerSettings.footerLogoSize}px` }}
                              className="object-contain"
                            />
                          </div>
                        </div>
                      )}

                      {footerLogoPreview ? (
                        <div className="p-4 border rounded-lg mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium">Footer Logo Preview</h4>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setFooterLogoFile(null)
                                  setFooterLogoPreview(null)
                                }}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => footerLogoFile && handleFooterLogoUpload(footerLogoFile)}
                                disabled={isUploadingFooterLogo}
                              >
                                {isUploadingFooterLogo ? 'Uploading...' : 'Save Logo'}
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                            <img
                              src={footerLogoPreview}
                              alt="Footer logo preview"
                              style={{ width: `${footerSettings.footerLogoSize}px` }}
                              className="object-contain"
                            />
                          </div>
                        </div>
                      ) : (
                        <div
                          {...getFooterLogoRootProps()}
                          className={`
                            text-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors mb-4
                            ${isFooterLogoDragActive
                              ? 'border-primary bg-primary/5'
                              : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
                            }
                          `}
                        >
                          <input {...getFooterLogoInputProps()} />
                          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h4 className="text-lg font-semibold mb-2">
                            {footerSettings.footerLogoUrl ? 'Replace Footer Logo' : 'Upload Footer Logo'}
                          </h4>
                          <p className="text-muted-foreground mb-4">
                            {isFooterLogoDragActive
                              ? 'Drop the logo here...'
                              : 'Drag & drop a logo, or click to select'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, JPEG, WebP, SVG up to 5MB
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="footerLogoSize">Footer Logo Size (px)</Label>
                          <Input
                            type="number"
                            value={footerSettings.footerLogoSize}
                            onChange={(e) => setFooterSettings(prev => ({ ...prev, footerLogoSize: parseInt(e.target.value) || 150 }))}
                            min="50"
                            max="400"
                          />
                        </div>

                        <div>
                          <Label htmlFor="footerTextColor">Footer Text Color</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              type="color"
                              value={footerSettings.footerTextColor}
                              onChange={(e) => setFooterSettings(prev => ({ ...prev, footerTextColor: e.target.value }))}
                              className="w-12 h-10 p-1 rounded border"
                            />
                            <Input
                              type="text"
                              value={footerSettings.footerTextColor}
                              onChange={(e) => setFooterSettings(prev => ({ ...prev, footerTextColor: e.target.value }))}
                              placeholder="#9ca3af"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Media Links */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Social media icons will only appear in the footer when you add URLs below. Leave blank to hide icons.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="socialFacebook">Facebook URL</Label>
                          <Input
                            type="url"
                            placeholder="https://facebook.com/yourpage"
                            value={footerSettings.socialFacebook}
                            onChange={(e) => setFooterSettings(prev => ({ ...prev, socialFacebook: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="socialTwitter">Twitter/X URL</Label>
                          <Input
                            type="url"
                            placeholder="https://twitter.com/yourhandle"
                            value={footerSettings.socialTwitter}
                            onChange={(e) => setFooterSettings(prev => ({ ...prev, socialTwitter: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="socialPinterest">Pinterest URL</Label>
                          <Input
                            type="url"
                            placeholder="https://pinterest.com/yourpage"
                            value={footerSettings.socialPinterest}
                            onChange={(e) => setFooterSettings(prev => ({ ...prev, socialPinterest: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="socialInstagram">Instagram URL</Label>
                          <Input
                            type="url"
                            placeholder="https://instagram.com/yourhandle"
                            value={footerSettings.socialInstagram}
                            onChange={(e) => setFooterSettings(prev => ({ ...prev, socialInstagram: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="socialTiktok">TikTok URL</Label>
                          <Input
                            type="url"
                            placeholder="https://tiktok.com/@yourhandle"
                            value={footerSettings.socialTiktok}
                            onChange={(e) => setFooterSettings(prev => ({ ...prev, socialTiktok: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Admin Email */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                      <div>
                        <Label htmlFor="adminEmail">Admin Email (for contact form)</Label>
                        <Input
                          type="email"
                          placeholder="admin@styleinspo.com"
                          value={footerSettings.adminEmail}
                          onChange={(e) => setFooterSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Contact form submissions will be sent to this email address
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}