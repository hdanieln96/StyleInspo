'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Page {
  id: string
  title: string
  content: string
  updated_at: string
}

export default function PageEditor() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activePageId, setActivePageId] = useState<string>('about')
  const [editedContent, setEditedContent] = useState<Record<string, string>>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    const loadPages = async () => {
      try {
        const response = await fetch('/api/pages')
        if (response.ok) {
          const data = await response.json()
          setPages(data)

          // Initialize edited content with current content
          const initialContent: Record<string, string> = {}
          data.forEach((page: Page) => {
            initialContent[page.id] = page.content
          })
          setEditedContent(initialContent)
        }
      } catch (error) {
        console.error('Error loading pages:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      loadPages()
    }
  }, [session])

  const handleSave = async (pageId: string) => {
    setIsSaving(true)
    try {
      const page = pages.find(p => p.id === pageId)
      if (!page) return

      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: page.title,
          content: editedContent[pageId]
        })
      })

      if (response.ok) {
        const updatedPage = await response.json()
        setPages(prev => prev.map(p => p.id === pageId ? updatedPage : p))
        alert('Page saved successfully!')
      } else {
        alert('Failed to save page. Please try again.')
      }
    } catch (error) {
      console.error('Error saving page:', error)
      alert('Failed to save page. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-16 w-96 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const activePage = pages.find(p => p.id === activePageId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
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
              <h1 className="text-3xl font-bold tracking-tight">Page Editor</h1>
              <p className="text-muted-foreground">Edit the content of your site pages</p>
            </div>
          </div>

          <Button
            onClick={() => activePage && handleSave(activePage.id)}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Edit Page Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activePageId} onValueChange={setActivePageId}>
              <TabsList className="grid w-full grid-cols-5">
                {pages.map((page) => (
                  <TabsTrigger key={page.id} value={page.id}>
                    {page.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {pages.map((page) => (
                <TabsContent key={page.id} value={page.id} className="space-y-4 mt-6">
                  <div>
                    <Label htmlFor={`content-${page.id}`}>
                      Page Content (HTML)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1 mb-2">
                      You can use HTML tags for formatting. The content will be displayed on the {page.title} page.
                    </p>
                    <Textarea
                      id={`content-${page.id}`}
                      rows={20}
                      value={editedContent[page.id] || ''}
                      onChange={(e) => setEditedContent(prev => ({
                        ...prev,
                        [page.id]: e.target.value
                      }))}
                      placeholder="Enter page content here..."
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(page.updated_at).toLocaleString()}
                    </p>
                    <Button
                      onClick={() => handleSave(page.id)}
                      disabled={isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save ' + page.title}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Formatting Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Use <code className="bg-muted px-1 py-0.5 rounded">&lt;h2&gt;</code> for section headings</p>
              <p>• Use <code className="bg-muted px-1 py-0.5 rounded">&lt;p&gt;</code> for paragraphs</p>
              <p>• Use <code className="bg-muted px-1 py-0.5 rounded">&lt;ul&gt;</code> and <code className="bg-muted px-1 py-0.5 rounded">&lt;li&gt;</code> for lists</p>
              <p>• Use <code className="bg-muted px-1 py-0.5 rounded">&lt;a href="..."&gt;</code> for links</p>
              <p>• Use <code className="bg-muted px-1 py-0.5 rounded">&lt;strong&gt;</code> for bold text</p>
              <p>• Use <code className="bg-muted px-1 py-0.5 rounded">&lt;em&gt;</code> for italic text</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}