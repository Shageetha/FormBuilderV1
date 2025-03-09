"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, isLoading, error } = useAuth()
  const router = useRouter()

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError(null)
    setRegisterSuccess(null)
    setIsSubmitting(true)
    
    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        setRegisterError('Passwords do not match')
        setIsSubmitting(false)
        return
      }
      
      // Validate password strength
      const passwordError = validatePassword(password);
      if (passwordError) {
        setRegisterError(passwordError);
        setIsSubmitting(false)
        return;
      }
      
      const result = await register(username, email, password)
      if (result.success) {
        // Show success message but don't close modal or redirect
        setRegisterSuccess(result.message)
        // Clear form fields
        setUsername('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
      } else {
        setRegisterError(result.message || 'Registration failed. Please try again.')
      }
    } catch (err) {
      console.error('Registration error:', err);
      setRegisterError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  const resetForm = () => {
    setUsername('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setRegisterError(null)
    setRegisterSuccess(null)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Create an account</h2>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {registerSuccess ? (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Registration successful</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{registerSuccess}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Register another account
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    // Redirect to login page
                    router.push('/login');
                  }}
                  className="px-4 py-2 rounded-md btn-gradient"
                >
                  Go to login
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  minLength={3}
                  maxLength={45}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Username must be between 3 and 45 characters.
                </p>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters.
                </p>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              {registerError && (
                <div className="bg-red-50 p-3 rounded-md text-sm text-red-600">
                  {registerError}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className={`w-full py-2 px-4 rounded-md btn-gradient ${
                  (isSubmitting || isLoading) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting || isLoading ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 