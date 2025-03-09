'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  name: string
  email: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user from sessionStorage on mount
    const loadUser = () => {
      try {
        const storedUser = sessionStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        } else {
          // Create a default user if none exists
          const defaultUser = {
            id: 1,
            name: 'Default User',
            email: 'user@example.com'
          }
          sessionStorage.setItem('user', JSON.stringify(defaultUser))
          sessionStorage.setItem('userId', defaultUser.id.toString())
          setUser(defaultUser)
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Update sessionStorage when user changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user))
      sessionStorage.setItem('userId', user.id.toString())
    } else {
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('userId')
    }
  }, [user])

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
} 