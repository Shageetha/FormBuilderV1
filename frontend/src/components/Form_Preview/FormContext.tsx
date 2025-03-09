"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { FormElement } from '@/types/form'
import { FormTheme } from '@/components/Left Panel/ThemePanel'

interface FormContextType {
  formElements: FormElement[]
  setFormElements: (elements: FormElement[]) => void
  formName: string
  setFormName: (name: string) => void
  formDescription: string
  setFormDescription: (description: string) => void
  formTheme: FormTheme | null
  setFormTheme: (theme: FormTheme) => void
  isReady: boolean
}

const defaultTheme: FormTheme = {
  primaryColor: '#3B82F6', // blue-500
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937', // gray-800
  borderRadius: '0.375rem', // rounded-md
  fontFamily: 'Inter, sans-serif',
  layout: 'default',
  style: 'flat'
}

const FormContext = createContext<FormContextType | undefined>(undefined)

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [formElements, setFormElements] = useState<FormElement[]>([])
  const [formName, setFormName] = useState<string>('')
  const [formDescription, setFormDescription] = useState<string>('')
  const [formTheme, setFormTheme] = useState<FormTheme>(defaultTheme)
  const [isReady, setIsReady] = useState(false)

  // Initialize state from sessionStorage after mount
  useEffect(() => {
    try {
      const savedFormName = sessionStorage.getItem('currentFormName')
      const savedFormDescription = sessionStorage.getItem('currentFormDescription')
      const savedFormElements = sessionStorage.getItem('currentFormElements')
      const savedFormTheme = sessionStorage.getItem('currentFormTheme')
      
      if (savedFormName) {
        setFormName(savedFormName)
      }
      
      if (savedFormDescription) {
        setFormDescription(savedFormDescription)
      }

      if (savedFormElements) {
        setFormElements(JSON.parse(savedFormElements))
      }

      if (savedFormTheme) {
        setFormTheme(JSON.parse(savedFormTheme))
      }
    } catch (error) {
      console.error('Error loading form data from session storage:', error)
    } finally {
      setIsReady(true)
    }
  }, [])

  // Save state changes to sessionStorage
  useEffect(() => {
    if (isReady) {
      try {
        sessionStorage.setItem('currentFormName', formName)
        sessionStorage.setItem('currentFormDescription', formDescription)
        sessionStorage.setItem('currentFormElements', JSON.stringify(formElements))
        sessionStorage.setItem('currentFormTheme', JSON.stringify(formTheme))
      } catch (error) {
        console.error('Error saving form data to session storage:', error)
      }
    }
  }, [formName, formDescription, formElements, formTheme, isReady])

  // Return loading state until ready
  if (!isReady) {
    return null
  }

  return (
    <FormContext.Provider value={{ 
      formElements, 
      setFormElements, 
      formName, 
      setFormName,
      formDescription,
      setFormDescription, 
      formTheme, 
      setFormTheme, 
      isReady 
    }}>
      {children}
    </FormContext.Provider>
  )
}

export function useForm() {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider')
  }
  return context
} 