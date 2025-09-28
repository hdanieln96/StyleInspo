import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Look not found</h1>
        <p className="text-muted-foreground mb-6">
          The fashion look you are looking for could not be found.
        </p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gallery
          </Link>
        </Button>
      </div>
    </div>
  )
}