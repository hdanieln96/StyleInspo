"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, LogOut, Eye, Edit, Trash2, Settings, Sparkles, BarChart3, MousePointer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Skeleton } from '@/components/ui/skeleton'
import { signOut } from 'next-auth/react'
import { FashionLook, SEOGenerationRequest, SEOGenerationResponse } from '@/types'
import { UploadDialog } from '@/components/upload-dialog'
import { EditItemsModal } from '@/components/edit-items-modal'
import { SEOPreviewModal } from '@/components/seo-preview-modal'
import { useLooks } from '@/lib/hooks/use-looks'
import { toast } from 'sonner'

interface AnalyticsData {
  recentViews?: Array<{ id: string; view_count: number }>
  clickSummary?: Array<{ click_count: string }>
  topLooks?: Array<{ id: string; title: string; view_count: number }>
  dailyStats?: Array<{ date: string; views: number }>
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { looks, loading, addLook, deleteLook, updateLook } = useLooks()
  const [showUpload, setShowUpload] = useState(false)
  const [editingLook, setEditingLook] = useState<FashionLook | null>(null)
  const [generatingSEO, setGeneratingSEO] = useState<string | null>(null)
  const [previewingSEO, setPreviewingSEO] = useState<FashionLook | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/admin/login')
      return
    }
  }, [session, status, router])

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics/summary')
        if (response.ok) {
          const data = await response.json()
          setAnalytics(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setAnalyticsLoading(false)
      }
    }

    if (session) {
      fetchAnalytics()
    }
  }, [session])

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const handleDeleteLook = async (lookId: string) => {
    if (confirm('Are you sure you want to delete this look?')) {
      await deleteLook(lookId)
    }
  }

  const handleGenerateSEO = async (look: FashionLook) => {
    setGeneratingSEO(look.id)

    try {
      const request: SEOGenerationRequest = {
        lookId: look.id,
        mainImage: look.mainImage,
        title: look.title,
        tags: look.tags,
        items: look.items,
        userOccasion: look.occasion,
        userSeason: look.season
      }

      const response = await fetch('/api/seo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      })

      const result: SEOGenerationResponse = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate SEO')
      }

      // Update the look with the generated SEO data
      const updatedLook: FashionLook = {
        ...look,
        seo: result.seoData,
        aiAnalysis: result.aiAnalysis,
        seoLastUpdated: new Date().toISOString()
      }

      await updateLook(look.id, updatedLook)

      toast.success('SEO content generated successfully!', {
        description: 'Your outfit now has optimized SEO content for better search rankings.'
      })

    } catch (error) {
      console.error('SEO generation failed:', error)
      toast.error('Failed to generate SEO content', {
        description: error instanceof Error ? error.message : 'Please try again later.'
      })
    } finally {
      setGeneratingSEO(null)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-16 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user?.email}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              View Public Site
            </Button>
            <Button
              onClick={() => setShowUpload(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Upload Look
            </Button>
            <Button
              onClick={() => router.push('/admin/style-settings')}
              variant="outline"
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Style Settings
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{looks.length}</CardTitle>
              <p className="text-muted-foreground">Total Looks</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {looks.reduce((acc, look) => acc + look.items.length, 0)}
              </CardTitle>
              <p className="text-muted-foreground">Total Items</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {looks.filter(look => look.items.length > 0).length}
              </CardTitle>
              <p className="text-muted-foreground">Complete Looks</p>
            </CardHeader>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics & Performance
          </h2>

          {analyticsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Analytics Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Page Views</CardTitle>
                    <div className="text-2xl font-bold">
                      {analytics.recentViews?.length || 0}
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Affiliate Clicks</CardTitle>
                    <div className="text-2xl font-bold">
                      {analytics.clickSummary?.reduce((acc: number, item: { click_count: string }) => acc + parseInt(item.click_count), 0) || 0}
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Most Viewed Look</CardTitle>
                    <div className="text-sm font-semibold">
                      {analytics.topLooks?.[0]?.title || 'No data'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {analytics.topLooks?.[0]?.view_count || 0} views
                    </div>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Click Rate</CardTitle>
                    <div className="text-2xl font-bold">
                      {analytics.recentViews?.length > 0
                        ? Math.round((analytics.clickSummary?.reduce((acc: number, item: { click_count: string }) => acc + parseInt(item.click_count), 0) / analytics.recentViews.length) * 100) || 0
                        : 0}%
                    </div>
                  </CardHeader>
                </Card>
              </div>

              {/* Top Performing Looks */}
              {analytics.topLooks && analytics.topLooks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Performing Looks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.topLooks.slice(0, 5).map((look: { id: string; title: string; view_count: number }, index: number) => (
                        <div key={look.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{look.title}</p>
                            <p className="text-xs text-muted-foreground">{look.view_count} views</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/look/${look.id}`)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Daily Views Chart (Simple List) */}
              {analytics.dailyStats && analytics.dailyStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Views (Last 7 Days)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.dailyStats.map((day: { date: string; views: number }) => (
                        <div key={day.date} className="flex justify-between items-center py-1">
                          <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                          <span className="font-medium">{day.views} views</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No analytics data available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Data will appear once visitors start viewing your looks.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Looks Management */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Fashion Looks</CardTitle>
          </CardHeader>
          <CardContent>
            {looks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">No fashion looks uploaded yet</p>
                <Button onClick={() => setShowUpload(true)}>
                  Upload your first look
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {looks.map((look) => (
                  <Card key={look.id} className="group relative">
                    <AspectRatio ratio={3/4} className="overflow-hidden rounded-t-lg">
                      <img
                        src={look.mainImage}
                        alt={look.title}
                        className="object-cover w-full h-full"
                      />
                    </AspectRatio>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-sm leading-tight">
                          {look.title}
                        </h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/look/${look.id}`)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingLook(look)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateSEO(look)}
                            disabled={generatingSEO === look.id}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                            title="Generate SEO content"
                          >
                            {generatingSEO === look.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                            ) : (
                              <Sparkles className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLook(look.id)}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <Badge variant={look.items.length > 0 ? "default" : "secondary"}>
                            {look.items.length} items
                          </Badge>
                          {look.seo && (
                            <Badge
                              variant="outline"
                              className="text-blue-600 border-blue-600 cursor-pointer hover:bg-blue-50"
                              onClick={() => setPreviewingSEO(look)}
                            >
                              SEO ✓
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(look.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <UploadDialog
          open={showUpload}
          onOpenChange={setShowUpload}
          onUpload={async (newLook) => {
            await addLook(newLook)
            setShowUpload(false)
          }}
        />

        {/* Edit Items Modal */}
        {editingLook && (
          <EditItemsModal
            open={!!editingLook}
            onOpenChange={(open) => !open && setEditingLook(null)}
            look={editingLook}
            onSave={async (updatedLook) => {
              await updateLook(updatedLook.id, updatedLook)
              setEditingLook(null)
            }}
          />
        )}

        {/* SEO Preview Modal */}
        {previewingSEO && (
          <SEOPreviewModal
            open={!!previewingSEO}
            onOpenChange={(open) => !open && setPreviewingSEO(null)}
            look={previewingSEO}
            onSave={async (updatedLook) => {
              await updateLook(updatedLook.id, updatedLook)
              setPreviewingSEO(null)
            }}
          />
        )}
      </div>
    </div>
  )
}