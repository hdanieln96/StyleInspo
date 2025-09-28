import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // This function runs when the middleware executes
    // You can add additional logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          // Allow access to login page
          if (req.nextUrl.pathname === '/admin/login') {
            return true
          }
          // For other admin routes, require authentication
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*']
}