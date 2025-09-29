import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DatabaseErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold">Database Connection Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            The StyleInspo database is not properly configured. This usually happens when environment variables are missing in deployment.
          </p>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>For administrators:</strong></p>
            <ul className="text-left list-disc list-inside space-y-1">
              <li>Check that DATABASE_POSTGRES_URL is set in Vercel environment variables</li>
              <li>Verify the database connection string is correct</li>
              <li>Ensure the Neon database is running</li>
            </ul>
          </div>
          <div className="pt-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Homepage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}