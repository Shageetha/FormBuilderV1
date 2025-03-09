import { useState } from 'react'

interface ToastOptions {
  title: string
  description?: string
  type?: 'success' | 'error' | 'info'
  duration?: number
}

export function useToast() {
  const [toast, setToast] = useState<ToastOptions | null>(null)

  const showToast = (options: ToastOptions) => {
    setToast(options)
    if (options.duration !== 0) {
      setTimeout(() => {
        setToast(null)
      }, options.duration || 3000)
    }
  }

  return {
    toast,
    showToast
  }
} 