"use client"

import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  const isLoading = status === 'loading'
  const isAuthenticated = !!session?.user
  const isAdmin = session?.user?.role === 'admin'

  return {
    session,
    user: session?.user,
    isLoading,
    isAuthenticated,
    isAdmin,
  }
}