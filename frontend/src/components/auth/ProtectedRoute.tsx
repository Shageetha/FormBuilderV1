"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#ff00c8' }}></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium" style={{ color: '#0072ff' }}>Redirecting to login...</div>
          <div className="animate-pulse h-2 w-24 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg, #0072ff 0%, #ff00c8 100%)' }}></div>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 