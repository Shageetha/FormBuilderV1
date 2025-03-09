import React from 'react'
import { Roboto } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import { FormProvider } from '@/components/Form_Preview/FormContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { UserProvider } from '@/contexts/UserContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { DragDropProvider } from '@/components/providers/DndProvider'

const roboto = Roboto({ 
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Form Builder App',
  description: 'Dynamic form builder with rules engine',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ToastProvider>
          <UserProvider>
            <AuthProvider>
              <DragDropProvider>
                <FormProvider>
                  <div className="min-h-screen flex flex-col">
                    <main className="flex-grow">
                      {children}
                    </main>
                    <footer className="bg-gray-100 border-t border-gray-200 py-4">
                      <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
                        &copy; {new Date().getFullYear()} Form Builder. All rights reserved.
                      </div>
                    </footer>
                  </div>
                </FormProvider>
              </DragDropProvider>
            </AuthProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  )
} 