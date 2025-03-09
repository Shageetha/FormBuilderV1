"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

// Define types
interface User {
  id: number | string  // Updated to support string IDs like "001"
  username: string
  email?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<{success: boolean, message: string}>
  logout: () => void
  error: string | null
}

// Define valid credentials for fallback when API is not available
const VALID_CREDENTIALS = [
  { username: 'Shageetha', password: 'Form@123', id: 1 },
  { username: 'admin', password: 'admin123', id: 2 },
  { username: 'demo', password: 'demo123', id: 3 }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// API URL
const API_URL = typeof window !== 'undefined' 
  ? (window as any).__ENV?.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
  : 'http://localhost:8000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse stored user data')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setError(null)
    setIsLoading(true)
    
    try {
      if (!username || !password) {
        throw new Error('Username and password are required')
      }

      try {
        // Try to login with the API
        console.log(`Attempting to login with API at ${API_URL}/auth_db/login`);
        const response = await fetch(`${API_URL}/auth_db/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          console.error('Error parsing response:', e);
          throw new Error('Invalid response from server');
        }
        
        if (!response.ok) {
          const errorMessage = responseData.detail || 'Login failed';
          console.error('Login error:', errorMessage);
          throw new Error(errorMessage);
        }

        console.log('Login successful:', responseData);
        
        if (!responseData.user || !responseData.user.id || !responseData.user.username) {
          throw new Error('Invalid user data received from server');
        }
        
        const userData: User = {
          id: responseData.user.id,
          username: responseData.user.username,
          email: responseData.user.email
        };

        // Store token and user data
        localStorage.setItem('token', responseData.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsLoading(false);
        return true;
      } catch (apiError) {
        console.error('API login failed, falling back to local validation:', apiError);
        
        // Fallback to local validation if API is not available
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // Check if credentials match any valid user
        const validUser = VALID_CREDENTIALS.find(
          cred => cred.username === username && cred.password === password
        );
        
        if (validUser) {
          const userData: User = {
            id: validUser.id,
            username: validUser.username
          }
          
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
          setIsLoading(false)
          return true
        } else {
          throw new Error('Invalid username or password')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setIsLoading(false)
      return false
    }
  }

  const register = async (username: string, email: string, password: string): Promise<{success: boolean, message: string}> => {
    setError(null)
    setIsLoading(true)
    
    try {
      if (!username || !email || !password) {
        throw new Error('All fields are required')
      }

      try {
        // Try to register with the API
        console.log(`Attempting to register with API at ${API_URL}/auth_db/register`);
        const response = await fetch(`${API_URL}/auth_db/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password }),
        });

        let responseData;
        try {
          responseData = await response.json();
        } catch (e) {
          console.error('Error parsing response:', e);
          throw new Error('Invalid response from server');
        }
        
        if (!response.ok) {
          let errorMessage = 'Registration failed';
          
          if (responseData.detail) {
            errorMessage = responseData.detail;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (typeof responseData === 'object' && responseData !== null) {
            // Check for validation errors
            const validationErrors = [];
            for (const key in responseData) {
              if (Array.isArray(responseData[key])) {
                validationErrors.push(`${key}: ${responseData[key].join(', ')}`);
              }
            }
            if (validationErrors.length > 0) {
              errorMessage = validationErrors.join('; ');
            }
          }
          
          console.error('Registration error:', errorMessage);
          throw new Error(errorMessage);
        }

        console.log('Registration successful:', responseData);
        
        // Return success message but don't log in automatically
        setIsLoading(false);
        return {
          success: true,
          message: responseData.message || 'Registration successful. Please log in with your credentials.'
        };
      } catch (apiError) {
        console.error('API registration failed, falling back to local validation:', apiError);
        
        // Check if username already exists
        if (VALID_CREDENTIALS.some(cred => cred.username === username)) {
          throw new Error('Username already exists')
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // For local fallback, just return success but don't log in
        setIsLoading(false)
        return {
          success: true,
          message: 'Registration successful. Please log in with your credentials.'
        };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      setIsLoading(false)
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Registration failed'
      };
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 